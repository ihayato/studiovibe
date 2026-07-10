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

const [kvTexture, shioriTexture, titleTexture, valleyTexture, terraceTexture] = await Promise.all([
  loadTexture('/worlds/luna/kv_eclipse.webp'),
  loadTexture('/worlds/luna/shiori_full.webp'),
  loadTexture('/worlds/luna/title_logo.webp'),
  loadTexture('/worlds/luna/bg_story_tani.webp'),
  loadTexture('/worlds/luna/bg_story_tanada.webp'),
]);

const runtime = createWorldRuntime({
  worldId: 'luna',
  room: WORLDS.luna.room,
  background: 0x100c14,
  fog: [0x18111b, 15, 48],
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
scene.add(new THREE.HemisphereLight(0xaaa2b6, 0x1b0d13, 1.55));
const moonLight = new THREE.DirectionalLight(0xe1d8ca, 2.65);
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
  new THREE.MeshStandardMaterial({ color: 0x332c37, roughness: 0.93, metalness: 0.02 }),
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

const cliffRocks = [];
for (let i = 0; i < 32; i++) {
  const angle = (i / 32) * Math.PI * 2 + 0.04;
  const radius = 10.05 + (i % 4) * 0.18;
  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.58 + (i % 5) * 0.08, 0),
    new THREE.MeshStandardMaterial({
      color: i % 3 === 0 ? 0x2f2531 : i % 3 === 1 ? 0x241f2b : 0x38272f,
      roughness: 0.94,
      metalness: 0.02,
    }),
  );
  const frontWeight = Math.max(0, Math.sin(angle));
  const frontScale = 1 - frontWeight * 0.52;
  rock.position.set(Math.cos(angle) * radius, -0.18 - (i % 3) * 0.13 - frontWeight * 0.45, Math.sin(angle) * radius);
  rock.scale.set(
    (1.15 + (i % 2) * 0.35) * frontScale,
    (0.9 + (i % 4) * 0.16) * frontScale,
    (0.95 + ((i + 1) % 3) * 0.2) * frontScale,
  );
  rock.rotation.set(i * 0.31, angle, i * 0.17);
  rock.castShadow = true;
  scene.add(rock);
  cliffRocks.push(rock);
}

const backdrop = makeImagePlane(valleyTexture, 27, 13.5, { transparent: false });
backdrop.position.set(0, 6.7, -29);
backdrop.material.color.set(0x6c5968);
scene.add(backdrop);

const memoryVista = makeImagePlane(terraceTexture, 5.6, 3.05, { transparent: false, opacity: 0.72 });
memoryVista.position.set(6.9, 3.2, -10.8);
memoryVista.rotation.y = -0.34;
memoryVista.material.color.set(0x8c6e79);
scene.add(memoryVista);

const kvBannerFrame = new THREE.Group();
kvBannerFrame.position.set(-6.4, 0.22, -7.1);
kvBannerFrame.rotation.y = 0.42;
const kvBanner = makeImagePlane(kvTexture, 3.8, 2.0, { transparent: false });
kvBanner.position.y = 2.05;
kvBannerFrame.add(kvBanner);
for (const side of [-1, 1]) {
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 2.7, 10), toon(0x24151d));
  post.position.set(side * 2.0, 1.35, 0);
  kvBannerFrame.add(post);
}
const bannerTop = new THREE.Mesh(new THREE.BoxGeometry(4.25, 0.08, 0.12), toon(0x8a2837));
bannerTop.position.y = 3.1;
kvBannerFrame.add(bannerTop);
scene.add(kvBannerFrame);

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
const moonHalos = [];
for (let i = 0; i < 3; i++) {
  const halo = new THREE.Mesh(
    new THREE.RingGeometry(3.25 + i * 0.42, 3.28 + i * 0.42, 96),
    new THREE.MeshBasicMaterial({ color: i === 0 ? 0xb83a49 : 0xc99f58, transparent: true, opacity: 0.17 - i * 0.035, side: THREE.DoubleSide }),
  );
  halo.position.set(0, 8.4, -16.7 - i * 0.02);
  scene.add(halo);
  moonHalos.push(halo);
}

