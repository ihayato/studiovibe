// vibe-presence: 島のプレゼンス同期（位置・向き・歩行・装具のみ。会話なし・保存なし）

const MAX_VISITORS = 10; // 島に同時に立てる人数（10人×10通/秒×9配信=900msg/s・DOには余裕）

// DoS対策の各上限。標準WebSocket APIのまま、部屋DO内で自衛する。
const MAX_CONNECTIONS = 32;     // hi前を含む生ソケットの総数上限（任意名の接続で満員判定を迂回して居座る穴を塞ぐ）
const HELLO_TIMEOUT_MS = 5_000; // 接続後この時間内に hi が来なければ強制close
const HEARTBEAT_MS = 10_000;    // alarm() で死活を掃引する間隔（hibernation下の唯一の定期起床。2026-09-06 5s→10s）
const STALE_MS = 30_000;        // この時間メッセージが途絶えたソケットは亡霊とみなし除去（クライアントは約10通/秒・背景タブでも約1通/秒送るので誤検知しない）
// メッセージのトークンバケット（1接続あたり）。クライアントの正常時は約10通/秒なので、
// 20通/秒＋バースト25でmargin十分。溢れた分は間引き、溢れっぱなしが続けば切断する。
const MSG_BURST = 25;
const MSG_REFILL_PER_SEC = 20;
const MSG_DROP_LIMIT = 200;     // 連続してこの数だけ間引かれたら濫用とみなし切断

// 有限数だけ通す（"1e999"→Infinity のような値を弾く）。範囲外はクランプ
const fin = (v, lo = -60, hi = 60) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : 0;
};
const cosmeticMask = (v) => Math.max(0, Math.floor(Number(v) || 0)) & 7;

export class Room {
  // 2026-09-06 コスト是正: 標準WebSocket(ws.accept)→Hibernation API(acceptWebSocket)へ。
  // 旧実装は接続が1本でもあるとDOがwall-clockで課金され続け、島ページのタブ放置1本で
  // 月295時間(口座DO durationの78%)を食っていた。Hibernation方式ではメッセージ処理中しか
  // 課金されない。接続ごとの状態はattachment(deserializeAttachment)に持ち、メモリMapは持たない
  // (休眠→復帰でメモリは消えるため)。
  constructor(state, env) {
    this.state = state;
  }

  sockets() {
    return this.state.getWebSockets();
  }

  // 論理的に有効な接続だけ（close済み=closing印のCLOSINGソケットはgetWebSockets()に残り得る・Codex監査#5）
  live() {
    return this.sockets().filter((ws) => {
      const a = this.att(ws);
      return a && !a.closing;
    });
  }

  att(ws) {
    try {
      return ws.deserializeAttachment();
    } catch {
      return null;
    }
  }

  joinedCount(except) {
    let n = 0;
    for (const ws of this.live()) {
      if (ws === except) continue;
      const a = this.att(ws);
      if (a && a.joined) n += 1;
    }
    return n;
  }

  // 退出を一度だけ記録・通知してcloseする共通経路。closeフレームの到達に依存せず枠を解放する
  leave(ws, a, code, reason) {
    if (!a || a.closing) return;
    const wasJoined = a.joined;
    a.closing = true;
    a.joined = false;
    try { ws.serializeAttachment(a); } catch {}
    try { ws.close(code, String(reason).slice(0, 120)); } catch {}
    if (wasJoined) this.broadcast({ t: 'bye', id: a.id }, ws);
  }

