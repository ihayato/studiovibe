import * as THREE from 'three';
import { createWorldRuntime, loadTexture, makeImagePlane, makeWorldLabel, addOutlines, toon } from '../shared/runtime.js';
import { worldHref, WORLDS } from '../registry.js';
import { warpTo } from '../shared/warp.js';

const SEARCH = new URLSearchParams(location.search);
const PROGRESS_KEY = 'vibe.world.hankacho.clues.v1';
const INTRO_KEY = 'vibe.world.hankacho.intro.v1';

if (SEARCH.get('qa') === 'reset') {
  try {
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem(INTRO_KEY);
  } catch {}
}

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

const [kvTexture, logoTexture, anneTexture, yuiTexture, kuonTexture, dangoTexture, episodeTexture] = await Promise.all([
  loadTexture('/worlds/hankacho/main-kv.jpg'),
  loadTexture('/worlds/hankacho/logo-ninja-hankacho-trim.webp'),
  loadTexture('/worlds/hankacho/anne.webp'),
  loadTexture('/worlds/hankacho/yui.webp'),
  loadTexture('/worlds/hankacho/kuon.webp'),
  loadTexture('/worlds/hankacho/dangoyasan.webp'),
  loadTexture('/worlds/hankacho/ep05-happiness.webp'),
]);

const runtime = createWorldRuntime({
  worldId: 'hankacho',
  room: WORLDS.hankacho.room,
  background: 0x95c7cf,
  fog: [0xa8cdd1, 19, 52],
  groundY: 0.22,
  walkRadius: 10.45,
  start: [0, 8.1],
  cameraPosition: [1.4, 3.35, 13.1],
  cameraTarget: [0, 0.82, 7.4],
  exposure: 1.08,
  playerRadius: 0.38,
  presenceLabel: (count) => `いま町に ${count === 1 ? 'ひとり' : `${count}人`}`,
  fullMessage: '犯科町は満員です。ソロで捜査できます',
  soundtrack: '/audio/bgm_ukidoro.m4a',
  soundtrackVolume: 0.28,
  loadingMinMs: 580,
});

const { scene } = runtime;
scene.add(new THREE.HemisphereLight(0xe8f5f3, 0x44535a, 1.85));
const sun = new THREE.DirectionalLight(0xfff2c7, 3.25);
sun.position.set(-8, 14, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(1536, 1536);
sun.shadow.camera.left = -13;
sun.shadow.camera.right = 13;
sun.shadow.camera.top = 13;
sun.shadow.camera.bottom = -13;
scene.add(sun);

const waterUniforms = {
  uTime: { value: 0 },
  uDeep: { value: new THREE.Color(0x347f8e) },
  uLight: { value: new THREE.Color(0x75c5ce) },
};
const water = new THREE.Mesh(
  new THREE.PlaneGeometry(116, 116, 44, 44),
  new THREE.ShaderMaterial({
    uniforms: waterUniforms,
    side: THREE.DoubleSide,
    vertexShader: `
      uniform float uTime;
      varying float vWave;
      varying vec2 vUv2;
      void main() {
        vec3 p = position;
        float wave = sin(p.x * .34 + uTime * .5) * .07;
        wave += sin(p.y * .52 - uTime * .38) * .045;
        p.z += wave;
        vWave = wave;
        vUv2 = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uDeep;
      uniform vec3 uLight;
      varying float vWave;
      varying vec2 vUv2;
      void main() {
        float ripple = .5 + .5 * sin((vUv2.x - vUv2.y) * 74.0 + uTime * .44);
        float glint = smoothstep(.94, 1.0, ripple) * .1;
        vec3 color = mix(uDeep, uLight, .38 + vWave * 2.1 + vUv2.y * .08);
        gl_FragColor = vec4(color + glint, 1.0);
      }
    `,
  }),
);
water.rotation.x = -Math.PI / 2;
water.position.y = -0.32;
scene.add(water);

const town = new THREE.Mesh(
  new THREE.CylinderGeometry(10.95, 10.45, 0.5, 88),
  new THREE.MeshStandardMaterial({ color: 0xb9bda9, roughness: 0.96, metalness: 0 }),
);
town.position.y = -0.01;
town.castShadow = town.receiveShadow = true;
scene.add(town);
const rim = new THREE.Mesh(
  new THREE.TorusGeometry(10.58, 0.07, 10, 128),
  new THREE.MeshStandardMaterial({ color: 0x2d7782, roughness: 0.42, metalness: 0.44 }),
);
rim.rotation.x = Math.PI / 2;
rim.position.y = 0.225;
scene.add(rim);

for (let i = 0; i < 40; i++) {
  const angle = (i / 40) * Math.PI * 2;
  const stone = new THREE.Mesh(
    new THREE.BoxGeometry(0.75 + (i % 3) * 0.08, 0.32 + (i % 2) * 0.06, 0.4),
    toon(i % 2 ? 0x748b89 : 0x829795),
  );
  stone.position.set(Math.cos(angle) * 10.62, 0.02, Math.sin(angle) * 10.62);
  stone.rotation.y = -angle;
  stone.rotation.z = (i % 3 - 1) * 0.035;
  stone.castShadow = true;
  scene.add(stone);
}

const distantTown = [];
for (let i = 0; i < 11; i++) {
  const angle = Math.PI * 1.08 + (i / 10) * Math.PI * 0.84;
  const radius = 15.5 + (i % 3) * 1.3;
  const group = new THREE.Group();
  group.position.set(Math.cos(angle) * radius, -0.1, Math.sin(angle) * radius);
  group.rotation.y = -angle + Math.PI / 2;
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2.1 + (i % 3) * 0.55, 1.8 + (i % 4) * 0.45, 1.8),
    new THREE.MeshStandardMaterial({ color: i % 2 ? 0x7c9693 : 0x8da19b, roughness: 0.92 }),
  );
  body.position.y = 0.9 + (i % 4) * 0.22;
  group.add(body);
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(1.75 + (i % 3) * 0.3, 0.55, 4),
    new THREE.MeshStandardMaterial({ color: 0x355a61, roughness: 0.78 }),
  );
  roof.position.y = body.position.y * 2 + 0.18;
  roof.rotation.y = Math.PI / 4;
  group.add(roof);
  scene.add(group);
  distantTown.push(group);
}

