import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createAvatar, loadIdentity } from '../../poc/island/avatars.js';
import { COSMETIC_ITEMS, cosmeticsToMask, createCosmeticRig } from '../../poc/island/cosmetics.js';
import { initPresence, makeNameLabel } from '../../poc/island/net.js';
import { addOutlines, canvasTex, toon } from '../../poc/island/toon.js';
import { playArrival, studioWorldHref, warpTo } from '../shared/warp.js';

playArrival('meikyo');

const IS_TOUCH = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || new URLSearchParams(location.search).has('pad');
document.body.classList.toggle('force-touch', IS_TOUCH);

try {
  await Promise.race([
    Promise.all([
      document.fonts.load('800 32px "Shippori Mincho B1"'),
      document.fonts.load('700 24px "Zen Kaku Gothic New"'),
      document.fonts.ready,
    ]),
    new Promise((resolve) => setTimeout(resolve, 2200)),
  ]);
} catch {}

const loader = new THREE.TextureLoader();
const [lakeTexture, mirrorFaceTexture] = await Promise.all([
  loader.loadAsync('/meikyou/mirror-lake.jpg'),
  loader.loadAsync('/meikyou/meikyou-mirror-face.jpg'),
]);
lakeTexture.colorSpace = THREE.SRGBColorSpace;
mirrorFaceTexture.colorSpace = THREE.SRGBColorSpace;

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdce8e9);
scene.fog = new THREE.Fog(0xdce8e9, 16, 42);

const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 100);
camera.position.set(1.25, 2.95, 8.95);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.75, 3.15);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.minDistance = 1.5;
controls.maxDistance = 15;
controls.maxPolarAngle = 1.5;

const environmentTexture = canvasTex(512, 256, (ctx, width, height) => {
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#a8c7cc');
  sky.addColorStop(0.44, '#f8fbf8');
  sky.addColorStop(0.62, '#d9c59a');
  sky.addColorStop(1, '#60817b');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);
});
environmentTexture.mapping = THREE.EquirectangularReflectionMapping;
scene.environment = environmentTexture;

scene.add(new THREE.HemisphereLight(0xeaf8f8, 0x6b8279, 1.7));
const sun = new THREE.DirectionalLight(0xfffbec, 3.1);
sun.position.set(-7, 13, 9);
sun.castShadow = true;
sun.shadow.mapSize.set(1536, 1536);
sun.shadow.camera.left = -10;
sun.shadow.camera.right = 10;
sun.shadow.camera.top = 10;
sun.shadow.camera.bottom = -10;
scene.add(sun);

const viewSize = () => {
  const vv = window.visualViewport;
  const layoutW = Math.round(document.documentElement.clientWidth || innerWidth);
  const layoutH = Math.round(document.documentElement.clientHeight || innerHeight);
  const visualW = Math.round(vv ? vv.width : layoutW);
  const visualH = Math.round(vv ? vv.height : layoutH);
  const desktopLayoutOnPhone = IS_TOUCH && layoutW > visualW * 1.4;
  return {
    width: desktopLayoutOnPhone ? layoutW : visualW,
    height: desktopLayoutOnPhone ? layoutH : visualH,
  };
};

const applySize = () => {
  const { width, height } = viewSize();
  const aspect = width / height;
  camera.aspect = aspect;
  camera.fov = THREE.MathUtils.lerp(43, 57, THREE.MathUtils.clamp((0.78 - aspect) / 0.32, 0, 1));
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};
applySize();
addEventListener('resize', applySize);
addEventListener('orientationchange', () => setTimeout(applySize, 240));
window.visualViewport?.addEventListener('resize', applySize);
window.visualViewport?.addEventListener('scroll', applySize);

const GROUND_Y = 0.2;
const WALK_RADIUS = 6.55;
const PLAYER_RADIUS = 0.3;
const obstacles = [
  { x: 0, z: -0.55, r: 2.05 },
];

const silver = (roughness = 0.16) => new THREE.MeshStandardMaterial({
  color: 0xd9e4e5,
  metalness: 0.88,
  roughness,
});
const glow = (color, opacity = 0.55) => new THREE.MeshBasicMaterial({
  color,
  transparent: true,
  opacity,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.DoubleSide,
});

const waterUniforms = {
  uTime: { value: 0 },
  uNear: { value: new THREE.Color(0xaed0d2) },
  uFar: { value: new THREE.Color(0x668f98) },
};
const water = new THREE.Mesh(
  new THREE.PlaneGeometry(72, 72, 96, 96),
  new THREE.ShaderMaterial({
    uniforms: waterUniforms,
    transparent: true,
    opacity: 0.96,
    side: THREE.DoubleSide,
    vertexShader: `
      uniform float uTime;
      varying float vWave;
      varying vec2 vUv2;
      void main() {
        vec3 p = position;
        float w = sin(p.x * 0.52 + uTime * 0.62) * 0.055;
        w += sin(p.y * 0.7 - uTime * 0.48) * 0.035;
        p.z += w;
        vWave = w;
        vUv2 = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uNear;
      uniform vec3 uFar;
      uniform float uTime;
      varying float vWave;
      varying vec2 vUv2;
      void main() {
        float band = 0.5 + 0.5 * sin((vUv2.x + vUv2.y) * 46.0 + uTime * 0.5);
        float shine = smoothstep(0.75, 1.0, band) * 0.08;
        vec3 color = mix(uFar, uNear, vUv2.y * 0.38 + 0.34 + vWave * 2.0);
        gl_FragColor = vec4(color + shine, 0.96);
      }
    `,
  }),
);
water.rotation.x = -Math.PI / 2;
water.position.y = -0.16;
scene.add(water);

