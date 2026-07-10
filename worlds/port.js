import * as THREE from 'three';
import { createWorldRuntime, loadTexture, makeImagePlane, makeWorldLabel, addOutlines, canvasTex, toon } from './shared/runtime.js';
import { worldHref, WORLDS } from './registry.js';
import { warpTo } from './shared/warp.js';

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

const [meikyoTexture, lunaTexture, hankachoTexture] = await Promise.all([
  loadTexture('/meikyou/meikyou-mirror-face.jpg'),
  loadTexture('/worlds/luna/kv_eclipse.webp'),
  loadTexture('/worlds/hankacho/main-kv.jpg'),
]);

const runtime = createWorldRuntime({
  worldId: 'hub',
  room: WORLDS.hub.room,
  background: 0x10191d,
  fog: [0x10191d, 18, 48],
  groundY: 0.22,
  walkRadius: 8.25,
  start: [0, 4.7],
  cameraPosition: [0, 3.35, 10.2],
  cameraTarget: [0, 0.82, 4.1],
  exposure: 1.12,
  presenceLabel: (count) => `いま港に ${count === 1 ? 'ひとり' : `${count}人`}`,
  fullMessage: '世界港は満員です。ソロで航路を選べます',
});

const { scene } = runtime;
scene.add(new THREE.HemisphereLight(0xc9ebee, 0x172026, 1.65));
const sun = new THREE.DirectionalLight(0xfff0c9, 2.8);
sun.position.set(-8, 13, 9);
sun.castShadow = true;
sun.shadow.mapSize.set(1536, 1536);
sun.shadow.camera.left = -12;
sun.shadow.camera.right = 12;
sun.shadow.camera.top = 12;
sun.shadow.camera.bottom = -12;
scene.add(sun);

const sea = new THREE.Mesh(
  new THREE.CircleGeometry(48, 128),
  new THREE.MeshStandardMaterial({ color: 0x24444e, roughness: 0.3, metalness: 0.28 }),
);
sea.rotation.x = -Math.PI / 2;
sea.position.y = -0.28;
sea.receiveShadow = true;
scene.add(sea);

const port = new THREE.Mesh(
  new THREE.CylinderGeometry(8.75, 8.35, 0.46, 80),
  new THREE.MeshStandardMaterial({ color: 0x28343a, roughness: 0.78, metalness: 0.08 }),
);
port.position.y = -0.01;
port.receiveShadow = port.castShadow = true;
scene.add(port);

const rim = new THREE.Mesh(
  new THREE.TorusGeometry(8.42, 0.08, 10, 128),
  new THREE.MeshStandardMaterial({ color: 0xc09c58, roughness: 0.32, metalness: 0.78 }),
);
rim.rotation.x = Math.PI / 2;
rim.position.y = 0.225;
scene.add(rim);

const compass = new THREE.Group();
compass.position.y = 0.235;
const compassRing = new THREE.Mesh(
  new THREE.RingGeometry(1.5, 1.57, 96),
  new THREE.MeshBasicMaterial({ color: 0x7bc5cb, transparent: true, opacity: 0.62, side: THREE.DoubleSide }),
);
compassRing.rotation.x = -Math.PI / 2;
compass.add(compassRing);
for (let i = 0; i < 8; i++) {
  const spoke = new THREE.Mesh(
    new THREE.BoxGeometry(i % 2 ? 0.025 : 0.045, 0.012, i % 2 ? 2.25 : 2.75),
    new THREE.MeshBasicMaterial({ color: i % 2 ? 0x5b8087 : 0xd0ae65, transparent: true, opacity: 0.72 }),
  );
  spoke.rotation.y = (i / 8) * Math.PI;
  compass.add(spoke);
}
const compassCore = new THREE.Mesh(
  new THREE.CylinderGeometry(0.22, 0.28, 0.08, 32),
  new THREE.MeshStandardMaterial({ color: 0xd0ae65, roughness: 0.28, metalness: 0.82 }),
);
compassCore.position.y = 0.04;
compass.add(compassCore);
scene.add(compass);

for (let i = 0; i < 18; i++) {
  const a = (i / 18) * Math.PI * 2;
  const lamp = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 0.1, 10),
    new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? 0xffd787 : 0x8de3eb }),
  );
  lamp.position.set(Math.cos(a) * 7.85, 0.31, Math.sin(a) * 7.85);
  lamp.userData.baseY = lamp.position.y;
  lamp.userData.phase = i * 0.7;
  scene.add(lamp);
  runtime.addFrame(({ elapsed }) => {
    lamp.position.y = lamp.userData.baseY + Math.sin(elapsed * 1.7 + lamp.userData.phase) * 0.025;
  });
}

const portalRefs = [];
const portalMaterial = (color) => new THREE.MeshStandardMaterial({
  color,
  roughness: 0.28,
  metalness: 0.72,
  emissive: color,
  emissiveIntensity: 0.12,
});

