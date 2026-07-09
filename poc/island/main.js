import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { canvasTex, toon, addOutlines } from './toon.js';
import { createAvatar, loadIdentity } from './avatars.js';
import { SHELLS } from './tarte.js';
import { initPresence, makeNameLabel } from './net.js';
import { createSound } from './sound.js';

// 渡島記念札コントラクト(Base mainnet・2026-07-08デプロイ)
const NFT_CONTRACT = '0x1d3f8c6Bf7B9C174d03f4ED61a0928dEE04Ce728';

// Canvasテクスチャがフォールバック字形で焼かれるのを防ぐため、Webフォントの読み込みを待つ（最大2.5秒）
try {
  await Promise.race([
    Promise.all([
      document.fonts.load('700 32px "Zen Maru Gothic"'),
      document.fonts.load('800 32px "Shippori Mincho B1"'),
      document.fonts.ready,
    ]),
    new Promise((r) => setTimeout(r, 2500)),
  ]);
} catch {}

// ---------- renderer / scene ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25; // 月夜=あつ森テイストの明るさへ
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07070b);
scene.fog = new THREE.Fog(0x232c4a, 15, 46); // 青紫の月霧

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 160);
camera.position.set(2.4, 2.2, 6.8);

// 画面実寸への追従（リスナー登録は末尾・毎秒の照合はanimate内。モバイルのresize取りこぼし対策）
const applySize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};
let sizeCheckT = 0;

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.5, 3.2);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 1.5;
controls.maxDistance = 15;
controls.maxPolarAngle = 1.5;
controls.enablePan = false;
let lastManualOrbit = -10;
controls.addEventListener('start', () => (lastManualOrbit = clock ? clock.elapsedTime : 0));

// ---------- lights ----------
scene.add(new THREE.HemisphereLight(0x8ea2d8, 0x3d4a66, 0.55)); // 月夜の環境光

// 月光（空に浮かぶ月の方角から差し込む）
const key = new THREE.DirectionalLight(0xbfd4ff, 3.5);
key.position.set(-8, 10, -13);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -9;
key.shadow.camera.right = 9;
key.shadow.camera.top = 9;
key.shadow.camera.bottom = -9;
scene.add(key);

// glow素材ヘルパー
const glowMat = (color, opacity) => new THREE.MeshBasicMaterial({
  color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
});

// 丸い光のスプライトテクスチャ（点光・蛍・提灯のにじみ用）
const glowSpriteTex = canvasTex(128, 128, (ctx, w, h) => {
  const g = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.5)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
});
const glowSprite = (color, scale, opacity = 0.4) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowSpriteTex, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  s.scale.set(scale, scale, 1);
  return s;
};

// 色相そのまま・明度だけ持ち上げるヘルパー（月夜の地面テクスチャの底上げ用）
const liftLightnessRgb = (r, g, b, dl) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l0 = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l0 > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  const l = Math.min(1, Math.max(0, l0 + dl / 100));
  const hue2rgb = (p, q, tt) => {
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  let R, G, B;
  if (s === 0) {
    R = G = B = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    R = hue2rgb(p, q, h + 1 / 3);
    G = hue2rgb(p, q, h);
    B = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(R * 255), Math.round(G * 255), Math.round(B * 255)];
};
const liftHex = (hex, dl) => {
  const n = parseInt(hex.replace('#', ''), 16);
  const [r, g, b] = liftLightnessRgb((n >> 16) & 255, (n >> 8) & 255, n & 255, dl);
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
};
const liftRgbStr = (str, dl) => {
  const [r, g, b] = str.split(',').map(Number);
  return liftLightnessRgb(r, g, b, dl).join(',');
};

// 桜の花びら形テクスチャ（白で描いて色はマテリアルで乗せる）
const petalTex = canvasTex(64, 64, (ctx) => {
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(32, 58);
  ctx.quadraticCurveTo(58, 34, 44, 8);
  ctx.quadraticCurveTo(38, 16, 32, 20);
  ctx.quadraticCurveTo(26, 16, 20, 8);
  ctx.quadraticCurveTo(6, 34, 32, 58);
  ctx.fill();
  // 中心の淡い筋
  ctx.strokeStyle = 'rgba(255,210,225,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(32, 22);
  ctx.lineTo(32, 52);
  ctx.stroke();
});

// 提灯の和紙（縦リブ＋上下の陰）
const chochinTex = canvasTex(128, 128, (ctx, w, h) => {
  ctx.fillStyle = '#fff4e0';
  ctx.fillRect(0, 0, w, h);
  const shade = ctx.createLinearGradient(0, 0, 0, h);
  shade.addColorStop(0, 'rgba(80,50,30,0.35)');
  shade.addColorStop(0.25, 'rgba(80,50,30,0)');
  shade.addColorStop(0.75, 'rgba(80,50,30,0)');
  shade.addColorStop(1, 'rgba(80,50,30,0.4)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, w, h);
  for (let y = 8; y < h; y += 13) {
    ctx.strokeStyle = 'rgba(90,55,35,0.32)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
});

// ---------- 島の地形 ----------
const ISLAND_R = 9.0;
const WALK_R = 8.16;
const R_SCALE = 1.2; // 中央広場(半径2.5以内)より外側の配置物の動径スケール

const ZONES = [
  { key: 'game', en: 'GAME', jp: '月蝕綺譚 -Luna Occulta-', color: 0xd9333f, sub: 0xc9a85c, angle: -Math.PI / 2, url: 'https://vibe.co.jp/luna-occulta', go: 'ゲームについて詳しく知る' },
  { key: 'anime', en: 'ANIME', jp: 'オリジナルアニメ', color: 0x7bb8e0, sub: 0xeaf6ff, angle: Math.PI / 6, url: 'https://www.youtube.com/channel/UCwxMnx33RjYJ7mlZoFH7Aaw', go: 'アニメについて詳しく知る' },
  { key: 'music', en: 'MUSIC', jp: 'Sakuya - 咲耶', color: 0xf48fb8, sub: 0xffe0ee, angle: Math.PI - Math.PI / 6, url: null, go: '音楽について詳しく知る' },
];

// Phase 3: 参照の受け皿
const camColliders = [];
let animeScreenMesh = null;
const zoneRings = []; // 足元リング（近づくと強く光る）
const musicRefs = { rim: null, spots: [] };
let musicLevel = 0;
const ZONE_R = 5.2 * R_SCALE;
for (const z of ZONES) z.pos = new THREE.Vector3(Math.cos(z.angle) * ZONE_R, 0, Math.sin(z.angle) * ZONE_R);

// 円形コライダー（貫通防止）。topYを持つ障害物は、プレイヤーがtopY付近以上の高さにいる間は水平押し出しをスキップ（＝上に乗れる）
const obstacles = [];
const addObstacle = (x, z, r, topY = null) => obstacles.push({ x, z, r, topY });
addObstacle(0, 0, 0.7); // 中央の大樹（幹）
const CHAR_R = 0.26;
const resolveCollisions = (v, playerY) => {
  for (const o of obstacles) {
    if (o.topY != null && playerY != null && playerY >= o.topY - 0.08) continue;
    const dx = v.x - o.x, dz = v.z - o.z;
    const d = Math.hypot(dx, dz);
    const min = o.r + CHAR_R;
    if (d < min && d > 1e-4) {
      v.x = o.x + (dx / d) * min;
      v.z = o.z + (dz / d) * min;
    }
  }
  return v;
};

// 乗れる足場（2段ジャンプで登れる岩・茂み・木・ステージなど）。supportYはterrainHとの大きい方を返す
const PLATFORMS = [];
const addPlatform = (x, z, r, topY) => PLATFORMS.push({ x, z, r, topY });
const supportY = (x, z, py) => {
  // 島の外は虚空（縁の丘の数式が続いているだけで地面はない）。桟橋・岬の足場だけを支えにする
  let best = Math.hypot(x, z) <= WALK_R + 0.1 ? terrainH(x, z) : -9;
  for (const p of PLATFORMS) {
    const d = Math.hypot(x - p.x, z - p.z);
    if (d < p.r && py >= p.topY - 0.08) best = Math.max(best, p.topY);
  }
  return best;
};

// 地面テクスチャv2（夜の草原：草・光る花・桜紋の広場・飛び石）
// 月光で照らされたラベンダー寄りの緑にするため、地の色は明度+12〜18ptで底上げ（色相は不変）
const groundBaseA = liftHex('#18231f', 16);
const groundBaseB = liftHex('#10171a', 16);
const groundBaseC = liftHex('#0a0e12', 14);
const mossColA = liftRgbStr('70,110,90', 15);
const mossColB = liftRgbStr('60,90,120', 15);
const grassColA = liftRgbStr('96,150,116', 14);
const grassColB = liftRgbStr('58,96,120', 14);
const noiseColB = liftRgbStr('40,55,60', 15);
const groundTex = canvasTex(2048, 2048, (ctx, w, h) => {
  const cx = w / 2, cy = h / 2;
  const px = (world) => (world / ISLAND_R) * (w / 2); // world→px

  const g = ctx.createRadialGradient(cx, cy, px(0.5), cx, cy, px(ISLAND_R));
  g.addColorStop(0, groundBaseA);
  g.addColorStop(0.5, groundBaseB);
  g.addColorStop(1, groundBaseC);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // 苔むらのムラ（島が広がった分、描き込み数を1.2倍に補正）
  for (let i = 0; i < 55; i++) {
    const x = Math.random() * w, y = Math.random() * h, r = 60 + Math.random() * 180;
    const mg = ctx.createRadialGradient(x, y, 6, x, y, r);
    const col = i % 3 ? mossColA : mossColB;
    mg.addColorStop(0, `rgba(${col},0.08)`);
    mg.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 7);
    ctx.fill();
  }

  // 草のストローク
  ctx.lineCap = 'round';
  for (let i = 0; i < 2880; i++) {
    const x = Math.random() * w, y = Math.random() * h;
    const len = 5 + Math.random() * 12;
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 0.9;
    ctx.strokeStyle = `rgba(${Math.random() > 0.35 ? grassColA : grassColB},${0.05 + Math.random() * 0.1})`;
    ctx.lineWidth = 2 + Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + Math.cos(a) * len * 0.5 + 3, y + Math.sin(a) * len * 0.5, x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
  }

  // 光る花（夜光の小花）
  for (let i = 0; i < 156; i++) {
    const x = Math.random() * w, y = Math.random() * h;
    const col = ['140,220,255', '250,170,200', '235,240,255'][i % 3];
    const gg = ctx.createRadialGradient(x, y, 1, x, y, 10);
    gg.addColorStop(0, `rgba(${col},0.55)`);
    gg.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = gg;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 7);
    ctx.fill();
    ctx.fillStyle = `rgba(${col},0.75)`;
    for (let p = 0; p < 4; p++) {
      const pa = (p / 4) * Math.PI * 2 + i;
      ctx.beginPath();
      ctx.arc(x + Math.cos(pa) * 3, y + Math.sin(pa) * 3, 1.8, 0, 7);
      ctx.fill();
    }
  }

  // 中央広場：桜の大紋＋二重サークル＋目盛り
  ctx.strokeStyle = 'rgba(190,220,255,0.2)';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(cx, cy, px(1.75), 0, 7);
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, px(1.45), 0, 7);
  ctx.stroke();
  ctx.lineWidth = 7;
  ctx.strokeStyle = 'rgba(244,180,205,0.16)';
  for (let p = 0; p < 5; p++) {
    const pa = (p / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.save();
    ctx.translate(cx + Math.cos(pa) * px(0.85), cy + Math.sin(pa) * px(0.85));
    ctx.rotate(pa + Math.PI / 2);
    ctx.beginPath();
    ctx.ellipse(0, 0, px(0.34), px(0.5), 0, 0, 7);
    ctx.stroke();
    ctx.restore();
  }
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    ctx.strokeStyle = 'rgba(190,220,255,0.2)';
    ctx.lineWidth = i % 2 ? 3 : 6;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * px(1.8), cy + Math.sin(a) * px(1.8));
    ctx.lineTo(cx + Math.cos(a) * px(1.95), cy + Math.sin(a) * px(1.95));
    ctx.stroke();
  }

  // 三方向への飛び石の道
  for (const z of ZONES) {
    const dx = Math.cos(z.angle), dz = Math.sin(z.angle);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(z.angle);
    ctx.fillStyle = 'rgba(160,175,215,0.06)';
    ctx.fillRect(px(1.9 * R_SCALE), -px(0.34 * R_SCALE), px(3.1 * R_SCALE), px(0.68 * R_SCALE));
    ctx.restore();
    for (let i = 0; i < 7; i++) {
      const r = (2.1 + i * 0.45) * R_SCALE;
      const off = (i % 2 ? 0.16 : -0.16) * R_SCALE;
      const sx = cx + (dx * r - dz * off) * px(1);
      const sy = cy + (dz * r + dx * off) * px(1);
      ctx.fillStyle = 'rgba(215,225,250,0.18)';
      ctx.strokeStyle = 'rgba(140,150,190,0.32)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(sx, sy, px(0.2), px(0.15), z.angle, 0, 7);
      ctx.fill();
      ctx.stroke();
    }
  }

  // ノイズ
  for (let i = 0; i < 8400; i++) {
    ctx.fillStyle = `rgba(${Math.random() > 0.6 ? '150,175,190' : noiseColB},${0.02 + Math.random() * 0.05})`;
    const s = 2 + Math.random() * 4;
    ctx.fillRect(Math.random() * w, Math.random() * h, s, s);
  }
});

// 建材テクスチャ
const woodTex = canvasTex(256, 256, (ctx, w, h) => {
  ctx.fillStyle = '#2e2231';
  ctx.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 36) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, y, w, 4);
    ctx.fillStyle = 'rgba(255,220,200,0.05)';
    ctx.fillRect(0, y + 4, w, 3);
  }
  for (let i = 0; i < 70; i++) {
    ctx.strokeStyle = `rgba(18,10,20,${0.15 + Math.random() * 0.2})`;
    ctx.lineWidth = 1 + Math.random() * 2;
    const y = Math.random() * h;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(w * 0.3, y + (Math.random() - 0.5) * 8, w * 0.7, y + (Math.random() - 0.5) * 8, w, y);
    ctx.stroke();
  }
});
const roofTex = canvasTex(256, 256, (ctx, w, h) => {
  ctx.fillStyle = '#c22f3c';
  ctx.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 32) {
    for (let x = 0; x < w; x += 32) {
      const ox = (y / 32) % 2 ? 16 : 0;
      ctx.fillStyle = 'rgba(90,18,32,0.5)';
      ctx.beginPath();
      ctx.arc(x + ox + 16, y + 30, 16, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,200,180,0.22)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x + ox + 16, y + 30, 15, Math.PI + 0.3, -0.3);
      ctx.stroke();
    }
  }
});
const curtainTex = canvasTex(512, 128, (ctx, w, h) => {
  for (let x = 0; x < w; x += 32) {
    const light = (x / 32) % 2 === 0;
    const g = ctx.createLinearGradient(x, 0, x + 32, 0);
    if (light) {
      g.addColorStop(0, '#f48fb8');
      g.addColorStop(0.5, '#d96f9c');
      g.addColorStop(1, '#f48fb8');
    } else {
      g.addColorStop(0, '#2a1d2e');
      g.addColorStop(0.5, '#1c1220');
      g.addColorStop(1, '#2a1d2e');
    }
    ctx.fillStyle = g;
    ctx.fillRect(x, 0, 32, h);
  }
  const shade = ctx.createLinearGradient(0, 0, 0, h);
  shade.addColorStop(0, 'rgba(0,0,0,0.25)');
  shade.addColorStop(0.4, 'rgba(0,0,0,0)');
  shade.addColorStop(1, 'rgba(0,0,0,0.3)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, w, h);
});

// 地形の高さ（ジオメトリの変位と接地処理で共通の一次情報）
const terrainHGeo = (x, gy) => {
  const r = Math.hypot(x, gy);
  const a = Math.atan2(gy, x);
  const rimK = THREE.MathUtils.smoothstep(r, 6.2 * R_SCALE, 7.4 * R_SCALE);
  return rimK * 0.24 * (1 + 0.35 * Math.sin(a * 5 + 1.3)) + 0.02 * Math.sin(x * 2.3) * Math.sin(gy * 2.7);
};
// ワールド座標(x,z)での地面の高さ（島は-90°回転して置かれるので geoY = -z）
const terrainH = (x, z) => terrainHGeo(x, -z);

// 起伏（縁に向かって丘・内側は微細な揺らぎ）
// ※CircleGeometryは内部頂点を持たない扇形なのでRingGeometry(半径方向32分割)を使う
const islandGeo = new THREE.RingGeometry(0.01, ISLAND_R, 128, 32);
{
  const pos = islandGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setZ(i, terrainHGeo(pos.getX(i), pos.getY(i)));
  }
  islandGeo.computeVertexNormals();
}
const islandTop = new THREE.Mesh(islandGeo, new THREE.MeshStandardMaterial({ map: groundTex, roughness: 1 }));
islandTop.rotation.x = -Math.PI / 2;
islandTop.receiveShadow = true;
scene.add(islandTop);

// 崖・島底・底の水晶
{
  const cliffGeo = new THREE.CylinderGeometry(ISLAND_R, ISLAND_R * 0.88, 2.0, 96, 4, true);
  const pos = cliffGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const a = Math.atan2(z, x);
    const k = 1 + 0.04 * Math.sin(a * 9 + y * 2.5) + 0.03 * Math.sin(a * 17);
    pos.setX(i, x * k);
    pos.setZ(i, z * k);
  }
  cliffGeo.computeVertexNormals();
  const cliff = new THREE.Mesh(cliffGeo, new THREE.MeshStandardMaterial({ color: 0x0d0d16, roughness: 1 }));
  cliff.position.y = -1.0;
  scene.add(cliff);

  const bottom = new THREE.Mesh(
    new THREE.CylinderGeometry(ISLAND_R * 0.88, 1.6, 3.2, 48),
    new THREE.MeshStandardMaterial({ color: 0x090910, roughness: 1 })
  );
  bottom.position.y = -3.6;
  scene.add(bottom);

  // 島底から下がる水晶
  [[0, -5.0, 0, 0.55], [1.8, -4.2, 1.2, 0.3], [-2.2, -4.0, -0.8, 0.35]].forEach(([x, y, z, s]) => {
    const c = new THREE.Mesh(new THREE.ConeGeometry(s * 0.42, s * 1.7, 5), glowMat(0x9fd8f2, 0.35));
    c.position.set(x, y, z);
    c.rotation.x = Math.PI;
    scene.add(c);
  });
}