const island = new THREE.Mesh(
  new THREE.CylinderGeometry(7.15, 6.55, 0.42, 72),
  new THREE.MeshStandardMaterial({ color: 0xdfe8e3, roughness: 0.82, metalness: 0.03 }),
);
island.position.y = -0.01;
island.receiveShadow = true;
island.castShadow = true;
scene.add(island);

const islandRim = new THREE.Mesh(
  new THREE.TorusGeometry(6.82, 0.055, 10, 120),
  new THREE.MeshStandardMaterial({ color: 0x557d77, roughness: 0.42, metalness: 0.48 }),
);
islandRim.rotation.x = Math.PI / 2;
islandRim.position.y = GROUND_Y + 0.018;
scene.add(islandRim);

const pool = new THREE.Mesh(
  new THREE.CircleGeometry(1.9, 72),
  new THREE.MeshBasicMaterial({ map: lakeTexture, color: 0xcde1e5, transparent: true, opacity: 0.88 }),
);
pool.rotation.x = -Math.PI / 2;
pool.position.set(0, GROUND_Y + 0.022, -0.55);
pool.userData.noOutline = true;
scene.add(pool);
const poolRim = new THREE.Mesh(new THREE.TorusGeometry(1.96, 0.045, 10, 96), silver(0.22));
poolRim.rotation.x = Math.PI / 2;
poolRim.position.set(0, GROUND_Y + 0.035, -0.55);
scene.add(poolRim);

for (const a of [-2.45, -0.72, 0.72, 2.45]) {
  const strip = new THREE.Mesh(
    new THREE.BoxGeometry(0.055, 0.015, 2.7),
    new THREE.MeshBasicMaterial({ color: a < 0 ? 0xb58d49 : 0x4f8378, transparent: true, opacity: 0.6 }),
  );
  strip.position.set(Math.sin(a) * 3.5, GROUND_Y + 0.03, Math.cos(a) * 3.5 - 0.2);
  strip.rotation.y = a;
  strip.userData.noOutline = true;
  scene.add(strip);
}

const labels = [];
const makeWorldLabel = (en, jp, color = '#24444b') => {
  const tex = canvasTex(640, 184, (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(248,251,250,0.92)';
    ctx.beginPath();
    ctx.roundRect(26, 18, width - 52, height - 36, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(34,75,82,0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = '700 29px Inter, sans-serif';
    ctx.fillText(en, width / 2, 68);
    ctx.fillStyle = '#10272d';
    ctx.font = '800 50px "Shippori Mincho B1", serif';
    ctx.fillText(jp, width / 2, 132);
  });
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sprite.scale.set(2.2, 0.64, 1);
  labels.push(sprite);
  return sprite;
};

const centralMirror = new THREE.Group();
centralMirror.position.set(0, GROUND_Y, -0.78);
centralMirror.scale.setScalar(0.82);
const centralBase = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.35, 0.26, 48), silver(0.28));
centralBase.position.y = 0.13;
centralBase.castShadow = centralBase.receiveShadow = true;
centralMirror.add(centralBase);
const centralFrame = new THREE.Mesh(new THREE.TorusGeometry(1.14, 0.09, 16, 88), silver(0.1));
centralFrame.position.y = 1.58;
centralFrame.scale.y = 1.3;
centralFrame.castShadow = true;
centralMirror.add(centralFrame);
const centralBacking = new THREE.Mesh(
  new THREE.CircleGeometry(1.04, 72),
  new THREE.MeshPhysicalMaterial({
    color: 0xc8d9dc,
    metalness: 0.78,
    roughness: 0.12,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    side: THREE.DoubleSide,
  }),
);
centralBacking.position.set(0, 1.58, 0);
centralBacking.scale.y = 1.3;
centralMirror.add(centralBacking);
const centralSurfaceMaterial = new THREE.MeshBasicMaterial({
  map: mirrorFaceTexture,
  color: 0xffffff,
  transparent: true,
  opacity: 0.34,
  side: THREE.DoubleSide,
  depthWrite: false,
});
const centralSurface = new THREE.Mesh(new THREE.CircleGeometry(1.035, 72), centralSurfaceMaterial);
centralSurface.position.set(0, 1.58, 0.008);
centralSurface.scale.y = 1.3;
centralSurface.userData.noOutline = true;
centralMirror.add(centralSurface);
const centralLight = new THREE.PointLight(0xc7f3ef, 0.45, 5, 2);
centralLight.position.set(0, 1.55, 0.6);
centralMirror.add(centralLight);
const centralLabel = makeWorldLabel('THE CLEAR MIRROR', '大鏡', '#3d766a');
centralLabel.position.set(0, 3.25, 0);
centralMirror.add(centralLabel);
addOutlines(centralMirror, { color: 0x1d3034, min: 0.006, max: 0.016 });
scene.add(centralMirror);

