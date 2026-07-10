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

const seaUniforms = {
  uTime: { value: 0 },
  uDeep: { value: new THREE.Color(0x10262e) },
  uShallow: { value: new THREE.Color(0x386672) },
};
const sea = new THREE.Mesh(
  new THREE.PlaneGeometry(96, 96, 48, 48),
  new THREE.ShaderMaterial({
    uniforms: seaUniforms,
    side: THREE.DoubleSide,
    vertexShader: `
      uniform float uTime;
      varying float vWave;
      varying vec2 vUv2;
      void main() {
        vec3 p = position;
        float wave = sin(p.x * .42 + uTime * .52) * .075;
        wave += sin(p.y * .63 - uTime * .38) * .045;
        p.z += wave;
        vWave = wave;
        vUv2 = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uDeep;
      uniform vec3 uShallow;
      varying float vWave;
      varying vec2 vUv2;
      void main() {
        float routeA = sin((vUv2.x + vUv2.y) * 54.0 + uTime * .35);
        float routeB = sin((vUv2.x - vUv2.y) * 38.0 - uTime * .24);
        float glint = smoothstep(.965, 1.0, routeA * routeB) * .045;
        vec3 color = mix(uDeep, uShallow, .36 + vWave * 2.2 + vUv2.y * .12);
        gl_FragColor = vec4(color + glint, 1.0);
      }
    `,
  }),
);
sea.rotation.x = -Math.PI / 2;
sea.position.y = -0.28;
sea.receiveShadow = true;
scene.add(sea);

const portUndercroft = new THREE.Mesh(
  new THREE.CylinderGeometry(8.38, 7.1, 0.9, 64),
  new THREE.MeshStandardMaterial({ color: 0x172329, roughness: 0.78, metalness: 0.22 }),
);
portUndercroft.position.y = -0.42;
portUndercroft.castShadow = true;
scene.add(portUndercroft);

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

for (const [index, radius] of [3.2, 4.65, 6.15].entries()) {
  const floorArc = new THREE.Mesh(
    new THREE.RingGeometry(radius, radius + 0.018, 128),
    new THREE.MeshBasicMaterial({
      color: index === 1 ? 0xc09c58 : 0x75c8cf,
      transparent: true,
      opacity: index === 1 ? 0.16 : 0.1,
      side: THREE.DoubleSide,
    }),
  );
  floorArc.rotation.x = -Math.PI / 2;
  floorArc.position.y = 0.235;
  scene.add(floorArc);
}
for (let i = 0; i < 16; i++) {
  const angle = (i / 16) * Math.PI * 2;
  const rivet = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 0.018, 12),
    new THREE.MeshStandardMaterial({ color: 0x647a80, roughness: 0.3, metalness: 0.82 }),
  );
  rivet.position.set(Math.cos(angle) * 6.9, 0.245, Math.sin(angle) * 6.9);
  scene.add(rivet);
}

for (let i = 0; i < 24; i++) {
  const angle = (i / 24) * Math.PI * 2;
  const bracket = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.72, 0.34),
    new THREE.MeshStandardMaterial({ color: i % 3 ? 0x41525a : 0xb18d4e, roughness: 0.4, metalness: 0.7 }),
  );
  bracket.position.set(Math.cos(angle) * 8.47, -0.22, Math.sin(angle) * 8.47);
  bracket.rotation.y = -angle + Math.PI / 2;
  scene.add(bracket);
}

const farHarbors = [];
for (let i = 0; i < 7; i++) {
  const angle = (i / 7) * Math.PI * 2 + 0.3;
  const radius = 18 + (i % 3) * 3.4;
  const group = new THREE.Group();
  group.position.set(Math.cos(angle) * radius, -0.3 - (i % 2) * 0.18, Math.sin(angle) * radius);
  const deck = new THREE.Mesh(
    new THREE.CylinderGeometry(1.7 + (i % 2) * 0.45, 1.3, 0.5, 20),
    new THREE.MeshStandardMaterial({ color: i % 2 ? 0x23353c : 0x2c3d43, roughness: 0.72, metalness: 0.18 }),
  );
  group.add(deck);
  const tower = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.18, 1.6 + (i % 3) * 0.35, 10),
    new THREE.MeshStandardMaterial({ color: 0x53666d, roughness: 0.48, metalness: 0.48 }),
  );
  tower.position.y = 0.85;
  group.add(tower);
  const beacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 12, 8),
    new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? 0xcfa85c : 0x75c8cf }),
  );
  beacon.position.y = tower.position.y + 0.85;
  group.add(beacon);
  scene.add(group);
  farHarbors.push({ group, beacon, phase: i * 0.9 });
}

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