// 縁のプリズムリング（地形に沿わせる）
{
  const ringGeo = new THREE.RingGeometry(ISLAND_R - 0.18, ISLAND_R - 0.1, 128);
  const pos = ringGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setZ(i, terrainHGeo(pos.getX(i), pos.getY(i)) + 0.03);
  }
  const ring = new THREE.Mesh(ringGeo, glowMat(0x7be0ff, 0.2));
  ring.rotation.x = -Math.PI / 2;
  scene.add(ring);
}

// ---------- 空 ----------
// グラデーション＋星雲のドーム
{
  const skyTex = canvasTex(1024, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#05050c');
    g.addColorStop(0.55, '#0a0a16');
    g.addColorStop(0.8, '#12101f');
    g.addColorStop(1, '#0a0a12');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // 星雲（プリズムの分光を思わせる淡い帯）
    const blobs = [
      [0.2, 0.35, 150, 'rgba(120,90,160,0.16)'],
      [0.32, 0.3, 90, 'rgba(90,140,190,0.13)'],
      [0.72, 0.42, 130, 'rgba(170,90,140,0.12)'],
      [0.85, 0.3, 80, 'rgba(90,170,190,0.1)'],
      [0.52, 0.25, 110, 'rgba(110,100,180,0.1)'],
    ];
    for (const [u, v, r, col] of blobs) {
      const gg = ctx.createRadialGradient(u * w, v * h, 6, u * w, v * h, r);
      gg.addColorStop(0, col);
      gg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gg;
      ctx.beginPath();
      ctx.arc(u * w, v * h, r, 0, 7);
      ctx.fill();
    }
  });
  const skyMat = new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide });
  skyMat.fog = false;
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(70, 32, 24), skyMat));
}

// プリズム・オーロラ（分光のカーテンが夜空に揺れる）
const auroraMats = [];
{
  const auroraTex = canvasTex(1024, 512, (ctx, w, h) => {
    const cols = ['123,224,255', '154,123,255', '244,143,184', '123,255,214'];
    for (let i = 0; i < 16; i++) {
      const x = Math.random() * w;
      const bw = 50 + Math.random() * 110;
      const col = cols[i % cols.length];
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, `rgba(${col},0)`);
      g.addColorStop(0.35, `rgba(${col},${0.1 + Math.random() * 0.12})`);
      g.addColorStop(0.75, `rgba(${col},0.04)`);
      g.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(x - bw / 2, 0, bw, h);
      if (x + bw / 2 > w) ctx.fillRect(x - w - bw / 2, 0, bw, h);
    }
  });
  auroraTex.wrapS = THREE.RepeatWrapping;
  [-0.78, -0.5, -0.22].forEach((k, i) => {
    const a = Math.PI * k;
    const m = new THREE.MeshBasicMaterial({ map: auroraTex, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    m.fog = false;
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(38, 15), m);
    plane.position.set(Math.cos(a) * 40, 11 + i * 1.5, Math.sin(a) * 40);
    plane.lookAt(0, 4, 0);
    scene.add(plane);
    auroraMats.push(m);
  });
}

// 雲海（島は雲の海に浮かんでいる）
const cloudLayers = [];
{
  const cloudTex = canvasTex(512, 512, (ctx, w, h) => {
    for (let i = 0; i < 90; i++) {
      const x = Math.random() * w, y = Math.random() * h, r = 30 + Math.random() * 70;
      const g = ctx.createRadialGradient(x, y, 2, x, y, r);
      g.addColorStop(0, 'rgba(190,200,235,0.16)');
      g.addColorStop(1, 'rgba(190,200,235,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 7);
      ctx.fill();
    }
  });
  cloudTex.wrapS = cloudTex.wrapT = THREE.RepeatWrapping;
  [[26 * R_SCALE, -4.4, 0.85, 1], [34 * R_SCALE, -5.6, 0.6, -0.6]].forEach(([r, y, op, dir]) => {
    const tex = cloudTex.clone();
    tex.needsUpdate = true;
    tex.repeat.set(3, 3);
    const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: op, depthWrite: false });
    const disc = new THREE.Mesh(new THREE.CircleGeometry(r, 48), m);
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = y;
    scene.add(disc);
    cloudLayers.push({ tex, dir });
  });
}

// 流れ星
const shootingStars = [];
{
  for (let i = 0; i < 3; i++) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 0.05),
      new THREE.MeshBasicMaterial({ color: 0xeaf4ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
    );
    m.material.fog = false;
    scene.add(m);
    shootingStars.push({ mesh: m, life: -1, dir: new THREE.Vector3() });
  }
}
let nextStarT = 3;

// 星
{
  const n = 700;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(40 + Math.random() * 25);
    pos.set([v.x, v.y, v.z], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({ color: 0xc4cce8, size: 0.2, transparent: true, opacity: 0.9, map: glowSpriteTex, depthWrite: false });
  m.fog = false;
  scene.add(new THREE.Points(g, m));
}

// 月（クレーターつき・ハロー）
{
  const moonTex = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#f2ead8';
    ctx.fillRect(0, 0, w, h);
    for (const [x, y, r] of [[70, 80, 22], [150, 60, 14], [180, 150, 26], [90, 180, 16], [130, 120, 9]]) {
      ctx.fillStyle = 'rgba(180,168,150,0.5)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 7);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,248,232,0.35)';
      ctx.beginPath();
      ctx.arc(x - r * 0.2, y - r * 0.2, r * 0.72, 0, 7);
      ctx.fill();
    }
  });
  const moonMat = new THREE.MeshBasicMaterial({ map: moonTex });
  moonMat.fog = false;
  const moon = new THREE.Mesh(new THREE.SphereGeometry(1.9, 32, 24), moonMat);
  moon.position.set(-14, 9.5, -18);
  scene.add(moon);
  const haloMat = glowMat(0xf2ead8, 0.14);
  haloMat.fog = false;
  const halo = new THREE.Mesh(new THREE.CircleGeometry(3.4, 32), haloMat);
  halo.position.copy(moon.position);
  halo.lookAt(0, 2, 0);
  scene.add(halo);
}

// 桜吹雪（ちゃんと花びらの形）
const petals = [];
{
  const geo = new THREE.PlaneGeometry(0.085, 0.085);
  const tints = [0xf7a8c4, 0xffd0e0, 0xf48fb8];
  for (let i = 0; i < 30; i++) {
    const p = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      map: petalTex, color: tints[i % 3], side: THREE.DoubleSide, transparent: true, opacity: 0.9, depthWrite: false,
    }));
    const a = Math.random() * Math.PI * 2;
    const r = 1 + Math.random() * 5.5;
    p.position.set(Math.cos(a) * r, 0.3 + Math.random() * 2.6, Math.sin(a) * r);
    p.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    p.userData = { a, r, y0: p.position.y, s: 0.3 + Math.random() * 0.5, ph: Math.random() * 7 };
    scene.add(p);
    petals.push(p);
  }
}

// 蛍（丸い光のスプライト）
const fireflies = [];
{
  for (let i = 0; i < 24; i++) {
    const col = [0x9fe8d8, 0xf7c9a8, 0xbfd8ff][i % 3];
    const f = glowSprite(col, 0.16, 0.8);
    const a = Math.random() * Math.PI * 2;
    const r = 2 + Math.random() * 4.5;
    f.userData = { a, r, y0: 0.4 + Math.random() * 1.1, ph: Math.random() * 7, s: 0.2 + Math.random() * 0.4 };
    scene.add(f);
    fireflies.push(f);
  }
}

// 浮遊岩
const rocks = [];
{
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.6;
    const r = (9 + (i % 2) * 1.6) * R_SCALE;
    const s = 0.35 + Math.random() * 0.45;
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), toon(0x141420));
    rock.position.set(Math.cos(a) * r, -0.5 + Math.random() * 2.2, Math.sin(a) * r);
    rock.rotation.set(Math.random() * 3, Math.random() * 3, 0);
    rock.userData = { y0: rock.position.y, ph: Math.random() * 7, sp: 0.1 + Math.random() * 0.15 };
    addOutlines(rock, { min: 0.01, max: 0.02 });
    scene.add(rock);
    rocks.push(rock);
  }
}

// 樹木テクスチャ（中央の大樹と道沿いの木で共有）
const leafTexGen = (base, dark, light) => canvasTex(256, 256, (ctx, w, h) => {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) {
    ctx.fillStyle = dark;
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, 8 + Math.random() * 18, 0, 7);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (let i = 0; i < 44; i++) {
    ctx.fillStyle = light;
    ctx.globalAlpha = 0.32;
    ctx.beginPath();
    ctx.arc(Math.random() * w * 0.75, Math.random() * h * 0.6, 3 + Math.random() * 8, 0, 7);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
});
const pineTex = leafTexGen('#2e4a3a', '#182c22', '#7ba888');
const sakuraTex = leafTexGen('#d98ba3', '#a05876', '#f5c9d6');
const barkTex = canvasTex(128, 256, (ctx, w, h) => {
  ctx.fillStyle = '#3a2c2c';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 44; i++) {
    ctx.strokeStyle = `rgba(18,10,10,${0.2 + Math.random() * 0.25})`;
    ctx.lineWidth = 2 + Math.random() * 3;
    const x = Math.random() * w;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (Math.random() - 0.5) * 20, h);
    ctx.stroke();
  }
});

// ---------- 中央：桜の大樹（VIBEの源泉） ----------
const sakuraTree = new THREE.Group();
const blossomLight = new THREE.PointLight(0xffd9e8, 2.2, 12);
{
  // 幹（歪んだ円錐台。放射方向のノイズでゴツゴツと歪ませる）
  const trunkGeo = new THREE.CylinderGeometry(0.24, 0.55, 2.8, 14, 6);
  {
    const pos = trunkGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const a = Math.atan2(z, x);
      const k = 1 + 0.1 * Math.sin(a * 5 + y * 2.6) + 0.05 * Math.sin(a * 11 - y * 1.7);
      pos.setX(i, x * k);
      pos.setZ(i, z * k);
    }
    trunkGeo.computeVertexNormals();
  }
  const trunk = new THREE.Mesh(trunkGeo, toon(0xffffff, barkTex));
  trunk.position.y = 1.4;
  trunk.castShadow = true;
  sakuraTree.add(trunk);

  // 太い枝（幹の上部から外側かつ上向きへ放射）
  const BRANCH_N = 5;
  for (let i = 0; i < BRANCH_N; i++) {
    const ang = (i / BRANCH_N) * Math.PI * 2 + 0.5;
    const dir = new THREE.Vector3(Math.cos(ang), 1.15, Math.sin(ang)).normalize();
    const len = 1.1 + (i % 2) * 0.25;
    const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.13, len, 8), toon(0xffffff, barkTex));
    branch.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    branch.position.set(Math.cos(ang) * 0.34, 2.45, Math.sin(ang) * 0.34).addScaledVector(dir, len * 0.5);
    sakuraTree.add(branch);
  }

  // 花冠（桜クラスタ球をドーム状に重ねる。発光する呼吸マテリアルを共有）
  const crownMat = toon(0xffffff, sakuraTex, { emissive: 0xff9fc0, emissiveIntensity: 0.35 });
  const crownDefs = [
    [0, 3.9, 0, 1.35], [0, 4.6, 0, 1.0],
    [1.5, 3.7, 0.3, 1.05], [-1.4, 3.75, -0.4, 1.0],
    [0.4, 3.6, 1.5, 1.0], [-0.5, 3.65, -1.5, 1.0],
    [1.1, 3.6, -1.2, 0.95], [-1.1, 3.55, 1.3, 0.95],
    [0.7, 4.6, 0.7, 0.85], [-0.8, 4.55, -0.6, 0.85],
    [0.2, 4.9, -0.9, 0.75], [-0.3, 4.85, 0.9, 0.75],
  ];
  for (const [x, y, z, r] of crownDefs) {
    // 花冠は影を落とさない（月光で広場全体が黒く覆われるため）
    const c = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), crownMat);
    c.position.set(x, y, z);
    c.scale.set(1, 0.75, 1);
    sakuraTree.add(c);
  }
  sakuraTree.userData.crownMat = crownMat;

  // 花冠の主照明（島の広場を照らすメインライト）
  blossomLight.position.set(0, 3.9, 0);
  sakuraTree.add(blossomLight);

  // 根元：苔の盛り土＋名残りの小水晶（かつての水晶台座の名残り）
  const mound = new THREE.Mesh(
    new THREE.SphereGeometry(1.1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    toon(0x46583e)
  );
  mound.scale.set(1, 0.23, 1);
  mound.castShadow = true;
  sakuraTree.add(mound);
  // 盛り土は乗れる足場（2段ジャンプで登れる）
  addObstacle(0, 0, 1.05, terrainH(0, 0) + 0.25);
  addPlatform(0, 0, 1.05, terrainH(0, 0) + 0.25);
  const relicCrystals = [
    [0.62, 0.1, 0.2, 0.08, 0.42, 0.3],
    [-0.58, 0.09, -0.32, 0.07, 0.36, -0.25],
    [0.1, 0.09, -0.66, 0.06, 0.3, 0.15],
  ];
  for (const [x, y, z, r, hgt, tilt] of relicCrystals) {
    const c = new THREE.Mesh(new THREE.ConeGeometry(r, hgt, 5), new THREE.MeshToonMaterial({
      color: 0xcfe8f8, transparent: true, opacity: 0.85,
    }));
    c.position.set(x, y, z);
    c.rotation.z = tilt;
    c.castShadow = true;
    sakuraTree.add(c);
  }

  addOutlines(sakuraTree);
  sakuraTree.position.set(0, terrainH(0, 0), 0);
  scene.add(sakuraTree);
}

// 花びらの分光ストリーム（大樹の花冠→三館へ流れ、道の色に染まっていく）
const petalStreams = [];
const petalBaseColor = new THREE.Color(0xfff2f6);
{
  const streamGeo = new THREE.PlaneGeometry(0.075, 0.075);
  for (const z of ZONES) {
    const zoneColor = new THREE.Color(z.color);
    const n = 16;
    for (let i = 0; i < n; i++) {
      const mat = new THREE.MeshBasicMaterial({
        map: petalTex, color: 0xfff2f6, side: THREE.DoubleSide, transparent: true,
        opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(streamGeo, mat);
      mesh.userData = {
        zoneColor, target: z.pos, prog: i / n,
        speed: 0.085 + Math.random() * 0.05, off: (Math.random() - 0.5) * 0.55,
        ph: Math.random() * 7, noOutline: true,
      };
      scene.add(mesh);
      petalStreams.push(mesh);
    }
  }
}

// ---------- 三館（アートパス） ----------
// 月蝕綺譚メディア（動画テクスチャ＋画像ローダ＋浮遊オブジェクト）
const texLoader = new THREE.TextureLoader();
const srgbTex = (src) => {
  const tx = texLoader.load(src);
  tx.colorSpace = THREE.SRGBColorSpace;
  return tx;
};
const kitanVideos = [];
const kitanVideoTex = (src) => {
  const v = document.createElement('video');
  v.src = src;
  v.muted = true;
  v.loop = true;
  v.playsInline = true;
  kitanVideos.push(v);
  const t = new THREE.VideoTexture(v);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};
const floaties = [];

const labels = [];
const makeLabel = (en, jp, colorHex) => {
  const c = '#' + colorHex.toString(16).padStart(6, '0');
  const tex = canvasTex(512, 160, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.textAlign = 'center';
    ctx.fillStyle = c;
    ctx.font = 'bold 84px Futura, "Avenir Next", sans-serif';
    ctx.fillText(en, w / 2, 84, w - 48); // maxWidthで長い題字も収める
    ctx.fillStyle = '#f4f2ec';
    ctx.font = '700 34px "Shippori Mincho B1", "Hiragino Mincho ProN", serif';
    ctx.fillText(jp, w / 2, 138, w - 48);
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.69), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide }));
  m.userData.noOutline = true;
  labels.push(m);
  return m;
};

// 吊り提灯の街灯（和紙のリブ・ゾーン色・ゆらゆら揺れる）
const lanterns = [];
const mkLampPost = (color) => {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.05, 1.2, 10), toon(0xffffff, woodTex));
  pole.position.y = 0.6;
  pole.castShadow = true;
  g.add(pole);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.08, 8), toon(0x1a1420));
  cap.position.y = 1.24;
  g.add(cap);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.04, 0.36), toon(0xffffff, woodTex));
  arm.position.set(0, 1.16, 0.14);
  arm.castShadow = true;
  g.add(arm);
  // 揺れる部分（紐＋提灯）
  const swing = new THREE.Group();
  swing.position.set(0, 1.14, 0.3);
  const string = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.1, 6), toon(0x1a1420));
  string.position.y = -0.05;
  swing.add(string);
  const paper = new THREE.Mesh(
    new THREE.SphereGeometry(0.115, 20, 16),
    new THREE.MeshBasicMaterial({ map: chochinTex, color })
  );
  paper.scale.set(1, 1.3, 1);
  paper.position.y = -0.25;
  paper.userData.noOutline = true;
  swing.add(paper);
  for (const yy of [-0.11, -0.395]) {
    const capRing = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.03, 12), toon(0x1a1420));
    capRing.position.y = yy;
    swing.add(capRing);
  }
  const halo = glowSprite(color, 0.62, 0.25); // 月夜の明るさ底上げに合わせて白飛び防止
  halo.position.y = -0.25;
  swing.add(halo);
  g.add(swing);
  lanterns.push({ swing, ph: Math.random() * 7 });
  return g;
};

const screenScrolls = [];