const backdrop = makeImagePlane(kvTexture, 15.7, 7.8, { transparent: false });
backdrop.position.set(0, 7.1, -25);
backdrop.material.color.set(0xd9e9e6);
scene.add(backdrop);

const cloudRefs = [];
for (let i = 0; i < 7; i++) {
  const cloud = new THREE.Group();
  cloud.position.set(-15 + i * 5.1, 7.4 + (i % 3) * 0.7, -16 - (i % 2) * 5.2);
  for (let puff = 0; puff < 4; puff++) {
    const mesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.7 + (puff % 3) * 0.22, 1),
      new THREE.MeshStandardMaterial({ color: 0xeaf4ef, transparent: true, opacity: 0.68, roughness: 1, depthWrite: false }),
    );
    mesh.position.set((puff - 1.5) * 0.68, Math.abs(puff - 1.5) * -0.12, (puff % 2) * 0.2);
    mesh.scale.y = 0.58;
    cloud.add(mesh);
  }
  scene.add(cloud);
  cloudRefs.push({ cloud, baseX: cloud.position.x, phase: i * 1.4 });
}

const street = new THREE.Mesh(
  new THREE.PlaneGeometry(3.35, 18.5),
  new THREE.MeshStandardMaterial({ color: 0xb49f83, roughness: 1, metalness: 0 }),
);
street.rotation.x = -Math.PI / 2;
street.position.set(0, 0.238, -0.25);
street.receiveShadow = true;
scene.add(street);
for (let i = 0; i < 16; i++) {
  const line = new THREE.Mesh(
    new THREE.BoxGeometry(2.9, 0.025, 0.035),
    new THREE.MeshBasicMaterial({ color: i % 2 ? 0x967f66 : 0xc4b093, transparent: true, opacity: 0.52 }),
  );
  line.position.set(0, 0.255, 7.4 - i * 1.03);
  scene.add(line);
}