const TRIALS = [
  {
    id: 'change',
    en: 'MIRROR I / CHANGE',
    title: '変化の鏡',
    position: new THREE.Vector3(-3.95, GROUND_Y, 0.75),
    color: 0x4f8378,
    prompt: '「明鏡」が最初に置く、マーケティングの根っこを映します。',
    question: 'マーケティングの核心を、もっとも端的に表すものは？',
    options: ['売上を最大化すること', '変化を起こすこと', '広告を最適化すること', 'ブランド名を広めること'],
    answer: 1,
    explanation: 'マーケティングとは「変化を起こすこと」。明鏡では、さらに「望ましい変化を定義し、その変化が起きるように設計し続けること」と捉えます。',
  },
  {
    id: 'roots',
    en: 'MIRROR II / ROOTS',
    title: '根と枝の鏡',
    position: new THREE.Vector3(3.95, GROUND_Y, 0.75),
    color: 0xb58d49,
    prompt: '流行の技法と、長く残る原則を見分けます。',
    question: '「枝葉」のマーケティングノウハウが持つ特徴は？',
    options: ['一生価値が変わらない', '事業の思想を決める', 'すぐ枯れ、小手先の数字で終わりやすい', 'AIには代替できない'],
    answer: 2,
    explanation: '枝葉も実務では必要です。ただし流行とともに枯れやすい。明鏡は、迷ったときに戻れる「根っこ」から学ぶことを重視します。',
  },
  {
    id: 'funnel',
    en: 'MIRROR III / FUNNEL',
    title: '導線の鏡',
    position: new THREE.Vector3(0, GROUND_Y, -5.15),
    color: 0x709db3,
    prompt: '人が商品へたどり着く順序を、水路のようにつなぎます。',
    question: '一般的なマーケティングファネルを、入口から順に選んでください。',
    options: ['比較・検討', '購入・成約', '認知', '興味・関心'],
    sequence: [2, 3, 0, 1],
    explanation: '基本の流れは「認知 → 興味・関心 → 比較・検討 → 購入・成約」。どこで人が止まるかを見つけ、導線を設計し続けます。',
  },
];

const trialMeshes = new Map();
for (const trial of TRIALS) {
  const group = new THREE.Group();
  group.position.copy(trial.position);
  group.rotation.y = Math.atan2(-trial.position.x, -trial.position.z);
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.84, 0.22, 36), silver(0.3));
  pedestal.position.y = 0.11;
  pedestal.castShadow = pedestal.receiveShadow = true;
  group.add(pedestal);
  const frame = new THREE.Mesh(new THREE.TorusGeometry(0.53, 0.055, 12, 56), silver(0.14));
  frame.position.y = 1.02;
  frame.scale.y = 1.18;
  frame.castShadow = true;
  group.add(frame);
  const material = new THREE.MeshPhysicalMaterial({
    color: trial.color,
    roughness: 0.18,
    metalness: 0.52,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    transparent: true,
    opacity: 0.66,
    side: THREE.DoubleSide,
  });
  const surface = new THREE.Mesh(new THREE.CircleGeometry(0.48, 48), material);
  surface.position.set(0, 1.02, 0.006);
  surface.scale.y = 1.18;
  surface.userData.noOutline = true;
  group.add(surface);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.72, 0.88, 48), glow(trial.color, 0.38));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.13;
  ring.userData.noOutline = true;
  group.add(ring);
  const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.115, 0), glow(0xffffff, 0.9));
  shard.position.set(0, 1.92, 0.04);
  shard.visible = false;
  shard.userData.noOutline = true;
  group.add(shard);
  const light = new THREE.PointLight(trial.color, 0.52, 2.6, 2);
  light.position.set(0, 1.05, 0.4);
  group.add(light);
  const label = makeWorldLabel(trial.en, trial.title, `#${trial.color.toString(16).padStart(6, '0')}`);
  label.position.set(0, 1.92, 0);
  group.add(label);
  addOutlines(group, { color: 0x20363a, min: 0.005, max: 0.013 });
  scene.add(group);
  obstacles.push({ x: trial.position.x, z: trial.position.z, r: 0.58 });
  trialMeshes.set(trial.id, { group, surface, ring, shard, light, label });
}

