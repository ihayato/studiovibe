import * as THREE from 'three';
import { createWorldRuntime, loadTexture, makeImagePlane, makeWorldLabel, addOutlines, canvasTex, toon } from '../shared/runtime.js';
import { worldHref, WORLDS } from '../registry.js';
import { warpTo } from '../shared/warp.js';

const SEARCH = new URLSearchParams(location.search);
const PROGRESS_KEY = 'vibe.world.luna.seals.v1';

try {
  await Promise.race([
    Promise.all([
      document.fonts.load('800 30px "Shippori Mincho B1"'),
      document.fonts.load('700 20px "Zen Kaku Gothic New"'),
      document.fonts.ready,
    ]),
    new Promise((resolve) => setTimeout(resolve, 1800)),
  ]);
} catch {}

const [kvTexture, shioriTexture, titleTexture] = await Promise.all([
  loadTexture('/worlds/luna/kv_eclipse.webp'),
  loadTexture('/worlds/luna/shiori_full.webp'),
  loadTexture('/worlds/luna/title_logo.webp'),
]);

const runtime = createWorldRuntime({
  worldId: 'luna',
  room: WORLDS.luna.room,
  background: 0x0b0910,
  fog: [0x120d16, 15, 48],
  groundY: 0.22,
  walkRadius: 9.55,
  start: [0, 7.4],
  cameraPosition: [1.25, 3.3, 12.2],
  cameraTarget: [0, 0.82, 6.7],
  exposure: 1.05,
  presenceLabel: (count) => `いま社に ${count === 1 ? 'ひとり' : `${count}人`}`,
  fullMessage: '月蝕の社は満員です。ソロで夜道を巡れます',
  loadingMinMs: 620,
});

const { scene } = runtime;
scene.add(new THREE.HemisphereLight(0x8e889c, 0x12070c, 1.35));
const moonLight = new THREE.DirectionalLight(0xe1d8ca, 2.25);
moonLight.position.set(-6, 12, 5);
moonLight.castShadow = true;
moonLight.shadow.mapSize.set(1536, 1536);
moonLight.shadow.camera.left = -12;
moonLight.shadow.camera.right = 12;
moonLight.shadow.camera.top = 12;
moonLight.shadow.camera.bottom = -12;
scene.add(moonLight);
const eclipseLight = new THREE.PointLight(0xa9283a, 2.7, 25, 2);
eclipseLight.position.set(0, 8, -11);
scene.add(eclipseLight);

const abyss = new THREE.Mesh(
  new THREE.CircleGeometry(55, 128),
  new THREE.MeshStandardMaterial({ color: 0x17121d, roughness: 0.42, metalness: 0.24 }),
);
abyss.rotation.x = -Math.PI / 2;
abyss.position.y = -0.32;
scene.add(abyss);

const island = new THREE.Mesh(
  new THREE.CylinderGeometry(10.05, 9.55, 0.48, 88),
  new THREE.MeshStandardMaterial({ color: 0x29242d, roughness: 0.93, metalness: 0.02 }),
);
island.position.y = -0.01;
island.castShadow = island.receiveShadow = true;
scene.add(island);
const rim = new THREE.Mesh(
  new THREE.TorusGeometry(9.7, 0.065, 10, 128),
  new THREE.MeshStandardMaterial({ color: 0x6e2530, roughness: 0.42, metalness: 0.5 }),
);
rim.rotation.x = Math.PI / 2;
rim.position.y = 0.225;
scene.add(rim);

const backdrop = makeImagePlane(kvTexture, 15.5, 8.1, { transparent: false });
backdrop.position.set(0, 7.4, -24);
backdrop.material.color.set(0xb88f99);
scene.add(backdrop);

const moonDisc = new THREE.Mesh(
  new THREE.CircleGeometry(3.1, 80),
  new THREE.MeshBasicMaterial({ color: 0xa92c3d, transparent: true, opacity: 0.78, side: THREE.DoubleSide }),
);
moonDisc.position.set(0, 8.4, -16.6);
scene.add(moonDisc);
const moonShadow = new THREE.Mesh(
  new THREE.CircleGeometry(2.75, 80),
  new THREE.MeshBasicMaterial({ color: 0x0b0910, side: THREE.DoubleSide }),
);
moonShadow.position.set(-0.78, 8.58, -16.5);
scene.add(moonShadow);