const buildingRefs = [];
const buildingLabels = [];
const makeBuilding = ({ x, z, width, depth, height, wall, roof, sign = null }) => {
  const group = new THREE.Group();
  group.position.set(x, 0.22, z);
  const foundation = new THREE.Mesh(new THREE.BoxGeometry(width + 0.18, 0.16, depth + 0.16), toon(0x7f7668));
  foundation.position.y = 0.08;
  foundation.receiveShadow = true;
  group.add(foundation);
  const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), toon(wall));
  body.position.y = height / 2 + 0.16;
  body.castShadow = body.receiveShadow = true;
  group.add(body);
  for (const px of [-1, 1]) {
    for (const pz of [-1, 1]) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.075, height + 0.05, 0.075), toon(0x5b493c));
      beam.position.set(px * (width / 2 - 0.04), height / 2 + 0.17, pz * (depth / 2 - 0.04));
      group.add(beam);
    }
  }
  const eave = new THREE.Mesh(new THREE.BoxGeometry(width * 1.16, 0.12, depth * 1.18), toon(roof));
  eave.position.y = height + 0.2;
  eave.castShadow = true;
  group.add(eave);
  const roofMesh = new THREE.Mesh(new THREE.ConeGeometry(Math.max(width, depth) * 0.72, 0.62, 4), toon(roof));
  roofMesh.position.y = height + 0.48;
  roofMesh.rotation.y = Math.PI / 4;
  roofMesh.scale.z = depth / width;
  roofMesh.castShadow = true;
  group.add(roofMesh);
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.13, depth * 1.08), toon(0x263c42));
  ridge.position.y = height + 0.82;
  group.add(ridge);
  const front = x < 0 ? 1 : -1;
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.88, 0.035), toon(0x594333));
  door.position.set(front * (width / 2 + 0.019), 0.6, 0);
  door.rotation.y = Math.PI / 2;
  group.add(door);
  for (const windowZ of [-depth * 0.28, depth * 0.28]) {
    const window = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, 0.58, 0.62),
      new THREE.MeshStandardMaterial({ color: 0xf0dfa8, emissive: 0x8b6b2f, emissiveIntensity: 0.16, roughness: 0.72 }),
    );
    window.position.set(front * (width / 2 + 0.023), 1.35, windowZ);
    group.add(window);
    for (const offset of [-0.18, 0, 0.18]) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.61, 0.028), toon(0x66503e));
      slat.position.set(front * (width / 2 + 0.045), 1.35, windowZ + offset);
      group.add(slat);
    }
  }
  if (sign) {
    const label = makeWorldLabel(sign.en, sign.jp, {
      color: sign.color || '#2b7580', paper: 'rgba(245, 235, 207, .94)', border: 'rgba(72,57,38,.28)', scale: [1.42, 0.4],
    });
    label.position.set(x < 0 ? width / 2 + 0.08 : -width / 2 - 0.08, height + 0.7, 0);
    group.add(label);
    buildingLabels.push({ label, position: new THREE.Vector3(x, 0.22, z) });
    const noren = new THREE.Group();
    noren.position.set(front * (width / 2 + 0.06), 1.24, 0);
    noren.rotation.y = Math.PI / 2;
    for (let panel = -1; panel <= 1; panel++) {
      const cloth = new THREE.Mesh(
        new THREE.PlaneGeometry(0.28, 0.62),
        new THREE.MeshStandardMaterial({ color: sign.en === 'DANGO' ? 0xd56b88 : 0x426d73, roughness: 0.92, side: THREE.DoubleSide }),
      );
      cloth.position.x = panel * 0.29;
      noren.add(cloth);
    }
    group.add(noren);
  }
  addOutlines(group, { color: 0x253438, min: 0.006, max: 0.016 });
  scene.add(group);
  runtime.addBoxObstacle(x, z, width + 0.22, depth + 0.22, 0, 0.16);
  buildingRefs.push(group);
  return group;
};

makeBuilding({ x: -4.45, z: 4.3, width: 3.1, depth: 2.5, height: 2.0, wall: 0xd8c8aa, roof: 0x355b63, sign: { en: 'DANGO', jp: '団子屋' } });
makeBuilding({ x: 4.5, z: 4.2, width: 3.0, depth: 2.4, height: 2.25, wall: 0xc7d5cb, roof: 0x365961 });
makeBuilding({ x: -4.6, z: 0.2, width: 3.25, depth: 2.8, height: 2.45, wall: 0xd4d0bd, roof: 0x3f4e56 });
makeBuilding({ x: 4.65, z: -0.35, width: 3.15, depth: 2.8, height: 2.1, wall: 0xd9c2a6, roof: 0x554e56 });
makeBuilding({ x: -4.55, z: -4.1, width: 3.1, depth: 2.6, height: 2.1, wall: 0xcbd4c6, roof: 0x3a5d64 });
makeBuilding({ x: 4.55, z: -4.2, width: 3.35, depth: 2.7, height: 2.35, wall: 0xcaa888, roof: 0x4a464c, sign: { en: 'SMITHY', jp: '鍛冶場', color: '#b55743' } });

