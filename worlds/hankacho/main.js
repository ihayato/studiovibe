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

const [kvTexture, logoTexture, anneTexture, yuiTexture, shionTexture, kuonTexture, dangoTexture] = await Promise.all([
  loadTexture('/worlds/hankacho/main-kv.jpg'),
  loadTexture('/worlds/hankacho/logo-ninja-hankacho-trim.webp'),
  loadTexture('/worlds/hankacho/anne.webp'),
  loadTexture('/worlds/hankacho/yui.webp'),
  loadTexture('/worlds/hankacho/shion.webp'),
  loadTexture('/worlds/hankacho/kuon.webp'),
  loadTexture('/worlds/hankacho/dangoyasan.webp'),
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

const street = new THREE.Group();
const streetBed = new THREE.Mesh(
  new THREE.PlaneGeometry(4.55, 19.15),
  new THREE.MeshStandardMaterial({ color: 0x766f63, roughness: 1, metalness: 0 }),
);
streetBed.rotation.x = -Math.PI / 2;
streetBed.position.set(0, 0.239, -0.2);
streetBed.receiveShadow = true;
street.add(streetBed);

const stonePalette = [0x9f9b8f, 0x8f9187, 0xaaa596, 0x7f857f, 0x989487];
const stoneMaterials = stonePalette.map((color) => new THREE.MeshStandardMaterial({ color, roughness: 0.98, metalness: 0 }));
for (let row = 0; row < 19; row++) {
  for (let column = -1; column <= 1; column++) {
    const seed = row * 7 + column * 3;
    const width = 1.16 + Math.sin(seed * 2.31) * 0.09;
    const depth = 0.78 + Math.cos(seed * 1.73) * 0.07;
    const stone = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.045, depth),
      stoneMaterials[(row * 3 + column + 8) % stoneMaterials.length],
    );
    stone.position.set(
      column * 1.28 + Math.sin(seed * 1.19) * 0.045,
      0.263,
      8.35 - row * 0.95 + Math.cos(seed * 1.41) * 0.04,
    );
    stone.rotation.y = Math.sin(seed * 0.83) * 0.035;
    stone.receiveShadow = true;
    street.add(stone);
  }
}

for (const x of [-0.73, 0.73]) {
  const rut = new THREE.Mesh(
    new THREE.PlaneGeometry(0.16, 18.7),
    new THREE.MeshBasicMaterial({ color: 0x655f53, transparent: true, opacity: 0.12, depthWrite: false }),
  );
  rut.rotation.x = -Math.PI / 2;
  rut.position.set(x, 0.289, -0.18);
  street.add(rut);
}

for (const side of [-1, 1]) {
  const gutterStone = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.12, 19.0),
    new THREE.MeshStandardMaterial({ color: 0x6f7770, roughness: 0.94, metalness: 0 }),
  );
  gutterStone.position.set(side * 2.48, 0.23, -0.2);
  gutterStone.receiveShadow = true;
  street.add(gutterStone);
  const gutterWater = new THREE.Mesh(
    new THREE.PlaneGeometry(0.19, 18.75),
    new THREE.MeshStandardMaterial({ color: 0x4f8e96, roughness: 0.32, metalness: 0.12, emissive: 0x1e5961, emissiveIntensity: 0.08 }),
  );
  gutterWater.rotation.x = -Math.PI / 2;
  gutterWater.position.set(side * 2.48, 0.298, -0.2);
  street.add(gutterWater);
  for (let index = 0; index < 19; index++) {
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.82), toon(index % 2 ? 0x7f857b : 0x898d82));
    curb.position.set(side * 2.22, 0.3, 8.32 - index * 0.95);
    curb.receiveShadow = true;
    street.add(curb);
  }
}

for (const z of [4.3, 0.15, -4.15]) {
  for (const side of [-1, 1]) {
    const bridge = new THREE.Group();
    for (let plank = -2; plank <= 2; plank++) {
      const board = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.075, 0.13), toon(plank % 2 ? 0x775a3d : 0x856647));
      board.position.set(side * 2.58, 0.36, z + plank * 0.14);
      board.castShadow = board.receiveShadow = true;
      bridge.add(board);
    }
    street.add(bridge);
  }
}
scene.add(street);

const buildingRefs = [];
const buildingLabels = [];
const timberMaterial = toon(0x574334);
const darkTimberMaterial = toon(0x40362f);
const shojiMaterial = new THREE.MeshStandardMaterial({
  color: 0xeee2bd,
  emissive: 0x8d733d,
  emissiveIntensity: 0.12,
  roughness: 0.9,
});

