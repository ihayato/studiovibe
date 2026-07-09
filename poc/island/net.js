// プレゼンス同期クライアント — 島にいる他の訪問者を映す。
// 送るのは位置・向き・歩行・ジャンプだけ。会話・保存なし。
import * as THREE from 'three';
import { createAvatar } from './avatars.js';

const WS_BASE = ['localhost', '127.0.0.1'].includes(location.hostname)
  ? 'ws://127.0.0.1:8787/ws'
  : 'wss://vibe-presence.nubonba.workers.dev/ws';
// ?room=xxx で部屋を分けられる（検証・将来のシーン分け用）
const ROOM = new URLSearchParams(location.search).get('room');
const WS_URL = ROOM ? `${WS_BASE}?room=${encodeURIComponent(ROOM)}` : WS_BASE;

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
  }

  dispose() {
    this.scene.remove(this.g);
  }
}

// ---------- 接続本体 ----------
export function initPresence({ scene, terrainH, identity, getState, onCount, onFull, onEmote }) {
  const peers = new Map();
  let ws = null;
  let sendTimer = null;
  let retries = 0;
  let closedByFull = false;
  let fullNotified = false; // 満員トーストは一度だけ（再試行のたびに出さない）
  const FULL_RETRY_MS = 75_000; // 満員時はこの間隔＋ゆらぎで静かに再試行（枠が空いたらリロード不要で合流）

  const notify = () => onCount && onCount(peers.size + 1);

  const connect = () => {
    try {
      ws = new WebSocket(WS_URL);
    } catch {
      return;
    }

    ws.addEventListener('open', () => {
      retries = 0;
      const s = getState();
      ws.send(JSON.stringify({ t: 'hi', name: identity.name, c: identity.c, v: identity.v, x: r3(s.x), z: r3(s.z), yaw: r3(s.yaw) }));
      sendTimer = setInterval(() => {
        if (ws.readyState !== WebSocket.OPEN) return;
        const p = getState();
        ws.send(JSON.stringify({ t: 'p', x: r3(p.x), z: r3(p.z), yaw: r3(p.yaw), w: r3(p.w), j: r3(p.j) }));
      }, SEND_MS);
    });

    ws.addEventListener('message', (e) => {
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

    ws.addEventListener('close', () => {
      clearInterval(sendTimer);
      for (const p of peers.values()) p.dispose();
      peers.clear();
      notify();
      if (closedByFull) {
        // 満員: ソロで遊べたまま、間隔を空けて静かに再試行する
        closedByFull = false;
        setTimeout(connect, FULL_RETRY_MS + Math.random() * 30_000);
      } else if (retries < 6) {
        retries += 1;
        setTimeout(connect, 2000 * retries);
      }
    });
  };

  connect();

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