const canal = new THREE.Mesh(
  new THREE.PlaneGeometry(1.12, 13.7),
  new THREE.MeshStandardMaterial({ color: 0x438f9e, roughness: 0.24, metalness: 0.16, emissive: 0x1f5964, emissiveIntensity: 0.12 }),
);
canal.rotation.x = -Math.PI / 2;
canal.position.set(7.45, 0.245, -0.15);
scene.add(canal);
for (const side of [-1, 1]) {
  const bank = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 14.0), toon(side > 0 ? 0x697f7e : 0x768987));
  bank.position.set(7.45 + side * 0.7, 0.3, -0.15);
  bank.castShadow = bank.receiveShadow = true;
  scene.add(bank);
}
const bridge = new THREE.Group();
bridge.position.set(7.45, 0.34, 3.2);
const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.12, 1.1), toon(0x8a6848));
bridgeDeck.castShadow = true;
bridge.add(bridgeDeck);
for (const side of [-1, 1]) {
  for (const x of [-0.82, 0, 0.82]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.52, 8), toon(0x5d4937));
    post.position.set(x, 0.3, side * 0.48);
    bridge.add(post);
  }
  const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.72, 8), toon(0x5d4937));
  rail.rotation.z = Math.PI / 2;
  rail.position.set(0, 0.52, side * 0.48);
  bridge.add(rail);
}
addOutlines(bridge, { color: 0x334142, min: 0.004, max: 0.011 });
scene.add(bridge);
runtime.addBoxObstacle(7.45, -2.28, 1.16, 9.44);
runtime.addBoxObstacle(7.45, 5.3, 1.16, 2.8);

const lilyPads = [];
for (let i = 0; i < 9; i++) {
  const pad = new THREE.Mesh(
    new THREE.CircleGeometry(0.12 + (i % 3) * 0.035, 18, 0.22, Math.PI * 1.82),
    new THREE.MeshStandardMaterial({ color: i % 2 ? 0x5f8b70 : 0x6b9977, roughness: 0.82, side: THREE.DoubleSide }),
  );
  pad.rotation.x = -Math.PI / 2;
  pad.position.set(7.45 + (i % 2 ? -0.22 : 0.2), 0.258, 5.5 - i * 1.34);
  pad.userData.phase = i * 0.8;
  scene.add(pad);
  lilyPads.push(pad);
}

const streetLanterns = [];
for (const [row, z] of [3.25, -0.9, -4.65].entries()) {
  const rope = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.014, 4.8, 8),
    new THREE.MeshStandardMaterial({ color: 0x6d5b48, roughness: 0.82 }),
  );
  rope.rotation.z = Math.PI / 2;
  rope.position.set(0, 3.02, z);
  scene.add(rope);
  for (let i = 0; i < 5; i++) {
    const lantern = new THREE.Group();
    lantern.position.set(-1.72 + i * 0.86, 2.72 - Math.abs(i - 2) * 0.055, z);
    const paper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 0.29, 12),
      new THREE.MeshBasicMaterial({ color: row % 2 ? 0xffd09b : 0xf19ab1 }),
    );
    lantern.add(paper);
    for (const y of [-0.16, 0.16]) {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.035, 12), toon(0x5b4238));
      cap.position.y = y;
      lantern.add(cap);
    }
    scene.add(lantern);
    streetLanterns.push({ group: lantern, phase: row * 1.3 + i * 0.55 });
  }
}

const makeStall = (x, z, color, goodsColor) => {
  const stall = new THREE.Group();
  stall.position.set(x, 0.22, z);
  const table = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.12, 0.65), toon(0x866143));
  table.position.y = 0.72;
  stall.add(table);
  for (const side of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 1.55, 8), toon(0x684c37));
    post.position.set(side * 0.5, 0.78, -0.23);
    stall.add(post);
  }
  const awning = new THREE.Mesh(
    new THREE.BoxGeometry(1.38, 0.08, 0.88),
    new THREE.MeshStandardMaterial({ color, roughness: 0.88 }),
  );
  awning.position.y = 1.52;
  awning.rotation.x = -0.08;
  stall.add(awning);
  for (let i = 0; i < 7; i++) {
    const goods = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), toon(i % 2 ? goodsColor : 0xf3d38c));
    goods.position.set(-0.4 + (i % 4) * 0.26, 0.83 + Math.floor(i / 4) * 0.09, -0.04);
    stall.add(goods);
  }
  addOutlines(stall, { color: 0x3a4040, min: 0.004, max: 0.011 });
  scene.add(stall);
  runtime.addBoxObstacle(x, z, 1.32, 0.82, 0, 0.04);
  return stall;
};
makeStall(1.82, -2.0, 0x4d8790, 0xd66f88);
makeStall(-1.82, 1.72, 0xd17d98, 0x75a97a);