const astrolabe = new THREE.Group();
astrolabe.position.set(0, 1.16, 0.45);
const astrolabeRings = [];
for (let i = 0; i < 3; i++) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.54 + i * 0.11, 0.016 + i * 0.003, 8, 72),
    new THREE.MeshStandardMaterial({
      color: i === 1 ? 0x75c8cf : 0xc7a35c,
      emissive: i === 1 ? 0x315b62 : 0x5c4724,
      emissiveIntensity: 0.46,
      metalness: 0.86,
      roughness: 0.24,
    }),
  );
  ring.rotation.set(i === 0 ? Math.PI / 2 : Math.PI / 3, i * Math.PI / 3, i * 0.45);
  astrolabe.add(ring);
  astrolabeRings.push(ring);
}
const astrolabeCore = new THREE.Mesh(
  new THREE.OctahedronGeometry(0.2, 0),
  new THREE.MeshStandardMaterial({ color: 0xf0d28b, emissive: 0xb78b35, emissiveIntensity: 0.8, metalness: 0.65, roughness: 0.2 }),
);
astrolabe.add(astrolabeCore);
const astrolabeLight = new THREE.PointLight(0x8fe5e9, 0.8, 5.2, 2);
astrolabe.add(astrolabeLight);
scene.add(astrolabe);
const astrolabeMast = new THREE.Mesh(
  new THREE.CylinderGeometry(0.07, 0.13, 1.05, 16),
  new THREE.MeshStandardMaterial({ color: 0x8f7547, roughness: 0.36, metalness: 0.75 }),
);
astrolabeMast.position.set(0, 0.7, 0.45);
scene.add(astrolabeMast);
runtime.addObstacle(0, 0.45, 0.28);

const portalLayout = {
  meikyo: { x: 0, z: -5.9, accent: 0x8ecbd0 },
  luna: { x: -5.55, z: -1.25, accent: 0xa92e3f },
  hankacho: { x: 5.55, z: -1.25, accent: 0x4cbac5 },
};
const routeLights = [];
const makePier = ({ x, z, accent }) => {
  const direction = new THREE.Vector3(x, 0, z);
  const distance = direction.length();
  direction.normalize();
  const start = direction.clone().multiplyScalar(2.05);
  const end = direction.clone().multiplyScalar(distance - 1.18);
  const length = start.distanceTo(end);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const group = new THREE.Group();
  group.position.set(mid.x, 0.27, mid.z);
  group.rotation.y = Math.atan2(direction.x, direction.z);
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(1.38, 0.1, length),
    new THREE.MeshStandardMaterial({ color: 0x34444a, roughness: 0.62, metalness: 0.2 }),
  );
  deck.receiveShadow = true;
  group.add(deck);
  for (const side of [-1, 1]) {
    const edge = new THREE.Mesh(
      new THREE.BoxGeometry(0.045, 0.055, length + 0.05),
      new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.58 }),
    );
    edge.position.set(side * 0.64, 0.078, 0);
    group.add(edge);
  }
  const inlay = new THREE.Mesh(
    new THREE.BoxGeometry(0.035, 0.06, length - 0.22),
    new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.72 }),
  );
  inlay.position.y = 0.082;
  group.add(inlay);
  for (let i = 0; i < 5; i++) {
    const marker = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.055, 0),
      new THREE.MeshBasicMaterial({ color: accent }),
    );
    marker.position.set(0, 0.17, -length / 2 + ((i + 1) / 6) * length);
    marker.userData.phase = i * 0.8 + distance;
    group.add(marker);
    routeLights.push(marker);
  }
  scene.add(group);
};
Object.values(portalLayout).forEach(makePier);

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

  const dockHalo = new THREE.Mesh(
    new THREE.RingGeometry(1.03, 1.12, 64),
    new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.24, side: THREE.DoubleSide }),
  );
  dockHalo.rotation.x = -Math.PI / 2;
  dockHalo.position.y = 0.195;
  group.add(dockHalo);

  let surface;
  if (kind === 'mirror') {
    const rearFrame = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.025, 10, 72), portalMaterial(0x7fb6bc));
    rearFrame.position.y = 1.18;
    rearFrame.position.z = -0.045;
    rearFrame.scale.y = 1.22;
    group.add(rearFrame);
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
    for (const side of [-1, 1]) {
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.13, 0), portalMaterial(side > 0 ? 0xe7f7f7 : 0x75b8c0));
      crystal.position.set(side * 1.0, 0.58 + (side + 1) * 0.16, 0.02);
      crystal.rotation.z = side * 0.25;
      group.add(crystal);
    }
  } else if (kind === 'eclipse') {
    for (const side of [-1, 1]) {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.1, 0.18), portalMaterial(0x6f1b26));
      pillar.position.set(side * 0.82, 1.1, 0);
      group.add(pillar);
    }
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.16, 0.2), portalMaterial(0x8c2330));
    lintel.position.y = 2.08;
    group.add(lintel);
    const upperLintel = new THREE.Mesh(new THREE.BoxGeometry(2.34, 0.08, 0.24), portalMaterial(0xb33a47));
    upperLintel.position.y = 2.24;
    group.add(upperLintel);
    const eclipseHalo = new THREE.Mesh(
      new THREE.TorusGeometry(0.63, 0.035, 10, 64),
      new THREE.MeshBasicMaterial({ color: 0xc54858, transparent: true, opacity: 0.54 }),
    );
    eclipseHalo.position.set(0, 1.18, -0.03);
    group.add(eclipseHalo);
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
    const eave = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.09, 0.34), portalMaterial(0x4e5960));
    eave.position.y = 2.2;
    group.add(eave);
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
  const motes = [];
  for (let i = 0; i < 6; i++) {
    const mote = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.035 + (i % 2) * 0.012, 0),
      new THREE.MeshBasicMaterial({ color: i % 2 ? 0xffffff : accent, transparent: true, opacity: 0.72 }),
    );
    mote.userData = { angle: (i / 6) * Math.PI * 2, radius: 0.88 + (i % 2) * 0.14, phase: i * 0.72 };
    group.add(mote);
    motes.push(mote);
  }
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
  portalRefs.push({ group, surface, floorRing, dockHalo, light, label, motes, interactable });
};