const returnGate = new THREE.Group();
returnGate.position.set(-5.2, GROUND_Y, 3.85);
returnGate.rotation.y = Math.atan2(-returnGate.position.x, -returnGate.position.z);
const returnBase = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.94, 0.18, 36), silver(0.28));
returnBase.position.y = 0.09;
returnBase.castShadow = returnBase.receiveShadow = true;
returnGate.add(returnBase);
const returnFrame = new THREE.Mesh(new THREE.TorusGeometry(0.61, 0.065, 12, 60), silver(0.12));
returnFrame.position.y = 1.05;
returnFrame.scale.y = 1.2;
returnGate.add(returnFrame);
const returnSurface = new THREE.Mesh(
  new THREE.CircleGeometry(0.55, 56),
  new THREE.MeshBasicMaterial({ map: lakeTexture, color: 0xdcebed, transparent: true, opacity: 0.82, side: THREE.DoubleSide }),
);
returnSurface.position.set(0, 1.05, 0.006);
returnSurface.scale.y = 1.2;
returnSurface.userData.noOutline = true;
returnGate.add(returnSurface);
const returnLabel = makeWorldLabel('RETURN GATE', 'Studio VIBE島', '#4f8378');
returnLabel.position.set(0, 2.18, 0);
returnGate.add(returnLabel);
addOutlines(returnGate, { color: 0x20363a, min: 0.005, max: 0.014 });
scene.add(returnGate);
obstacles.push({ x: returnGate.position.x, z: returnGate.position.z, r: 0.55 });

// 銀の幹と常緑の葉だけを外周へ置き、鏡と試練の視線を空ける。
for (const [index, angle] of [-2.8, -2.15, -1.22, -0.42, 0.38, 2.78].entries()) {
  const radius = 6.15 + (index % 2) * 0.22;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius - 0.15;
  const tree = new THREE.Group();
  tree.position.set(x, GROUND_Y, z);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.9, 10), silver(0.34));
  trunk.position.y = 0.45;
  trunk.castShadow = true;
  tree.add(trunk);
  for (let layer = 0; layer < 3; layer++) {
    const crown = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.42 - layer * 0.06, 1),
      new THREE.MeshStandardMaterial({
        color: layer === 1 ? 0x72958a : 0x4f776e,
        roughness: 0.62,
        metalness: 0.08,
      }),
    );
    crown.position.set((layer - 1) * 0.18, 1.03 + layer * 0.23, (layer % 2) * 0.1);
    crown.scale.y = 0.8;
    crown.castShadow = true;
    tree.add(crown);
  }
  addOutlines(tree, { color: 0x243a3d, min: 0.005, max: 0.012 });
  scene.add(tree);
  obstacles.push({ x, z, r: 0.26 });
}

for (let i = 0; i < 26; i++) {
  const angle = (i / 26) * Math.PI * 2 + 0.12;
  const radius = 5.1 + (i % 3) * 0.45;
  const crystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.045 + (i % 2) * 0.018),
    glow(i % 4 === 0 ? 0xc49b4a : 0xbce9e8, 0.72),
  );
  crystal.position.set(Math.cos(angle) * radius, GROUND_Y + 0.06 + (i % 3) * 0.04, Math.sin(angle) * radius - 0.15);
  crystal.rotation.set(i * 0.3, i * 0.7, 0);
  crystal.userData.noOutline = true;
  scene.add(crystal);
}

const identity = loadIdentity();
const avatar = createAvatar(identity.c, identity.v);
avatar.group.position.set(0, GROUND_Y, 4.75);
avatar.group.rotation.y = Math.PI;
avatar.group.add(makeNameLabel(identity.name));
scene.add(avatar.group);

const readCosmeticMask = () => {
  try {
    const raw = JSON.parse(localStorage.getItem('vibe.island.cosmetics.v1') || 'null');
    const valid = new Set(COSMETIC_ITEMS.map((item) => item.id));
    return cosmeticsToMask((Array.isArray(raw?.equipped) ? raw.equipped : []).filter((id) => valid.has(id)));
  } catch {
    return 0;
  }
};
const cosmeticRig = createCosmeticRig(readCosmeticMask());
avatar.group.add(cosmeticRig.group);

const PROGRESS_KEY = 'vibe.world.meikyo.progress.v1';
const completed = (() => {
  try {
    const raw = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]');
    return new Set((Array.isArray(raw) ? raw : []).filter((id) => TRIALS.some((trial) => trial.id === id)));
  } catch {
    return new Set();
  }
})();

const progressEl = document.getElementById('progress');
const objectiveEl = document.getElementById('objective');
const objectiveDots = [...document.querySelectorAll('.objective-dots i')];
const hintEl = document.getElementById('hint');
const toastEl = document.getElementById('toast');
const lessonPanel = document.getElementById('lesson-panel');
const lessonClose = document.getElementById('lesson-close');
const lessonKicker = document.getElementById('lesson-kicker');
const lessonTitle = document.getElementById('lesson-title');
const lessonCopy = document.getElementById('lesson-copy');
const lessonOptions = document.getElementById('lesson-options');
const lessonFeedback = document.getElementById('lesson-feedback');
const completionPanel = document.getElementById('completion-panel');
const completionClose = document.getElementById('completion-close');
const completionStay = document.getElementById('completion-stay');
const presenceEl = document.getElementById('presence');

let toastTimer = 0;
const showToast = (message, duration = 2200) => {
  clearTimeout(toastTimer);
  toastEl.textContent = message;
  toastEl.classList.add('is-visible');
  toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), duration);
};