for (const [x, z] of [[-6.1, 2.1], [6.05, -6.1], [-5.9, -2.0], [5.9, 6.2]]) {
  const stack = new THREE.Group();
  stack.position.set(x, 0.22, z);
  for (let i = 0; i < 3; i++) {
    const crate = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.38, 0.42), toon(i % 2 ? 0x8f704f : 0xa28058));
    crate.position.set((i % 2) * 0.34, 0.19 + Math.floor(i / 2) * 0.38, (i % 2) * 0.08);
    crate.rotation.y = i * 0.22;
    stack.add(crate);
  }
  addOutlines(stack, { color: 0x4a4842, min: 0.004, max: 0.01 });
  scene.add(stack);
  runtime.addBoxObstacle(x + 0.17, z + 0.04, 0.82, 0.58, 0, 0.02);
}

const gate = new THREE.Group();
gate.position.set(0, 0.22, -7.2);
for (const side of [-1, 1]) {
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.75, 0.24), toon(0x324b50));
  post.position.set(side * 1.75, 1.38, 0);
  post.castShadow = true;
  gate.add(post);
  runtime.addObstacle(side * 1.75, -7.2, 0.18);
}
const gateTop = new THREE.Mesh(new THREE.BoxGeometry(4.25, 0.25, 0.28), toon(0x2b4449));
gateTop.position.y = 2.67;
gate.add(gateTop);
const gateLogo = makeImagePlane(logoTexture, 2.9, 0.86);
gateLogo.position.set(0, 2.02, 0.08);
gate.add(gateLogo);
addOutlines(gate, { color: 0x203034, min: 0.007, max: 0.016 });
scene.add(gate);

const well = new THREE.Group();
well.position.set(3.25, 0.22, 2.0);
const wellBase = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.78, 0.58, 24), toon(0x8d8d82));
wellBase.position.y = 0.29;
well.add(wellBase);
const wellDark = new THREE.Mesh(new THREE.CircleGeometry(0.55, 32), new THREE.MeshBasicMaterial({ color: 0x24434b }));
wellDark.rotation.x = -Math.PI / 2;
wellDark.position.y = 0.59;
well.add(wellDark);
scene.add(well);
runtime.addObstacle(3.25, 2.0, 0.72);

const petalRefs = [];
const makeSakura = (x, z, scale = 1) => {
  const group = new THREE.Group();
  group.position.set(x, 0.22, z);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.13 * scale, 0.2 * scale, 1.75 * scale, 10), toon(0x665047));
  trunk.position.y = 0.85 * scale;
  group.add(trunk);
  for (let i = 0; i < 6; i++) {
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry((0.58 + (i % 3) * 0.08) * scale, 1), toon(i % 2 ? 0xf0a0b7 : 0xe982a4));
    crown.position.set((i % 3 - 1) * 0.45 * scale, (1.65 + Math.floor(i / 3) * 0.42) * scale, (i % 2 ? -0.28 : 0.28) * scale);
    group.add(crown);
  }
  addOutlines(group, { color: 0x3a4242, min: 0.005, max: 0.013 });
  scene.add(group);
  runtime.addObstacle(x, z, 0.24 * scale);
  for (let i = 0; i < 8; i++) {
    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffb4c8 }));
    petal.scale.set(1.5, 0.45, 0.8);
    petal.userData = { x, z, phase: Math.random() * Math.PI * 2, radius: 0.7 + Math.random() * 0.8, y: 1.2 + Math.random() * 1.8 };
    scene.add(petal);
    petalRefs.push(petal);
  }
};
makeSakura(-2.8, 7.0, 1.05);
makeSakura(5.2, 7.15, 0.88);
makeSakura(-2.7, -6.2, 0.88);