for (const z of ZONES) {
  const { x: px2, z: pz2 } = z.pos;
  const g = new THREE.Group();
  g.position.copy(z.pos);
  g.rotation.y = Math.atan2(-px2, -pz2);

  const accent = toon(z.color);

  if (z.key === 'game') {
    // ---- GAME館：神社 ----
    // 鳥居（笠木の反り＝両端を持ち上げ）。プラザ寄りへ+1.4しスマホパネルとの距離を確保
    const TORII_Z = 3.2;
    for (const s of [1, -1]) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.115, 1.7, 16), accent);
      pillar.position.set(0.75 * s, 0.85, TORII_Z);
      pillar.castShadow = true;
      g.add(pillar);
    }
    const kasagi = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.16, 0.18), accent);
    kasagi.position.set(0, 1.74, TORII_Z);
    kasagi.castShadow = true;
    g.add(kasagi);
    for (const s of [1, -1]) {
      const tip = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.15, 0.18), accent);
      tip.position.set(1.08 * s, 1.8, TORII_Z);
      tip.rotation.z = 0.18 * s;
      g.add(tip);
    }
    const nuki = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.11, 0.13), accent);
    nuki.position.set(0, 1.38, TORII_Z);
    g.add(nuki);
    const gakuita = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, 0.06), toon(z.sub));
    gakuita.position.set(0, 1.56, TORII_Z);
    g.add(gakuita);

    // 本殿→巨大スマートフォン（石の台座にterrainH接地・やや後傾で立つ。全体を約1.35倍に拡大）
    {
      const yaw0 = g.rotation.y;
      const worldXZ0 = (lx, lz) => ({
        x: g.position.x + lx * Math.cos(yaw0) + lz * Math.sin(yaw0),
        z: g.position.z - lx * Math.sin(yaw0) + lz * Math.cos(yaw0),
      });
      const phoneBaseWorld = worldXZ0(0, -0.5);
      const phoneGroundY = terrainH(phoneBaseWorld.x, phoneBaseWorld.z);

      const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.84, 1.0, 0.3, 10), toon(0x3c3c4a));
      pedestal.position.set(0, phoneGroundY + 0.15, -0.5);
      pedestal.castShadow = true;
      g.add(pedestal);

      const phoneBody = new THREE.Group();
      phoneBody.position.set(0, phoneGroundY + 0.3, -0.5);
      phoneBody.rotation.x = -0.06;
      g.add(phoneBody);

      const slab = new THREE.Mesh(new RoundedBoxGeometry(2.0, 4.0, 0.2, 4, 0.107), toon(0x14141c));
      slab.position.y = 2.0;
      slab.castShadow = true;
      phoneBody.add(slab);
      camColliders.push(slab);

      const powerBtn = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 0.07), toon(0x0c0c12));
      powerBtn.position.set(1.04, 2.84, 0);
      phoneBody.add(powerBtn);

      const camDot = new THREE.Mesh(new THREE.CircleGeometry(0.038, 16), toon(0x33445c));
      camDot.position.set(0, 3.75, 0.12);
      camDot.userData.noOutline = true;
      phoneBody.add(camDot);

      // 浮かせ量0.09→0.12(スラブ厚み拡大に合わせZファイティング回避量も再計算)
      const screenGlowFrame = new THREE.Mesh(new THREE.PlaneGeometry(1.89, 3.67), glowMat(z.color, 0.22));
      screenGlowFrame.position.set(0, 2.0, 0.21);
      screenGlowFrame.userData.noOutline = true;
      phoneBody.add(screenGlowFrame);

      const phoneScreen = new THREE.Mesh(
        new THREE.PlaneGeometry(1.78, 3.56),
        new THREE.MeshBasicMaterial({ map: kitanVideoTex('/kitan/game_intro.mp4') })
      );
      phoneScreen.position.set(0, 2.0, 0.22);
      phoneScreen.userData.noOutline = true;
      phoneBody.add(phoneScreen);

      const screenSpill = new THREE.PointLight(0xffd9e8, 1.0, 5);
      screenSpill.position.set(0, 0.41, 0.68);
      phoneBody.add(screenSpill);
    }

    const zoneLight = new THREE.PointLight(z.color, 2.0, 7);
    zoneLight.position.set(0, 1.6, 0.6);
    g.add(zoneLight);

    // --- 月蝕綺譚ショーケース ---
    // 掛け軸シアター（旧本殿の壁掛け→自立スタンドに。OPタイトルのループ上映）
    {
      const stand = new THREE.Group();
      stand.position.set(-2.15, 0, 1.35);
      stand.rotation.y = 0.75;
      stand.scale.setScalar(1.35);
      for (const s of [1, -1]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 1.62, 10), toon(0xffffff, woodTex));
        post.position.set(0.45 * s, 0.81, 0);
        post.castShadow = true;
        stand.add(post);
      }
      const beam = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.07, 0.07), toon(0xffffff, woodTex));
      beam.position.set(0, 1.6, 0);
      beam.castShadow = true;
      stand.add(beam);
      const scroll = new THREE.Mesh(
        new THREE.PlaneGeometry(0.62, 1.1),
        new THREE.MeshBasicMaterial({ map: kitanVideoTex('/kitan/op_title_loop.mp4') })
      );
      scroll.position.set(0, 0.95, 0.02);
      scroll.userData.noOutline = true;
      stand.add(scroll);
      for (const yy of [1.53, 0.37]) {
        const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.74, 10), toon(0x1a1420));
        rail.rotation.z = Math.PI / 2;
        rail.position.set(0, yy, 0.03);
        stand.add(rail);
      }
      g.add(stand);
    }
    // 絵馬ギャラリー（実際のゲーム画面3枚）
    {
      const rack = new THREE.Group();
      rack.position.set(2.15, 0, 1.35);
      rack.rotation.y = -0.75;
      rack.scale.setScalar(1.35);
      for (const s of [1, -1]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 1.5, 10), toon(0xffffff, woodTex));
        post.position.set(0.8 * s, 0.75, 0);
        post.castShadow = true;
        rack.add(post);
      }
      const beam = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.07, 0.07), toon(0xffffff, woodTex));
      beam.position.set(0, 1.48, 0);
      beam.castShadow = true;
      rack.add(beam);
      ['screen_hensei', 'screen_ninmu', 'screen_shoukan'].forEach((name, i) => {
        const x = (i - 1) * 0.52;
        const tilt = (i - 1) * 0.03;
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.99, 0.03), toon(0x241a26));
        frame.position.set(x, 0.86, 0);
        frame.rotation.z = tilt;
        frame.castShadow = true;
        rack.add(frame);
        const art = new THREE.Mesh(
          new THREE.PlaneGeometry(0.42, 0.92),
          new THREE.MeshBasicMaterial({ map: srgbTex(`/kitan/${name}.webp`) })
        );
        art.position.set(x, 0.86, 0.02);
        art.rotation.z = tilt;
        art.userData.noOutline = true;
        rack.add(art);
        const str = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.14, 0.014), toon(0x1a1420));
        str.position.set(x, 1.42, 0);
        rack.add(str);
      });
      g.add(rack);
    }
  } else if (z.key === 'anime') {
    // ---- ANIME館：夜のシアター（同寸2枚のフィルム縁スクリーンを「ハの字」対称配置。どちらもベンチ側を向く） ----
    // フィルム縁飾り付きスクリーンを1枚組み立てる共通ヘルパー（位置・向き・映像だけが異なる）
    const buildFilmScreen = (localX, localZ, screenYaw, videoTexMesh) => {
      const holder = new THREE.Group();
      holder.position.set(localX, 0, localZ);
      holder.rotation.y = screenYaw;
      g.add(holder);

      const frame = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.15, 0.18), toon(0x191926));
      frame.position.set(0, 1.35, 0);
      frame.castShadow = true;
      holder.add(frame);
      camColliders.push(frame);
      for (const sy of [2.34, 0.36]) {
        const strip = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.14, 0.2), toon(0x0d0d14));
        strip.position.set(0, sy, 0);
        holder.add(strip);
        for (let i = -6; i <= 6; i++) {
          const hole = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.07), new THREE.MeshBasicMaterial({ color: 0xeaf6ff }));
          hole.position.set(i * 0.26, sy, 0.11);
          hole.userData.noOutline = true;
          holder.add(hole);
        }
      }
      videoTexMesh.position.set(0, 1.35, 0.1);
      videoTexMesh.userData.noOutline = true;
      holder.add(videoTexMesh);
      const screenGlow = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.2), glowMat(0x9fc4e8, 0.12));
      screenGlow.position.set(0, 1.35, 0.15);
      screenGlow.userData.noOutline = true;
      holder.add(screenGlow);
      return { holder, frame };
    };

    const screenTex = canvasTex(512, 288, (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#bcd9f2');
      grad.addColorStop(1, '#5a86b0');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      for (let y = 0; y < h; y += 6) ctx.fillRect(0, y, w, 2);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.textAlign = 'center';
      ctx.font = 'bold 62px Futura, sans-serif';
      ctx.fillText('NOW SHOWING', w / 2, h / 2 - 8);
      ctx.font = '700 30px "Zen Maru Gothic", "Hiragino Sans", sans-serif';
      ctx.fillText('フルAIアニメ上映中', w / 2, h / 2 + 46);
    });
    screenTex.wrapT = THREE.RepeatWrapping;
    screenScrolls.push(screenTex);
    const screenMesh1 = new THREE.Mesh(new THREE.PlaneGeometry(3.15, 1.75), new THREE.MeshBasicMaterial({ map: screenTex }));
    // 1枚目（NOW SHOWING→hero-bg.mp4に差し替わる）。ベンチ側を向く「ハの字」左側
    buildFilmScreen(-1.95, -0.5, 0.21, screenMesh1);
    animeScreenMesh = screenMesh1;

    // 2枚目（ミタセオPV）。「ハの字」右側
    const screenMesh2 = new THREE.Mesh(
      new THREE.PlaneGeometry(3.15, 1.75),
      new THREE.MeshBasicMaterial({ map: kitanVideoTex('/pv_mitaseo.mp4') })
    );
    buildFilmScreen(1.95, -0.5, -0.21, screenMesh2);

    // ベンチと映写機
    for (const s of [1, -1]) {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.26, 0.36), toon(0x2a2334));
      bench.position.set(0.7 * s, 0.13, 1.5);
      bench.castShadow = true;
      g.add(bench);
    }
    const zoneLight = new THREE.PointLight(z.color, 1.9, 7);
    zoneLight.position.set(0, 1.5, 0.4);
    g.add(zoneLight);
  } else {
    // ---- MUSIC館：野外ステージ ----
    const stage = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.7, 0.36, 48), toon(0x241d2e));
    stage.position.set(0, 0.18, -0.35);
    stage.castShadow = true;
    g.add(stage);
    // ステージ幕（ストライプ）
    const curtain = new THREE.Mesh(new THREE.CylinderGeometry(1.57, 1.73, 0.3, 48, 1, true), toon(0xffffff, curtainTex));
    curtain.position.set(0, 0.16, -0.35);
    g.add(curtain);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.03, 10, 64), new THREE.MeshBasicMaterial({ color: z.color }));
    rim.rotation.x = Math.PI / 2;
    rim.position.set(0, 0.37, -0.35);
    rim.userData.noOutline = true;
    g.add(rim);
    musicRefs.rim = rim;
    camColliders.push(stage);

    // MVスクリーン（ステージ背面いっぱいの大型LEDウォール）
    {
      const mvGlowFrame = new THREE.Mesh(new THREE.PlaneGeometry(4.62, 2.68), glowMat(z.color, 0.28));
      mvGlowFrame.position.set(0, 1.72, -1.61);
      mvGlowFrame.userData.noOutline = true;
      g.add(mvGlowFrame);
      const mvScreen = new THREE.Mesh(
        new THREE.PlaneGeometry(4.5, 2.53),
        new THREE.MeshBasicMaterial({ map: kitanVideoTex('/mv_sakuya.mp4') })
      );
      mvScreen.position.set(0, 1.72, -1.6);
      mvScreen.userData.noOutline = true;
      g.add(mvScreen);
      camColliders.push(mvScreen);
    }
    // スピーカー（マイクスタンドはMVスクリーンを遮るため置かない）
    for (const s of [1, -1]) {
      const spk = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.78, 0.44), toon(0x1f1a28));
      spk.position.set(1.7 * s, 0.39, 0.15);
      spk.castShadow = true;
      g.add(spk);
      const cone1 = new THREE.Mesh(new THREE.CircleGeometry(0.13, 20), toon(0x39304a));
      cone1.position.set(1.7 * s, 0.55, 0.375);
      g.add(cone1);
      const cone2 = new THREE.Mesh(new THREE.CircleGeometry(0.09, 20), toon(0x39304a));
      cone2.position.set(1.7 * s, 0.24, 0.375);
      g.add(cone2);
    }

    // スポットライトの光条
    for (const s of [1, -1]) {
      const spot = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2.2, 20, 1, true), glowMat(s > 0 ? 0xf48fb8 : 0x9fe8d8, 0.08));
      spot.position.set(0.75 * s, 1.3, -0.8);
      spot.rotation.z = -0.35 * s;
      spot.rotation.x = 0.15;
      spot.userData.noOutline = true;
      g.add(spot);
      musicRefs.spots.push(spot);
    }

    // 浮かぶ音符
    const noteTex = canvasTex(128, 128, (ctx, w, h) => {
      ctx.fillStyle = '#ffe0ee';
      ctx.font = '700 96px "Zen Maru Gothic", "Hiragino Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('♪', w / 2, 96);
    });
    for (let i = 0; i < 3; i++) {
      const note = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.28), new THREE.MeshBasicMaterial({ map: noteTex, transparent: true, side: THREE.DoubleSide }));
      note.position.set(-0.6 + i * 0.6, 1.5 + (i % 2) * 0.3, -0.5);
      note.userData = { y0: note.position.y, ph: i * 2.1, noOutline: true, isNote: true };
      labels.push(note); // ビルボード対象
      petals.push(Object.assign(note, { userData: { ...note.userData, a: 0, r: 0, s: 0 } }));
      g.add(note);
    }

    const zoneLight = new THREE.PointLight(z.color, 2.0, 7);
    zoneLight.position.set(0, 1.5, -0.2);
    g.add(zoneLight);
  }

  // 看板・足元リング
  const label = makeLabel(z.en, z.jp, z.color);
  label.position.set(0, 2.7, 0.4);
  g.add(label);
  const zr = new THREE.Mesh(new THREE.RingGeometry(2.72, 3.0, 96), glowMat(z.color, 0.6));
  zr.rotation.x = -Math.PI / 2;
  zr.position.y = 0.04;
  zr.userData.noOutline = true;
  g.add(zr);
  // 内側のほのかな満ち光（近づくと灯る）
  const zrFill = new THREE.Mesh(new THREE.RingGeometry(0.02, 2.72, 96), glowMat(z.color, 0.05));
  zrFill.rotation.x = -Math.PI / 2;
  zrFill.position.y = 0.035;
  zrFill.userData.noOutline = true;
  g.add(zrFill);
  zoneRings.push({ ring: zr, fill: zrFill, zone: z });

  // 館のコライダー（ローカル座標→ワールドに変換して登録）
  {
    const yaw = g.rotation.y;
    const worldOf = (lx, lz) => ({
      x: g.position.x + lx * Math.cos(yaw) + lz * Math.sin(yaw),
      z: g.position.z - lx * Math.sin(yaw) + lz * Math.cos(yaw),
    });
    const OBS = {
      game: [
        [0, -0.5, 1.05], [0.75, 3.2, 0.16], [-0.75, 3.2, 0.16],
        [2.15, 1.35, 1.15], [-2.15, 1.35, 0.85],
      ],
      anime: [
        // スクリーン1（左・NOW SHOWING→hero-bg）中心＋左右端
        [-1.95, -0.5, 0.85], [-3.66, -0.14, 0.85], [-0.24, -0.86, 0.85],
        // スクリーン2（右・ミタセオPV）中心＋左右端
        [1.95, -0.5, 0.85], [0.24, -0.86, 0.85], [3.66, -0.14, 0.85],
        [0.7, 1.5, 0.55, 0.26], [-0.7, 1.5, 0.55, 0.26],
      ],
      music: [
        [0, -0.35, 1.8, 0.36], [1.7, 0.15, 0.38], [-1.7, 0.15, 0.38],
      ],
    }[z.key];
    // topYLocal付きのエントリはベンチ座面／ステージ床＝乗れる足場として登録
    for (const [lx, lz, orr, topYLocal] of OBS) {
      const w2 = worldOf(lx, lz);
      if (topYLocal != null) {
        const topY = terrainH(w2.x, w2.z) + topYLocal;
        addObstacle(w2.x, w2.z, orr, topY);
        addPlatform(w2.x, w2.z, orr, topY);
      } else {
        addObstacle(w2.x, w2.z, orr);
      }
    }
  }

  addOutlines(g, { min: 0.008, max: 0.02 });
  scene.add(g);

  // 道沿いの吊り提灯（提灯は道側を向く・地形に接地）。GAME/ANIME館側は視界確保のため全撤去、MUSIC側は外側リング(rr=4.1)のみ間引く
  for (const rrBase of [2.7, 4.1]) {
    if (z.key === 'anime' || z.key === 'game') continue;
    if (z.key === 'music' && rrBase === 4.1) continue;
    const rr = rrBase * R_SCALE;
    for (const offBase of [0.55, -0.55]) {
      const off = offBase * R_SCALE;
      const lamp = mkLampPost(z.color);
      const dx = Math.cos(z.angle), dz = Math.sin(z.angle);
      const px = dx * rr - dz * off;
      const pz = dz * rr + dx * off;
      lamp.position.set(px, terrainH(px, pz), pz);
      const s = Math.sign(off);
      lamp.rotation.y = Math.atan2(dz * s, -dx * s);
      addObstacle(px, pz, 0.12);
      addOutlines(lamp);
      scene.add(lamp);
    }
  }
}