let audioContext = null;
const chime = (frequency = 740, duration = 0.16) => {
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume();
    const start = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, start);
    osc.frequency.exponentialRampToValueAtTime(frequency * 1.45, start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.08, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(audioContext.destination);
    osc.start(start);
    osc.stop(start + duration + 0.03);
  } catch {}
};

const updateProgress = () => {
  progressEl.textContent = String(completed.size);
  objectiveDots.forEach((dot, index) => dot.classList.toggle('is-done', index < completed.size));
  objectiveEl.querySelector('span').textContent = completed.size === 3
    ? '大鏡が澄みました'
    : `あと${3 - completed.size}枚の鏡片を探そう`;
  centralSurfaceMaterial.color.set(completed.size === 3 ? 0xffffff : 0x92a9ad);
  centralSurfaceMaterial.opacity = completed.size === 3 ? 0.94 : 0.34 + completed.size * 0.15;
  centralLight.intensity = completed.size === 3 ? 2.1 : 0.45 + completed.size * 0.36;
  for (const [index, trial] of TRIALS.entries()) {
    const fx = trialMeshes.get(trial.id);
    const done = completed.has(trial.id);
    fx.shard.visible = done;
    fx.surface.material.opacity = done ? 0.92 : 0.66;
    fx.light.intensity = done ? 1.15 : 0.52;
    objectiveDots[index].classList.toggle('is-done', done);
  }
};
updateProgress();

let activeTrial = null;
let selectedSequence = [];
let closeTimer = 0;
const closeLesson = () => {
  clearTimeout(closeTimer);
  lessonPanel.hidden = true;
  activeTrial = null;
  selectedSequence = [];
};

const completeTrial = (trial) => {
  if (completed.has(trial.id)) return;
  completed.add(trial.id);
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify([...completed])); } catch {}
  updateProgress();
  chime(720 + completed.size * 120, 0.24);
  showToast(`鏡片が澄んだ　${completed.size}/3`, 2600);
  closeTimer = setTimeout(() => {
    closeLesson();
    if (completed.size === 3) {
      setTimeout(() => { completionPanel.hidden = false; }, 450);
    }
  }, 1450);
};

const renderChoiceTrial = (trial) => {
  trial.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = option;
    button.addEventListener('click', () => {
      const buttons = [...lessonOptions.querySelectorAll('button')];
      buttons.forEach((entry) => { entry.disabled = true; });
      if (index === trial.answer) {
        button.classList.add('is-correct');
        lessonFeedback.textContent = trial.explanation;
        completeTrial(trial);
      } else {
        button.classList.add('is-wrong');
        buttons[trial.answer].classList.add('is-correct');
        lessonFeedback.textContent = '鏡が少し曇りました。正しい輪郭を確かめて、もう一度立ち返ってください。';
        chime(240, 0.12);
        closeTimer = setTimeout(() => openTrial(trial), 1500);
      }
    });
    lessonOptions.appendChild(button);
  });
};

const renderSequenceTrial = (trial) => {
  const buttons = [];
  trial.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = option;
    button.addEventListener('click', () => {
      if (button.disabled) return;
      selectedSequence.push(index);
      button.disabled = true;
      button.textContent = `${selectedSequence.length}. ${option}`;
      button.classList.add('is-correct');
      if (selectedSequence.length < trial.sequence.length) return;
      const correct = selectedSequence.every((value, position) => value === trial.sequence[position]);
      if (correct) {
        lessonFeedback.textContent = trial.explanation;
        completeTrial(trial);
      } else {
        buttons.forEach((entry) => entry.classList.remove('is-correct'));
        lessonFeedback.textContent = '流れが逆流しています。「知る」から「選ぶ」までを、もう一度つないでみましょう。';
        chime(240, 0.12);
        closeTimer = setTimeout(() => openTrial(trial), 1500);
      }
    });
    buttons.push(button);
    lessonOptions.appendChild(button);
  });
};

function openTrial(trial) {
  clearTimeout(closeTimer);
  activeTrial = trial;
  selectedSequence = [];
  lessonPanel.hidden = false;
  lessonKicker.textContent = trial.en;
  lessonTitle.textContent = trial.title;
  lessonCopy.textContent = completed.has(trial.id) ? trial.explanation : `${trial.prompt} ${trial.question}`;
  lessonOptions.replaceChildren();
  lessonFeedback.textContent = '';
  if (completed.has(trial.id)) {
    lessonFeedback.textContent = 'この鏡片は澄んでいます。ほかの鏡へ向かいましょう。';
    return;
  }
  if (trial.sequence) renderSequenceTrial(trial);
  else renderChoiceTrial(trial);
  requestAnimationFrame(() => lessonOptions.querySelector('button')?.focus());
}

lessonClose.addEventListener('click', closeLesson);
lessonPanel.addEventListener('click', (event) => { if (event.target === lessonPanel) closeLesson(); });
completionClose.addEventListener('click', () => { completionPanel.hidden = true; });
completionStay.addEventListener('click', () => { completionPanel.hidden = true; });
completionPanel.addEventListener('click', (event) => { if (event.target === completionPanel) completionPanel.hidden = true; });
addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeLesson();
    completionPanel.hidden = true;
  }
});