for (const [index, data] of [
  [-8.2, -17.5, 5.2],
  [7.6, -18.8, 6.4],
  [-13.2, -23.5, 8.0],
  [13.4, -24.2, 7.2],
].entries()) {
  const [x, z, size] = data;
  const mountain = new THREE.Mesh(
    new THREE.ConeGeometry(size, size * 1.35, 7),
    new THREE.MeshStandardMaterial({ color: index % 2 ? 0x17131b : 0x201720, roughness: 1, metalness: 0 }),
  );
  mountain.position.set(x, size * 0.47 - 0.4, z);
  mountain.rotation.y = index * 0.71;
  scene.add(mountain);
}

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
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * scale, 0.27 * scale, 0.16 * scale, 16), toon(0x3b252c));
    foot.position.set(side * 1.22 * scale, 0.08 * scale, 0);
    torii.add(foot);
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
  const cap = new THREE.Mesh(new THREE.BoxGeometry(3.48 * scale, 0.07 * scale, 0.25 * scale), toon(0xb13c47));
  cap.position.y = 2.49 * scale;
  torii.add(cap);
  const ropeCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-0.92 * scale, 1.94 * scale, 0.12),
    new THREE.Vector3(0, 1.72 * scale, 0.16),
    new THREE.Vector3(0.92 * scale, 1.94 * scale, 0.12),
  );
  const rope = new THREE.Mesh(
    new THREE.TubeGeometry(ropeCurve, 28, 0.025 * scale, 8, false),
    new THREE.MeshStandardMaterial({ color: 0xc6a45e, roughness: 0.66, metalness: 0.12 }),
  );
  torii.add(rope);
  for (const x of [-0.5, 0, 0.5]) {
    const paper = new THREE.Mesh(
      new THREE.PlaneGeometry(0.13 * scale, 0.34 * scale),
      new THREE.MeshBasicMaterial({ color: 0xeee7da, side: THREE.DoubleSide }),
    );
    paper.position.set(x * scale, (1.72 + Math.abs(x) * 0.1) * scale, 0.16);
    paper.rotation.z = x * 0.2;
    torii.add(paper);
  }
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
    const lampFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.29, 0.055, 0.27),
      new THREE.MeshStandardMaterial({ color: 0x3a2426, roughness: 0.72 }),
    );
    lampFrame.position.y = 1.095;
    group.add(lampFrame);
    const lampRoof = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.16, 4), toon(0x2b1a20));
    lampRoof.position.y = 1.19;
    lampRoof.rotation.y = Math.PI / 4;
    group.add(lampRoof);
    const baseStone = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.1, 10), toon(0x51484f));
    baseStone.position.y = 0.05;
    group.add(baseStone);
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
for (let i = 0; i < 3; i++) {
  const step = new THREE.Mesh(
    new THREE.BoxGeometry(3.65 - i * 0.22, 0.08, 0.42),
    toon(i % 2 ? 0x4a3c43 : 0x57454b),
  );
  step.position.set(0, 0.04 + i * 0.06, 1.45 + i * 0.32);
  step.castShadow = step.receiveShadow = true;
  shrine.add(step);
}
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
const shrineEave = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.14, 2.25), toon(0x241820));
shrineEave.position.set(0, 2.12, -0.2);
shrine.add(shrineEave);
for (const side of [-1, 1]) {
  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.11, 1.75, 12), toon(0x9a2937));
  column.position.set(side * 1.34, 1.06, 0.67);
  shrine.add(column);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.22, 1.38), toon(0x481720));
  wing.position.set(side * 1.68, 0.92, -0.28);
  shrine.add(wing);
  const sideLamp = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.44, 0.24),
    new THREE.MeshBasicMaterial({ color: side > 0 ? 0xe9b66d : 0xd78765 }),
  );
  sideLamp.position.set(side * 1.56, 1.22, 0.82);
  shrine.add(sideLamp);
}
for (const side of [-1, 1]) {
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.28, 0.04), toon(side > 0 ? 0x2d2028 : 0x34242c));
  door.position.set(side * 0.57, 1.05, 0.67);
  shrine.add(door);
  for (const slat of [-0.32, 0, 0.32]) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.035, 1.12, 0.025), toon(0xb2434c));
    beam.position.set(side * 0.57 + slat, 1.05, 0.705);
    shrine.add(beam);
  }
}
const shrineRopeCurve = new THREE.QuadraticBezierCurve3(
  new THREE.Vector3(-1.28, 1.73, 0.78),
  new THREE.Vector3(0, 1.51, 0.88),
  new THREE.Vector3(1.28, 1.73, 0.78),
);
const shrineRope = new THREE.Mesh(
  new THREE.TubeGeometry(shrineRopeCurve, 32, 0.035, 8, false),
  new THREE.MeshStandardMaterial({ color: 0xd1ad63, roughness: 0.62, metalness: 0.08 }),
);
shrine.add(shrineRope);
for (const x of [-0.68, 0, 0.68]) {
  const bell = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.14, 12),
    new THREE.MeshStandardMaterial({ color: 0xc8a052, metalness: 0.78, roughness: 0.28 }),
  );
  bell.position.set(x, 1.47 + Math.abs(x) * 0.12, 0.9);
  bell.rotation.x = Math.PI;
  shrine.add(bell);
}
const titlePlane = makeImagePlane(titleTexture, 2.3, 0.68);
titlePlane.position.set(0, 1.83, 0.73);
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
const sealSiteRefs = [];
for (const def of sealDefs) {
  const site = new THREE.Group();
  site.position.set(def.x, 0.22, def.z);
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.68, 0.82, 0.18, 28),
    toon(0x4b4148),
  );
  base.position.y = 0.09;
  base.castShadow = base.receiveShadow = true;
  site.add(base);
  const sigil = new THREE.Mesh(
    new THREE.RingGeometry(0.35, 0.52, 48),
    new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.28, side: THREE.DoubleSide }),
  );
  sigil.rotation.x = -Math.PI / 2;
  sigil.position.y = 0.19;
  site.add(sigil);
  for (const side of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 1.15, 10), toon(0x5c1c27));
    post.position.set(side * 0.56, 0.72, -0.15);
    site.add(post);
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.07, 0.09), toon(0x922b38));
  beam.position.set(0, 1.28, -0.15);
  site.add(beam);
  for (let i = 0; i < 5; i++) {
    const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.11 + (i % 2) * 0.035, 0), toon(i % 2 ? 0x51464e : 0x62535a));
    const angle = (i / 5) * Math.PI * 2;
    stone.position.set(Math.cos(angle) * 0.9, 0.06, Math.sin(angle) * 0.72);
    stone.rotation.set(i, angle, i * 0.4);
    site.add(stone);
  }
  addOutlines(site, { color: 0x160d12, min: 0.004, max: 0.012 });
  scene.add(site);
  sealSiteRefs.push({ site, sigil, phase: sealSiteRefs.length * 1.4 });
}
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