const addLatticePanel = (group, { x, y, z, span, height, front }) => {
  const backing = new THREE.Mesh(new THREE.BoxGeometry(0.035, height, span), shojiMaterial);
  backing.position.set(x, y, z);
  group.add(backing);
  const faceX = x + front * 0.025;
  for (let index = -2; index <= 2; index++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.03, height + 0.035, 0.025), darkTimberMaterial);
    slat.position.set(faceX, y, z + index * span * 0.18);
    group.add(slat);
  }
  for (let index = -1; index <= 1; index++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.027, span + 0.035), darkTimberMaterial);
    slat.position.set(faceX, y + index * height * 0.27, z);
    group.add(slat);
  }
};

const addMachiyaRoof = (group, { width, depth, height, color }) => {
  const baseY = height + 0.25;
  const span = width / 2 + 0.25;
  const rise = Math.min(0.72, width * 0.21);
  const slopeLength = Math.hypot(span, rise);
  const angle = Math.atan2(rise, span);
  const roofMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.78, metalness: 0.08 });
  const tileMaterial = new THREE.MeshStandardMaterial({ color: 0x303f42, roughness: 0.7, metalness: 0.12 });
  for (const side of [-1, 1]) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(slopeLength, 0.11, depth + 0.5), roofMaterial);
    panel.position.set(side * span * 0.5, baseY + rise * 0.5, 0);
    panel.rotation.z = -side * angle;
    panel.castShadow = panel.receiveShadow = true;
    group.add(panel);
    for (let row = 1; row <= 5; row++) {
      const progress = row / 6;
      const tile = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, depth + 0.54, 7), tileMaterial);
      tile.rotation.x = Math.PI / 2;
      tile.position.set(side * span * progress, baseY + rise * (1 - progress) + 0.075, 0);
      group.add(tile);
    }
    const fascia = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.17, depth + 0.58), darkTimberMaterial);
    fascia.position.set(side * span, baseY, 0);
    fascia.castShadow = true;
    group.add(fascia);
  }
  const ridge = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, depth + 0.62, 10), tileMaterial);
  ridge.rotation.x = Math.PI / 2;
  ridge.position.set(0, baseY + rise + 0.08, 0);
  ridge.castShadow = true;
  group.add(ridge);
};