const playerTarget = new THREE.Vector3().copy(avatar.group.position);
let clickMoving = false;
let jumpQueued = false;
let verticalSpeed = 0;
let playerY = GROUND_Y;
let grounded = true;
let walkPhase = 0;
let previousYaw = avatar.group.rotation.y;
const previousPosition = avatar.group.position.clone();
const keyboard = new Set();

const clampWalkable = (point) => {
  const length = Math.hypot(point.x, point.z);
  if (length > WALK_RADIUS) {
    point.x *= WALK_RADIUS / length;
    point.z *= WALK_RADIUS / length;
  }
};

const resolveObstacles = (point) => {
  for (let pass = 0; pass < 3; pass++) {
    let changed = false;
    for (const obstacle of obstacles) {
      const dx = point.x - obstacle.x;
      const dz = point.z - obstacle.z;
      const distance = Math.hypot(dx, dz);
      const minimum = obstacle.r + PLAYER_RADIUS;
      if (distance >= minimum) continue;
      const nx = distance > 0.0001 ? dx / distance : 1;
      const nz = distance > 0.0001 ? dz / distance : 0;
      point.x = obstacle.x + nx * minimum;
      point.z = obstacle.z + nz * minimum;
      changed = true;
    }
    if (!changed) break;
  }
  clampWalkable(point);
};

const groundPick = new THREE.Mesh(
  new THREE.CircleGeometry(WALK_RADIUS, 64),
  new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide }),
);
groundPick.rotation.x = -Math.PI / 2;
groundPick.position.y = GROUND_Y + 0.035;
scene.add(groundPick);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerDown = null;

renderer.domElement.addEventListener('pointerdown', (event) => {
  pointerDown = { x: event.clientX, y: event.clientY, at: performance.now() };
});
renderer.domElement.addEventListener('pointerup', (event) => {
  if (!pointerDown) return;
  const moved = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
  const held = performance.now() - pointerDown.at;
  pointerDown = null;
  if (moved > 10 || held > 550) return;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObject(groundPick, false)[0];
  if (!hit) return;
  playerTarget.copy(hit.point);
  playerTarget.y = GROUND_Y;
  resolveObstacles(playerTarget);
  clickMoving = true;
});

addEventListener('keydown', (event) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
    keyboard.add(event.code);
    if (!event.repeat) clickMoving = false;
    event.preventDefault();
  }
  if (event.code === 'Space' && !event.repeat) {
    jumpQueued = true;
    event.preventDefault();
  }
});
addEventListener('keyup', (event) => keyboard.delete(event.code));

const joystick = document.getElementById('joystick');
const joystickKnob = joystick.querySelector('span');
const joystickInput = new THREE.Vector2();
let joystickPointer = null;
const updateJoystick = (event) => {
  const rect = joystick.getBoundingClientRect();
  const dx = event.clientX - (rect.left + rect.width / 2);
  const dy = event.clientY - (rect.top + rect.height / 2);
  const max = rect.width * 0.31;
  const length = Math.hypot(dx, dy) || 1;
  const scale = Math.min(1, max / length);
  const x = dx * scale;
  const y = dy * scale;
  joystickKnob.style.transform = `translate(${x}px, ${y}px)`;
  joystickInput.set(x / max, y / max);
  clickMoving = false;
};
joystick.addEventListener('pointerdown', (event) => {
  joystickPointer = event.pointerId;
  joystick.setPointerCapture(event.pointerId);
  updateJoystick(event);
  event.stopPropagation();
});
joystick.addEventListener('pointermove', (event) => {
  if (event.pointerId === joystickPointer) updateJoystick(event);
});
const releaseJoystick = (event) => {
  if (event.pointerId !== joystickPointer) return;
  joystickPointer = null;
  joystickInput.set(0, 0);
  joystickKnob.style.transform = '';
};
joystick.addEventListener('pointerup', releaseJoystick);
joystick.addEventListener('pointercancel', releaseJoystick);

const jumpButton = document.getElementById('jump');
jumpButton.addEventListener('pointerdown', (event) => {
  jumpQueued = true;
  event.stopPropagation();
});

let currentNear = null;
const hintAction = () => {
  if (!currentNear) return;
  if (currentNear.type === 'trial') {
    openTrial(currentNear.trial);
  } else if (currentNear.type === 'return') {
    chime(520, 0.22);
    warpTo({ href: studioWorldHref(), from: 'meikyo', to: 'studio', label: 'Studio VIBE島へ' });
  } else if (currentNear.type === 'central') {
    if (completed.size === 3) completionPanel.hidden = false;
    else showToast(`大鏡はまだ曇っている　鏡片 ${completed.size}/3`);
  }
};
hintEl.addEventListener('click', hintAction);