const path = new THREE.Mesh(
  new THREE.PlaneGeometry(2.2, 15.8),
  new THREE.MeshStandardMaterial({ color: 0x403740, roughness: 0.98, metalness: 0 }),
);
path.rotation.x = -Math.PI / 2;
path.position.set(0, 0.238, 0.4);
path.receiveShadow = true;
scene.add(path);
for (let i = 0; i < 13; i++) {
  const stone = new THREE.Mesh(
    new THREE.BoxGeometry(1.55 + (i % 3) * 0.16, 0.035, 0.54),
    toon(i % 2 ? 0x4a4249 : 0x554950),
  );
  stone.position.set((i % 2 ? -1 : 1) * 0.08, 0.255, 6.4 - i * 1.02);
  stone.rotation.y = (i % 3 - 1) * 0.025;
  stone.receiveShadow = true;
  scene.add(stone);
}

const toriiRefs = [];
const makeTorii = (z, scale = 1) => {
  const torii = new THREE.Group();
  torii.position.set(0, 0.22, z);
  for (const side of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.11 * scale, 0.15 * scale, 2.45 * scale, 14), toon(0x7f1f2d));
    post.position.set(side * 1.22 * scale, 1.2 * scale, 0);
    post.castShadow = true;
    torii.add(post);
    runtime.addObstacle(side * 1.22 * scale, z, 0.16 * scale);
  }
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(3.15 * scale, 0.17 * scale, 0.19 * scale), toon(0x971f30));
  lintel.position.y = 2.35 * scale;
  lintel.castShadow = true;
  torii.add(lintel);
  const lower = new THREE.Mesh(new THREE.BoxGeometry(2.55 * scale, 0.12 * scale, 0.16 * scale), toon(0x5d1822));
  lower.position.y = 2.05 * scale;
  torii.add(lower);
  addOutlines(torii, { color: 0x160b10, min: 0.006, max: 0.014 });
  scene.add(torii);
  toriiRefs.push(torii);
};
makeTorii(5.75, 1.04);
makeTorii(2.55, 0.95);
makeTorii(-0.65, 0.88);
makeTorii(-3.75, 0.82);

const lanterns = [];
for (let i = 0; i < 10; i++) {
  const z = 5.1 - i * 1.2;
  for (const side of [-1, 1]) {
    const group = new THREE.Group();
    group.position.set(side * 1.75, 0.22, z);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.92, 10), toon(0x271a1c));
    post.position.y = 0.46;
    group.add(post);
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.32, 0.22), new THREE.MeshBasicMaterial({ color: 0xe9b970 }));
    lamp.position.y = 0.92;
    group.add(lamp);
    const light = new THREE.PointLight(0xcf6a45, 0.7, 2.4, 2);
    light.position.y = 0.9;
    group.add(light);
    scene.add(group);
    lanterns.push({ lamp, light, phase: i + side });
  }
}

const shrine = new THREE.Group();
shrine.position.set(0, 0.22, -6.7);
const shrineBase = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.3, 2.5), toon(0x33272d));
shrineBase.position.y = 0.15;
shrineBase.castShadow = shrineBase.receiveShadow = true;
shrine.add(shrineBase);
const shrineBody = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.8, 1.7), toon(0x5f1723));
shrineBody.position.set(0, 1.2, -0.2);
shrineBody.castShadow = true;
shrine.add(shrineBody);
const shrineRoof = new THREE.Mesh(new THREE.ConeGeometry(2.65, 0.8, 4), toon(0x211820));
shrineRoof.position.set(0, 2.45, -0.2);
shrineRoof.rotation.y = Math.PI / 4;
shrineRoof.scale.z = 0.64;
shrineRoof.castShadow = true;
shrine.add(shrineRoof);
const titlePlane = makeImagePlane(titleTexture, 2.3, 0.68);
titlePlane.position.set(0, 1.55, 0.67);
shrine.add(titlePlane);
addOutlines(shrine, { color: 0x12090e, min: 0.007, max: 0.016 });
scene.add(shrine);
runtime.addObstacle(0, -6.82, 1.55);