const characterRefs = [];
const makeCharacter = (texture, { x, z, width, height, name, en }) => {
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(Math.max(0.34, width * 0.34), 36),
    new THREE.MeshBasicMaterial({ color: 0x24434a, transparent: true, opacity: 0.2, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(x, 0.247, z);
  scene.add(shadow);
  const stand = new THREE.Mesh(
    new THREE.CylinderGeometry(width * 0.25, width * 0.31, 0.08, 28),
    new THREE.MeshStandardMaterial({ color: 0x5b8b8f, roughness: 0.48, metalness: 0.28 }),
  );
  stand.position.set(x, 0.27, z);
  scene.add(stand);
  const character = makeImagePlane(texture, width, height);
  character.position.set(x, 0.29 + height / 2, z);
  runtime.addBillboard(character);
  scene.add(character);
  const label = makeWorldLabel(en, name, {
    color: '#287d88', paper: 'rgba(248, 239, 214, .93)', border: 'rgba(38,95,103,.28)', scale: [1.32, 0.37],
  });
  label.position.set(x, 0.5 + height, z);
  scene.add(label);
  characterRefs.push({ character, label, shadow, stand });
  return character;
};

const anne = makeCharacter(anneTexture, { x: -1.85, z: 5.45, width: 1.35, height: 2.65, name: 'あんね', en: 'ANNE' });
const yui = makeCharacter(yuiTexture, { x: 2.0, z: -5.7, width: 1.25, height: 2.55, name: '結', en: 'YUI' });
const dango = makeCharacter(dangoTexture, { x: -2.24, z: 3.75, width: 1.22, height: 2.4, name: '団子屋さん', en: 'DANGO' });
const kuon = makeCharacter(kuonTexture, { x: 2.28, z: 5.2, width: 1.35, height: 2.55, name: '久遠', en: 'KUON' });
runtime.addObstacle(anne.position.x, anne.position.z, 0.28);
runtime.addObstacle(yui.position.x, yui.position.z, 0.27);
runtime.addObstacle(dango.position.x, dango.position.z, 0.26);

const board = new THREE.Group();
board.position.set(-1.3, 0.22, -1.75);
for (const side of [-1, 1]) {
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 1.55, 10), toon(0x74573c));
  post.position.set(side * 0.56, 0.78, 0);
  board.add(post);
}
const boardFace = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.92, 0.08), toon(0xeadcb8));
boardFace.position.y = 1.05;
board.add(boardFace);
const boardEpisode = makeImagePlane(episodeTexture, 1.4, 0.78, { transparent: false });
boardEpisode.position.set(0, 1.05, 0.055);
board.add(boardEpisode);
const boardLabel = makeWorldLabel('NOW SHOWING', '上映札', {
  color: '#287d88', paper: 'rgba(246, 233, 199, .96)', border: 'rgba(90,68,42,.34)', scale: [1.08, 0.3],
});
boardLabel.position.set(0, 1.72, 0.06);
board.add(boardLabel);
addOutlines(board, { color: 0x3d403d, min: 0.006, max: 0.014 });
scene.add(board);
runtime.addBoxObstacle(board.position.x, board.position.z, 1.62, 0.18, 0, 0.03);

const missionPanel = document.getElementById('mission-panel');
const casePanel = document.getElementById('case-panel');
const episodesPanel = document.getElementById('episodes-panel');
const modalReturnFocus = new WeakMap();
const openPanel = (panel) => {
  modalReturnFocus.set(panel, document.activeElement);
  panel.hidden = false;
  requestAnimationFrame(() => panel.querySelector('.world-sheet__close')?.focus());
};
const closePanel = (panel) => {
  panel.hidden = true;
  modalReturnFocus.get(panel)?.focus?.();
};
for (const panel of [missionPanel, casePanel, episodesPanel]) {
  panel.querySelector('.world-sheet__close').addEventListener('click', () => closePanel(panel));
  panel.addEventListener('click', (event) => { if (event.target === panel) closePanel(panel); });
  panel.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => closePanel(panel)));
}
addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closePanel(missionPanel);
    closePanel(casePanel);
    closePanel(episodesPanel);
  }
});

let metAnne = false;
try { metAnne = localStorage.getItem(INTRO_KEY) === '1'; } catch {}
runtime.addInteractable({
  id: 'anne',
  position: anne.position,
  radius: 1.55,
  priority: 3,
  label: 'あんねから事件を聞く',
  action: () => {
    metAnne = true;
    try { localStorage.setItem(INTRO_KEY, '1'); } catch {}
    updateProgress();
    openPanel(missionPanel);
  },
});
runtime.addInteractable({
  id: 'episodes',
  position: board.position,
  radius: 1.35,
  label: '上映札をひらく',
  action: () => openPanel(episodesPanel),
});