// 木・茂み・岩（テクスチャ入りで密度アップ。樹皮・桜クラスタのテクスチャは中央の大樹と共有）
{
  // Math.PI*0.32方向の桜(旧6本目)はANIME館の右スクリーン(ミタセオPV)と干渉するため撤去(距離1.67<干渉判定1.5余裕なし)
  const treeDefs = [
    [-Math.PI / 6, 6.3, 0], [Math.PI / 2, 6.4, 1], [Math.PI * 0.6, 6.2, 0],
    [-Math.PI * 0.82, 6.3, 1], [-Math.PI * 0.35, 6.5, 0],
  ];
  treeDefs.forEach(([a, rBase, kind]) => {
    const r = rBase * R_SCALE;
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 0.7, 12), toon(0xffffff, barkTex));
    trunk.position.y = 0.35;
    trunk.castShadow = true;
    tree.add(trunk);
    let crownY, crownR;
    if (kind === 0) {
      const l1 = new THREE.Mesh(new THREE.ConeGeometry(0.62, 1.05, 14), toon(0xffffff, pineTex));
      l1.position.y = 1.1;
      l1.castShadow = true;
      const l2 = new THREE.Mesh(new THREE.ConeGeometry(0.46, 0.82, 14), toon(0xffffff, pineTex));
      l2.position.y = 1.62;
      tree.add(l1, l2);
      crownY = 1.1;
      crownR = 0.62;
    } else {
      const blossom = new THREE.Mesh(new THREE.SphereGeometry(0.62, 20, 16), toon(0xffffff, sakuraTex));
      blossom.position.y = 1.25;
      blossom.scale.set(1, 0.85, 1);
      blossom.castShadow = true;
      const blossom2 = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 12), toon(0xffffff, sakuraTex));
      blossom2.position.set(0.3, 1.55, 0.1);
      tree.add(blossom, blossom2);
      crownY = 1.25;
      crownR = 0.62;
    }
    const tx = Math.cos(a) * r, tz = Math.sin(a) * r;
    tree.position.set(tx, terrainH(tx, tz) + 0.04, tz);
    addObstacle(tx, tz, 0.24);
    // 花冠／葉クラスタの上面を足場として登録（岩→2段ジャンプで木の上、が成立する高さ）
    addPlatform(tx, tz, 0.8, tree.position.y + crownY + crownR * 0.6);
    addOutlines(tree);
    scene.add(tree);
  });

  // 茂み
  for (let i = 0; i < 7; i++) {
    const a = i * 0.92 + 0.45;
    const r = (5.2 + (i % 3) * 0.6) * R_SCALE;
    const bushRadius = 0.22 + (i % 2) * 0.08;
    const bush = new THREE.Mesh(new THREE.SphereGeometry(bushRadius, 14, 10), toon(0xffffff, pineTex));
    bush.scale.set(1.15, 0.7, 1.15);
    const bx = Math.cos(a) * r, bz = Math.sin(a) * r;
    const bushBaseY = terrainH(bx, bz) + 0.1;
    bush.position.set(bx, bushBaseY, bz);
    const bushTopY = bushBaseY + bushRadius * 0.7;
    addObstacle(bx, bz, 0.3, bushTopY);
    addPlatform(bx, bz, 0.3, bushTopY);
    bush.castShadow = true;
    addOutlines(bush);
    scene.add(bush);
  }
  // 地面の岩
  for (let i = 0; i < 6; i++) {
    const a = i * 1.13 + 0.2;
    const r = (4.6 + (i % 3) * 0.8) * R_SCALE;
    const rockRadius = 0.13 + (i % 3) * 0.07;
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rockRadius, 0), toon(0x3c3c4a));
    const rx = Math.cos(a) * r, rz = Math.sin(a) * r;
    const rockBaseY = terrainH(rx, rz) + 0.06;
    rock.position.set(rx, rockBaseY, rz);
    const rockTopY = rockBaseY + rockRadius;
    addObstacle(rx, rz, rockRadius, rockTopY);
    addPlatform(rx, rz, rockRadius, rockTopY);
    rock.rotation.set(i, i * 2, 0);
    rock.castShadow = true;
    addOutlines(rock);
    scene.add(rock);
  }
}

// ---------- 島の案内板（高札風・三館の道と被らない南寄りの隙間に単独設置。ZONESには入れない） ----------
const INFO_ANGLE = (7 * Math.PI) / 6; // 210°＝MUSIC(150°)とGAME(-90°=270°)の間の隙間
const INFO_R = 2.6;
const infoPos = new THREE.Vector3(Math.cos(INFO_ANGLE) * INFO_R, 0, Math.sin(INFO_ANGLE) * INFO_R);
{
  const infoGroup = new THREE.Group();
  const infoGroundY = terrainH(infoPos.x, infoPos.z);
  infoGroup.position.set(infoPos.x, infoGroundY, infoPos.z);
  infoGroup.rotation.y = Math.atan2(-infoPos.x, -infoPos.z); // 中央広場を向く

  for (const s of [1, -1]) {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 1.5, 10), toon(0xffffff, woodTex));
    pillar.position.set(0.42 * s, 0.75, 0);
    pillar.castShadow = true;
    infoGroup.add(pillar);
  }
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.62, 0.05), toon(0xffffff, woodTex));
  board.position.set(0, 1.05, 0.03);
  board.castShadow = true;
  infoGroup.add(board);
  for (const s of [1, -1]) {
    const slope = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.05, 0.34), toon(0xffffff, woodTex));
    slope.position.set(0, 1.5, 0.1 * s);
    slope.rotation.x = -0.5 * s;
    slope.castShadow = true;
    infoGroup.add(slope);
  }
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.04, 0.06), toon(0x1a1420));
  ridge.position.set(0, 1.62, 0);
  infoGroup.add(ridge);

  // 板面：墨文字「島の案内」縦書き風＋STUDIO VIBEロゴ文字
  // ※キャンバスの縦横比は貼り先PlaneGeometry(0.78×0.5=1.56:1)と一致させる（ずれると文字が潰れる）
  const infoBoardTex = canvasTex(512, 328, (ctx, w, h) => {
    ctx.fillStyle = '#f1e6cf';
    ctx.fillRect(0, 0, w, h);
    for (let x = 12; x < w; x += 26) {
      ctx.strokeStyle = 'rgba(120,90,50,0.08)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(40,26,16,0.6)';
    ctx.lineWidth = 6;
    ctx.strokeRect(14, 14, w - 28, h - 28);
    ctx.fillStyle = '#231610';
    ctx.font = '700 54px "Shippori Mincho B1", "Hiragino Mincho ProN", serif';
    ctx.textAlign = 'center';
    ['島', 'の', '案', '内'].forEach((c, i) => ctx.fillText(c, w / 2, 74 + i * 60));
    ctx.font = '700 22px Futura, "Avenir Next", sans-serif';
    ctx.fillStyle = '#6b5636';
    ctx.fillText('STUDIO VIBE', w / 2, h - 26);
  });
  const boardFace = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.5), new THREE.MeshBasicMaterial({ map: infoBoardTex }));
  boardFace.position.set(0, 1.05, 0.06);
  boardFace.userData.noOutline = true;
  infoGroup.add(boardFace);

  addObstacle(infoPos.x, infoPos.z, 0.45);
  addOutlines(infoGroup);
  scene.add(infoGroup);
}

// 地を這う霧
const mists = [];
{
  const mistTex = canvasTex(256, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 8, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(190,205,235,0.14)');
    g.addColorStop(1, 'rgba(190,205,235,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 4.6), new THREE.MeshBasicMaterial({ map: mistTex, transparent: true, opacity: 0.5, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    const a = (i / 6) * Math.PI * 2;
    m.position.set(Math.cos(a) * 5.6 * R_SCALE, 0.1, Math.sin(a) * 5.6 * R_SCALE);
    m.userData = { a, ph: i * 1.7 };
    scene.add(m);
    mists.push(m);
  }
}

// ---------- ANIME館：実映像（ショーリール）をスクリーンへ ----------
{
  const video = document.createElement('video');
  video.src = '/video/hero-bg.mp4';
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.addEventListener('loadeddata', () => {
    const vt = new THREE.VideoTexture(video);
    vt.colorSpace = THREE.SRGBColorSpace;
    if (animeScreenMesh) {
      animeScreenMesh.material.map = vt;
      animeScreenMesh.material.needsUpdate = true;
    }
  });
  const tryPlay = () => video.play().catch(() => {});
  tryPlay();
  addEventListener('pointerdown', tryPlay, { once: true });
}

// 月蝕綺譚の動画（掛け軸・絵札）も同様に再生
{
  const playAll = () => kitanVideos.forEach((v) => v.play().catch(() => {}));
  playAll();
  addEventListener('pointerdown', playAll, { once: true });
}

// ---------- MUSIC館：音を灯す（主題歌＋音反応） ----------
// ---------- サウンド（BGM+SE・既定OFF） ----------
const sound = createSound();
const soundBtn = document.getElementById('sound');
const renderSoundBtn = () => soundBtn && soundBtn.classList.toggle('off', !sound.on);
if (soundBtn) {
  soundBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
  soundBtn.addEventListener('click', () => {
    sound.toggle();
    renderSoundBtn();
  });
}
renderSoundBtn();
// 前回ONだった端末は、最初の操作で音を起こす（自動再生制限のため）
addEventListener('pointerdown', () => {
  sound.resumeIfSaved();
  renderSoundBtn();
}, { once: true });

// ---------- もどるボタン（アトラクションから中央広場へ） ----------
const homeBtn = document.getElementById('home');
const goHome = () => {
  const pos = tarte.group.position;
  spawnBurst(pos.x, pos.z, 0x9fd8f2);
  misakiShot = null;
  pos.set(0, 0, 3.2);
  py = supportY(0, 3.2, 1e9);
  pos.y = py;
  vy = 0;
  grounded = true;
  airJumps = 0;
  target.copy(pos);
  moving = false;
  tarte.group.rotation.y = Math.PI;
  controls.target.set(0, 0.6, 3.2);
  camera.position.set(2.4, 2.6, 7.4);
  camGroundY = camGroundTargetY = py; // カメラの接地面追従もここへ揃える（後からぬるっと滑らない）
  prevPos.copy(pos);
  spawnBurst(0, 3.2, 0xf48fb8);
  sound.se.warp();
};
if (homeBtn) {
  homeBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
  homeBtn.addEventListener('click', goHome);
}

let musicOn = false;
let audioEl = null, audioCtx = null, analyser = null, freqData = null;
const toggleMusic = () => {
  if (!audioEl) {
    audioEl = new Audio('/audio/op_title.m4a');
    audioEl.loop = true;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const src = audioCtx.createMediaElementSource(audioEl);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    src.connect(analyser);
    analyser.connect(audioCtx.destination);
    freqData = new Uint8Array(analyser.frequencyBinCount);
  }
  musicOn = !musicOn;
  if (musicOn) {
    audioCtx.resume();
    audioEl.play().catch(() => (musicOn = false));
  } else {
    audioEl.pause();
    audioCtx.suspend().catch(() => {}); // 止めたらAudioContextも眠らせる（rAF外の常駐を残さない）
  }
};

// ---------- 衝動のかけら（7つ集めると…） ----------
const shards = [];
const bursts = [];
const collected = new Set((() => {
  try {
    const a = JSON.parse(localStorage.getItem('vibe_shards') || '[]');
    return Array.isArray(a) ? a : [];
  } catch { return []; } // localStorageが壊れていてもモジュール全体を落とさない
})());
const SHARD_POS = [[2.4, -1.2], [-2.6, -3.4], [5.6, 1.4], [-5.4, -1.2], [0.8, 5.6], [-3.8, 4.4], [6.2, -2.2]];
SHARD_POS.forEach(([sxBase, szBase], i) => {
  const sx = sxBase * R_SCALE, sz = szBase * R_SCALE;
  const sg = new THREE.Group();
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.09), new THREE.MeshBasicMaterial({ color: 0xeaf6ff }));
  core.userData.noOutline = true;
  const halo = new THREE.Mesh(new THREE.OctahedronGeometry(0.17), glowMat(i % 2 ? 0xf48fb8 : 0x7be0ff, 0.35));
  halo.userData.noOutline = true;
  sg.add(core, halo);
  // 空へ伸びる目印の光柱
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.06, 1.9, 10, 1, true),
    glowMat(i % 2 ? 0xf48fb8 : 0x7be0ff, 0.16)
  );
  beam.position.y = 0.95;
  beam.userData.noOutline = true;
  sg.add(beam);
  const baseY = terrainH(sx, sz) + 0.5;
  sg.position.set(sx, baseY, sz);
  sg.userData = { i, ph: i * 1.3, beam, baseY };
  sg.visible = !collected.has(i);
  scene.add(sg);
  shards.push(sg);
});
const shardsTextEl = document.getElementById('shards-text');
const toastEl = document.getElementById('toast');
let toastTimer = null;
const showToast = (html, ms = 4200) => {
  if (!toastEl) return;
  toastEl.innerHTML = html;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), ms);
};
const updateShardHud = () => {
  if (shardsTextEl) shardsTextEl.textContent = `かけら ${collected.size}/7`;
};
updateShardHud();
const spawnBurst = (x, z, color) => {
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.16, 40), glowMat(color, 0.8));
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(x, 0.03, z);
  scene.add(ring);
  bursts.push({ mesh: ring, t: 0 });
};

// ---------- 隠し祠（渡島記念札）----------
// 大樹の根元・盛り土の縁。案内板(210°)と反対側の30°付近に置く
const SHRINE_ANGLE = Math.PI / 6;
const SHRINE_R = 1.85; // 1.3倍化に合わせて盛り土の縁から少し外へ
const shrinePos = new THREE.Vector3(Math.cos(SHRINE_ANGLE) * SHRINE_R, 0, Math.sin(SHRINE_ANGLE) * SHRINE_R);
let shrineVisible = collected.size >= 7;
// 祠の衝突判定は「現れた時」に足す（見えない壁を作らない）
const addShrineObstacle = () => addObstacle(shrinePos.x, shrinePos.z, 0.6);
const shrineGroup = new THREE.Group();
{
  const groundY = terrainH(shrinePos.x, shrinePos.z);
  shrineGroup.position.set(shrinePos.x, groundY, shrinePos.z);
  shrineGroup.rotation.y = Math.atan2(-shrinePos.x, -shrinePos.z); // 中央広場を向く
  shrineGroup.scale.setScalar(1.3);

  // 石の台
  const stonePlat = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.56, 0.16, 12), toon(0x3a3a44));
  stonePlat.position.y = 0.08;
  stonePlat.castShadow = true;
  stonePlat.receiveShadow = true;
  shrineGroup.add(stonePlat);

  // 小さな木の社
  const shrineBox = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.4, 0.34), toon(0xffffff, woodTex));
  shrineBox.position.set(0, 0.36, 0);
  shrineBox.castShadow = true;
  shrineGroup.add(shrineBox);
  const shrineRoof = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.22, 4), toon(0x8a2530));
  shrineRoof.rotation.y = Math.PI / 4;
  shrineRoof.position.set(0, 0.66, 0);
  shrineRoof.castShadow = true;
  shrineGroup.add(shrineRoof);
  const shrineDoor = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.24), new THREE.MeshBasicMaterial({ color: 0xd9a94c }));
  shrineDoor.position.set(0, 0.32, 0.18);
  shrineDoor.userData.noOutline = true;
  shrineGroup.add(shrineDoor);

  // 緋色の小鳥居
  const toriiMat = toon(0xc23347);
  for (const s of [1, -1]) {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.036, 0.62, 10), toriiMat);
    pillar.position.set(0.26 * s, 0.31, 0.48);
    pillar.castShadow = true;
    shrineGroup.add(pillar);
  }
  const kasagi = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.05, 0.06), toriiMat);
  kasagi.position.set(0, 0.63, 0.48);
  shrineGroup.add(kasagi);
  for (const s of [1, -1]) {
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.045, 0.06), toriiMat);
    tip.position.set(0.34 * s, 0.655, 0.48);
    tip.rotation.z = 0.18 * s;
    shrineGroup.add(tip);
  }
  const nuki = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.032, 0.045), toriiMat);
  nuki.position.set(0, 0.5, 0.48);
  shrineGroup.add(nuki);

  // 金の光の粒
  const shrineSparks = [];
  for (let i = 0; i < 8; i++) {
    const sp = glowSprite(0xf0c869, 0.09, 0.75);
    sp.userData = { a: (i / 8) * Math.PI * 2, r: 0.34 + (i % 3) * 0.05, y0: 0.3 + (i % 4) * 0.1, ph: i * 0.9 };
    shrineGroup.add(sp);
    shrineSparks.push(sp);
  }
  shrineGroup.userData.sparks = shrineSparks;

  addOutlines(shrineGroup);
  shrineGroup.visible = shrineVisible;
  if (shrineVisible) addShrineObstacle();
  scene.add(shrineGroup);
}

// ---------- 光の桟橋と月見の岬 ----------
// 月(-14, 9.5, -18)の対蹠方向(約52°)はアニメ館の裏に当たり通れないため、
// 障害物のない70°へ。岬から島を振り返ると、大樹のやや左上に月がかかる。
const PIER_ANGLE = (70 * Math.PI) / 180;
const PIER_AX = Math.cos(PIER_ANGLE), PIER_AZ = Math.sin(PIER_ANGLE);
const PIER_S0 = 7.2; // 付け根（島の草の上の石段から始まる）
const DECK_S = 15.0; // 岬デッキ中心までの距離
const PIER_HALF_W = 0.55; // 桟橋で歩ける半幅
const DECK_WALK_R = 1.85; // デッキで歩ける半径
const PIER_TOP = 0.34; // 桟橋の床高（島の縁の丘より上を通す）
const DECK_TOP = PIER_TOP;
const DECK_POS = new THREE.Vector3(PIER_AX * DECK_S, 0, PIER_AZ * DECK_S);
const pierXZ = (s, q) => ({ x: PIER_AX * s - PIER_AZ * q, z: PIER_AZ * s + PIER_AX * q });

const MISAKI_NEAR = { key: 'misaki', title: '月見の岬', jp: '月と島をひとつの額に', go: '📷 月見の一枚を撮る' };