const presence = initPresence({
  room: 'meikyo',
  scene,
  terrainH: () => GROUND_Y,
  identity,
  getState: () => ({
    x: avatar.group.position.x,
    z: avatar.group.position.z,
    yaw: avatar.group.rotation.y,
    w: clickMoving || keyboard.size || joystickInput.lengthSq() > 0.02 ? 1 : 0,
    j: Math.max(0, playerY - GROUND_Y),
    a: cosmeticRig.mask,
  }),
  onCount: (count) => { presenceEl.textContent = `いま島に ${count === 1 ? 'ひとり' : `${count}人`}`; },
  onFull: () => showToast('明鏡島は満員です。ソロで散策できます'),
});

const findNear = (position) => {
  let nearest = null;
  let distance = Infinity;
  for (const trial of TRIALS) {
    const d = Math.hypot(position.x - trial.position.x, position.z - trial.position.z);
    if (d < 1.45 && d < distance) {
      distance = d;
      nearest = { type: 'trial', trial };
    }
  }
  const returnDistance = Math.hypot(position.x - returnGate.position.x, position.z - returnGate.position.z);
  if (returnDistance < 1.4 && returnDistance < distance) nearest = { type: 'return' };
  const centralDistance = Math.hypot(position.x, position.z + 0.55);
  if (centralDistance < 2.65 && centralDistance < distance) nearest = { type: 'central' };
  return nearest;
};

const updateHint = (near) => {
  const changed = near?.type !== currentNear?.type || near?.trial?.id !== currentNear?.trial?.id;
  currentNear = near;
  if (!changed) return;
  if (!near) {
    hintEl.classList.remove('is-visible');
    return;
  }
  if (near.type === 'trial') {
    hintEl.textContent = completed.has(near.trial.id) ? `${near.trial.title}を振り返る` : `${near.trial.title}に向き合う`;
  } else if (near.type === 'return') {
    hintEl.textContent = 'Studio VIBE島へ戻る';
  } else {
    hintEl.textContent = completed.size === 3 ? '澄んだ大鏡をひらく' : `大鏡を確かめる　${completed.size}/3`;
  }
  hintEl.classList.add('is-visible');
};

let lastFrame = performance.now();
let elapsed = 0;
let firstFrame = true;
const moveVector = new THREE.Vector3();
const cameraForward = new THREE.Vector3();
const cameraRight = new THREE.Vector3();

