// プレゼンス同期クライアント — 島にいる他の訪問者を映す。
// 送るのは位置・向き・歩行・ジャンプ・装具だけ。会話・保存なし。
import * as THREE from 'three';
import { createAvatar } from './avatars.js';
import { createCosmeticRig } from './cosmetics.js';

const IS_LOCAL = ['localhost', '127.0.0.1'].includes(location.hostname);
const SEARCH = new URLSearchParams(location.search);
// ローカルでは Worker が起動していないことが多いため、通常は静かなソロ散策にする。
// 同時接続を確認したい時だけ ?presence=local でローカル Worker へ接続する。
const LOCAL_PRESENCE_ENABLED = SEARCH.get('presence') === 'local';
const requestedLocalPort = SEARCH.get('presencePort') || '8787';
const LOCAL_PRESENCE_PORT = /^\d{2,5}$/.test(requestedLocalPort) ? requestedLocalPort : '8787';
const WS_BASE = IS_LOCAL
  ? `ws://127.0.0.1:${LOCAL_PRESENCE_PORT}/ws`
  : 'wss://vibe-presence.nubonba.workers.dev/ws';
// ?room=xxx で部屋を分けられる（検証・将来のシーン分け用）
const buildWsUrl = (configuredRoom) => {
  const room = configuredRoom || SEARCH.get('room');
  return room ? `${WS_BASE}?room=${encodeURIComponent(room)}` : WS_BASE;
};

const SEND_MS = 100;
const r3 = (n) => Math.round(n * 1000) / 1000;

const lerpAngle = (a, b, t) => {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
};

// ---------- 頭上の名前ラベル ----------
export function makeNameLabel(rawName) {
  const name = String(rawName || '旅人').slice(0, 16); // 巨大canvas生成を防ぐため上限
  const font = '700 26px "Zen Maru Gothic", "Hiragino Sans", sans-serif';
  const meas = document.createElement('canvas').getContext('2d');
  meas.font = font;
  const tw = meas.measureText(name).width;
  const w = Math.ceil(tw + 44), h = 44;
  const c = document.createElement('canvas');
  c.width = w * 2;
  c.height = h * 2;
  const ctx = c.getContext('2d');
  ctx.scale(2, 2);
  ctx.beginPath();
  ctx.roundRect(1, 1, w - 2, h - 2, 21);
  ctx.fillStyle = 'rgba(10, 10, 18, 0.62)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(244, 242, 236, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.font = font;
  ctx.fillStyle = '#f4f2ec';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, w / 2, h / 2 + 1);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.92 }));
  const H = 0.13; // 世界単位での高さ（小さめ）
  sprite.scale.set(H * (w / h), H, 1);
  sprite.position.y = 1.3;
  return sprite;
}

// ---------- リモート訪問者 ----------
class RemotePeer {
  constructor(scene, terrainH, s) {
    this.scene = scene;
    this.terrainH = terrainH;
    this.avatar = createAvatar(s.c, s.v);
    this.g = this.avatar.group;
    this.g.position.set(s.x, terrainH(s.x, s.z), s.z);
    this.g.rotation.y = s.yaw;
    this.g.add(makeNameLabel(s.name));
    this.cosmeticRig = createCosmeticRig(s.a, { illuminate: false });
    this.g.add(this.cosmeticRig.group);
    this.tx = s.x; this.tz = s.z; this.tyaw = s.yaw;
    this.w = 0; this.tw = 0;
    this.j = 0; this.tj = 0;
    this.walkPhase = 0;
    this.prevYaw = s.yaw;
    scene.add(this.g);
  }

  setTarget(m) {
    this.tx = m.x; this.tz = m.z; this.tyaw = m.yaw;
    this.tw = m.w; this.tj = m.j;
    if (m.a != null) this.cosmeticRig.apply(m.a);
  }

  update(dt, t) {
    const p = this.g.position;
    const k = 1 - Math.pow(0.0005, dt);
    const px = p.x, pz = p.z;
    p.x += (this.tx - p.x) * k;
    p.z += (this.tz - p.z) * k;
    this.j += (this.tj - this.j) * Math.min(1, dt * 14);
    p.y = this.terrainH(p.x, p.z) + this.j;
    this.g.rotation.y = lerpAngle(this.g.rotation.y, this.tyaw, 1 - Math.pow(0.001, dt));
    const moved = Math.hypot(p.x - px, p.z - pz);
    this.walkPhase += moved * 9;
    this.w += (this.tw - this.w) * Math.min(1, dt * 10);
    const yawVel = (this.g.rotation.y - this.prevYaw) / Math.max(dt, 1e-4);
    this.prevYaw = this.g.rotation.y;
    this.avatar.update(dt, t, this.w, this.walkPhase, yawVel);
    this.cosmeticRig.update(dt, t);
  }

  dispose() {
    this.scene.remove(this.g);
  }
}