{
  const g = new THREE.Group();

  // 入口の石段（島の草地から桟橋の高さまで四段で上がる。一段0.07以内＝歩きで登れる段差）
  const stepMat = toon(0xaab2d8);
  const STEPS = [[7.35, 0.07], [7.7, 0.14], [8.05, 0.21], [8.4, 0.28]];
  for (const [s, topY] of STEPS) {
    const { x, z } = pierXZ(s, 0);
    const step = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.34, 18), stepMat);
    step.position.set(x, topY - 0.17, z);
    step.castShadow = step.receiveShadow = true;
    g.add(step);
    addPlatform(x, z, 0.5, topY);
  }

  // 浮き桟橋の板（杭ではなく、板の下に吊られた光の水晶が支える）
  const plankGeo = new THREE.BoxGeometry(1.44, 0.07, 0.34);
  const plankMat = toon(0xffffff, woodTex);
  let i = 0;
  for (let s = 8.6; s <= 13.9; s += 0.44, i++) {
    const { x, z } = pierXZ(s, (Math.random() - 0.5) * 0.04);
    const plank = new THREE.Mesh(plankGeo, plankMat);
    plank.position.set(x, PIER_TOP - 0.035, z);
    plank.rotation.y = PIER_ANGLE + Math.PI / 2 + (Math.random() - 0.5) * 0.05;
    plank.castShadow = plank.receiveShadow = true;
    g.add(plank);
    if (i % 2 === 0) {
      for (const side of [1, -1]) {
        const e = pierXZ(s, side * 0.68);
        const sp = glowSprite(0x7be0ff, 0.26, 0.3);
        sp.position.set(e.x, PIER_TOP + 0.06, e.z);
        g.add(sp);
      }
    }
    if (i % 4 === 2) {
      const c = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.5, 5), glowMat(0x9fd8f2, 0.32));
      c.userData.noOutline = true;
      c.position.set(x, PIER_TOP - 0.45, z);
      c.rotation.x = Math.PI;
      g.add(c);
    }
    const p0 = pierXZ(s, 0);
    addPlatform(p0.x, p0.z, 0.75, PIER_TOP);
  }

  // 岬デッキ（床・岩の土台・吊り水晶）
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.34, 0.16, 40), toon(0xffffff, woodTex));
  floor.position.set(DECK_POS.x, DECK_TOP - 0.08, DECK_POS.z);
  floor.castShadow = floor.receiveShadow = true;
  g.add(floor);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 0.4, 1.5, 24), new THREE.MeshStandardMaterial({ color: 0x0d0d16, roughness: 1 }));
  base.position.set(DECK_POS.x, DECK_TOP - 0.85, DECK_POS.z);
  g.add(base);
  const bc = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.1, 5), glowMat(0x9fd8f2, 0.3));
  bc.userData.noOutline = true;
  bc.position.set(DECK_POS.x, DECK_TOP - 2.1, DECK_POS.z);
  bc.rotation.x = Math.PI;
  g.add(bc);

  // 縁のプリズムの輪と、床の満月の紋（近づくと強く光る）
  const rim = new THREE.Mesh(new THREE.RingGeometry(2.04, 2.18, 48), glowMat(0x7be0ff, 0.22));
  rim.rotation.x = -Math.PI / 2;
  rim.position.set(DECK_POS.x, DECK_TOP + 0.015, DECK_POS.z);
  rim.userData.noOutline = true;
  g.add(rim);
  const moonRing = new THREE.Mesh(new THREE.RingGeometry(1.02, 1.18, 48), glowMat(0xf4e6c0, 0.55));
  moonRing.rotation.x = -Math.PI / 2;
  moonRing.position.set(DECK_POS.x, DECK_TOP + 0.02, DECK_POS.z);
  moonRing.userData.noOutline = true;
  g.add(moonRing);
  const moonFill = new THREE.Mesh(new THREE.CircleGeometry(1.02, 48), glowMat(0xf4e6c0, 0.05));
  moonFill.rotation.x = -Math.PI / 2;
  moonFill.position.set(DECK_POS.x, DECK_TOP + 0.018, DECK_POS.z);
  moonFill.userData.noOutline = true;
  g.add(moonFill);
  zoneRings.push({ ring: moonRing, fill: moonFill, zone: MISAKI_NEAR });

  // 外周側の手すり（写真の背中側。落ちる不安を消す）
  const railMat = toon(0xffffff, woodTex);
  const postGeo = new THREE.CylinderGeometry(0.035, 0.045, 0.62, 8);
  const postPts = [];
  for (let k = -3; k <= 3; k++) {
    const a = PIER_ANGLE + k * 0.38;
    const x = DECK_POS.x + Math.cos(a) * 2.02, z = DECK_POS.z + Math.sin(a) * 2.02;
    const post = new THREE.Mesh(postGeo, railMat);
    post.position.set(x, DECK_TOP + 0.31, z);
    post.castShadow = true;
    g.add(post);
    postPts.push([x, z]);
  }
  for (let k = 0; k < postPts.length - 1; k++) {
    const [x1, z1] = postPts[k], [x2, z2] = postPts[k + 1];
    const len = Math.hypot(x2 - x1, z2 - z1);
    const seg = new THREE.Mesh(new THREE.BoxGeometry(len, 0.045, 0.05), railMat);
    seg.position.set((x1 + x2) / 2, DECK_TOP + 0.6, (z1 + z2) / 2);
    seg.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
    g.add(seg);
  }

  // 入口の提灯（プリズム色）とデッキの提灯（月色）
  for (const side of [1, -1]) {
    const e = pierXZ(7.15, side * 0.85);
    const lamp = mkLampPost(0x7be0ff);
    lamp.position.set(e.x, terrainH(e.x, e.z), e.z);
    lamp.rotation.y = -PIER_ANGLE;
    g.add(lamp);
    addObstacle(e.x, e.z, 0.12);
  }
  for (const side of [1, -1]) {
    const a = PIER_ANGLE + side * 1.31; // 手すりの両端＝写真のフレーム外
    const x = DECK_POS.x + Math.cos(a) * 1.98, z = DECK_POS.z + Math.sin(a) * 1.98;
    const lamp = mkLampPost(0xf4e6c0);
    lamp.position.set(x, DECK_TOP - 0.02, z);
    lamp.rotation.y = Math.atan2(DECK_POS.x - x, DECK_POS.z - z);
    g.add(lamp);
  }

  const label = makeLabel('PHOTO SPOT', '月見の岬', 0xf4e6c0);
  label.position.set(DECK_POS.x, DECK_TOP + 2.0, DECK_POS.z);
  g.add(label);

  addPlatform(DECK_POS.x, DECK_POS.z, 1.98, DECK_TOP);
  addOutlines(g);
  scene.add(g);
}

// ---------- 浮灯籠の登り道と星見台（アスレチック） ----------
// 障害物のない120°方面へ。浮かぶ灯籠石を二段ジャンプで渡り、天空の星見台を目指す。
// 落ちたら最後に立っていた足場へふわっと戻る（ペナルティなし）
const COURSE_ANGLE = (120 * Math.PI) / 180;
const C_AX = Math.cos(COURSE_ANGLE), C_AZ = Math.sin(COURSE_ANGLE);
const C_S0 = 7.2, C_S1 = 23.3, C_HALF = 2.4;
const courseXZ = (s, q) => ({ x: C_AX * s - C_AZ * q, z: C_AZ * s + C_AX * q });
const HOSHI_S = 21.4, HOSHI_TOP = 2.5;
const HOSHI_POS = new THREE.Vector3(C_AX * HOSHI_S, 0, C_AZ * HOSHI_S);
const HOSHI_WALK_R = 1.3;

const HOSHIMI_NEAR = { key: 'hoshimi', title: '星見台', jp: '雲海と月を見晴らす', go: '📷 星見の一枚を撮る' };

{
  const g = new THREE.Group();

  // 入口の石段（桟橋と同じ型）と出発の台
  const stepMat = toon(0xaab2d8);
  for (const [s, topY] of [[7.35, 0.07], [7.7, 0.14], [8.05, 0.21], [8.4, 0.28]]) {
    const { x, z } = courseXZ(s, 0);
    const step = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.34, 18), stepMat);
    step.position.set(x, topY - 0.17, z);
    step.castShadow = step.receiveShadow = true;
    g.add(step);
    addPlatform(x, z, 0.5, topY);
  }
  const stoneMat = toon(0x9aa8cf);
  const startP = courseXZ(9.1, 0);
  const startDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.98, 0.24, 24), stoneMat);
  startDisc.position.set(startP.x, 0.16, startP.z);
  startDisc.castShadow = startDisc.receiveShadow = true;
  g.add(startDisc);
  addPlatform(startP.x, startP.z, 0.85, 0.28);
  for (const side of [1, -1]) {
    const e = courseXZ(7.15, side * 0.85);
    const lamp = mkLampPost(0xf0c869);
    lamp.position.set(e.x, terrainH(e.x, e.z), e.z);
    lamp.rotation.y = -COURSE_ANGLE;
    g.add(lamp);
    addObstacle(e.x, e.z, 0.12);
  }
  const cLabel = makeLabel('ATHLETIC', '浮灯籠の登り道', 0xf0c869);
  cLabel.position.set(startP.x, 2.1, startP.z);
  g.add(cLabel);

  // 浮灯籠の石（脇に提灯がひとつ浮かんで目印になる）
  const HOPS = [
    [10.9, 0.55, 0.55, 0.55],
    [12.5, -0.5, 0.82, 0.5],
    [14.1, 0.5, 1.1, 0.5],
    [15.6, -0.45, 1.38, 0.45],
    [17.1, 0.3, 1.66, 0.45],
    [18.5, -0.3, 1.95, 0.4],
    [19.8, 0, 2.22, 0.4],
  ];
  for (let hi = 0; hi < HOPS.length; hi++) {
    const [s, q, topY, r] = HOPS[hi];
    const { x, z } = courseXZ(s, q);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.12, 0.22, 20), stoneMat);
    disc.position.set(x, topY - 0.11, z);
    disc.castShadow = disc.receiveShadow = true;
    g.add(disc);
    const ring = new THREE.Mesh(new THREE.RingGeometry(r * 0.72, r * 0.88, 28), glowMat(0xf0c869, 0.3));
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, topY + 0.012, z);
    ring.userData.noOutline = true;
    g.add(ring);
    const crystal = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.42, 5), glowMat(0x9fd8f2, 0.32));
    crystal.userData.noOutline = true;
    crystal.position.set(x, topY - 0.5, z);
    crystal.rotation.x = Math.PI;
    g.add(crystal);
    const off = courseXZ(s, q + (q >= 0 ? 0.6 : -0.6));
    const swing = new THREE.Group();
    swing.position.set(off.x, topY + 0.55, off.z);
    const paper = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), new THREE.MeshBasicMaterial({ map: chochinTex, color: hi % 2 ? 0xf0c869 : 0x9fd8f2 }));
    paper.scale.set(1, 1.3, 1);
    paper.userData.noOutline = true;
    swing.add(paper);
    swing.add(glowSprite(hi % 2 ? 0xf0c869 : 0x9fd8f2, 0.5, 0.25));
    g.add(swing);
    lanterns.push({ swing, ph: Math.random() * 7 });
    addPlatform(x, z, r, topY);
  }

  // 星見台（天空のゴールデッキ。柵なし＝見晴らし優先）
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.66, 0.2, 32), toon(0xffffff, woodTex));
  floor.position.set(HOSHI_POS.x, HOSHI_TOP - 0.1, HOSHI_POS.z);
  floor.castShadow = floor.receiveShadow = true;
  g.add(floor);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 0.3, 1.2, 20), new THREE.MeshStandardMaterial({ color: 0x0d0d16, roughness: 1 }));
  base.position.set(HOSHI_POS.x, HOSHI_TOP - 0.75, HOSHI_POS.z);
  g.add(base);
  const bc = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.9, 5), glowMat(0x9fd8f2, 0.3));
  bc.userData.noOutline = true;
  bc.position.set(HOSHI_POS.x, HOSHI_TOP - 1.75, HOSHI_POS.z);
  bc.rotation.x = Math.PI;
  g.add(bc);
  const starRing = new THREE.Mesh(new THREE.RingGeometry(0.92, 1.06, 40), glowMat(0xeaf6ff, 0.5));
  starRing.rotation.x = -Math.PI / 2;
  starRing.position.set(HOSHI_POS.x, HOSHI_TOP + 0.02, HOSHI_POS.z);
  starRing.userData.noOutline = true;
  g.add(starRing);
  const starFill = new THREE.Mesh(new THREE.CircleGeometry(0.92, 40), glowMat(0xeaf6ff, 0.05));
  starFill.rotation.x = -Math.PI / 2;
  starFill.position.set(HOSHI_POS.x, HOSHI_TOP + 0.018, HOSHI_POS.z);
  starFill.userData.noOutline = true;
  g.add(starFill);
  zoneRings.push({ ring: starRing, fill: starFill, zone: HOSHIMI_NEAR });
  // 縁の灯籠石3基（定点カメラの視線と着地の動線は空けた方角に置く）
  const toroMat = toon(0x7a84a8);
  for (const da of [-1.57, 0.87, 1.57]) {
    const a = COURSE_ANGLE + da;
    const x = HOSHI_POS.x + Math.cos(a) * 1.32, z = HOSHI_POS.z + Math.sin(a) * 1.32;
    const toro = new THREE.Group();
    toro.scale.setScalar(0.8);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.34, 8), toroMat);
    shaft.position.y = 0.17;
    toro.add(shaft);
    const house = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.16), toroMat);
    house.position.y = 0.4;
    toro.add(house);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.1, 4), toroMat);
    cap.position.y = 0.51;
    toro.add(cap);
    const gl = glowSprite(0xf0c869, 0.3, 0.35);
    gl.position.y = 0.4;
    toro.add(gl);
    toro.position.set(x, HOSHI_TOP, z);
    g.add(toro);
  }
  const hLabel = makeLabel('PHOTO SPOT', '星見台', 0xeaf6ff);
  hLabel.position.set(HOSHI_POS.x, HOSHI_TOP + 1.9, HOSHI_POS.z);
  g.add(hLabel);
  addPlatform(HOSHI_POS.x, HOSHI_POS.z, 1.45, HOSHI_TOP);
  addOutlines(g);
  scene.add(g);
}

// 撮影演出：タルトがスポット中央へ立ち、定点の構図へカメラが回り込んで一枚を撮る
let misakiShot = null;
const startSpotShot = (def) => {
  if (misakiShot) return; // 演出中の再入禁止（連打でt=0リセットが続きソフトロックするのを防ぐ）
  misakiShot = {
    t: 0,
    fromPos: camera.position.clone(),
    fromTgt: controls.target.clone(),
    fromP: tarte.group.position.clone(),
    toP: def.toP.clone(),
    toPos: def.toPos.clone(),
    toTgt: def.toTgt.clone(),
  };
  target.copy(def.toP);
  moving = false;
  jumpQueued = false; // 撮影に入る瞬間の入力を持ち越さない
};
// 月見の岬：柵の内側から、月・大樹・桟橋・鳥居を背にする定点
const MISAKI_SHOT = {
  toP: new THREE.Vector3(DECK_POS.x, 0, DECK_POS.z),
  toPos: new THREE.Vector3(DECK_POS.x + PIER_AX * 1.7 + PIER_AZ * 0.95, DECK_TOP + 0.7, DECK_POS.z + PIER_AZ * 1.7 - PIER_AX * 0.95),
  toTgt: new THREE.Vector3(DECK_POS.x + 0.16, DECK_TOP + 0.7, DECK_POS.z - 0.19),
};
// 星見台：柵がないので一歩引いた高みから、島と登り道を右に月を左に入れる定点
const HOSHIMI_SHOT = {
  toP: new THREE.Vector3(HOSHI_POS.x, 0, HOSHI_POS.z),
  toPos: new THREE.Vector3(HOSHI_POS.x - 0.54, HOSHI_TOP + 0.85, HOSHI_POS.z + 2.54),
  toTgt: new THREE.Vector3(HOSHI_POS.x + 0.08, HOSHI_TOP + 0.55, HOSHI_POS.z - 0.39),
};

// ---------- タルト ----------
const identity = loadIdentity(); // 端末ごとの二つ名と甲羅色（初回にランダム抽選）
const tarte = createAvatar(identity.c, identity.v);
tarte.group.position.set(0, 0, 3.2);
tarte.group.rotation.y = Math.PI;
tarte.group.add(makeNameLabel(identity.name));
scene.add(tarte.group);

// ---------- 移動 ----------
const marker = new THREE.Mesh(new THREE.RingGeometry(0.09, 0.12, 32), new THREE.MeshBasicMaterial({ color: 0xf7a8c4, transparent: true, opacity: 0 }));
marker.rotation.x = -Math.PI / 2;
marker.position.y = 0.012;
scene.add(marker);

const raycaster = new THREE.Raycaster();
const target = new THREE.Vector3(0, 0, 3.2);
let moving = false;
let downPos = null;

const clampToIsland = (v) => {
  const l = Math.hypot(v.x, v.z);
  if (l > WALK_R) {
    // 島の外で歩けるのは桟橋の上と月見の岬だけ。外れた点は一番近い歩ける場所へ寄せる
    const s = v.x * PIER_AX + v.z * PIER_AZ;
    const q = -v.x * PIER_AZ + v.z * PIER_AX;
    const dd = Math.hypot(v.x - DECK_POS.x, v.z - DECK_POS.z);
    const onPier = s >= PIER_S0 && s <= DECK_S && Math.abs(q) <= PIER_HALF_W;
    // アスレチック回廊（入口は狭く、灯籠石の区間は広く=ジャンプの横移動と落下を許す）
    const s2 = v.x * C_AX + v.z * C_AZ;
    const q2 = -v.x * C_AZ + v.z * C_AX;
    const onCourse = s2 >= C_S0 && s2 <= C_S1 && Math.abs(q2) <= (s2 < 10 ? 1.0 : C_HALF);
    if (!onPier && !onCourse && dd > DECK_WALK_R) {
      const cand = [[v.x * (WALK_R / l), v.z * (WALK_R / l)]];
      const cs = THREE.MathUtils.clamp(s, PIER_S0, DECK_S);
      const cq = THREE.MathUtils.clamp(q, -PIER_HALF_W, PIER_HALF_W);
      cand.push([PIER_AX * cs - PIER_AZ * cq, PIER_AZ * cs + PIER_AX * cq]);
      const cs2 = THREE.MathUtils.clamp(s2, C_S0, C_S1);
      const cw2 = cs2 < 10 ? 1.0 : C_HALF;
      const cq2 = THREE.MathUtils.clamp(q2, -cw2, cw2);
      cand.push([C_AX * cs2 - C_AZ * cq2, C_AZ * cs2 + C_AX * cq2]);
      if (dd > 1e-4) {
        const k = DECK_WALK_R / dd;
        cand.push([DECK_POS.x + (v.x - DECK_POS.x) * k, DECK_POS.z + (v.z - DECK_POS.z) * k]);
      }
      let bx = cand[0][0], bz = cand[0][1], bd = Infinity;
      for (const c2 of cand) {
        const d2 = (v.x - c2[0]) ** 2 + (v.z - c2[1]) ** 2;
        if (d2 < bd) { bd = d2; bx = c2[0]; bz = c2[1]; }
      }
      v.x = bx;
      v.z = bz;
    }
  }
  const c = Math.hypot(v.x, v.z);
  if (c < 1.15 && c > 1e-4) {
    v.x *= 1.15 / c;
    v.z *= 1.15 / c;
  }
  return v;
};