  async fetch(req) {
    if (req.headers.get('Upgrade') !== 'websocket') {
      return new Response(JSON.stringify({ ok: true, visitors: this.joinedCount() }), {
        headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' },
      });
    }
    // コネクションフラッド対策: 生ソケットの総数に上限。満員判定はhi後のjoinedで見るため、
    // hiを送らずに張るだけの接続はこの総数上限でのみ弾ける。accept前にHTTPで拒む（受け入れ数の厳密な上限）
    if (this.live().length >= MAX_CONNECTIONS) {
      return new Response(JSON.stringify({ ok: false, error: 'busy' }), {
        status: 503,
        headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*', 'retry-after': '30' },
      });
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    const now = Date.now();
    this.state.acceptWebSocket(server); // 公式例に合わせ accept→serialize の順
    server.serializeAttachment({
      id: crypto.randomUUID().slice(0, 8),
      joined: false,
      closing: false,
      st: null,
      tokens: MSG_BURST,
      lastRefill: now,
      lastSeen: now,
      dropped: 0,
      openedAt: now,
    });
    // 死活掃引のalarmを（無ければ）仕掛ける。setAlarmは上書きなので二重には積まない。
    await this.ensureAlarm();
    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketMessage(ws, data) {
    const a = this.att(ws);
    if (!a || a.closing) return;
    // レート制限はパース前に。broadcast/パースのコストを濫用させない。
    if (!this.allow(a)) {
      a.dropped += 1;
      if (a.dropped > MSG_DROP_LIMIT) {
        this.dropClient(ws, a, 1008, 'flood');
        return;
      }
      ws.serializeAttachment(a);
      return;
    }
    a.dropped = 0;
    a.lastSeen = Date.now();
    let m;
    try {
      m = JSON.parse(typeof data === 'string' ? data : new TextDecoder().decode(data));
    } catch {
      ws.serializeAttachment(a);
      return;
    }
    if (m.t === 'hi' && !a.joined) {
      if (this.joinedCount(ws) >= MAX_VISITORS) {
        this.safeSend(ws, { t: 'full', max: MAX_VISITORS });
        this.leave(ws, a, 1000, 'full');
        return;
      }
      a.joined = true;
      a.st = {
        id: a.id,
        name: String(m.name || '旅人').slice(0, 12),
        c: String(m.c || 'tarte').slice(0, 16), // キャラ種別（将来の他CNPキャラ用）
        v: Math.max(0, Math.floor(Number(m.v) || 0)) % 32, // 甲羅色などのバリアント
        x: fin(m.x),
        z: fin(m.z),
        yaw: fin(m.yaw, -7, 7),
        w: 0,
        j: 0,
        a: cosmeticMask(m.a),
      };
      ws.serializeAttachment(a);
      const peers = [];
      for (const other of this.live()) {
        if (other === ws) continue;
        const o = this.att(other);
        if (o && o.joined && o.st) peers.push(o.st);
      }
      this.safeSend(ws, { t: 'welcome', id: a.id, peers });
      this.broadcast({ t: 'join', peer: a.st }, ws);
      return;
    }
    if (m.t === 'p' && a.joined && a.st) {
      a.st.x = fin(m.x);
      a.st.z = fin(m.z);
      a.st.yaw = fin(m.yaw, -7, 7);
      a.st.w = fin(m.w, 0, 1);
      a.st.j = fin(m.j, 0, 20);
      a.st.a = cosmeticMask(m.a);
      ws.serializeAttachment(a);
      this.broadcast({ t: 'p', id: a.id, x: a.st.x, z: a.st.z, yaw: a.st.yaw, w: a.st.w, j: a.st.j, a: a.st.a }, ws);
      return;
    }
    if (m.t === 'e' && a.joined) {
      ws.serializeAttachment(a);
      // エモート（頭上の吹き出し）。種類番号だけ中継する
      const k = Math.max(0, Math.floor(Number(m.k) || 0)) % 8;
      this.broadcast({ t: 'e', id: a.id, k }, ws);
      return;
    }
    ws.serializeAttachment(a);
  }

  webSocketClose(ws, code = 1000, reason = '') {
    // hibernatable WSはハンドラ側でclose()を返して握手を完了させる（二重closeは握る）。
    // 既に leave() 済み(closing)なら bye は送らない（二重送信防止）
    const a = this.att(ws);
    if (a && !a.closing) {
      this.leave(ws, a, code, reason);
    } else {
      try { ws.close(code, String(reason).slice(0, 120)); } catch {}
    }
  }

  webSocketError(ws) {
    this.webSocketClose(ws, 1011, 'error');
  }

  // トークンバケット: 送信できるならtrue。満タンを超えては貯めない。
  allow(a) {
    const now = Date.now();
    const elapsed = (now - a.lastRefill) / 1000;
    a.lastRefill = now;
    a.tokens = Math.min(MSG_BURST, a.tokens + elapsed * MSG_REFILL_PER_SEC);
    if (a.tokens < 1) return false;
    a.tokens -= 1;
    return true;
  }

  dropClient(ws, a, code, reason) {
    this.leave(ws, a, code, reason);
  }

  // alarmが無ければ1つ仕掛ける（既にあれば触らない＝接続のたびに先送りしない）。
  async ensureAlarm() {
    if ((await this.state.storage.getAlarm()) === null) {
      await this.state.storage.setAlarm(Date.now() + HEARTBEAT_MS);
    }
  }

  // 死活掃引: hi無しの居座り・メッセージが途絶えた亡霊接続を除去してスロットを解放する。
  // TCPのclose通知が遅れる/欠落しても、満員スロットが空かない問題をここで根治する。
  async alarm() {
    const now = Date.now();
    for (const ws of this.sockets()) {
      const a = this.att(ws);
      if (!a) {
        try { ws.close(1008, 'no state'); } catch {}
        continue;
      }
      if (a.closing) continue; // 退出済み(CLOSING残留)は数えない
      if (!a.joined && now - a.openedAt > HELLO_TIMEOUT_MS) {
        this.dropClient(ws, a, 1008, 'no hello');
      } else if (now - a.lastSeen > STALE_MS) {
        this.dropClient(ws, a, 1001, 'stale');
      }
    }
    // まだ誰か(論理的に有効な接続)がいる間だけ掃引を続ける。全員去ったら再設定せず止める＝完全休眠。
    if (this.live().length > 0) {
      await this.state.storage.setAlarm(now + HEARTBEAT_MS);
    }
  }

  safeSend(ws, obj) {
    try {
      ws.send(JSON.stringify(obj));
    } catch {}
  }

  broadcast(obj, exceptWs) {
    const s = JSON.stringify(obj);
    for (const ws of this.sockets()) {
      if (ws === exceptWs) continue;
      const a = this.att(ws);
      if (!a || a.closing || !a.joined) continue;
      try {
        ws.send(s);
      } catch {}
    }
  }
}

// ---------- 旅人の帳（島の掲示板・永続） ----------
const BOARD_KEEP = 200; // 保持する最大件数
const BOARD_LIST = 50; // 一覧で返す件数
const POST_MIN_INTERVAL_MS = 60_000; // 続けての書き込みの最短間隔
const POST_DAY_LIMIT = 20; // 1日の上限（IPごと）
// rl:${ip} はIPごとに無期限に増える。直近この時間書き込みの無いIPのレート記録は掃除する。
const RL_TTL_MS = 2 * 24 * 60 * 60 * 1000; // 2日
const RL_SWEEP_MS = 6 * 60 * 60 * 1000; // 掃引間隔（6時間ごと）
// 帳に記せない言葉（部分一致・NFKC小文字化してから判定）
const NG_WORDS = [
  '死ね', 'しね', '殺す', 'ころす', 'きもい', 'キモい', 'うざい', 'ウザい', 'ばか', 'バカ', '馬鹿',
  'あほ', 'アホ', 'くそ', 'クソ', '糞', 'ちんこ', 'まんこ', 'うんこ', 'せっくす', 'セックス', 'sex',
  'fuck', 'shit', 'bitch', 'porn', 'エロ', '援交', 'パパ活', '出会い系', '詐欺', 'casino', 'カジノ',
];
// ゼロ幅・双方向制御文字は禁止語判定をすり抜ける踏み台になるので、正規化前に落とす
const stripInvisible = (s) => s.replace(/[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g, '');
const normText = (s) => stripInvisible(s).normalize('NFKC').toLowerCase();
const hasNg = (s) => {
  const n = normText(s);
  return NG_WORDS.some((w) => n.includes(normText(w)));
};
// URLらしきもの・長い数字列（電話番号など）は帳に載せない
const looksLikeUrl = (s) => /(https?:\/\/|www\.|[a-z0-9-]+\.(com|net|org|jp|io|dev|xyz|me)\b)/i.test(s);
const longDigits = (s) => /\d{8,}/.test(s.normalize('NFKC'));

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS',
  'access-control-allow-headers': 'content-type,authorization',
};
const json = (obj, status = 200) => new Response(JSON.stringify(obj), {
  status,
  headers: { 'content-type': 'application/json', ...CORS },
});

// 長さ・内容の差でタイミングが漏れない定数時間比較（管理鍵の突合用）
const timingSafeEqual = (a, b) => {
  const enc = new TextEncoder();
  const ab = enc.encode(String(a));
  const bb = enc.encode(String(b));
  let diff = ab.length ^ bb.length;
  for (let i = 0; i < bb.length; i++) diff |= (ab[i] ?? 0) ^ bb[i];
  return diff === 0;
};

export class Board {
  constructor(state, env) {
    this.storage = state.storage;
    this.env = env;
  }

  async fetch(req) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (req.method === 'GET') {
      const posts = (await this.storage.get('posts')) || [];
      return json({ posts: posts.slice(0, BOARD_LIST) });
    }
    if (req.method === 'POST') return this.post(req);
    if (req.method === 'DELETE') return this.remove(req);
    return json({ error: 'bad' }, 405);
  }

  async post(req) {
    // 巨大ボディはパース前に弾く（JSONパース＋正規化のCPUを浪費させない）
    const len = Number(req.headers.get('content-length') || 0);
    if (len > 2048) return json({ error: 'too_large' }, 413);

    // レート制限は検証より前に消費する（NGワード等で必ず失敗するリクエストを連投して
    // カウンタを迂回されないように＝内容に依存しない「1分1回・日20回」をまず適用）
    const ip = req.headers.get('cf-connecting-ip') || 'unknown';
    const today = new Date().toISOString().slice(0, 10);
    const rl = (await this.storage.get(`rl:${ip}`)) || { last: 0, day: today, count: 0 };
    if (rl.day !== today) {
      rl.day = today;
      rl.count = 0;
    }
    const now = Date.now();
    if (now - rl.last < POST_MIN_INTERVAL_MS || rl.count >= POST_DAY_LIMIT) return json({ error: 'rate' }, 429);
    rl.last = now;
    rl.count += 1;
    await this.storage.put(`rl:${ip}`, rl);
    await this.ensureSweep(); // rl:キーを作ったので、掃除のalarmを（無ければ）仕掛ける

    let m;
    try {
      m = await req.json();
    } catch {
      return json({ error: 'bad' }, 400);
    }
    const text = String(m.text || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
    const name = String(m.name || '旅人').slice(0, 12);
    const v = Math.max(0, Math.floor(Number(m.v) || 0)) % 32;
    if (!text || text.length > 20) return json({ error: 'bad' }, 400); // 一言の帳＝20字まで
    if (hasNg(text) || hasNg(name) || looksLikeUrl(text) || looksLikeUrl(name) || longDigits(text) || longDigits(name)) {
      return json({ error: 'ng' }, 400);
    }

    const post = { id: crypto.randomUUID().slice(0, 8), name, v, text, ts: now };
    const posts = (await this.storage.get('posts')) || [];
    posts.unshift(post);
    await this.storage.put('posts', posts.slice(0, BOARD_KEEP));
    return json({ ok: true, post });
  }

  // 運営の削除。wrangler secret put BOARD_ADMIN_KEY を設定した上で
  // DELETE /board?id=xxxx を Authorization: Bearer <鍵> ヘッダ付きで叩く
  // （鍵はログに残りやすいクエリでなくヘッダで受け、定数時間比較で総当たりの手掛かりを与えない）
  async remove(req) {
    const auth = req.headers.get('authorization') || '';
    const key = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!this.env.BOARD_ADMIN_KEY || !timingSafeEqual(key, this.env.BOARD_ADMIN_KEY)) {
      return json({ error: 'forbidden' }, 403);
    }
    const url = new URL(req.url);
    const id = url.searchParams.get('id') || '';
    const posts = (await this.storage.get('posts')) || [];
    const next = posts.filter((p) => p.id !== id);
    await this.storage.put('posts', next);
    return json({ ok: true, removed: posts.length - next.length });
  }

  // rl:キーの掃除alarmが無ければ仕掛ける（posts本体は掃除対象外＝BOARD_KEEPで既に上限あり）。
  async ensureSweep() {
    if ((await this.storage.getAlarm()) === null) {
      await this.storage.setAlarm(Date.now() + RL_SWEEP_MS);
    }
  }

  // 古い rl:${ip} を掃除する。alarmは1DOに1つなので掲示板ではこの用途に専念。
  async alarm() {
    const now = Date.now();
    const entries = await this.storage.list({ prefix: 'rl:' });
    const stale = [];
    for (const [key, val] of entries) {
      if (!val || typeof val.last !== 'number' || now - val.last > RL_TTL_MS) stale.push(key);
    }
    if (stale.length) await this.storage.delete(stale);
    // rl:キーがまだ残っていれば次回も掃引する。全部消えたら止める。
    const remaining = await this.storage.list({ prefix: 'rl:', limit: 1 });
    if (remaining.size > 0) await this.storage.setAlarm(now + RL_SWEEP_MS);
  }
}

// 部屋は許可リスト制。任意名でDO（＝レート制限カウンタと保存領域）を無限増殖させられないようにする。
// 将来シーンを増やすときはここに足す。
const ROOMS = new Set(['island', 'meikyo', 'world-port', 'luna-occulta', 'ninja-hankacho']);

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const room = url.searchParams.get('room') || 'island';
    if (!ROOMS.has(room)) return json({ error: 'bad_room' }, 400);
    if (url.pathname === '/ws') {
      const id = env.ROOM.idFromName(room);
      return env.ROOM.get(id).fetch(req);
    }
    if (url.pathname === '/board') {
      const id = env.BOARD.idFromName(room);
      return env.BOARD.get(id).fetch(req);
    }
    return new Response('vibe-presence ok', { headers: { 'access-control-allow-origin': '*' } });
  },
};