// ---------- 接続本体 ----------
export function initPresence({ scene, terrainH, identity, getState, onCount, onFull, onEmote, room = null }) {
  const peers = new Map();
  const wsUrl = buildWsUrl(room);
  let ws = null;
  let sendTimer = null;
  let reconnectTimer = null; // 予約済み再接続（背景移行時に解除する・Codex監査#4）
  let gen = 0;               // 接続世代。古い接続のイベントは無視する
  let retries = 0;
  let closedByFull = false;
  let fullNotified = false; // 満員トーストは一度だけ（再試行のたびに出さない）
  // 背景タブでは接続を畳む（2026-09-06 コスト是正）: 放置タブ1本が部屋DOを起こし続けていた。
  // 見えなくなったら送信を止めてcloseし、戻ったら再接続する（満員待ちの再試行も止める）
  let pausedByHidden = false;
  const FULL_RETRY_MS = 75_000; // 満員時はこの間隔＋ゆらぎで静かに再試行（枠が空いたらリロード不要で合流）

  const notify = () => onCount && onCount(peers.size + 1);

  if (IS_LOCAL && !LOCAL_PRESENCE_ENABLED) {
    notify();
    return {
      update() {},
      count: () => 1,
      sendEmote() {},
    };
  }

  const scheduleReconnect = (ms) => {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => { reconnectTimer = null; connect(); }, ms);
  };

  const connect = () => {
    if (pausedByHidden) return; // 背景中は繋がない
    if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) return; // 二重接続防止
    let sock;
    try {
      sock = new WebSocket(wsUrl);
    } catch {
      return;
    }
    const myGen = ++gen;
    ws = sock;
    const isCurrent = () => myGen === gen && ws === sock;

    sock.addEventListener('open', () => {
      if (!isCurrent()) { try { sock.close(1000, 'stale'); } catch {} return; }
      retries = 0;
      const s = getState();
      sock.send(JSON.stringify({ t: 'hi', name: identity.name, c: identity.c, v: identity.v, x: r3(s.x), z: r3(s.z), yaw: r3(s.yaw), a: s.a || 0 }));
      if (sendTimer) clearInterval(sendTimer);
      sendTimer = setInterval(() => {
        if (!isCurrent() || sock.readyState !== WebSocket.OPEN) return;
        const p = getState();
        sock.send(JSON.stringify({ t: 'p', x: r3(p.x), z: r3(p.z), yaw: r3(p.yaw), w: r3(p.w), j: r3(p.j), a: p.a || 0 }));
      }, SEND_MS);
    });

    sock.addEventListener('message', (e) => {
      if (!isCurrent()) return;
      let m;
      try { m = JSON.parse(e.data); } catch { return; }
      if (m.t === 'welcome') {
        fullNotified = false; // 入島できたので、次に満員へ当たったらまた知らせてよい
        for (const peer of m.peers || []) {
          if (!peers.has(peer.id)) peers.set(peer.id, new RemotePeer(scene, terrainH, peer));
        }
        notify();
      } else if (m.t === 'join') {
        if (!peers.has(m.peer.id)) peers.set(m.peer.id, new RemotePeer(scene, terrainH, m.peer));
        notify();
      } else if (m.t === 'p') {
        const p = peers.get(m.id);
        if (p) p.setTarget(m);
      } else if (m.t === 'e') {
        const p = peers.get(m.id);
        if (p && onEmote) onEmote(p, Math.max(0, Math.floor(Number(m.k) || 0)) % 8);
      } else if (m.t === 'bye') {
        const p = peers.get(m.id);
        if (p) { p.dispose(); peers.delete(m.id); notify(); }
      } else if (m.t === 'full') {
        closedByFull = true;
        if (!fullNotified) {
          fullNotified = true;
          onFull && onFull(m.max);
        }
      }
    });

    sock.addEventListener('close', () => {
      if (!isCurrent()) return; // 古い接続のcloseは新接続の状態に触らない
      if (sendTimer) { clearInterval(sendTimer); sendTimer = null; }
      for (const p of peers.values()) p.dispose();
      peers.clear();
      notify();
      if (pausedByHidden) {
        // 自分で畳んだ接続。visibilitychangeで戻ったときに再接続する
        closedByFull = false;
      } else if (closedByFull) {
        // 満員: ソロで遊べたまま、間隔を空けて静かに再試行する
        closedByFull = false;
        scheduleReconnect(FULL_RETRY_MS + Math.random() * 30_000);
      } else if (retries < 6) {
        retries += 1;
        scheduleReconnect(2000 * retries);
      }
    });
  };

  const onVisibility = () => {
    if (document.hidden) {
      pausedByHidden = true;
      if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; } // 予約済み再接続も止める
      if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
        try { ws.close(1000, 'hidden'); } catch {}
      }
    } else if (pausedByHidden) {
      pausedByHidden = false;
      retries = 0;
      connect();
    }
  };
  document.addEventListener('visibilitychange', onVisibility);

  if (document.hidden) pausedByHidden = true; // 背景で開かれたタブは、見えるまで繋がない
  else connect();

  return {
    update(dt, t) {
      for (const p of peers.values()) p.update(dt, t);
    },
    count: () => peers.size + 1,
    sendEmote(k) {
      try {
        if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ t: 'e', k }));
      } catch {}
    },
  };
}