const makeBuilding = ({ x, z, width, depth, height, wall, roof, sign = null }) => {
  const group = new THREE.Group();
  group.position.set(x, 0.22, z);
  const front = x < 0 ? 1 : -1;
  const frontX = front * (width / 2 + 0.025);
  const foundation = new THREE.Mesh(new THREE.BoxGeometry(width + 0.22, 0.2, depth + 0.22), toon(0x73736b));
  foundation.position.y = 0.1;
  foundation.receiveShadow = true;
  group.add(foundation);
  const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), toon(wall));
  body.position.y = height / 2 + 0.2;
  body.castShadow = body.receiveShadow = true;
  group.add(body);
  addMachiyaRoof(group, { width, depth, height, color: roof });
  const eave = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.13, depth + 0.34), darkTimberMaterial);
  eave.position.set(front * (width / 2 + 0.22), height - 0.08, 0);
  eave.castShadow = true;
  group.add(eave);
  addOutlines(group, { color: 0x263438, min: 0.004, max: 0.011 });

  for (const px of [-1, 1]) {
    for (const pz of [-1, 1]) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.085, height + 0.08, 0.085), timberMaterial);
      beam.position.set(px * (width / 2 - 0.045), height / 2 + 0.2, pz * (depth / 2 - 0.045));
      group.add(beam);
    }
  }
  for (const beamY of [0.31, 1.22, height - 0.18]) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.09, depth + 0.045), timberMaterial);
    beam.position.set(frontX + front * 0.025, beamY, 0);
    group.add(beam);
  }
  for (const beamZ of [-depth / 2 + 0.08, -depth / 6, depth / 6, depth / 2 - 0.08]) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.07, Math.min(1.08, height - 0.42), 0.065), timberMaterial);
    beam.position.set(frontX + front * 0.03, 0.75, beamZ);
    group.add(beam);
  }

  const engawa = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.13, depth * 0.92), toon(0x806044));
  engawa.position.set(front * (width / 2 + 0.23), 0.28, 0);
  engawa.castShadow = engawa.receiveShadow = true;
  group.add(engawa);
  for (let plank = -2; plank <= 2; plank++) {
    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.57, 0.018, 0.018), darkTimberMaterial);
    seam.position.set(front * (width / 2 + 0.24), 0.352, plank * depth * 0.17);
    group.add(seam);
  }

  const lowerSpan = depth * 0.27;
  addLatticePanel(group, { x: frontX + front * 0.045, y: 0.78, z: -depth * 0.31, span: lowerSpan, height: 0.78, front });
  addLatticePanel(group, { x: frontX + front * 0.045, y: 0.78, z: depth * 0.31, span: lowerSpan, height: 0.78, front });
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.94, Math.min(0.48, depth * 0.2)), toon(0x4f3c31));
  door.position.set(frontX + front * 0.055, 0.76, 0);
  group.add(door);
  const doorPull = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), toon(0xc8a85f));
  doorPull.position.set(frontX + front * 0.085, 0.76, depth * 0.07);
  group.add(doorPull);

  if (height >= 2.08) {
    addLatticePanel(group, { x: frontX + front * 0.04, y: height - 0.48, z: -depth * 0.25, span: depth * 0.34, height: 0.52, front });
    addLatticePanel(group, { x: frontX + front * 0.04, y: height - 0.48, z: depth * 0.25, span: depth * 0.34, height: 0.52, front });
  }
  if (sign) {
    const label = makeWorldLabel(sign.en, sign.jp, {
      color: sign.color || '#2b7580', paper: 'rgba(245, 235, 207, .94)', border: 'rgba(72,57,38,.28)', scale: [1, 0.28],
    });
    label.position.set(front * (width / 2 + 0.42), height + 0.77, 0);
    group.add(label);
    buildingLabels.push({ label, position: new THREE.Vector3(x, 0.22, z) });
    const noren = new THREE.Group();
    noren.position.set(front * (width / 2 + 0.1), 1.3, 0);
    noren.rotation.y = front > 0 ? Math.PI / 2 : -Math.PI / 2;
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.08, 8), toon(0x5f4936));
    rod.rotation.z = Math.PI / 2;
    rod.position.y = 0.33;
    noren.add(rod);
    for (let panel = -1; panel <= 1; panel++) {
      const cloth = new THREE.Mesh(
        new THREE.PlaneGeometry(0.32, 0.58),
        new THREE.MeshStandardMaterial({ color: sign.en === 'DANGO' ? 0xd56b88 : 0x426d73, roughness: 0.92, side: THREE.DoubleSide }),
      );
      cloth.position.x = panel * 0.33;
      noren.add(cloth);
    }
    group.add(noren);
    const hangingSign = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.72, 0.34), toon(0x765636));
    hangingSign.position.set(front * (width / 2 + 0.43), 1.72, -depth * 0.38);
    hangingSign.castShadow = true;
    group.add(hangingSign);
  }
  scene.add(group);
  runtime.addBoxObstacle(x, z, width + 0.22, depth + 0.22, 0, 0.16);
  buildingRefs.push(group);
  return group;
};

makeBuilding({ x: -4.45, z: 4.3, width: 3.1, depth: 2.5, height: 2.0, wall: 0xe0d6bd, roof: 0x3b484a, sign: { en: 'DANGO', jp: '団子屋', color: '#a64f68' } });
makeBuilding({ x: 4.5, z: 4.2, width: 3.0, depth: 2.4, height: 2.25, wall: 0xd9d5c3, roof: 0x465154, sign: { en: 'KIMONO', jp: '呉服屋', color: '#376f78' } });
makeBuilding({ x: -4.6, z: 0.2, width: 3.25, depth: 2.8, height: 2.45, wall: 0xe3ddcb, roof: 0x374346, sign: { en: 'TEA', jp: '茶舗', color: '#526e4e' } });
makeBuilding({ x: 4.65, z: -0.35, width: 3.15, depth: 2.8, height: 2.1, wall: 0xd8cbb5, roof: 0x4a4b4f, sign: { en: 'BOOKS', jp: '本屋', color: '#596a86' } });
makeBuilding({ x: -4.55, z: -4.1, width: 3.1, depth: 2.6, height: 2.1, wall: 0xd7d8ca, roof: 0x3d4b4d, sign: { en: 'LANTERN', jp: '提灯屋', color: '#9b5a55' } });
makeBuilding({ x: 4.55, z: -4.2, width: 3.35, depth: 2.7, height: 2.35, wall: 0xd1bea4, roof: 0x44474b, sign: { en: 'SMITHY', jp: '鍛冶場', color: '#a54f42' } });

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

const dangoStickMaterial = toon(0x8b633d);
const dangoMaterials = [toon(0xe992a9), toon(0xf1e7c9), toon(0x82a66d)];
const makeDangoSkewer = () => {
  const skewer = new THREE.Group();
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.75, 7), dangoStickMaterial);
  stick.position.y = 1.04;
  skewer.add(stick);
  [1.25, 1.08, 0.91].forEach((y, index) => {
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.082, 14, 10), dangoMaterials[index]);
    ball.position.y = y;
    ball.scale.y = 0.94;
    skewer.add(ball);
  });
  return skewer;
};