function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, Math.max(0.001, (now - lastFrame) / 1000));
  lastFrame = now;
  elapsed += dt;
  waterUniforms.uTime.value = elapsed;

  const player = avatar.group.position;
  moveVector.set(0, 0, 0);
  const keyboardX = (keyboard.has('KeyD') || keyboard.has('ArrowRight') ? 1 : 0) - (keyboard.has('KeyA') || keyboard.has('ArrowLeft') ? 1 : 0);
  const keyboardZ = (keyboard.has('KeyS') || keyboard.has('ArrowDown') ? 1 : 0) - (keyboard.has('KeyW') || keyboard.has('ArrowUp') ? 1 : 0);
  const inputX = keyboardX + joystickInput.x;
  const inputZ = keyboardZ + joystickInput.y;

  if (Math.hypot(inputX, inputZ) > 0.08) {
    cameraForward.subVectors(controls.target, camera.position).setY(0).normalize();
    cameraRight.crossVectors(cameraForward, THREE.Object3D.DEFAULT_UP);
    moveVector.addScaledVector(cameraRight, inputX).addScaledVector(cameraForward, -inputZ).normalize();
  } else if (clickMoving) {
    moveVector.subVectors(playerTarget, player).setY(0);
    if (moveVector.length() < 0.08) {
      clickMoving = false;
      moveVector.set(0, 0, 0);
    } else {
      moveVector.normalize();
    }
  }

  const moving = moveVector.lengthSq() > 0.001 && lessonPanel.hidden && completionPanel.hidden;
  if (moving) {
    const candidate = player.clone().addScaledVector(moveVector, dt * 2.35);
    candidate.y = GROUND_Y;
    resolveObstacles(candidate);
    const dx = candidate.x - player.x;
    const dz = candidate.z - player.z;
    player.x = candidate.x;
    player.z = candidate.z;
    playerTarget.x = clickMoving ? playerTarget.x : player.x;
    playerTarget.z = clickMoving ? playerTarget.z : player.z;
    walkPhase += Math.hypot(dx, dz) * 9;
    const desiredYaw = Math.atan2(dx, dz);
    let diff = ((desiredYaw - avatar.group.rotation.y + Math.PI) % (Math.PI * 2)) - Math.PI;
    if (diff < -Math.PI) diff += Math.PI * 2;
    avatar.group.rotation.y += diff * Math.min(1, dt * 10);
  }

  if (jumpQueued && grounded && lessonPanel.hidden && completionPanel.hidden) {
    verticalSpeed = 3.15;
    grounded = false;
    chime(420, 0.1);
  }
  jumpQueued = false;
  if (!grounded) {
    verticalSpeed -= 8.8 * dt;
    playerY += verticalSpeed * dt;
    if (playerY <= GROUND_Y) {
      playerY = GROUND_Y;
      verticalSpeed = 0;
      grounded = true;
    }
  }
  player.y = playerY;

  const yawVelocity = (avatar.group.rotation.y - previousYaw) / dt;
  previousYaw = avatar.group.rotation.y;
  avatar.update(dt, elapsed, moving ? 1 : 0, walkPhase, yawVelocity);
  cosmeticRig.update(dt, elapsed);
  presence.update(dt, elapsed);

  const cameraDelta = new THREE.Vector3().subVectors(player, previousPosition);
  cameraDelta.y = 0;
  camera.position.add(cameraDelta);
  controls.target.add(cameraDelta);
  previousPosition.copy(player);
  previousPosition.y = GROUND_Y;

  const near = findNear(player);
  updateHint(near);

  centralSurfaceMaterial.opacity += ((completed.size === 3 ? 0.94 : 0.34 + completed.size * 0.15) - centralSurfaceMaterial.opacity) * Math.min(1, dt * 3);
  centralSurface.scale.set(1 + Math.sin(elapsed * 1.3) * 0.008, 1.3 + Math.sin(elapsed * 1.3) * 0.012, 1);
  centralLight.intensity += ((completed.size === 3 ? 2.1 : 0.45 + completed.size * 0.36) - centralLight.intensity) * Math.min(1, dt * 4);
  returnSurface.material.opacity = 0.72 + Math.sin(elapsed * 1.6) * 0.1;

  for (const [index, trial] of TRIALS.entries()) {
    const fx = trialMeshes.get(trial.id);
    const active = near?.trial?.id === trial.id;
    fx.ring.material.opacity = (completed.has(trial.id) ? 0.78 : 0.36) + Math.sin(elapsed * 2 + index) * 0.08;
    fx.surface.scale.set(1 + Math.sin(elapsed * 1.5 + index) * 0.018, 1.18, 1);
    if (fx.shard.visible) {
      fx.shard.rotation.y += dt * 1.6;
      fx.shard.position.y = 1.92 + Math.sin(elapsed * 2.2 + index) * 0.06;
    }
    fx.light.intensity = (completed.has(trial.id) ? 1.15 : 0.52) + (active ? 0.45 : 0) + Math.sin(elapsed * 1.7 + index) * 0.08;
    const distance = Math.hypot(player.x - trial.position.x, player.z - trial.position.z);
    fx.label.material.opacity = THREE.MathUtils.smoothstep(distance, 1.5, 3.1);
  }
  const centralDistance = Math.hypot(player.x, player.z + 0.55);
  centralLabel.material.opacity = THREE.MathUtils.smoothstep(centralDistance, 2.2, 4.2);
  const returnDistance = Math.hypot(player.x - returnGate.position.x, player.z - returnGate.position.z);
  returnLabel.material.opacity = 1 - THREE.MathUtils.smoothstep(returnDistance, 2.6, 4.4);

  controls.enabled = lessonPanel.hidden && completionPanel.hidden;
  controls.update();
  renderer.render(scene, camera);

  if (firstFrame) {
    firstFrame = false;
    requestAnimationFrame(() => document.getElementById('loading').classList.add('is-done'));
  }
}
requestAnimationFrame(animate);

if (['localhost', '127.0.0.1'].includes(location.hostname)) {
  window.__meikyo = {
    avatar: avatar.group,
    camera,
    controls,
    trials: TRIALS,
    completed,
    complete(id) {
      const trial = TRIALS.find((entry) => entry.id === id);
      if (trial) completeTrial(trial);
    },
    reset() {
      completed.clear();
      localStorage.removeItem(PROGRESS_KEY);
      updateProgress();
    },
    teleport(x, z) {
      const point = new THREE.Vector3(Number(x) || 0, GROUND_Y, Number(z) || 0);
      resolveObstacles(point);
      const delta = point.clone().sub(avatar.group.position).setY(0);
      avatar.group.position.copy(point);
      playerTarget.copy(point);
      previousPosition.copy(point);
      camera.position.add(delta);
      controls.target.add(delta);
    },
  };

  const qa = new URLSearchParams(location.search).get('qa');
  if (qa === 'reset') {
    completed.clear();
    localStorage.removeItem(PROGRESS_KEY);
    updateProgress();
  } else if (qa === 'complete' || qa === 'completion-panel') {
    TRIALS.forEach((trial) => completed.add(trial.id));
    updateProgress();
    if (qa === 'completion-panel') setTimeout(() => { completionPanel.hidden = false; }, 320);
  } else {
    const qaTrial = TRIALS.find((trial) => trial.id === qa || `${trial.id}-panel` === qa);
    if (qaTrial) {
      const towardCenter = qaTrial.position.clone().setY(0).multiplyScalar(-1).normalize();
      const point = qaTrial.position.clone().addScaledVector(towardCenter, 1.2);
      window.__meikyo.teleport(point.x, point.z);
      if (qa.endsWith('-panel')) setTimeout(() => openTrial(qaTrial), 350);
    } else if (qa === 'return') {
      const towardCenter = returnGate.position.clone().setY(0).multiplyScalar(-1).normalize();
      const point = returnGate.position.clone().addScaledVector(towardCenter, 1.15);
      window.__meikyo.teleport(point.x, point.z);
    }
  }
}