makePortal({ world: WORLDS.meikyo, ...portalLayout.meikyo, texture: meikyoTexture, kind: 'mirror' });
makePortal({ world: WORLDS.luna, ...portalLayout.luna, texture: lunaTexture, kind: 'eclipse' });
makePortal({ world: WORLDS.hankacho, ...portalLayout.hankacho, texture: hankachoTexture, kind: 'scroll' });

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

runtime.addFrame(({ dt, elapsed, near }) => {
  seaUniforms.uTime.value = elapsed;
  compass.rotation.y = elapsed * 0.025;
  astrolabe.position.y = 1.16 + Math.sin(elapsed * 0.8) * 0.035;
  astrolabeRings.forEach((ring, index) => {
    ring.rotation.x += (0.12 + index * 0.04) * dt;
    ring.rotation.y += (index % 2 ? -1 : 1) * (0.16 + index * 0.035) * dt;
  });
  astrolabeCore.rotation.y = elapsed * 0.8;
  astrolabeCore.rotation.x = elapsed * 0.35;
  astrolabeLight.intensity = 0.72 + Math.sin(elapsed * 1.8) * 0.16;
  routeLights.forEach((marker) => {
    marker.position.y = 0.17 + Math.sin(elapsed * 2 + marker.userData.phase) * 0.045;
    marker.rotation.y = elapsed * 1.1 + marker.userData.phase;
  });
  farHarbors.forEach(({ group, beacon, phase }) => {
    group.position.y += (Math.sin(elapsed * 0.42 + phase) * 0.018 - (group.userData.lastBob || 0));
    group.userData.lastBob = Math.sin(elapsed * 0.42 + phase) * 0.018;
    beacon.scale.setScalar(0.86 + Math.sin(elapsed * 1.7 + phase) * 0.22);
  });
  for (const ref of portalRefs) {
    const active = near === ref.interactable;
    ref.floorRing.material.opacity = (active ? 0.82 : 0.36) + Math.sin(elapsed * 1.9) * 0.08;
    ref.dockHalo.material.opacity = (active ? 0.5 : 0.2) + Math.sin(elapsed * 1.45) * 0.06;
    ref.light.intensity = (active ? 1.8 : 1.08) + Math.sin(elapsed * 1.7) * 0.12;
    ref.surface.scale.x = 1 + Math.sin(elapsed * 1.25) * 0.008;
    ref.motes.forEach((mote, index) => {
      const data = mote.userData;
      const angle = data.angle + elapsed * (index % 2 ? -0.34 : 0.34);
      mote.position.set(Math.cos(angle) * data.radius, 1.15 + Math.sin(elapsed * 1.4 + data.phase) * 0.62, Math.sin(angle) * 0.08 + 0.08);
      mote.rotation.y = elapsed + data.phase;
    });
  }
});

if (new URLSearchParams(location.search).get('qa') === 'luna') runtime.teleport(-4.6, -1.1);
if (new URLSearchParams(location.search).get('qa') === 'hankacho') runtime.teleport(4.6, -1.1);
if (new URLSearchParams(location.search).get('qa') === 'meikyo') runtime.teleport(0, -4.7);

runtime.start();