const makeStall = (x, z, color) => {
  const stall = new THREE.Group();
  stall.position.set(x, 0.22, z);
  const table = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.13, 0.72), toon(0x806044));
  table.position.y = 0.72;
  stall.add(table);
  for (const side of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 1.55, 8), toon(0x684c37));
    post.position.set(side * 0.55, 0.78, -0.27);
    stall.add(post);
  }
  const lowerBrace = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.07, 0.08), toon(0x684c37));
  lowerBrace.position.set(0, 0.28, -0.27);
  stall.add(lowerBrace);
  const awning = new THREE.Mesh(
    new THREE.BoxGeometry(1.48, 0.08, 0.94),
    new THREE.MeshStandardMaterial({ color, roughness: 0.88 }),
  );
  awning.position.y = 1.52;
  awning.rotation.x = -0.08;
  stall.add(awning);
  for (let stripe = -2; stripe <= 2; stripe++) {
    if (stripe % 2 === 0) continue;
    const cloth = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.012, 0.96),
      new THREE.MeshStandardMaterial({ color: 0xf0dfbd, roughness: 0.94 }),
    );
    cloth.position.set(stripe * 0.245, 1.565, 0);
    cloth.rotation.x = -0.08;
    stall.add(cloth);
  }
  const tray = new THREE.Mesh(new THREE.BoxGeometry(1.03, 0.055, 0.34), toon(0x4d4035));
  tray.position.set(0, 0.81, 0.02);
  stall.add(tray);
  for (let index = 0; index < 5; index++) {
    const skewer = makeDangoSkewer();
    skewer.position.set(-0.4 + index * 0.2, 0, 0.02 + Math.abs(index - 2) * 0.012);
    skewer.rotation.z = (index - 2) * 0.025;
    stall.add(skewer);
  }
  addOutlines(stall, { color: 0x3a4040, min: 0.004, max: 0.011 });
  scene.add(stall);
  runtime.addBoxObstacle(x, z, 1.32, 0.82, 0, 0.04);
  return stall;
};
makeStall(1.82, -2.0, 0x4d8790);
makeStall(-1.82, 1.72, 0xd17d98);

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
  const foot = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.48), toon(0x77776d));
  foot.position.set(side * 1.92, 0.11, 0);
  gate.add(foot);
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.35, 0.3), toon(0x34494b));
  post.position.set(side * 1.92, 1.74, 0);
  post.castShadow = true;
  gate.add(post);
  runtime.addObstacle(side * 1.92, -7.2, 0.23);
}
const gateTop = new THREE.Mesh(new THREE.BoxGeometry(4.65, 0.26, 0.34), toon(0x263e42));
gateTop.position.y = 3.28;
gate.add(gateTop);
for (const side of [-1, 1]) {
  const roofPanel = new THREE.Mesh(
    new THREE.BoxGeometry(4.92, 0.11, 0.62),
    new THREE.MeshStandardMaterial({ color: 0x354447, roughness: 0.75, metalness: 0.08 }),
  );
  roofPanel.position.set(0, 3.51, side * 0.22);
  roofPanel.rotation.x = side * 0.34;
  roofPanel.castShadow = true;
  gate.add(roofPanel);
}
const gateRidge = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 4.98, 10), toon(0x26383b));
gateRidge.rotation.z = Math.PI / 2;
gateRidge.position.y = 3.67;
gate.add(gateRidge);
const gateBoard = new THREE.Mesh(new THREE.BoxGeometry(2.08, 1.4, 0.12), toon(0xeee5ce));
gateBoard.position.set(0, 2.62, 0.03);
gateBoard.castShadow = true;
gate.add(gateBoard);
for (const x of [-1.09, 1.09]) {
  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.52, 0.16), toon(0x6b4e36));
  frame.position.set(x, 2.62, 0.02);
  gate.add(frame);
}
for (const y of [1.88, 3.36]) {
  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.28, 0.1, 0.16), toon(0x6b4e36));
  frame.position.set(0, y, 0.02);
  gate.add(frame);
}
const gateLogo = makeImagePlane(logoTexture, 1.86, 1.24);
gateLogo.position.set(0, 2.62, 0.102);
gate.add(gateLogo);
addOutlines(gate, { color: 0x203034, min: 0.005, max: 0.013 });
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
    color: '#287d88', paper: 'rgba(248, 239, 214, .93)', border: 'rgba(38,95,103,.28)', scale: [0.98, 0.275],
  });
  label.position.set(x, 0.38 + height, z);
  scene.add(label);
  characterRefs.push({ character, label, shadow, stand });
  return character;
};

