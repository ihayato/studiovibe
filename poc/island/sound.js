// sound.js — 島のサウンド一式（BGMクロスフェード + WebAudioシンセSE）
// 既定OFF。トグル（ユーザー操作）でAudioContextを起こす。
// BGMはAudioBufferのloopで継ぎ目なし再生し、エリアに応じてゲインをクロスフェードする。
// SEは軽量シンセ（プリズム/水晶の世界観に合う澄んだ音）。後で生成素材に差し替え可能。

const LS_KEY = 'vibe.island.sound.v1';
const TRACKS = {
  island: '/audio/bgm_island.m4a',
  ukidoro: '/audio/bgm_ukidoro.m4a',
};
const BGM_LEVEL = 0.4;
const SE_LEVEL = 0.5;

export function createSound() {
  let on = false;
  let saved = '0';
  try { saved = localStorage.getItem(LS_KEY) || '0'; } catch {}

  let ctx = null;
  let master = null, seGain = null, bgmGain = null;
  const bgm = {}; // name -> { gain } | { pending: true }
  let zone = 'island';

  const ensureCtx = async () => {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.connect(ctx.destination);
      seGain = ctx.createGain();
      seGain.gain.value = SE_LEVEL;
      seGain.connect(master);
      bgmGain = ctx.createGain();
      bgmGain.gain.value = BGM_LEVEL;
      bgmGain.connect(master);
    }
    if (ctx.state === 'suspended') await ctx.resume().catch(() => {});
  };

  // ループBGMを読み込んで即再生開始（ゲイン0）。素材が無い環境では静かに諦める
  const loadTrack = async (name) => {
    if (bgm[name]) return;
    bgm[name] = { pending: true };
    try {
      const res = await fetch(TRACKS[name]);
      if (!res.ok) throw new Error('http ' + res.status);
      const buf = await ctx.decodeAudioData(await res.arrayBuffer());
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(bgmGain);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      src.connect(gain);
      src.start();
      bgm[name] = { gain };
    } catch {
      delete bgm[name];
    }
  };

  const setOn = async (v) => {
    on = v;
    try { localStorage.setItem(LS_KEY, v ? '1' : '0'); } catch {}
    if (v) {
      await ensureCtx();
      loadTrack('island');
      loadTrack('ukidoro');
    } else if (ctx) {
      ctx.suspend().catch(() => {});
    }
  };

  // ---------- シンセSE ----------
  const tone = (freq, { type = 'sine', dur = 0.18, peak = 0.2, glide = 0, delay = 0 } = {}) => {
    if (!ctx || !on || ctx.state !== 'running') return;
    const t0 = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (glide) o.frequency.exponentialRampToValueAtTime(glide, t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(seGain);
    o.start(t0);
    o.stop(t0 + dur + 0.1);
  };
  let noiseBuf = null;
  const noise = ({ dur = 0.06, peak = 0.18, hp = 2500, delay = 0 } = {}) => {
    if (!ctx || !on || ctx.state !== 'running') return;
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const t0 = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = hp;
    const g = ctx.createGain();
    g.gain.setValueAtTime(peak, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f);
    f.connect(g);
    g.connect(seGain);
    src.start(t0);
    src.stop(t0 + dur + 0.05);
  };

  const se = {
    jump: () => tone(392, { type: 'triangle', glide: 784, dur: 0.16, peak: 0.26 }),
    hop: () => tone(523, { type: 'triangle', glide: 1047, dur: 0.14, peak: 0.22 }),
    land: () => tone(147, { type: 'triangle', glide: 98, dur: 0.1, peak: 0.15 }),
    shard: () => {
      tone(1318.5, { dur: 0.32, peak: 0.1 });
      tone(1760, { dur: 0.42, peak: 0.08, delay: 0.07 });
    },
    coin: () => {
      tone(987.8, { type: 'triangle', dur: 0.16, peak: 0.1 });
      tone(1480, { dur: 0.28, peak: 0.08, delay: 0.055 });
    },
    shutter: () => {
      noise({ dur: 0.05, peak: 0.2, hp: 3000 });
      tone(1200, { type: 'square', dur: 0.04, peak: 0.04, delay: 0.05 });
    },
    ui: () => tone(660, { dur: 0.1, peak: 0.06 }),
    post: () => {
      tone(587, { dur: 0.14, peak: 0.08 });
      tone(880, { dur: 0.22, peak: 0.08, delay: 0.09 });
    },
    warp: () => {
      tone(880, { glide: 440, dur: 0.22, peak: 0.1 });
      tone(587, { glide: 1174, dur: 0.34, peak: 0.12, delay: 0.12 });
    },
    emote: () => tone(784, { glide: 1046, dur: 0.14, peak: 0.12 }),
  };

  return {
    get on() { return on; },
    toggle() { setOn(!on); },
    // 前回ONだった端末では、最初の操作でそっと音を起こす（自動再生制限対応）
    resumeIfSaved() { if (!on && saved === '1') setOn(true); },
    setZone(z) { zone = z; },
    // duck=true（主題歌が灯っている間）はBGMを絞る
    update(dt, { duck = false } = {}) {
      if (!ctx || !on) return;
      const duckK = duck ? 0.1 : 1;
      for (const [name, tr] of Object.entries(bgm)) {
        if (!tr.gain) continue;
        const tgt = (name === zone ? 1 : 0) * duckK;
        tr.gain.gain.value += (tgt - tr.gain.gain.value) * Math.min(1, dt * 1.4);
      }
    },
    se,
  };
}