let downTime = 0;
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
renderer.domElement.addEventListener('pointerdown', (e) => {
  downPos = [e.clientX, e.clientY];
  downTime = performance.now();
});
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!downPos) return;
  const dx = e.clientX - downPos[0], dy = e.clientY - downPos[1];
  downPos = null;
  // 少しのブレ・長押しは視点操作とみなす
  if (dx * dx + dy * dy > 144 || performance.now() - downTime > 400) return;
  const rect = renderer.domElement.getBoundingClientRect();
  const rw = rect.width || renderer.domElement.width / renderer.getPixelRatio() || 1;
  const rh = rect.height || renderer.domElement.height / renderer.getPixelRatio() || 1;
  const ndc = new THREE.Vector2(
    ((e.clientX - rect.left) / rw) * 2 - 1,
    -((e.clientY - rect.top) / rh) * 2 + 1
  );
  raycaster.setFromCamera(ndc, camera);
  // 地面ヒット優先、外れたら（建物でも）地平面に落として必ず歩き出す
  let point = null;
  const hit = raycaster.intersectObject(islandTop)[0];
  if (hit) {
    point = hit.point.clone();
  } else {
    const p = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(groundPlane, p)) point = p;
  }
  if (!point) return;
  target.copy(point);
  target.y = 0;
  clampToIsland(target);
  resolveCollisions(target);
  moving = true;
  marker.position.set(target.x, supportY(target.x, target.z, 1e9) + 0.03, target.z);
  marker.material.opacity = 1.0;
});

const keys = {};
const KEYMAP = { arrowup: 'w', arrowdown: 's', arrowleft: 'a', arrowright: 'd' };
let jumpQueued = false;
// テキスト入力中は移動・ジャンプのキー処理を止める（アドレス入力のa/dで歩き出す等を防ぐ）
const typingInField = () => {
  const el = document.activeElement;
  return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
};
addEventListener('keydown', (e) => {
  if (typingInField()) return;
  let k = e.key.toLowerCase();
  if (KEYMAP[k]) {
    e.preventDefault();
    k = KEYMAP[k];
  }
  if (k === ' ') {
    e.preventDefault();
    jumpQueued = true;
    return;
  }
  keys[k] = true;
});
addEventListener('keyup', (e) => {
  let k = e.key.toLowerCase();
  if (KEYMAP[k]) k = KEYMAP[k];
  keys[k] = false;
});
const jumpBtn = document.getElementById('jump');
if (jumpBtn) {
  jumpBtn.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    jumpQueued = true;
  });
}

// ---------- アスレチック用の操作パッド（タッチ端末のみ・登り道エリアで出現） ----------
const IS_TOUCH = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || new URLSearchParams(location.search).has('pad'); // ?pad でPCでも確認できる
const padEl = document.getElementById('pad');
const padKnob = document.getElementById('pad-knob');
const padVec = { x: 0, y: 0 }; // -1..1（画面基準。yは下が正）
if (padEl && padKnob) {
  const PAD_R = 44;
  let padPointer = null;
  const setKnob = (dx, dy) => {
    padKnob.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  const updateFromEvent = (e) => {
    const r = padEl.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2);
    let dy = e.clientY - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy);
    if (d > PAD_R) {
      dx *= PAD_R / d;
      dy *= PAD_R / d;
    }
    setKnob(dx, dy);
    padVec.x = dx / PAD_R;
    padVec.y = dy / PAD_R;
  };
  padEl.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    e.preventDefault();
    padPointer = e.pointerId;
    try { padEl.setPointerCapture(e.pointerId); } catch {}
    updateFromEvent(e);
  });
  padEl.addEventListener('pointermove', (e) => {
    if (e.pointerId === padPointer) updateFromEvent(e);
  });
  const padEnd = (e) => {
    if (e.pointerId !== padPointer) return;
    padPointer = null;
    padVec.x = 0;
    padVec.y = 0;
    setKnob(0, 0);
    // 離したらその場でぴたっと止まる（足場の縁で止まれるように）
    target.copy(tarte.group.position);
    moving = false;
  };
  padEl.addEventListener('pointerup', padEnd);
  padEl.addEventListener('pointercancel', padEnd);
  // タッチ端末では島じゅうどこでも常時表示
  if (IS_TOUCH) {
    padEl.classList.add('show');
    document.body.classList.add('pad-on');
  }
}

// ---------- HUD ----------
const hintEl = document.getElementById('hint');
const titleEl = document.getElementById('title-overlay');
setTimeout(() => titleEl && titleEl.classList.add('hide'), 3000);

// ---------- 初回導入シーケンス ----------
const INTRO_KEY = 'vibe.island.intro.v1';
const introIsFirstVisit = !localStorage.getItem(INTRO_KEY);
if (introIsFirstVisit) localStorage.setItem(INTRO_KEY, '1');
const introEl = document.getElementById('intro');
const introCard = document.getElementById('intro-card');
const introHead = document.getElementById('intro-head');
const introBody = document.getElementById('intro-body');
const introNext = document.getElementById('intro-next');
const introDots = introEl ? [...introEl.querySelectorAll('.dot')] : [];
const identityColor = (SHELLS[identity.v] || SHELLS[0]).scallop;
const INTRO_STEPS = [
  {
    head: 'ようこそ、夜の島へ',
    body: 'ここはStudio VIBEのバーチャルスタジオ。<br>衝動が、世界になる場所。<br><span style="opacity:.7;font-size:11px">いまはベータ版。気づいたことは、旅人の帳へ。</span>',
    btn: 'つぎへ',
  },
  {
    head: identity.name,
    headColor: identityColor,
    body: '今夜のあなたの姿。<br>島で出会うだれかにも、この名前が見えています。',
    btn: 'つぎへ',
  },
  {
    head: '衝動のかけら',
    body: '島のどこかに七つ。桜の大樹の光をたよりに集めてみて。<br>クリックで移動 ／ Spaceで二段ジャンプ',
    btn: '島へ',
  },
];
let introStep = 0;
const renderIntro = () => {
  const s = INTRO_STEPS[introStep];
  if (introHead) {
    introHead.textContent = s.head;
    introHead.style.color = s.headColor || '';
  }
  if (introBody) introBody.innerHTML = s.body;
  if (introNext) introNext.textContent = s.btn;
  introDots.forEach((d, i) => d.classList.toggle('on', i === introStep));
};
const closeIntro = () => {
  if (introEl) introEl.classList.remove('show');
  document.body.classList.remove('intro-open');
};
const advanceIntro = () => {
  introStep += 1;
  if (introStep >= INTRO_STEPS.length) {
    closeIntro();
    return;
  }
  renderIntro();
};
const openIntro = () => {
  if (!introEl) return;
  introStep = 0;
  renderIntro();
  introEl.classList.add('show');
  document.body.classList.add('intro-open');
};
if (introNext) introNext.addEventListener('click', (e) => { e.stopPropagation(); advanceIntro(); });
if (introCard) introCard.addEventListener('click', () => advanceIntro());
setTimeout(() => {
  if (introIsFirstVisit) openIntro();
}, 3400);

// ベータのお知らせ（導入カードを見ない再訪者に、一度だけ）
const BETA_NOTICE_KEY = 'vibe.island.beta.v1';
setTimeout(() => {
  if (introIsFirstVisit || localStorage.getItem(BETA_NOTICE_KEY)) return;
  try { localStorage.setItem(BETA_NOTICE_KEY, '1'); } catch {}
  showToast('この島はいまベータ版<br>気づいたことは、旅人の帳へ', 5600);
}, 3800);

// かけらの案内（タイトルが消えたあとに一度だけ。初回導入時は案内が重複するのでスキップ）
setTimeout(() => {
  if (!introIsFirstVisit && collected.size < 7) {
    showToast('✦ 島には「衝動のかけら」が 7つ 眠っている<br>細い光の柱を目印に、近づいて集めよう', 6000);
  }
}, 6500);

// ---------- 記念撮影（SNSシェア用） ----------
const flashEl = document.getElementById('flash');
const photoModal = document.getElementById('photo-modal');
const photoImg = document.getElementById('photo-img');
let photoUrl = '';
const takePhoto = () => {
  sound.se.shutter();
  renderer.render(scene, camera); // 最新フレームを確実に焼く
  const src = renderer.domElement;
  if (!src.width || !src.height) return;
  const cv = document.createElement('canvas');
  cv.width = src.width;
  cv.height = src.height;
  const c2 = cv.getContext('2d');
  c2.drawImage(src, 0, 0);
  // 銘入りの帯
  const pad = Math.round(cv.height * 0.05);
  c2.fillStyle = 'rgba(7,7,11,0.82)';
  c2.fillRect(0, cv.height - pad * 1.9, cv.width, pad * 1.9);
  // 縦長写真では左右の銘が重なるため、フォントは幅にも比例させて収める
  c2.textBaseline = 'middle';
  c2.textAlign = 'left';
  c2.fillStyle = '#f4f2ec';
  c2.font = `700 ${Math.round(Math.min(pad * 0.72, cv.width * 0.045))}px Futura, "Avenir Next", sans-serif`;
  c2.fillText('STUDIO VIBE', pad, cv.height - pad * 0.95);
  c2.textAlign = 'right';
  c2.fillStyle = '#7be0ff';
  c2.font = `700 ${Math.round(Math.min(pad * 0.5, cv.width * 0.031))}px Futura, "Avenir Next", sans-serif`;
  c2.fillText('VIBES INTO WORLDS.', cv.width - pad, cv.height - pad * 0.95);
  photoUrl = cv.toDataURL('image/png');
  if (photoImg) photoImg.src = photoUrl;
  if (flashEl) {
    flashEl.classList.add('on');
    setTimeout(() => flashEl.classList.remove('on'), 170);
  }
  setTimeout(() => photoModal && photoModal.classList.add('show'), 220);
};
const photoBtn = document.getElementById('photo');
if (photoBtn) {
  photoBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
  photoBtn.addEventListener('click', takePhoto);
}
const photoSave = document.getElementById('photo-save');
if (photoSave) {
  photoSave.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = photoUrl;
    a.download = 'studio-vibe-island.png';
    a.click();
  });
}
const photoTweet = document.getElementById('photo-tweet');
if (photoTweet) {
  photoTweet.addEventListener('click', () => {
    const text = 'Studio VIBEの島を散歩してきた🐢✨\n#StudioVIBE #月蝕綺譚\nhttps://vibe.co.jp';
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  });
}
const photoClose = document.getElementById('photo-close');
if (photoClose) photoClose.addEventListener('click', () => photoModal.classList.remove('show'));
const photoClose2 = document.getElementById('photo-close2');
if (photoClose2) photoClose2.addEventListener('click', () => photoModal.classList.remove('show'));
if (photoModal) {
  photoModal.addEventListener('click', (e) => {
    if (e.target === photoModal) photoModal.classList.remove('show');
  });
}

// ---------- 旅人の帳（島の掲示板HUD） ----------
const BOARD_URL = ['localhost', '127.0.0.1'].includes(location.hostname)
  ? 'http://127.0.0.1:8787/board'
  : 'https://vibe-presence.nubonba.workers.dev/board';
const boardBtn = document.getElementById('board');
const boardPanel = document.getElementById('board-panel');
const boardListEl = document.getElementById('board-list');
const boardInput = document.getElementById('board-input');
const boardSend = document.getElementById('board-send');
const boardCountEl = document.getElementById('board-count');
const boardNameEl = document.getElementById('board-name');
if (boardNameEl) boardNameEl.textContent = `${identity.name} として記す`;

const BOARD_ERROR_TEXT = {
  rate: '続けては記せないみたい。少し待ってね',
  ng: 'その言葉は帳に記せないみたい',
  bad: 'うまく記せなかったみたい',
};
const fmtAgo = (ts) => {
  if (!Number.isFinite(ts)) return '';
  const s = Math.max(0, (Date.now() - ts) / 1000);
  if (s < 60) return 'たった今';
  if (s < 3600) return `${Math.floor(s / 60)}分前`;
  if (s < 86400) return `${Math.floor(s / 3600)}時間前`;
  return `${Math.floor(s / 86400)}日前`;
};
const shellColor = (v) => {
  const n = Number.isFinite(v) ? Math.floor(v) : 0; // サーバー由来の型異常で帳全体が壊れないように
  return SHELLS[((n % SHELLS.length) + SHELLS.length) % SHELLS.length].scallop;
};

const boardEmpty = (msg) => {
  boardListEl.innerHTML = '';
  const d = document.createElement('div');
  d.id = 'board-empty';
  d.textContent = msg;
  boardListEl.appendChild(d);
};
const renderBoardPosts = (posts) => {
  if (!posts.length) {
    boardEmpty('まだ何も記されていない');
    return;
  }
  boardListEl.innerHTML = '';
  for (const p of posts) {
    const item = document.createElement('div');
    item.className = 'board-post';
    const who = document.createElement('div');
    who.className = 'who';
    const dot = document.createElement('span');
    dot.className = 'dot';
    dot.style.background = shellColor(p.v);
    const nm = document.createElement('span');
    nm.textContent = p.name;
    const when = document.createElement('span');
    when.className = 'when';
    when.textContent = fmtAgo(p.ts);
    who.append(dot, nm, when);
    const txt = document.createElement('div');
    txt.className = 'txt';
    txt.textContent = p.text;
    item.append(who, txt);
    boardListEl.appendChild(item);
  }
};

let boardLoading = false;
const openBoard = async () => {
  if (!boardPanel.classList.contains('show')) sound.se.ui();
  boardPanel.classList.add('show');
  if (boardLoading) return;
  boardLoading = true;
  try {
    const res = await fetch(BOARD_URL);
    const body = await res.json();
    renderBoardPosts(body.posts || []);
  } catch {
    boardEmpty('帳を開けなかったみたい');
  } finally {
    boardLoading = false;
  }
};
const closeBoard = () => boardPanel && boardPanel.classList.remove('show');

const sendBoardPost = async () => {
  const text = (boardInput.value || '').trim();
  if (!text || boardSend.disabled) return;
  boardSend.disabled = true;
  try {
    const res = await fetch(BOARD_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: identity.name, v: identity.v, text }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      showToast(BOARD_ERROR_TEXT[body.error] || BOARD_ERROR_TEXT.bad, 3600);
      return;
    }
    boardInput.value = '';
    if (boardCountEl) boardCountEl.textContent = '0/80';
    sound.se.post();
    await openBoard(); // 最新を読み直す
  } catch {
    showToast('島の外と連絡が取れないみたい', 3600);
  } finally {
    boardSend.disabled = false;
  }
};

if (boardBtn) {
  boardBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
  boardBtn.addEventListener('click', openBoard);
}
const boardCloseBtn = document.getElementById('board-close');
if (boardCloseBtn) boardCloseBtn.addEventListener('click', closeBoard);
if (boardPanel) {
  boardPanel.addEventListener('click', (e) => {
    if (e.target === boardPanel) closeBoard();
  });
}
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeBoard();
});
if (boardInput) {
  boardInput.addEventListener('input', () => {
    if (boardCountEl) boardCountEl.textContent = `${boardInput.value.length}/80`;
  });
  boardInput.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') e.stopPropagation(); // 入力中のWASD/Spaceで歩き出さないように（ESCは閉じるへ通す）
    if (e.key === 'Enter') sendBoardPost();
  });
}
if (boardSend) boardSend.addEventListener('click', sendBoardPost);