const paperCharms = [];
for (let i = 0; i < 18; i++) {
  const side = i % 2 ? -1 : 1;
  const charm = new THREE.Mesh(
    new THREE.PlaneGeometry(0.065 + (i % 3) * 0.018, 0.2 + (i % 4) * 0.02),
    new THREE.MeshBasicMaterial({ color: i % 5 === 0 ? 0xd6b36f : 0xeee7dc, side: THREE.DoubleSide, transparent: true, opacity: 0.52 }),
  );
  charm.position.set(side * (2.8 + (i % 5) * 0.86), 0.85 + (i % 6) * 0.4, 5.4 - (i % 9) * 1.32);
  charm.userData = { baseY: charm.position.y, phase: i * 0.67, side };
  scene.add(charm);
  paperCharms.push(charm);
}

const spiritPositions = new Float32Array(72 * 3);
for (let i = 0; i < 72; i++) {
  const angle = (i / 72) * Math.PI * 2 * 5.3;
  const radius = 2.5 + (i % 13) * 0.48;
  spiritPositions[i * 3] = Math.cos(angle) * radius;
  spiritPositions[i * 3 + 1] = 0.5 + (i % 9) * 0.38;
  spiritPositions[i * 3 + 2] = Math.sin(angle) * radius - 0.8;
}
const spiritGeometry = new THREE.BufferGeometry();
spiritGeometry.setAttribute('position', new THREE.BufferAttribute(spiritPositions, 3));
const spiritMotes = new THREE.Points(
  spiritGeometry,
  new THREE.PointsMaterial({ color: 0xe1bb73, size: 0.045, transparent: true, opacity: 0.68, sizeAttenuation: true }),
);
scene.add(spiritMotes);

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

runtime.addFrame(({ dt, elapsed, near }) => {
  eclipseLight.intensity = 2.4 + Math.sin(elapsed * 0.7) * 0.35;
  moonShadow.position.x = -0.78 + Math.sin(elapsed * 0.14) * 0.22;
  moonHalos.forEach((halo, index) => {
    halo.rotation.z += dt * (index % 2 ? -0.035 : 0.035);
    halo.material.opacity = 0.09 + (2 - index) * 0.025 + Math.sin(elapsed * 0.7 + index) * 0.018;
  });
  memoryVista.material.opacity = 0.62 + Math.sin(elapsed * 0.33) * 0.08;
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
  sealSiteRefs.forEach(({ sigil, phase }) => {
    sigil.rotation.z = elapsed * 0.14 + phase;
    sigil.material.opacity = 0.22 + Math.sin(elapsed * 1.6 + phase) * 0.08;
  });
  paperCharms.forEach((charm) => {
    const { baseY, phase, side } = charm.userData;
    charm.position.y = baseY + Math.sin(elapsed * 0.9 + phase) * 0.16;
    charm.rotation.y = Math.sin(elapsed * 0.65 + phase) * 0.52 + side * 0.24;
    charm.rotation.z = Math.sin(elapsed * 1.1 + phase) * 0.16;
  });
  spiritMotes.rotation.y = elapsed * 0.025;
  spiritMotes.material.opacity = 0.54 + Math.sin(elapsed * 0.8) * 0.12;
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