const shiori = makeImagePlane(shioriTexture, 1.55, 3.05);
shiori.position.set(2.45, 1.72, 4.5);
runtime.addBillboard(shiori);
scene.add(shiori);
const shioriLabel = makeWorldLabel('GUIDE', '栞', {
  color: '#c99f58', paper: 'rgba(18, 10, 17, .88)', border: 'rgba(201,159,88,.38)', scale: [1.48, 0.42],
});
shioriLabel.position.set(2.45, 3.35, 4.5);
scene.add(shioriLabel);

const shioriPanel = document.getElementById('shiori-panel');
const maaiPanel = document.getElementById('maai-panel');
const modalReturnFocus = new WeakMap();
const openPanel = (panel) => {
  modalReturnFocus.set(panel, document.activeElement);
  panel.hidden = false;
  requestAnimationFrame(() => panel.querySelector('.world-sheet__close')?.focus());
};
const closePanel = (panel) => {
  if (panel === maaiPanel) {
    cancelAnimationFrame(maaiRaf);
    maaiState = 'ready';
  }
  panel.hidden = true;
  modalReturnFocus.get(panel)?.focus?.();
};
for (const panel of [shioriPanel, maaiPanel]) {
  panel.querySelector('.world-sheet__close').addEventListener('click', () => closePanel(panel));
  panel.addEventListener('click', (event) => { if (event.target === panel) closePanel(panel); });
  panel.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => closePanel(panel)));
}
addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closePanel(shioriPanel);
    closePanel(maaiPanel);
  }
});

runtime.addInteractable({
  id: 'shiori',
  position: shiori.position,
  radius: 1.65,
  priority: 2,
  label: '栞の話を聞く',
  action: () => openPanel(shioriPanel),
});

const sealCount = document.getElementById('seal-count');
const objective = document.getElementById('objective');
const savedSeals = (() => {
  if (SEARCH.get('qa') === 'reset') {
    try { localStorage.removeItem(PROGRESS_KEY); } catch {}
  }
  try {
    const raw = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]');
    return new Set(Array.isArray(raw) ? raw : []);
  } catch {
    return new Set();
  }
})();

const sealDefs = [
  { id: 'tsuki', glyph: '月', title: '月影の札', x: -3.25, z: 2.6, color: 0xc99f58 },
  { id: 'en', glyph: '縁', title: '境の札', x: 3.45, z: -0.5, color: 0xb44556 },
  { id: 'zan', glyph: '斬', title: '見切りの札', x: -3.15, z: -3.15, color: 0xe0ddd2 },
];
const sealRefs = [];
const saveSeals = () => {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify([...savedSeals])); } catch {}
};
const updateProgress = () => {
  sealCount.textContent = String(savedSeals.size);
  objective.textContent = savedSeals.size < 3 ? `三枚の御霊札を探す　${savedSeals.size}/3` : '奥の社で「月蝕の間合い」に挑む';
  sealRefs.forEach((ref) => { ref.group.visible = !savedSeals.has(ref.def.id); });
};