const clueCount = document.getElementById('clue-count');
const objective = document.getElementById('objective');
const foundClues = (() => {
  try {
    const raw = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]');
    return new Set(Array.isArray(raw) ? raw : []);
  } catch {
    return new Set();
  }
})();
runtime.addObstacle(kuon.position.x, kuon.position.z, 0.3, () => foundClues.size === 3);
const clueDefs = [
  { id: 'dango', title: '甘い団子の串', detail: '団子屋の軒先から、青い足跡が続いている。', x: -1.55, z: 3.55, rotation: -0.4 },
  { id: 'well', title: '井戸端の青い毛', detail: '水をのぞいた跡。足跡は北へ曲がった。', x: 2.15, z: 1.45, rotation: 0.65 },
  { id: 'roof', title: '屋根から落ちた鈴', detail: '聞き覚えのある鈴。久遠は南門ではなく桜の木へ戻ったようだ。', x: 1.25, z: -3.6, rotation: -0.2 },
];
const clueRefs = [];
const saveClues = () => {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify([...foundClues])); } catch {}
};
const updateProgress = () => {
  clueCount.textContent = String(foundClues.size);
  if (!metAnne) objective.textContent = 'あんねから事件を聞く';
  else if (foundClues.size < 3) objective.textContent = `青い足跡を調べる　${foundClues.size}/3`;
  else objective.textContent = '桜の近くにいる久遠を見つける';
  clueRefs.forEach((ref) => { ref.group.visible = !foundClues.has(ref.def.id); });
  const kuonRef = characterRefs.find((ref) => ref.character === kuon);
  if (kuonRef) {
    const visible = foundClues.size === 3;
    kuonRef.character.visible = visible;
    kuonRef.shadow.visible = visible;
    kuonRef.stand.visible = visible;
  }
};

const makePaw = () => {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ color: 0x3fa7ba, transparent: true, opacity: 0.88 });
  const pad = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 10), material);
  pad.scale.set(1.2, 0.22, 1);
  group.add(pad);
  for (let i = 0; i < 3; i++) {
    const toe = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), material);
    toe.scale.y = 0.22;
    toe.position.set((i - 1) * 0.11, 0.015, -0.16 - Math.abs(i - 1) * 0.025);
    group.add(toe);
  }
  return group;
};
for (const def of clueDefs) {
  const group = new THREE.Group();
  group.position.set(def.x, 0.27, def.z);
  group.rotation.y = def.rotation;
  for (let i = 0; i < 3; i++) {
    const paw = makePaw();
    paw.position.set((i - 1) * 0.22, i * 0.008, (i - 1) * 0.34);
    group.add(paw);
  }
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.42, 0.5, 40),
    new THREE.MeshBasicMaterial({ color: 0x4ec1d0, transparent: true, opacity: 0.24, side: THREE.DoubleSide }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.015;
  group.add(ring);
  scene.add(group);
  const interactable = runtime.addInteractable({
    id: `clue-${def.id}`,
    position: group.position,
    radius: 1.15,
    priority: 4,
    enabled: () => !foundClues.has(def.id),
    label: '青い足跡を調べる',
    action: () => {
      foundClues.add(def.id);
      saveClues();
      updateProgress();
      runtime.showToast(`${def.title}　${def.detail}`, 3200);
    },
  });
  clueRefs.push({ def, group, ring, interactable });
}
updateProgress();

runtime.addInteractable({
  id: 'kuon',
  position: kuon.position,
  radius: 1.55,
  priority: 3,
  enabled: () => foundClues.size === 3,
  label: () => foundClues.size === 3 ? '久遠を見つけた' : '久遠の様子を見る',
  action: () => {
    if (foundClues.size < 3) {
      runtime.showToast('久遠は知らん顔。先に青い足跡を調べよう');
      return;
    }
    openPanel(casePanel);
  },
});
runtime.addInteractable({
  id: 'dango-person',
  position: dango.position,
  radius: 1.4,
  label: '団子屋さんに聞く',
  action: () => runtime.showToast('「青いのなら、ついさっき井戸の方へ走っていったよ」', 3000),
});
runtime.addInteractable({
  id: 'yui',
  position: yui.position,
  radius: 1.4,
  label: '結に話しかける',
  action: () => runtime.showToast('「鈴の音なら、桜の方から聞こえたよ」', 2800),
});