const anne = makeCharacter(anneTexture, { x: -1.85, z: 5.45, width: 1.35, height: 2.65, name: 'あんね', en: 'ANNE' });
const dango = makeCharacter(dangoTexture, { x: -2.24, z: 3.75, width: 1.22, height: 2.4, name: '団子屋さん', en: 'DANGO' });
const kuon = makeCharacter(kuonTexture, { x: 2.28, z: 5.2, width: 1.35, height: 2.55, name: '久遠', en: 'KUON' });
runtime.addObstacle(anne.position.x, anne.position.z, 0.28);
runtime.addObstacle(dango.position.x, dango.position.z, 0.26);

const characterPanel = new THREE.Group();
characterPanel.position.set(-1.3, 0.22, -1.75);
const characterPanelShadow = new THREE.Mesh(
  new THREE.CircleGeometry(0.82, 36),
  new THREE.MeshBasicMaterial({ color: 0x24434a, transparent: true, opacity: 0.2, depthWrite: false }),
);
characterPanelShadow.rotation.x = -Math.PI / 2;
characterPanelShadow.position.y = 0.012;
characterPanelShadow.scale.y = 0.38;
characterPanel.add(characterPanelShadow);
const characterPanelBase = new THREE.Mesh(
  new THREE.BoxGeometry(1.5, 0.12, 0.36),
  toon(0x71543c),
);
characterPanelBase.position.y = 0.07;
characterPanelBase.castShadow = characterPanelBase.receiveShadow = true;
characterPanel.add(characterPanelBase);
const characterPanelLip = new THREE.Mesh(
  new THREE.BoxGeometry(1.38, 0.05, 0.3),
  toon(0xd1b47b),
);
characterPanelLip.position.y = 0.145;
characterPanel.add(characterPanelLip);

const characterCutouts = new THREE.Group();
const addCharacterCutout = (texture, { x, z, width, height }) => {
  const outline = makeImagePlane(texture, width * 1.045, height * 1.045);
  outline.material.color.set(0x203034);
  outline.material.opacity = 0.78;
  outline.position.set(x, 0.17 + height / 2, z - 0.012);
  characterCutouts.add(outline);
  const art = makeImagePlane(texture, width, height);
  art.position.set(x, 0.17 + height / 2, z);
  characterCutouts.add(art);
};
addCharacterCutout(yuiTexture, { x: -0.34, z: 0.015, width: 0.86, height: 1.74 });
addCharacterCutout(shionTexture, { x: 0.37, z: 0.035, width: 0.87, height: 1.76 });
characterPanel.add(characterCutouts);
addOutlines(characterPanelBase, { color: 0x343733, min: 0.006, max: 0.013 });
scene.add(characterPanel);
runtime.addBoxObstacle(characterPanel.position.x, characterPanel.position.z, 1.58, 0.48, 0, 0.03);
runtime.addFrame(() => {
  const dx = runtime.camera.position.x - characterPanel.position.x;
  const dz = runtime.camera.position.z - characterPanel.position.z;
  characterPanel.rotation.y = Math.atan2(dx, dz);
});

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
  position: characterPanel.position,
  radius: 1.35,
  label: '犯科町の物語を見る',
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
  const paw = makePaw();
  paw.scale.setScalar(1.18);
  group.add(paw);
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
    label.material.opacity = reveal * (1 - THREE.MathUtils.smoothstep(distance, 1.5, 2.1));
  }
  for (const { label, position } of buildingLabels) {
    const distance = Math.hypot(runtime.avatar.position.x - position.x, runtime.avatar.position.z - position.z);
    label.material.opacity = 1 - THREE.MathUtils.smoothstep(distance, 2.5, 3.8);
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
} else if (SEARCH.get('qa') === 'standee') {
  runtime.teleport(-1.3, -0.45);
} else if (SEARCH.get('qa') === 'collision-view') {
  const resolved = runtime.teleport(-2.65, -1.3);
  document.body.dataset.collisionView = JSON.stringify({
    x: Math.round(resolved.x * 100) / 100,
    z: Math.round(resolved.z * 100) / 100,
  });
} else if (SEARCH.get('qa') === 'gate') {
  runtime.teleport(0, -5.45);
} else if (SEARCH.get('qa') === 'dango') {
  runtime.teleport(-0.35, 3.0);
} else if (SEARCH.get('qa') === 'clue') {
  runtime.teleport(-0.2, 4.45);
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