for (const def of sealDefs) {
  const group = new THREE.Group();
  group.position.set(def.x, 0.62, def.z);
  const glow = new THREE.Mesh(
    new THREE.CircleGeometry(0.48, 48),
    new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  glow.position.z = -0.03;
  group.add(glow);
  const cardTexture = canvasTex(300, 480, (ctx, w, h) => {
    ctx.fillStyle = '#ede5d4';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#6e2632';
    ctx.lineWidth = 12;
    ctx.strokeRect(17, 17, w - 34, h - 34);
    ctx.fillStyle = '#25151a';
    ctx.textAlign = 'center';
    ctx.font = '800 150px "Shippori Mincho B1", serif';
    ctx.fillText(def.glyph, w / 2, 285);
    ctx.fillStyle = '#9a2a3a';
    ctx.font = '700 24px "Zen Kaku Gothic New", sans-serif';
    ctx.fillText('月蝕綺譚', w / 2, 398);
  });
  const card = new THREE.Mesh(
    new THREE.PlaneGeometry(0.58, 0.92),
    new THREE.MeshBasicMaterial({ map: cardTexture, side: THREE.DoubleSide }),
  );
  group.add(card);
  scene.add(group);
  runtime.addBillboard(group);
  const interactable = runtime.addInteractable({
    id: `seal-${def.id}`,
    position: group.position,
    radius: 1.25,
    priority: 3,
    enabled: () => !savedSeals.has(def.id),
    label: `${def.title}に触れる`,
    action: () => {
      savedSeals.add(def.id);
      saveSeals();
      updateProgress();
      runtime.showToast(`${def.title}を手にした　${savedSeals.size}/3`);
    },
  });
  sealRefs.push({ def, group, glow, card, interactable, y: group.position.y });
}
updateProgress();

runtime.addInteractable({
  id: 'maai-shrine',
  position: new THREE.Vector3(0, 0.22, -5.55),
  radius: 1.75,
  priority: 2,
  label: () => savedSeals.size === 3 ? '月蝕の間合いに挑む' : `社の封を確かめる　${savedSeals.size}/3`,
  action: () => {
    if (savedSeals.size < 3) {
      runtime.showToast(`御霊札があと ${3 - savedSeals.size}枚 必要です`);
      return;
    }
    openMaai();
  },
});

const returnGate = new THREE.Group();
returnGate.position.set(-6.85, 0.22, 5.9);
returnGate.rotation.y = Math.atan2(-returnGate.position.x, -returnGate.position.z);
for (const side of [-1, 1]) {
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.7, 0.14), toon(0x54424b));
  post.position.set(side * 0.82, 0.88, 0);
  returnGate.add(post);
}
const returnTop = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.13, 0.16), toon(0xc59d58));
returnTop.position.y = 1.68;
returnGate.add(returnTop);
const returnRing = new THREE.Mesh(
  new THREE.RingGeometry(0.45, 0.62, 48),
  new THREE.MeshBasicMaterial({ color: 0xc99f58, transparent: true, opacity: 0.46, side: THREE.DoubleSide }),
);
returnRing.rotation.x = -Math.PI / 2;
returnRing.position.y = 0.04;
returnGate.add(returnRing);
scene.add(returnGate);
runtime.addInteractable({
  id: 'return-hub',
  position: returnGate.position,
  radius: 1.35,
  label: '世界港へ戻る',
  action: () => warpTo({ href: worldHref('hub'), from: 'luna', to: 'hub', label: '世界港へ' }),
});

const maaiAction = document.getElementById('maai-action');
const maaiRetry = document.getElementById('maai-retry');
const maaiMarker = document.getElementById('maai-marker');
const maaiZone = document.getElementById('maai-zone');
const maaiResult = document.getElementById('maai-result');
const maaiRound = document.getElementById('maai-round');
const maaiScore = document.getElementById('maai-score');
const maaiLinks = document.getElementById('maai-links');
const maaiSakuya = document.getElementById('maai-sakuya');
const roundNames = ['一 / 三', '二 / 三', '三 / 三'];
const zoneCenters = [0.42, 0.63, 0.36];
let maaiState = 'ready';
let maaiRoundIndex = 0;
let maaiPoints = 0;
let maaiStart = 0;
let maaiRaf = 0;
let markerPosition = 0;