// ---------- 解説パネル ----------
const PANEL_DATA = {
  studio: {
    color: '#7be0ff',
    title: 'STUDIO VIBE',
    sub: 'VIBES INTO WORLDS. ― 衝動を、世界に。',
    body: 'ゲーム・アニメ・音楽——ジャンルを持たない、物語のクリエイティブスタジオ。<br>「AIじゃできない」を嘆くな。「AIでできること」を極めろ。<br>今ある技術のすべてで、最高峰のエンターテインメントをつくる。<br><span class="corp">合同会社日本の田舎は資本主義のフロンティアだ／代表 池田勇人／2016年設立<br>事業 AIアニメ制作／IP開発／ゲーム・音楽制作／クリエイター育成</span>',
    actions: [
      { label: '問い合わせ', url: '/contact' },
      { label: '会社概要', url: '/about' },
    ],
  },
  game: {
    color: '#ff5f6e',
    title: 'GAME｜月蝕綺譚 -Luna Occulta-',
    sub: '和風ダークファンタジー放置RPG',
    body: '月の巫女たちと「隠された月」を巡る物語。<br>全キャラフルボイス。週ごとに新しい御霊が舞い降りる、"生きているゲーム"。<br>境内の絵馬は実際のゲーム画面。大きなスマートフォンには、紹介動画が流れています。',
    actions: [{ label: '▶ 作品ページへ', url: 'https://vibe.co.jp/luna-occulta' }],
  },
  anime: {
    color: '#7bb8e0',
    title: 'ANIME｜オリジナルアニメ',
    sub: 'フルAIジャパニメーション',
    body: '世界最長クラスのフルAIアニメを生む、Studio VIBEの看板レーベル。<br>『ニンジャ犯科帳』『おばけのミタマと死にたがりの瀬織』公開中。',
    actions: [
      { label: '▶ YouTubeで見る', url: 'https://www.youtube.com/channel/UCwxMnx33RjYJ7mlZoFH7Aaw' },
      { label: '公式サイト', url: 'https://vibe.co.jp/hankacho' },
    ],
  },
  music: {
    color: '#f48fb8',
    title: 'MUSIC｜Sakuya - 咲耶',
    sub: 'バーチャルシンガー',
    body: '桜の名を持つ歌い手。月蝕綺譚の主題歌をはじめ、物語と地続きの歌をうたう。<br>ステージの奥では、MVが静かに流れています。<br>「音を灯す」と、この島が歌に呼応します。',
    actions: [
      { label: '♪ 音を灯す', music: true },
      { label: '主題歌の物語へ', url: 'https://vibe.co.jp/luna-occulta' },
    ],
  },
  info: {
    color: '#d9b36a',
    title: '島の案内',
    sub: 'GUIDE',
    body: '夜空に浮かぶ、Studio VIBEの小さな島。<br>緋の鳥居はGAME館。月蝕綺譚の紹介動画が流れています。<br>青いスクリーンはANIME館。オリジナルアニメを上映中。<br>桜のステージはMUSIC館。咲耶のMVが観られます。<br>島のどこかに衝動のかけらが七つ。二段ジャンプで岩や木の上にも乗れます。<br>📷で記念撮影。出会った旅人の頭上には、その子の二つ名が見えます。<br>光の桟橋を渡った先は、月見の岬。月と島を背にした一枚が撮れます。<br>浮灯籠を跳んで登った先は、天空の星見台。',
    actions: [],
  },
};

const panelEl = document.getElementById('panel');
const panelCard = document.getElementById('panel-card');
const panelBody = document.getElementById('panel-body');
const openPanel = (key) => {
  const d = PANEL_DATA[key];
  if (!d || !panelEl) return;
  panelCard.style.setProperty('--acc', d.color);
  panelBody.innerHTML = `<h2>${d.title}</h2><div class="sub">${d.sub}</div><p>${d.body}</p><div class="actions"></div>`;
  sound.se.ui();
  const row = panelBody.querySelector('.actions');
  for (const a of d.actions) {
    const b = document.createElement('button');
    b.className = 'btn';
    b.textContent = a.music ? (musicOn ? '⏸ 音を止める' : '♪ 音を灯す') : a.label;
    b.addEventListener('click', () => {
      if (a.music) {
        toggleMusic();
        b.textContent = musicOn ? '⏸ 音を止める' : '♪ 音を灯す';
      } else if (a.photo) {
        closePanel();
        setTimeout(takePhoto, 250);
      } else {
        window.open(a.url, '_blank', 'noopener,noreferrer');
      }
    });
    row.appendChild(b);
  }
  panelEl.classList.add('show');
};
const closePanel = () => panelEl && panelEl.classList.remove('show');
const panelCloseBtn = document.getElementById('panel-close');
if (panelCloseBtn) panelCloseBtn.addEventListener('click', closePanel);
if (panelEl) {
  panelEl.addEventListener('click', (e) => {
    if (e.target === panelEl) closePanel();
  });
}
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePanel();
});

const STUDIO_NEAR = { key: 'studio', title: 'STUDIO VIBE', jp: '衝動を、世界に。', go: 'スタジオについて' };

// 中央のスタジオ円も外周を光らせる（判定2.05に合わせた寸法のまま・プリズムシアン）
{
  const sr = new THREE.Mesh(new THREE.RingGeometry(1.86, 2.06, 96), glowMat(0x7be0ff, 0.6));
  sr.rotation.x = -Math.PI / 2;
  sr.position.set(0, terrainH(0, 0) + 0.045, 0);
  sr.userData.noOutline = true;
  scene.add(sr);
  const srFill = new THREE.Mesh(new THREE.RingGeometry(1.15, 1.86, 96), glowMat(0x7be0ff, 0.04));
  srFill.rotation.x = -Math.PI / 2;
  srFill.position.set(0, terrainH(0, 0) + 0.04, 0);
  srFill.userData.noOutline = true;
  scene.add(srFill);
  zoneRings.push({ ring: sr, fill: srFill, zone: STUDIO_NEAR });
}
const INFO_NEAR = { key: 'info', title: '島の案内板', jp: '道しるべ', go: '📖 くわしく' };
const MINT_NEAR = { key: 'mint', title: '隠し祠', jp: '渡島記念札', go: '渡島記念札を受け取る' };
let currentNear = null;
let lastHintKey = '';
if (hintEl) {
  hintEl.addEventListener('click', () => {
    if (!currentNear) return;
    if (currentNear.key === 'mint') {
      openMintPanel();
      return;
    }
    if (currentNear.key === 'misaki') {
      startSpotShot(MISAKI_SHOT);
      return;
    }
    if (currentNear.key === 'hoshimi') {
      startSpotShot(HOSHIMI_SHOT);
      return;
    }
    openPanel(currentNear.key);
  });
}

// ---------- 渡島記念札のミントパネル ----------
const BASESCAN_ORIGIN = 'https://basescan.org';
const MINT_STORAGE_KEY = 'vibe.island.minted';
const MINT_ERROR_TEXT = {
  already_minted: 'この住所にはもう授与済みです',
  invalid_address: 'アドレスの形式が正しくありません',
  sold_out: '頒布を終えました',
  not_configured: '授与所は開帳前です',
  bot_detected: '人の操作を確かめられませんでした。少し待ってからお試しください',
};
const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

const mintPanelEl = document.getElementById('mint-panel');
const mintFormEl = document.getElementById('mint-form');
const mintResultEl = document.getElementById('mint-result');
const mintNotReadyEl = document.getElementById('mint-notready');
const mintAddressInput = document.getElementById('mint-address');
const mintWalletBtn = document.getElementById('mint-wallet-btn');
const mintSubmitBtn = document.getElementById('mint-submit');
const mintErrorEl = document.getElementById('mint-error');
const mintResultText = document.getElementById('mint-result-text');
const mintScanLink = document.getElementById('mint-scan-link');
const mintTurnstileEl = document.getElementById('mint-turnstile');
const mintPanelCloseBtn = document.getElementById('mint-panel-close');

let turnstileToken = '';
let turnstileWidgetId = null;
let turnstileScriptRequested = false;

const loadTurnstile = () => {
  // ローカル開発ではTurnstile(sitekeyのドメイン制限)も/api/mint(Vercel Function)も動かない
  if (['localhost', '127.0.0.1'].includes(location.hostname)) {
    if (mintTurnstileEl) mintTurnstileEl.innerHTML = '<span style="opacity:.6;font-size:12px">授与は本番の島（vibe.co.jp）でのみ</span>';
    if (mintSubmitBtn) mintSubmitBtn.disabled = true;
    return;
  }
  if (turnstileScriptRequested) return;
  turnstileScriptRequested = true;
  const s = document.createElement('script');
  s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__vibeTurnstileReady';
  s.async = true;
  s.defer = true;
  window.__vibeTurnstileReady = () => {
    if (!mintTurnstileEl || !window.turnstile) return;
    turnstileWidgetId = window.turnstile.render(mintTurnstileEl, {
      sitekey: '0x4AAAAAACaXaMN9Bai0y96b',
      theme: 'dark',
      callback: (token) => {
        turnstileToken = token;
      },
      'expired-callback': () => {
        turnstileToken = '';
      },
    });
  };
  document.head.appendChild(s);
};

const getMintedRecord = () => {
  try {
    return JSON.parse(localStorage.getItem(MINT_STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
};
const setMintedRecord = (rec) => {
  try {
    localStorage.setItem(MINT_STORAGE_KEY, JSON.stringify(rec));
  } catch {}
};

const showMintError = (msg) => {
  if (mintErrorEl) mintErrorEl.textContent = msg || '';
};

const renderMintDone = (record) => {
  if (mintFormEl) mintFormEl.style.display = 'none';
  if (mintNotReadyEl) mintNotReadyEl.style.display = 'none';
  if (mintResultEl) mintResultEl.style.display = '';
  if (mintResultText) {
    mintResultText.textContent = record.tokenId != null ? `第${record.tokenId}号 授与` : '授与されました';
  }
  if (mintScanLink) {
    mintScanLink.href = NFT_CONTRACT
      ? `${BASESCAN_ORIGIN}/token/${NFT_CONTRACT}`
      : `${BASESCAN_ORIGIN}/tx/${record.txHash || ''}`;
  }
};

const openMintPanel = () => {
  if (!mintPanelEl) return;
  showMintError('');
  const record = getMintedRecord();
  if (record) {
    renderMintDone(record);
  } else if (!NFT_CONTRACT) {
    if (mintFormEl) mintFormEl.style.display = 'none';
    if (mintResultEl) mintResultEl.style.display = 'none';
    if (mintNotReadyEl) mintNotReadyEl.style.display = '';
  } else {
    if (mintFormEl) mintFormEl.style.display = '';
    if (mintResultEl) mintResultEl.style.display = 'none';
    if (mintNotReadyEl) mintNotReadyEl.style.display = 'none';
    loadTurnstile();
  }
  mintPanelEl.classList.add('show');
};
const closeMintPanel = () => mintPanelEl && mintPanelEl.classList.remove('show');
if (mintPanelCloseBtn) mintPanelCloseBtn.addEventListener('click', closeMintPanel);
if (mintPanelEl) {
  mintPanelEl.addEventListener('click', (e) => {
    if (e.target === mintPanelEl) closeMintPanel();
  });
}
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMintPanel();
});

if (mintWalletBtn) {
  if (!window.ethereum) {
    mintWalletBtn.disabled = true;
    mintWalletBtn.textContent = '対応ウォレットのブラウザで開いてください';
  } else {
    mintWalletBtn.addEventListener('click', async () => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts?.[0] && mintAddressInput) {
          mintAddressInput.value = accounts[0];
          showMintError('');
        }
      } catch {
        // 接続拒否は無言で戻す
      }
    });
  }
}

if (mintSubmitBtn) {
  mintSubmitBtn.addEventListener('click', async () => {
    const address = (mintAddressInput?.value || '').trim();
    if (!ADDRESS_RE.test(address)) {
      showMintError('アドレスの形式が正しくありません');
      return;
    }
    if (!turnstileToken) {
      showMintError('人の操作を確かめられませんでした。少し待ってからお試しください');
      return;
    }
    showMintError('');
    mintSubmitBtn.disabled = true;
    mintSubmitBtn.textContent = '儀を執り行っています';
    try {
      const res = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, turnstileToken }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        showMintError(MINT_ERROR_TEXT[body.error] || 'うまくいかなかったみたい。少しおいてもう一度');
        if (window.turnstile && turnstileWidgetId != null) window.turnstile.reset(turnstileWidgetId);
        turnstileToken = '';
        return;
      }
      const record = { tokenId: body.tokenId ?? null, txHash: body.txHash || '' };
      setMintedRecord(record);
      renderMintDone(record);
    } catch {
      showMintError('島の外と連絡が取れないみたい');
    } finally {
      mintSubmitBtn.disabled = false;
      mintSubmitBtn.textContent = '受け取る';
    }
  });
}

// ---------- プレゼンス（島にいる他の訪問者） ----------
const visitorsEl = document.getElementById('visitors');
const presence = initPresence({
  scene,
  terrainH,
  identity,
  getState: () => ({
    x: tarte.group.position.x,
    z: tarte.group.position.z,
    yaw: tarte.group.rotation.y,
    w: Math.min(1, speedSmooth / 2.0),
    j: py - terrainH(tarte.group.position.x, tarte.group.position.z),
  }),
  onCount: (n) => {
    if (visitorsEl) visitorsEl.textContent = n > 1 ? `● いま島に ${n}人` : '○ いま島に ひとり';
  },
  onFull: (max) => {
    showToast(`いま島は満員（${Number(max) || 3}人）みたい<br>ほかの旅人が帰ったらまた会えるよ`, 6000);
  },
});

// ---------- animation ----------
const clock = new THREE.Clock();
let walkPhase = 0;
let speedSmooth = 0;
let spotPoseT = 0;
let py = terrainH(tarte.group.position.x, tarte.group.position.z), vy = 0, grounded = true, landT = 0, airJumps = 0, airJumpT = 0;
const lastSafe = new THREE.Vector3(0, 0, 3.2); // 最後に接地していた場所（虚空落下の戻り先）
let stuckT = 0;
let prevYaw = tarte.group.rotation.y;
const prevPos = tarte.group.position.clone();
// カメラが追う「接地面の高さ」。ジャンプのバウンドは追わず、足場の高さの変化だけを滑らかに追う
let camGroundY = py;
let camGroundTargetY = py;

const lerpAngle = (a, b, t) => {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
};

