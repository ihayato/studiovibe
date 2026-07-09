// アバターレジストリ — 島に立てるCNPキャラの台帳。
// 新キャラは create(variant) を実装してここに1行足すだけで、通信・表示側はそのまま動く。
import { createTarte, SHELLS } from './tarte.js';
import { createLele, BANDANAS } from './lele.js';

export const AVATARS = {
  tarte: {
    label: 'タルト',
    variants: SHELLS.length, // 甲羅の色バリアント数
    create: (v) => createTarte({ shell: v }),
  },
  lele: {
    label: 'リーリー',
    variants: BANDANAS.length, // バンダナの色バリアント数
    create: (v) => createLele({ bandana: v }),
  },
};

export function createAvatar(char, variant) {
  const def = AVATARS[char] || AVATARS.tarte;
  const n = Math.max(1, def.variants);
  return def.create(((Math.floor(variant) % n) + n) % n);
}

// ---------- 訪問者のランダムな二つ名 ----------
const NAME_PREFIXES = [
  'そよかぜの', 'ひだまりの', 'こもれびの', 'うたかたの', 'ほしくずの',
  'あさつゆの', 'ゆうなぎの', 'かざはなの', 'しらなみの', 'つきかげの',
  'はなびらの', 'あまおとの',
];

// 端末ごとに一度だけ抽選して保存（自分のタルトに愛着が湧くように）
export function loadIdentity() {
  const KEY = 'vibe.island.identity.v1';
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    // hasOwnProperty で判定（"__proto__" 等のプロトタイプキーを弾く）＋名前長を制限
    if (saved && typeof saved.name === 'string' && Object.prototype.hasOwnProperty.call(AVATARS, saved.c)) {
      saved.name = saved.name.slice(0, 16);
      return saved;
    }
  } catch {}
  const char = 'tarte';
  const def = AVATARS[char];
  const id = {
    c: char,
    v: Math.floor(Math.random() * def.variants),
    name: NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)] + def.label,
  };
  try { localStorage.setItem(KEY, JSON.stringify(id)); } catch {}
  return id;
}