const setMaaiResult = (text, kind = '') => {
  maaiResult.textContent = text;
  maaiResult.className = `maai-result${kind ? ` is-${kind}` : ''}`;
};
const positionMaaiZone = () => {
  const center = zoneCenters[maaiRoundIndex];
  maaiZone.style.left = `${(center - 0.06) * 100}%`;
};
const animateMaai = (now) => {
  if (maaiState !== 'play') return;
  const period = 1280 - maaiRoundIndex * 150;
  const phase = ((now - maaiStart) % period) / period;
  markerPosition = phase < 0.5 ? phase * 2 : 2 - phase * 2;
  maaiMarker.style.left = `${markerPosition * 100}%`;
  maaiRaf = requestAnimationFrame(animateMaai);
};
const startMaai = () => {
  cancelAnimationFrame(maaiRaf);
  maaiState = 'play';
  maaiRoundIndex = 0;
  maaiPoints = 0;
  maaiScore.textContent = '0';
  maaiRound.textContent = roundNames[0];
  maaiLinks.hidden = true;
  maaiAction.hidden = false;
  maaiAction.disabled = false;
  maaiAction.textContent = '斬る';
  maaiSakuya.src = '/worlds/luna/maai_sakuya_kamae.webp';
  setMaaiResult('黄金の間を見定める');
  positionMaaiZone();
  maaiStart = performance.now();
  maaiRaf = requestAnimationFrame(animateMaai);
};
function openMaai() {
  openPanel(maaiPanel);
  maaiState = 'ready';
  maaiAction.hidden = false;
  maaiAction.disabled = false;
  maaiAction.textContent = '始める';
  maaiLinks.hidden = true;
  maaiRoundIndex = 0;
  maaiRound.textContent = roundNames[0];
  maaiScore.textContent = '0';
  maaiMarker.style.left = '0%';
  positionMaaiZone();
  setMaaiResult('黄金の間を見定める');
}
const finishMaai = () => {
  maaiState = 'done';
  cancelAnimationFrame(maaiRaf);
  maaiAction.hidden = true;
  maaiLinks.hidden = false;
  const title = maaiPoints >= 260 ? '極・月蝕' : maaiPoints >= 170 ? '見切り' : '朧月';
  setMaaiResult(`${title}　${maaiPoints}点`, maaiPoints >= 260 ? 'perfect' : 'good');
};
maaiAction.addEventListener('click', () => {
  if (maaiState === 'ready') {
    startMaai();
    return;
  }
  if (maaiState !== 'play') return;
  cancelAnimationFrame(maaiRaf);
  maaiAction.disabled = true;
  const distance = Math.abs(markerPosition - zoneCenters[maaiRoundIndex]);
  const gain = distance <= 0.026 ? 100 : distance <= 0.072 ? 70 : distance <= 0.13 ? 35 : 0;
  maaiPoints += gain;
  maaiScore.textContent = String(maaiPoints);
  maaiSakuya.src = '/worlds/luna/maai_sakuya_battou.webp';
  if (gain === 100) setMaaiResult('極　完全な間合い', 'perfect');
  else if (gain >= 70) setMaaiResult('見切り', 'good');
  else if (gain) setMaaiResult('斬　あと半歩', 'good');
  else setMaaiResult('隙　間合いの外', 'miss');
  setTimeout(() => {
    if (maaiRoundIndex >= 2) {
      finishMaai();
      return;
    }
    maaiRoundIndex += 1;
    maaiRound.textContent = roundNames[maaiRoundIndex];
    maaiSakuya.src = '/worlds/luna/maai_sakuya_kamae.webp';
    positionMaaiZone();
    setMaaiResult('次の気配を待つ');
    maaiAction.disabled = false;
    maaiStart = performance.now();
    maaiRaf = requestAnimationFrame(animateMaai);
  }, 720);
});
maaiRetry.addEventListener('click', startMaai);

runtime.addFrame(({ elapsed, near }) => {
  eclipseLight.intensity = 2.4 + Math.sin(elapsed * 0.7) * 0.35;
  moonShadow.position.x = -0.78 + Math.sin(elapsed * 0.14) * 0.22;
  toriiRefs.forEach((torii, index) => { torii.rotation.z = Math.sin(elapsed * 0.45 + index) * 0.0025; });
  lanterns.forEach(({ lamp, light, phase }) => {
    const pulse = 0.78 + Math.sin(elapsed * 1.8 + phase) * 0.15;
    lamp.material.color.setRGB(1 * pulse, 0.62 * pulse, 0.34 * pulse);
    light.intensity = 0.68 + Math.sin(elapsed * 1.8 + phase) * 0.12;
  });
  sealRefs.forEach((ref, index) => {
    ref.group.position.y = ref.y + Math.sin(elapsed * 1.5 + index * 1.8) * 0.08;
    ref.glow.material.opacity = 0.14 + Math.sin(elapsed * 2 + index) * 0.06;
  });
  returnRing.material.opacity = (near?.id === 'return-hub' ? 0.82 : 0.4) + Math.sin(elapsed * 1.8) * 0.08;
});

if (SEARCH.get('qa') === 'story') {
  runtime.teleport(1.55, 4.5);
  setTimeout(() => openPanel(shioriPanel), 320);
} else if (SEARCH.get('qa') === 'maai') {
  sealDefs.forEach((seal) => savedSeals.add(seal.id));
  updateProgress();
  runtime.teleport(0, -5.1);
  setTimeout(openMaai, 360);
} else if (SEARCH.get('qa') === 'return') {
  runtime.teleport(-5.85, 5.05);
}

runtime.start();