const makePortal = ({ world, x, z, texture, kind }) => {
  const group = new THREE.Group();
  group.position.set(x, 0.22, z);
  group.rotation.y = Math.atan2(-x, -z);
  const accent = new THREE.Color(world.accent);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.12, 1.28, 0.18, 40), toon(0x46535a));
  base.position.y = 0.09;
  base.castShadow = base.receiveShadow = true;
  group.add(base);

  const floorRing = new THREE.Mesh(
    new THREE.RingGeometry(0.62, 0.98, 64),
    new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.42, side: THREE.DoubleSide }),
  );
  floorRing.rotation.x = -Math.PI / 2;
  floorRing.position.y = 0.19;
  group.add(floorRing);

  let surface;
  if (kind === 'mirror') {
    const frame = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.075, 14, 72), portalMaterial(0xcbdadc));
    frame.position.y = 1.18;
    frame.scale.y = 1.22;
    group.add(frame);
    surface = new THREE.Mesh(
      new THREE.CircleGeometry(0.72, 64),
      new THREE.MeshBasicMaterial({ map: texture, color: 0xe5f7f7, transparent: true, opacity: 0.9, side: THREE.DoubleSide }),
    );
    surface.position.set(0, 1.18, 0.012);
    surface.scale.y = 1.22;
    group.add(surface);
  } else if (kind === 'eclipse') {
    for (const side of [-1, 1]) {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.1, 0.18), portalMaterial(0x6f1b26));
      pillar.position.set(side * 0.82, 1.1, 0);
      group.add(pillar);
    }
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.16, 0.2), portalMaterial(0x8c2330));
    lintel.position.y = 2.08;
    group.add(lintel);
    surface = makeImagePlane(texture, 1.48, 1.72, { transparent: false });
    surface.position.set(0, 1.14, 0.03);
    group.add(surface);
  } else {
    for (const side of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.05, 0.16), portalMaterial(0x6f5940));
      post.position.set(side * 0.88, 1.08, 0);
      group.add(post);
    }
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.18, 0.2), portalMaterial(0xb0874f));
    top.position.y = 2.04;
    group.add(top);
    surface = makeImagePlane(texture, 1.55, 1.55, { transparent: false });
    surface.position.set(0, 1.12, 0.03);
    group.add(surface);
  }

  surface.userData.noOutline = true;
  const label = makeWorldLabel(world.en, world.shortName, {
    color: world.accent,
    ink: '#f4eee4',
    paper: 'rgba(10, 16, 19, .9)',
    border: `${world.accent}88`,
    scale: [1.82, 0.5],
  });
  label.position.set(0, 2.4, 0);
  group.add(label);

  const light = new THREE.PointLight(accent, 1.15, 4.3, 2);
  light.position.set(0, 1.15, 0.55);
  group.add(light);
  addOutlines(group, { color: 0x11191d, min: 0.006, max: 0.014 });
  scene.add(group);

  const worldPosition = new THREE.Vector3(x, 0.22, z);
  const interactable = runtime.addInteractable({
    id: `portal-${world.id}`,
    position: worldPosition,
    radius: 1.65,
    label: `${world.name}へ渡る`,
    action: () => warpTo({ href: worldHref(world.id), from: 'hub', to: world.id, label: `${world.shortName}へ` }),
  });
  portalRefs.push({ group, surface, floorRing, light, label, interactable });
};

makePortal({ world: WORLDS.meikyo, x: 0, z: -5.9, texture: meikyoTexture, kind: 'mirror' });
makePortal({ world: WORLDS.luna, x: -5.55, z: -1.25, texture: lunaTexture, kind: 'eclipse' });
makePortal({ world: WORLDS.hankacho, x: 5.55, z: -1.25, texture: hankachoTexture, kind: 'scroll' });

const studioGate = new THREE.Group();
studioGate.position.set(-5.75, 0.22, 4.75);
studioGate.rotation.y = Math.atan2(-studioGate.position.x, -studioGate.position.z);
const studioTex = canvasTex(640, 320, (ctx, w, h) => {
  ctx.fillStyle = '#19262b';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(117,200,207,.5)';
  ctx.lineWidth = 4;
  ctx.strokeRect(18, 18, w - 36, h - 36);
  ctx.fillStyle = '#f4eee4';
  ctx.textAlign = 'center';
  ctx.font = '700 78px Inter, sans-serif';
  ctx.fillText('VIBE', w / 2, 150);
  ctx.fillStyle = '#75c8cf';
  ctx.font = '700 26px Inter, sans-serif';
  ctx.fillText('STUDIO ISLAND', w / 2, 206);
});
const studioPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(1.8, 0.9),
  new THREE.MeshBasicMaterial({ map: studioTex, side: THREE.DoubleSide }),
);
studioPlane.position.y = 1.08;
studioGate.add(studioPlane);
for (const side of [-1, 1]) {
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.75, 12), portalMaterial(0xb9985e));
  post.position.set(side * 1.05, 0.92, 0);
  studioGate.add(post);
}
const studioTop = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.12, 0.16), portalMaterial(0xb9985e));
studioTop.position.y = 1.8;
studioGate.add(studioTop);
addOutlines(studioGate, { color: 0x11191d, min: 0.006, max: 0.014 });
scene.add(studioGate);
runtime.addInteractable({
  id: 'portal-studio',
  position: studioGate.position,
  radius: 1.45,
  label: 'Studio VIBE島へ戻る',
  action: () => warpTo({ href: worldHref('studio'), from: 'hub', to: 'studio', label: 'VIBE島へ' }),
});

runtime.addFrame(({ elapsed, near }) => {
  compass.rotation.y = elapsed * 0.025;
  for (const ref of portalRefs) {
    const active = near === ref.interactable;
    ref.floorRing.material.opacity = (active ? 0.82 : 0.36) + Math.sin(elapsed * 1.9) * 0.08;
    ref.light.intensity = (active ? 1.8 : 1.08) + Math.sin(elapsed * 1.7) * 0.12;
    ref.surface.scale.x = 1 + Math.sin(elapsed * 1.25) * 0.008;
  }
});

if (new URLSearchParams(location.search).get('qa') === 'luna') runtime.teleport(-4.6, -1.1);
if (new URLSearchParams(location.search).get('qa') === 'hankacho') runtime.teleport(4.6, -1.1);
if (new URLSearchParams(location.search).get('qa') === 'meikyo') runtime.teleport(0, -4.7);

runtime.start();