function animate() {
  if (!window.__pumping) requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  const pos = tarte.group.position;

  // resizeイベントを取りこぼしても描画領域がズレたまま固まらないよう、毎秒実寸を照合
  sizeCheckT -= dt;
  if (sizeCheckT <= 0) {
    sizeCheckT = 1;
    const el = renderer.domElement;
    if (el.clientWidth !== window.innerWidth || el.clientHeight !== window.innerHeight) applySize();
  }

  // 操作パッド（アナログ）: 倒した向きへカメラ基準で歩く。倒し具合で速さが変わる
  if (padVec.x || padVec.y) {
    const mag = Math.min(1, Math.hypot(padVec.x, padVec.y));
    const fwd = new THREE.Vector3();
    camera.getWorldDirection(fwd);
    fwd.y = 0;
    fwd.normalize();
    const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0));
    const dir = fwd.multiplyScalar(-padVec.y).add(right.multiplyScalar(padVec.x)).normalize();
    target.copy(pos).addScaledVector(dir, 0.25 + 0.65 * mag);
    clampToIsland(target);
    resolveCollisions(target);
    moving = true;
    marker.material.opacity = 0;
  }

  const kx = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
  const kz = (keys.s ? 1 : 0) - (keys.w ? 1 : 0);
  if (kx || kz) {
    const fwd = new THREE.Vector3();
    camera.getWorldDirection(fwd);
    fwd.y = 0;
    fwd.normalize();
    const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0));
    const dir = fwd.multiplyScalar(-kz).add(right.multiplyScalar(kx)).normalize();
    target.copy(pos).add(dir.multiplyScalar(0.9));
    clampToIsland(target);
    resolveCollisions(target);
    moving = true;
    marker.material.opacity = 0;
  }

  let speed = 0;
  if (moving) {
    const to = new THREE.Vector3().subVectors(target, pos);
    to.y = 0;
    const dist = to.length();
    if (dist < 0.06) {
      moving = false;
    } else {
      speed = Math.min(2.4, Math.max(0.9, dist * 3));
      const step = Math.min(dist, speed * dt);
      const px0 = pos.x, pz0 = pos.z;
      pos.add(to.normalize().multiplyScalar(step));
      clampToIsland(pos);
      resolveCollisions(pos, py);
      tarte.group.rotation.y = lerpAngle(tarte.group.rotation.y, Math.atan2(to.x, to.z), 1 - Math.pow(0.001, dt));
      walkPhase += step * 9;
      // 壁に押し戻されて進めないときは歩行をやめる
      const moved = Math.hypot(pos.x - px0, pos.z - pz0);
      if (moved < step * 0.2) {
        stuckT += dt;
        if (stuckT > 0.5) {
          moving = false;
          stuckT = 0;
        }
      } else {
        stuckT = 0;
      }
    }
  }
  // ジャンプ（2段ジャンプ・絶対Y物理）。撮影演出中はポーズが崩れるので入力を捨てる
  if (misakiShot) jumpQueued = false;
  if (jumpQueued) {
    jumpQueued = false;
    if (grounded) {
      vy = 4.0;
      grounded = false;
      airJumps = 0;
      sound.se.jump();
    } else if (airJumps < 1) {
      vy = 3.8;
      airJumps = 1;
      airJumpT = 0.15; // 空中ジャンプの瞬間の小さなクッション演出
      sound.se.hop();
    }
  }
  if (grounded) {
    const sup = supportY(pos.x, pos.z, py);
    if (sup < py - 0.05) {
      grounded = false; // 足場の縁から歩き出た＝落下開始
    } else {
      py = sup;
      lastSafe.set(pos.x, 0, pos.z);
    }
  }
  if (!grounded) {
    vy -= 9.8 * dt;
    py += vy * dt;
    const sup = supportY(pos.x, pos.z, py);
    if (vy <= 0 && py <= sup) {
      py = sup;
      vy = 0;
      grounded = true;
      airJumps = 0;
      landT = 0.22;
      sound.se.land();
    }
  }
  pos.y = py;
  // 虚空へ落ちたら、最後に立っていた足場へ戻す
  if (py < -4) {
    pos.set(lastSafe.x, 0, lastSafe.z);
    py = supportY(pos.x, pos.z, 1e9);
    pos.y = py;
    vy = 0;
    grounded = true;
    airJumps = 0;
    target.copy(pos);
    moving = false;
  }
  if (landT > 0) {
    landT -= dt;
    const k = Math.sin((Math.PI * Math.max(0, landT)) / 0.22) * 0.16;
    tarte.group.scale.set(1 + k, 1 - k * 1.4, 1 + k);
  } else if (airJumpT > 0) {
    airJumpT -= dt;
    const k = Math.max(0, airJumpT) / 0.15;
    tarte.group.scale.set(1 + 0.12 * k, 1 - 0.15 * k, 1 + 0.12 * k);
  } else {
    tarte.group.scale.set(1, 1, 1);
  }

  // BGMのエリア切替（浮灯籠の登り道と星見台では曲が変わる）＋主題歌が灯っている間は絞る
  {
    const s2 = pos.x * C_AX + pos.z * C_AZ;
    const q2 = -pos.x * C_AZ + pos.z * C_AX;
    const onTrail = s2 > 8.4 && Math.abs(q2) <= C_HALF && Math.hypot(pos.x, pos.z) > 7.2;
    sound.setZone(onTrail ? 'ukidoro' : 'island');
    sound.update(dt, { duck: musicOn });
    // 島の外（桟橋・岬・登り道・星見台）にいる間だけ「もどる」を出す
    if (homeBtn) homeBtn.classList.toggle('show', Math.hypot(pos.x, pos.z) > WALK_R + 0.3);
  }

  // 撮影スポットでは片手をあげてポーズ
  spotPoseT += ((misakiShot ? 1 : 0) - spotPoseT) * Math.min(1, dt * 5);
  tarte.setPose(spotPoseT);

  speedSmooth += (speed - speedSmooth) * Math.min(1, dt * 10);
  const w = Math.min(1, speedSmooth / 2.0);
  const yawVel = (tarte.group.rotation.y - prevYaw) / Math.max(dt, 1e-4);
  prevYaw = tarte.group.rotation.y;

  tarte.update(dt, t, w, walkPhase, yawVel);
  presence.update(dt, t);

  // 足場の高さにはカメラも滑らかについていく（浮灯籠を登るほどタルトが画面上端に張り付くのを防ぐ）
  if (grounded) camGroundTargetY = py;
  {
    const ny = camGroundY + (camGroundTargetY - camGroundY) * Math.min(1, dt * 3);
    const dy = ny - camGroundY;
    camGroundY = ny;
    if (dy) {
      camera.position.y += dy;
      controls.target.y += dy;
    }
  }

  // カメラ追従（ジャンプの上下はカメラに伝えない）
  const delta = new THREE.Vector3().subVectors(pos, prevPos);
  delta.y = 0;
  camera.position.add(delta);
  controls.target.add(delta);
  prevPos.copy(pos);

  // 移動中はカメラがそっと背後に回り込む（手動で視点操作した直後は遠慮）
  if (moving && t - lastManualOrbit > 1.2) {
    const off = new THREE.Vector3().subVectors(camera.position, controls.target);
    const radius = Math.hypot(off.x, off.z);
    const na = lerpAngle(Math.atan2(off.x, off.z), tarte.group.rotation.y + Math.PI, 1 - Math.pow(0.55, dt));
    off.x = Math.sin(na) * radius;
    off.z = Math.cos(na) * radius;
    camera.position.copy(controls.target).add(off);
  }

  // ゾーン判定（三館＋中央のスタジオ碑＋案内板）→ 解説パネルへの入口
  let near = null;
  for (const z of ZONES) {
    if (pos.distanceTo(z.pos) < 3.05) near = z;
  }
  if (!near && shrineVisible && pos.distanceTo(shrinePos) < 1.2) near = MINT_NEAR;
  if (!near && pos.distanceTo(infoPos) < 1.6) near = INFO_NEAR;
  if (!near && Math.hypot(pos.x, pos.z) < 2.05) near = STUDIO_NEAR;
  if (!near && Math.hypot(pos.x - DECK_POS.x, pos.z - DECK_POS.z) < DECK_WALK_R + 0.15) near = MISAKI_NEAR;
  if (!near && Math.hypot(pos.x - HOSHI_POS.x, pos.z - HOSHI_POS.z) < HOSHI_WALK_R + 0.2) near = HOSHIMI_NEAR;
  currentNear = near;
  // 足元リング: 常時ゆっくり脈動し、円の中にいるあいだは強く発光する
  for (const zrs of zoneRings) {
    const on = near === zrs.zone;
    const ringTarget = on ? 1.0 : 0.55 + 0.2 * (0.5 + 0.5 * Math.sin(t * 2.1));
    const fillTarget = on ? 0.16 : 0.05;
    zrs.ring.material.opacity += (ringTarget - zrs.ring.material.opacity) * Math.min(1, dt * 7);
    zrs.fill.material.opacity += (fillTarget - zrs.fill.material.opacity) * Math.min(1, dt * 7);
  }
  {
    const hk = near ? near.key : '';
    if (hk !== lastHintKey && hintEl) {
      lastHintKey = hk;
      if (near) {
        if (near.key === 'info') {
          hintEl.innerHTML = `<b>${near.title}</b>　${near.jp}<span class="go">${near.go}</span>`;
        } else {
          // スマホ見切れ対策：スタジオ／三館は「✦ ◯◯について詳しく知る」の一句だけの短縮表示
          hintEl.innerHTML = `<span class="go">${near.go}</span>`;
        }
        hintEl.classList.add('show');
      } else {
        hintEl.classList.remove('show');
      }
    }
  }

  // かけら収集
  for (const s of shards) {
    if (!s.visible) continue;
    s.position.y = s.userData.baseY + Math.sin(t * 1.6 + s.userData.ph) * 0.08;
    s.rotation.y += dt * 1.4;
    s.userData.beam.material.opacity = 0.1 + 0.09 * (0.5 + 0.5 * Math.sin(t * 2.2 + s.userData.ph));
    if (Math.hypot(pos.x - s.position.x, pos.z - s.position.z) < 0.75) {
      s.visible = false;
      collected.add(s.userData.i);
      sound.se.shard();
      localStorage.setItem('vibe_shards', JSON.stringify([...collected]));
      updateShardHud();
      spawnBurst(s.position.x, s.position.z, s.userData.i % 2 ? 0xf48fb8 : 0x7be0ff);
      if (collected.size >= 7) {
        showToast('✦ 七つのかけらが揃った ✦<br>大樹の根元に、隠し祠が現れた', 6000);
        spawnBurst(0, 0, 0xeaf6ff);
        if (!shrineVisible) {
          shrineVisible = true;
          shrineGroup.visible = true;
          addShrineObstacle();
          spawnBurst(shrinePos.x, shrinePos.z, 0xf0c869);
        }
      } else {
        showToast(`衝動のかけらを見つけた（${collected.size}/7）`, 2200);
      }
    }
  }
  for (let i = bursts.length - 1; i >= 0; i--) {
    const b = bursts[i];
    b.t += dt;
    b.mesh.scale.setScalar(1 + b.t * 6);
    b.mesh.material.opacity = Math.max(0, 0.8 - b.t);
    if (b.t > 0.9) {
      scene.remove(b.mesh);
      bursts.splice(i, 1);
    }
  }

  // 音楽レベル解析→世界が呼応
  if (analyser && musicOn) {
    analyser.getByteFrequencyData(freqData);
    let sum = 0;
    const nb = 48;
    for (let i = 0; i < nb; i++) sum += freqData[i];
    const lvl = sum / nb / 255;
    musicLevel += (lvl - musicLevel) * Math.min(1, dt * 8);
  } else {
    musicLevel *= Math.max(0, 1 - dt * 2);
  }
  if (musicRefs.rim) musicRefs.rim.scale.setScalar(1 + musicLevel * 0.18);
  for (const sp of musicRefs.spots) sp.material.opacity = 0.08 + musicLevel * 0.22;

  // 環境アニメ
  for (const pe of petals) {
    const u = pe.userData;
    if (u.isNote) {
      pe.position.y = u.y0 + Math.sin(t * (1.2 + musicLevel * 3) + u.ph) * (0.12 + musicLevel * 0.28);
      continue;
    }
    u.a += dt * 0.07 * u.s;
    pe.position.x = Math.cos(u.a) * u.r;
    pe.position.z = Math.sin(u.a) * u.r;
    pe.position.y = u.y0 + Math.sin(t * 0.7 + u.ph) * 0.2;
    pe.rotation.x += dt * 1.2 * u.s;
    pe.rotation.y += dt * 0.9 * u.s;
  }
  for (const f of fireflies) {
    const u = f.userData;
    u.a += dt * 0.12 * u.s;
    f.position.set(
      Math.cos(u.a) * u.r + Math.sin(t * 0.9 + u.ph) * 0.3,
      u.y0 + Math.sin(t * 1.3 + u.ph) * 0.25,
      Math.sin(u.a) * u.r + Math.cos(t * 0.7 + u.ph) * 0.3
    );
    f.material.opacity = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t * 2.2 + u.ph * 3));
  }
  if (shrineVisible) {
    for (const sp of shrineGroup.userData.sparks) {
      const u = sp.userData;
      u.a += dt * 0.3;
      sp.position.set(Math.cos(u.a) * u.r, u.y0 + Math.sin(t * 1.6 + u.ph) * 0.06, Math.sin(u.a) * u.r);
      sp.material.opacity = 0.5 + 0.35 * (0.5 + 0.5 * Math.sin(t * 2.4 + u.ph));
    }
  }
  for (const r of rocks) {
    r.position.y = r.userData.y0 + Math.sin(t * 0.5 + r.userData.ph) * 0.25;
    r.rotation.y += dt * r.userData.sp;
  }

  // 雲海のドリフト
  for (const c of cloudLayers) c.tex.offset.x += dt * 0.0045 * c.dir;

  // オーロラのゆらぎ
  auroraMats.forEach((m, i) => {
    m.opacity = 0.19 + 0.07 * Math.sin(t * 0.4 + i * 1.7);
  });
  if (auroraMats.length) auroraMats[0].map.offset.x += dt * 0.006;

  // 流れ星
  nextStarT -= dt;
  if (nextStarT <= 0) {
    const s = shootingStars.find((x) => x.life < 0);
    if (s) {
      const a = Math.random() * Math.PI * 2;
      s.mesh.position.set(Math.cos(a) * (24 + Math.random() * 14), 13 + Math.random() * 9, Math.sin(a) * (24 + Math.random() * 14));
      s.dir.set(-Math.cos(a) * 0.5 + (Math.random() - 0.5), -0.55, -Math.sin(a) * 0.5 + (Math.random() - 0.5)).normalize();
      s.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), s.dir);
      s.life = 0;
    }
    nextStarT = 4 + Math.random() * 5;
  }
  for (const s of shootingStars) {
    if (s.life < 0) continue;
    s.life += dt;
    s.mesh.position.addScaledVector(s.dir, dt * 20);
    s.mesh.material.opacity = Math.sin(Math.min(1, s.life / 1.1) * Math.PI) * 0.9;
    if (s.life > 1.1) {
      s.life = -1;
      s.mesh.material.opacity = 0;
    }
  }

  // 提灯のゆらぎ
  for (const ln of lanterns) {
    ln.swing.rotation.z = Math.sin(t * 1.6 + ln.ph) * 0.08;
    ln.swing.rotation.x = Math.sin(t * 1.1 + ln.ph * 2) * 0.05;
  }

  // 地を這う霧
  for (const m of mists) {
    m.userData.a += dt * 0.02;
    m.position.x = Math.cos(m.userData.a) * 5.6;
    m.position.z = Math.sin(m.userData.a) * 5.6;
    m.material.opacity = 0.32 + 0.18 * Math.sin(t * 0.5 + m.userData.ph);
    m.rotation.z += dt * 0.03;
  }
  for (const s of screenScrolls) s.offset.y = Math.sin(t * 0.6) * 0.012;

  // 花冠の呼吸（周期4秒・±15%）＋音楽レベルで加算発光
  {
    const breathe = Math.sin(t * (Math.PI / 2)) * 0.15;
    sakuraTree.userData.crownMat.emissiveIntensity = 0.35 * (1 + breathe) + musicLevel * 0.4;
    blossomLight.intensity = 2.2 * (1 + breathe * 0.6) + musicLevel * 1.6;
  }

  // 花びらの分光ストリーム（大樹の花冠→各館へ流れ、道の色に染まっていく）
  for (const pt of petalStreams) {
    const u = pt.userData;
    u.prog += dt * u.speed;
    if (u.prog > 1) u.prog -= 1;
    const dx = u.target.x, dz = u.target.z;
    const perpX = -dz, perpZ = dx;
    const perpLen = Math.hypot(perpX, perpZ) || 1;
    const wobble = Math.sin(t * 1.4 + u.ph) * u.off;
    pt.position.set(
      dx * u.prog + (perpX / perpLen) * wobble,
      3.5 - u.prog * 3.1 + Math.sin(t * 1.8 + u.ph) * 0.14,
      dz * u.prog + (perpZ / perpLen) * wobble
    );
    pt.material.color.copy(petalBaseColor).lerp(u.zoneColor, Math.min(1, u.prog * 1.2));
    let op = 0.8;
    if (u.prog < 0.08) op *= u.prog / 0.08;
    if (u.prog > 0.82) op *= Math.max(0, (1 - u.prog) / 0.18);
    pt.material.opacity = op;
    pt.rotation.x += dt * 1.1;
    pt.rotation.y += dt * 0.8;
  }
  for (const l of labels) l.lookAt(camera.position);
  for (const f of floaties) {
    f.mesh.position.y = f.y0 + Math.sin(t * 1.1 + f.ph) * 0.05;
    f.mesh.rotation.y = f.baseRot + Math.sin(t * 0.6 + f.ph) * 0.3;
  }
  marker.material.opacity = Math.max(0, marker.material.opacity - dt * 0.8);
  marker.scale.setScalar(1 + Math.sin(t * 6) * 0.08);

  // 月見の岬の撮影演出（カメラが構図へ回り込み、着いたらシャッター）
  if (misakiShot) {
    misakiShot.t += dt;
    const k = THREE.MathUtils.smoothstep(misakiShot.t, 0, 0.9);
    camera.position.lerpVectors(misakiShot.fromPos, misakiShot.toPos, k);
    controls.target.lerpVectors(misakiShot.fromTgt, misakiShot.toTgt, k);
    const mp = tarte.group.position;
    mp.x = misakiShot.fromP.x + (misakiShot.toP.x - misakiShot.fromP.x) * k;
    mp.z = misakiShot.fromP.z + (misakiShot.toP.z - misakiShot.fromP.z) * k;
    tarte.group.rotation.y = lerpAngle(tarte.group.rotation.y, Math.atan2(misakiShot.toPos.x - mp.x, misakiShot.toPos.z - mp.z), Math.min(1, dt * 6));
    if (misakiShot.t >= 1.15) {
      misakiShot = null;
      takePhoto();
    }
  }

  controls.update();

  // カメラの建物めり込み対策（注視点→カメラのレイで遮蔽物より手前に寄せる）
  {
    const camDir = new THREE.Vector3().subVectors(camera.position, controls.target);
    const camDist = camDir.length();
    raycaster.set(controls.target, camDir.clone().normalize());
    raycaster.far = camDist;
    const hits = raycaster.intersectObjects(camColliders, false);
    raycaster.far = Infinity;
    if (hits.length) {
      const d = Math.max(0.6, hits[0].distance * 0.9);
      camera.position.copy(controls.target).addScaledVector(camDir.normalize(), d);
    }
  }

  renderer.render(scene, camera);
}
// かけらが障害物の中に埋まって取れなくならないよう、起動時に外へ押し出す
// （プレイヤーは障害物の縁 r+CHAR_R までしか近づけない。収集判定0.75に届く位置まで逃がす）
for (const s of shards) {
  for (let iter = 0; iter < 4; iter++) {
    let moved = false;
    for (const o of obstacles) {
      const dx = s.position.x - o.x, dz = s.position.z - o.z;
      const d = Math.hypot(dx, dz);
      const need = o.r + CHAR_R + 0.3;
      if (d < need) {
        const k = d > 1e-4 ? need / d : 1;
        s.position.x = d > 1e-4 ? o.x + dx * k : o.x + need;
        s.position.z = d > 1e-4 ? o.z + dz * k : o.z;
        moved = true;
      }
    }
    if (!moved) break;
  }
  const l = Math.hypot(s.position.x, s.position.z);
  if (l > WALK_R - 0.3) {
    s.position.x *= (WALK_R - 0.3) / l;
    s.position.z *= (WALK_R - 0.3) / l;
  }
  s.userData.baseY = terrainH(s.position.x, s.position.z) + 0.5;
  s.position.y = s.userData.baseY;
}

// 開発検品用テレポート（localhostのみ・本番では生えない）
if (['localhost', '127.0.0.1'].includes(location.hostname)) {
  window.__pos = () => ({ x: tarte.group.position.x, z: tarte.group.position.z });
  // 非表示タブ検証用：rAFが止まっていてもフレームを手動で進める（ms>0で実時間駆動）
  window.__pump = (n = 1, ms = 0) => new Promise((res) => {
    window.__pumping = true;
    if (!ms) {
      for (let i = 0; i < n; i++) animate();
      window.__pumping = false;
      res(n);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      animate();
      if (++i >= n) {
        clearInterval(id);
        window.__pumping = false;
        res(i);
      }
    }, ms);
  });
  window.__walkTo = (x, z) => {
    const v = new THREE.Vector3(x, 0, z);
    clampToIsland(v);
    target.copy(v);
    moving = true;
  };
  window.__jump = () => { jumpQueued = true; };
  window.__tp = (x, z, fx, fz) => {
    const v = new THREE.Vector3(x, 0, z);
    clampToIsland(v);
    resolveCollisions(v, 1e9);
    tarte.group.position.set(v.x, supportY(v.x, v.z, 1e9), v.z);
    target.copy(v);
    moving = false;
    py = supportY(v.x, v.z, 1e9);
    vy = 0;
    grounded = true;
    camGroundY = camGroundTargetY = py;
    controls.target.set(v.x, py + 0.6, v.z);
    if (fx !== undefined) {
      // 注視点fx,fzを正面に見る位置へカメラを回す
      const back = new THREE.Vector3(v.x - fx, 0, v.z - fz).normalize().multiplyScalar(4.2);
      camera.position.set(v.x + back.x, py + 2.6, v.z + back.z);
    } else {
      const off = camera.position.clone().sub(controls.target);
      camera.position.copy(controls.target).add(off);
    }
    prevPos.copy(tarte.group.position);
  };
}

animate();

// 内部状態フック（他のデバッグフックと同様 localhost 限定・本番では生やさない）
if (['localhost', '127.0.0.1'].includes(location.hostname)) {
  window.__poc = { tarte: tarte.group, target, camera, controls, toggleMusic, shards, collected, DECK_POS, obstacles, PLATFORMS, get near() { return currentNear; }, get py() { return py; }, get grounded() { return grounded; } };
}

addEventListener('resize', applySize);
// iOSはキーボードやURLバーの伸縮をvisualViewport側でしか通知しないことがある
if (window.visualViewport) window.visualViewport.addEventListener('resize', applySize);