const returnGate = new THREE.Group();
returnGate.position.set(-7.55, 0.22, 6.45);
returnGate.rotation.y = Math.atan2(-returnGate.position.x, -returnGate.position.z);
for (const side of [-1, 1]) {
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.13, 1.72, 0.15), toon(0x38555b));
  post.position.set(side * 0.84, 0.88, 0);
  returnGate.add(post);
}
const returnTop = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.14, 0.17), toon(0xe2b65e));
returnTop.position.y = 1.7;
returnGate.add(returnTop);
const returnRing = new THREE.Mesh(
  new THREE.RingGeometry(0.45, 0.63, 48),
  new THREE.MeshBasicMaterial({ color: 0x5bc9d2, transparent: true, opacity: 0.46, side: THREE.DoubleSide }),
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
  action: () => warpTo({ href: worldHref('hub'), from: 'hankacho', to: 'hub', label: '世界港へ' }),
});

runtime.addFrame(({ elapsed, near }) => {
  waterUniforms.uTime.value = elapsed;
  lilyPads.forEach((pad) => {
    pad.rotation.z = Math.sin(elapsed * 0.3 + pad.userData.phase) * 0.16;
    pad.position.y = 0.258 + Math.sin(elapsed * 0.85 + pad.userData.phase) * 0.012;
  });
  streetLanterns.forEach(({ group, phase }) => {
    group.rotation.z = Math.sin(elapsed * 1.15 + phase) * 0.055;
    group.position.y += (Math.sin(elapsed * 1.15 + phase) * 0.018 - (group.userData.lastBob || 0));
    group.userData.lastBob = Math.sin(elapsed * 1.15 + phase) * 0.018;
  });
  cloudRefs.forEach(({ cloud, baseX, phase }) => {
    cloud.position.x = baseX + Math.sin(elapsed * 0.08 + phase) * 1.8;
  });
  clueRefs.forEach((ref, index) => {
    ref.ring.material.opacity = 0.2 + Math.sin(elapsed * 2.1 + index) * 0.1;
    ref.group.position.y = 0.27 + Math.sin(elapsed * 1.6 + index) * 0.018;
  });
  for (const petal of petalRefs) {
    const { x, z, phase, radius, y } = petal.userData;
    const a = elapsed * 0.35 + phase;
    petal.position.set(x + Math.cos(a) * radius, 0.4 + ((y + elapsed * 0.26) % 2.7), z + Math.sin(a * 1.3) * radius);
    petal.rotation.y = a * 2;
  }
  for (const { character, label } of characterRefs) {
    const distance = Math.hypot(runtime.avatar.position.x - character.position.x, runtime.avatar.position.z - character.position.z);
    const reveal = character === kuon && foundClues.size < 3 ? 0 : 1;
    label.material.opacity = reveal * (1 - THREE.MathUtils.smoothstep(distance, 3.2, 5.4));
  }
  for (const { label, position } of buildingLabels) {
    const distance = Math.hypot(runtime.avatar.position.x - position.x, runtime.avatar.position.z - position.z);
    label.material.opacity = 1 - THREE.MathUtils.smoothstep(distance, 3.4, 5.6);
  }
  returnRing.material.opacity = (near?.id === 'return-hub' ? 0.82 : 0.4) + Math.sin(elapsed * 1.8) * 0.08;
});

if (SEARCH.get('qa') === 'mission') {
  runtime.teleport(-0.95, 5.35);
  setTimeout(() => openPanel(missionPanel), 320);
} else if (SEARCH.get('qa') === 'complete') {
  clueDefs.forEach((clue) => foundClues.add(clue.id));
  metAnne = true;
  updateProgress();
  runtime.teleport(2.1, 5.15);
  setTimeout(() => openPanel(casePanel), 340);
} else if (SEARCH.get('qa') === 'episodes') {
  runtime.teleport(-1.8, -1.75);
  setTimeout(() => openPanel(episodesPanel), 340);
} else if (SEARCH.get('qa') === 'collision-view') {
  const resolved = runtime.teleport(-2.65, -1.3);
  document.body.dataset.collisionView = JSON.stringify({
    x: Math.round(resolved.x * 100) / 100,
    z: Math.round(resolved.z * 100) / 100,
  });
} else if (SEARCH.get('qa') === 'return') {
  runtime.teleport(-6.55, 5.6);
}

if (['localhost', '127.0.0.1'].includes(location.hostname)) {
  window.__hankacho = {
    clues: foundClues,
    collectAll() {
      clueDefs.forEach((clue) => foundClues.add(clue.id));
      updateProgress();
    },
    openCase() { openPanel(casePanel); },
  };
}

runtime.start();
