import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ---------- renderer / scene ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07070b);
scene.fog = new THREE.Fog(0x07070b, 9, 26);

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(1.9, 1.4, 2.7);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.5, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 1.0;
controls.maxDistance = 9;
controls.maxPolarAngle = 1.48;
controls.enablePan = false;

// ---------- lights（セルルック用：強いキー＋明るい環境光） ----------
scene.add(new THREE.HemisphereLight(0x9aa3cf, 0x2a2230, 1.1));

const key = new THREE.DirectionalLight(0xfff4e6, 2.6);
key.position.set(3, 5, 2);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
key.shadow.camera.left = -4;
key.shadow.camera.right = 4;
key.shadow.camera.top = 4;
key.shadow.camera.bottom = -4;
scene.add(key);

const pinkFill = new THREE.PointLight(0xff7bb0, 2, 12);
pinkFill.position.set(-2, 1.5, -1);
scene.add(pinkFill);

// ---------- canvas textures ----------
const canvasTex = (w, h, draw) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

const GREEN = '#b9e19f';
const GREEN_HI = '#d6f0bf';
const GREEN_SHADE = '#9ccb85';

// 顔（頭テクスチャ）：目・ほっぺ・口・鼻すじ・セルハイライト
const drawFace = (ctx, w, h, closed) => {
  ctx.fillStyle = GREEN;
  ctx.fillRect(0, 0, w, h);
  const cx = w * 0.25;
  const ey = h * 0.48;

  // セル塗りハイライト（頭頂左に大きな面）
  ctx.fillStyle = GREEN_HI;
  ctx.beginPath();
  ctx.ellipse(cx - 60, ey - 150, 90, 46, -0.35, 0, 7);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 120, ey - 130, 30, 16, 0.3, 0, 7);
  ctx.fill();

  // 鼻すじ（うっすら）
  ctx.strokeStyle = GREEN_SHADE;
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, ey - 10, 26, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();

  // ほっぺ（大きくぷに）
  for (const s of [-1, 1]) {
    const bx = cx + 114 * s, by = ey + 48;
    const g = ctx.createRadialGradient(bx, by, 22, bx, by, 48);
    g.addColorStop(0, 'rgba(246,160,178,0.95)');
    g.addColorStop(0.8, 'rgba(246,160,178,0.85)');
    g.addColorStop(1, 'rgba(246,160,178,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(bx, by, 48, 0, 7);
    ctx.fill();
  }

  for (const s of [-1, 1]) {
    const ex = cx + 64 * s;
    if (closed) {
      ctx.strokeStyle = '#241d26';
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(ex, ey - 10, 27, 0.35, Math.PI - 0.35);
      ctx.stroke();
    } else {
      // まんまる大きな目（黒縁→濃紫の瞳→下弦の大きな照り）
      ctx.fillStyle = '#241c26';
      ctx.beginPath();
      ctx.ellipse(ex, ey, 30, 35, 0, 0, 7);
      ctx.fill();
      ctx.fillStyle = '#4d3d50';
      ctx.beginPath();
      ctx.ellipse(ex, ey + 4, 23, 28, 0, 0, 7);
      ctx.fill();
      // 下半分の大きな白い照り
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.beginPath();
      ctx.ellipse(ex, ey + 13, 15, 11, 0, 0, 7);
      ctx.fill();
      // 上の小さなキラ
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(ex - 9 * s, ey - 11, 6, 0, 7);
      ctx.fill();
      // 目尻のまつげ
      ctx.strokeStyle = '#241c26';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ex + 22 * s, ey - 25);
      ctx.lineTo(ex + 32 * s, ey - 34);
      ctx.stroke();
    }
  }

  // 口（にこっとした一本線）
  ctx.strokeStyle = '#241c26';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx + 6, ey + 46, 29, 0.25, Math.PI * 0.72);
  ctx.stroke();
};
const faceOpen = canvasTex(1024, 512, (c, w, h) => drawFace(c, w, h, false));
const faceClosed = canvasTex(1024, 512, (c, w, h) => drawFace(c, w, h, true));

// 甲羅（Latheドーム用UV：u=一周で花弁5枚が並ぶ・v=中心→縁）
const shellTex = canvasTex(1024, 512, (ctx, w, h) => {
  const SEG = w / 5;
  ctx.fillStyle = '#f2bcc7';
  ctx.fillRect(0, 0, w, h);

  // 花弁プレート5枚（外端に桜の切れ込み）
  for (let k = 0; k < 5; k++) {
    const cx = k * SEG + SEG / 2;
    ctx.fillStyle = '#f6ccd6';
    ctx.strokeStyle = '#d8879f';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.ellipse(cx, 255, SEG * 0.42, 175, 0, 0, 7);
    ctx.fill();
    ctx.stroke();
    // 花弁の切れ込み（外端のV）
    ctx.fillStyle = '#f2bcc7';
    ctx.beginPath();
    ctx.moveTo(cx - 20, 452);
    ctx.lineTo(cx + 20, 452);
    ctx.lineTo(cx, 396);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#d8879f';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx - 18, 448);
    ctx.lineTo(cx, 400);
    ctx.lineTo(cx + 18, 448);
    ctx.stroke();
    // 花弁内の筋
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(216,135,159,0.55)';
    ctx.beginPath();
    ctx.moveTo(cx, 150);
    ctx.lineTo(cx, 330);
    ctx.stroke();
  }

  // 花弁の境界の割れ線
  ctx.strokeStyle = '#d8879f';
  ctx.lineWidth = 7;
  for (let k = 0; k < 5; k++) {
    const x = k * SEG;
    ctx.beginPath();
    ctx.moveTo(x, 95);
    ctx.quadraticCurveTo(x + 10, 260, x, 465);
    ctx.stroke();
  }

  // 中心の星（下端がギザギザの帯として一周）
  ctx.fillStyle = '#e2738f';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  for (let x = 0; x <= w; x += 8) {
    const b = 72 + 30 * Math.cos((x / w) * Math.PI * 10);
    ctx.lineTo(x, b);
  }
  ctx.lineTo(w, 0);
  ctx.closePath();
  ctx.fill();

  // 縁のリム帯
  ctx.fillStyle = '#eea9bb';
  ctx.fillRect(0, 468, w, h - 468);
  ctx.strokeStyle = '#c97690';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, 466);
  ctx.lineTo(w, 466);
  ctx.stroke();
});

const groundTex = canvasTex(1024, 1024, (ctx, w, h) => {
  const g = ctx.createRadialGradient(w / 2, h / 2, 60, w / 2, h / 2, w / 2);
  g.addColorStop(0, '#16161f');
  g.addColorStop(0.55, '#0e0e16');
  g.addColorStop(1, '#08080d');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 4200; i++) {
    ctx.fillStyle = `rgba(${Math.random() > 0.6 ? '150,160,200' : '40,40,60'},${0.02 + Math.random() * 0.05})`;
    const s = 1 + Math.random() * 3;
    ctx.fillRect(Math.random() * w, Math.random() * h, s, s);
  }
});

// ---------- toon materials ----------
const gradientMap = new THREE.DataTexture(new Uint8Array([165, 255]), 2, 1, THREE.RedFormat);
gradientMap.minFilter = THREE.NearestFilter;
gradientMap.magFilter = THREE.NearestFilter;
gradientMap.needsUpdate = true;
const toon = (color, map = null) => new THREE.MeshToonMaterial({ color, map, gradientMap });

const M = {
  face: toon(0xffffff, faceOpen),
  green: toon(0xb9e19f),
  belly: toon(0xf2f6e8),
  shell: toon(0xffffff, shellTex),
  sprout: toon(0xf29daa),
  claw: toon(0xe6e0ac),
};

// ---------- ground / sky ----------
const ground = new THREE.Mesh(
  new THREE.CircleGeometry(8, 64),
  new THREE.MeshStandardMaterial({ map: groundTex, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const mkRing = (r, color, opacity) => {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(r, r + 0.02, 96),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.002;
  scene.add(ring);
  return ring;
};
mkRing(2.4, 0x7be0ff, 0.18);
mkRing(4.0, 0xff7bb0, 0.14);

// stars
{
  const n = 350;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(28 + Math.random() * 30);
    v.y = Math.abs(v.y) + 2;
    pos.set([v.x, v.y, v.z], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xaab4d8, size: 0.09, transparent: true, opacity: 0.8 })));
}

// 桜の花びら
const petals = [];
{
  const geo = new THREE.PlaneGeometry(0.034, 0.024);
  for (let i = 0; i < 14; i++) {
    const p = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xf7a8c4, side: THREE.DoubleSide, transparent: true, opacity: 0.6 }));
    const a = Math.random() * Math.PI * 2;
    const r = 1.2 + Math.random() * 3;
    p.position.set(Math.cos(a) * r, 0.3 + Math.random() * 2.2, Math.sin(a) * r);
    p.userData = { a, r, y0: p.position.y, s: 0.3 + Math.random() * 0.5, ph: Math.random() * 7 };
    scene.add(p);
    petals.push(p);
  }
}

// prism column
const prism = new THREE.Group();
{
  const core = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 7, 16),
    new THREE.MeshBasicMaterial({ color: 0xeaf6ff, transparent: true, opacity: 0.85 })
  );
  const glow = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 7, 16),
    new THREE.MeshBasicMaterial({ color: 0x7be0ff, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  prism.add(core, glow);
  prism.position.set(0, 3.5, -3.4);
  scene.add(prism);
}

// ---------- TARTE（カメのニンジャ） ----------
const chara = new THREE.Group();
chara.rotation.y = 0.5;
scene.add(chara);

const mesh = (geo, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
};

// --- 脚（短いずんぐり足＋爪） ---
const mkLeg = (side) => {
  const hip = new THREE.Group();
  hip.position.set(0.11 * side, 0.2, 0);
  const leg = mesh(new THREE.CapsuleGeometry(0.078, 0.09, 8, 20), M.green, 0, -0.05, 0);
  hip.add(leg);
  const foot = mesh(new THREE.SphereGeometry(0.08, 24, 18), M.green, 0, -0.13, 0.02);
  foot.scale.set(0.95, 0.55, 1.2);
  hip.add(foot);
  for (let i = -1; i <= 1; i++) {
    const claw = mesh(new THREE.ConeGeometry(0.016, 0.045, 8), M.claw, i * 0.035, -0.15, 0.11);
    claw.rotation.x = Math.PI / 2.4;
    hip.add(claw);
  }
  chara.add(hip);
  return hip;
};
const legL = mkLeg(1);
const legR = mkLeg(-1);

// --- 胴体 ---
const body = new THREE.Group();
chara.add(body);

// 緑の胴（大きめ＝頭とのバランス改善）
const torso = mesh(new THREE.SphereGeometry(0.27, 48, 36), M.green, 0, 0.34, 0);
torso.scale.set(1, 0.95, 0.85);
body.add(torso);
// 白いおなか
const belly = mesh(new THREE.SphereGeometry(0.24, 48, 36), M.belly, 0, 0.31, 0.115);
belly.scale.set(0.75, 0.85, 0.5);
body.add(belly);
// 桜の甲羅：縁リップ付きドーム＋しっぽの切り欠き（頂点変形）
const shell = (() => {
  const pts = [
    [0.272, -0.075], [0.268, -0.05], [0.255, 0.0], [0.225, 0.07],
    [0.17, 0.125], [0.09, 0.16], [0.001, 0.17],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const geo = new THREE.LatheGeometry(pts, 72);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    if (z < -0.1) {
      const edgeK = THREE.MathUtils.clamp((0.05 - y) / 0.125, 0, 1);
      const lift = 0.12 * edgeK * Math.exp(-(x * x) / 0.0064) * THREE.MathUtils.clamp((-z - 0.1) / 0.17, 0, 1);
      pos.setZ(i, z + lift);
    }
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, M.shell);
  m.castShadow = true;
  m.rotation.x = -Math.PI / 2; // ドームの頂点を背中側(-z)へ
  m.position.set(0, 0.37, -0.115);
  return m;
})();
body.add(shell);
// しっぽ（甲羅の切り欠きの隙間から出る）
const tail = mesh(new THREE.ConeGeometry(0.05, 0.18, 12), M.green, 0, 0.15, -0.24);
tail.rotation.x = Math.PI / 2 + 0.35;
body.add(tail);

// --- 腕（ぺたぺたフリッパー＋爪） ---
const mkArm = (side) => {
  const shoulder = new THREE.Group();
  shoulder.position.set(0.205 * side, 0.43, 0);
  shoulder.rotation.z = 0.28 * side;
  const arm = mesh(new THREE.CapsuleGeometry(0.07, 0.13, 8, 20), M.green, 0, -0.09, 0);
  arm.scale.set(1, 1, 0.62);
  shoulder.add(arm);
  // 手のひらの淡色
  const palm = mesh(new THREE.SphereGeometry(0.062, 20, 16), M.belly, 0, -0.155, 0.012);
  palm.scale.set(0.9, 0.75, 0.5);
  shoulder.add(palm);
  for (let i = -1; i <= 1; i++) {
    const claw = mesh(new THREE.BoxGeometry(0.026, 0.03, 0.02), M.claw, i * 0.032, -0.185, 0.01);
    shoulder.add(claw);
  }
  body.add(shoulder);
  return shoulder;
};
const armL = mkArm(1);
const armR = mkArm(-1);

// --- 頭（大きなまんまる） ---
const head = new THREE.Group();
head.position.y = 0.58;
body.add(head);

const headMesh = mesh(new THREE.SphereGeometry(0.295, 72, 56), M.face, 0, 0.155, 0.01);
headMesh.scale.set(1.05, 1, 0.97);
head.add(headMesh);

// 頭の若葉（先の尖ったパキッとした双葉＝2D輪郭の押し出し）
const sprout = new THREE.Group();
sprout.position.set(0, 0.44, 0.02);
{
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0);
  leafShape.quadraticCurveTo(0.055, 0.15, 0.21, 0.125);
  leafShape.quadraticCurveTo(0.1, 0.005, 0, 0);
  const leafGeo = new THREE.ExtrudeGeometry(leafShape, { depth: 0.05, bevelEnabled: false, curveSegments: 16 });
  leafGeo.translate(0, 0, -0.025);
  for (const s of [1, -1]) {
    const leaf = new THREE.Mesh(leafGeo, M.sprout);
    leaf.castShadow = true;
    leaf.scale.set(s, 1, 1);
    leaf.rotation.z = 0.22 * s;
    sprout.add(leaf);
  }
  sprout.add(mesh(new THREE.SphereGeometry(0.028, 12, 10), M.sprout, 0, 0.0, 0));
}
head.add(sprout);

// ---------- 輪郭線（インバーテッドハル・常時ON） ----------
const outlineMat = (thickness) => new THREE.ShaderMaterial({
  side: THREE.BackSide,
  uniforms: { uT: { value: thickness }, uC: { value: new THREE.Color(0x171219) } },
  vertexShader: `
    uniform float uT;
    void main() {
      vec3 p = position + normal * uT;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }`,
  fragmentShader: `
    uniform vec3 uC;
    void main() { gl_FragColor = vec4(uC, 1.0); }`,
});

{
  const targets = [];
  chara.traverse((o) => { if (o.isMesh) targets.push(o); });
  for (const m of targets) {
    m.geometry.computeBoundingSphere();
    const r = m.geometry.boundingSphere.radius;
    const outline = new THREE.Mesh(m.geometry, outlineMat(THREE.MathUtils.clamp(r * 0.12, 0.006, 0.016)));
    outline.userData.isOutline = true;
    m.add(outline);
  }
}

// ---------- click-to-move / 自動さんぽ ----------
const marker = new THREE.Mesh(
  new THREE.RingGeometry(0.08, 0.11, 32),
  new THREE.MeshBasicMaterial({ color: 0xf7a8c4, transparent: true, opacity: 0 })
);
marker.rotation.x = -Math.PI / 2;
marker.position.y = 0.004;
scene.add(marker);

const raycaster = new THREE.Raycaster();
const target = new THREE.Vector3(0, 0, 0);
let moving = false;
let idleT = 0;
let downPos = null;

renderer.domElement.addEventListener('pointerdown', (e) => (downPos = [e.clientX, e.clientY]));
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!downPos) return;
  const dx = e.clientX - downPos[0], dy = e.clientY - downPos[1];
  downPos = null;
  if (dx * dx + dy * dy > 36) return;
  const ndc = new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  const hit = raycaster.intersectObject(ground)[0];
  if (!hit) return;
  target.copy(hit.point);
  target.clampLength(0, 6.5);
  moving = true;
  marker.position.set(target.x, 0.004, target.z);
  marker.material.opacity = 0.9;
});

const keys = {};
addEventListener('keydown', (e) => (keys[e.key.toLowerCase()] = true));
addEventListener('keyup', (e) => (keys[e.key.toLowerCase()] = false));

// ---------- animation ----------
const clock = new THREE.Clock();
let walkPhase = 0;
let speedSmooth = 0;
let blinkT = 1.6;
let blink = 0;
let prevYaw = chara.rotation.y;

const lerpAngle = (a, b, t) => {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
};

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  const kx = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
  const kz = (keys.s ? 1 : 0) - (keys.w ? 1 : 0);
  if (kx || kz) {
    const fwd = new THREE.Vector3();
    camera.getWorldDirection(fwd);
    fwd.y = 0;
    fwd.normalize();
    const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0));
    const dir = fwd.multiplyScalar(-kz).add(right.multiplyScalar(kx)).normalize();
    target.copy(chara.position).add(dir.multiplyScalar(0.6));
    target.clampLength(0, 6.5);
    moving = true;
    marker.material.opacity = 0;
  }

  if (!moving) {
    idleT += dt;
    if (idleT > 2.2) {
      const a = Math.random() * Math.PI * 2;
      const r = 1.2 + Math.random() * 2.4;
      target.set(chara.position.x + Math.cos(a) * r, 0, chara.position.z + Math.sin(a) * r);
      target.clampLength(0, 5.5);
      moving = true;
      idleT = 0;
      marker.position.set(target.x, 0.004, target.z);
      marker.material.opacity = 0.35;
    }
  } else {
    idleT = 0;
  }

  let speed = 0;
  if (moving) {
    const to = new THREE.Vector3().subVectors(target, chara.position);
    to.y = 0;
    const dist = to.length();
    if (dist < 0.05) {
      moving = false;
    } else {
      speed = Math.min(1.0, dist * 4);
      const step = Math.min(dist, speed * dt);
      chara.position.add(to.normalize().multiplyScalar(step));
      chara.rotation.y = lerpAngle(chara.rotation.y, Math.atan2(to.x, to.z), 1 - Math.pow(0.001, dt));
      walkPhase += step * 13;
    }
  }
  speedSmooth += (speed - speedSmooth) * Math.min(1, dt * 10);
  const w = Math.min(1, speedSmooth / 1.0);
  const yawVel = (chara.rotation.y - prevYaw) / Math.max(dt, 1e-4);
  prevYaw = chara.rotation.y;

  const p = walkPhase;

  // ずんぐり足のワドル（よちよち）
  legL.rotation.x = Math.sin(p) * 0.55 * w;
  legR.rotation.x = -Math.sin(p) * 0.55 * w;

  // フリッパーはぱたぱた
  armL.rotation.x = -Math.sin(p) * 0.4 * w + Math.sin(t * 2.1) * 0.05 * (1 - w);
  armR.rotation.x = Math.sin(p) * 0.4 * w + Math.sin(t * 2.1 + 1) * 0.05 * (1 - w);
  armL.rotation.z = 0.28 + Math.abs(Math.sin(p)) * 0.15 * w + Math.sin(t * 2.4) * 0.03 * (1 - w);
  armR.rotation.z = -0.28 - Math.abs(Math.sin(p + 1)) * 0.15 * w - Math.sin(t * 2.4 + 0.8) * 0.03 * (1 - w);

  // 体：左右にころころ揺れるワドル＋呼吸のスクワッシュ
  body.position.y = Math.abs(Math.cos(p)) * 0.05 * w;
  body.rotation.x = 0.05 * w;
  body.rotation.z = Math.sin(p) * 0.09 * w;
  body.rotation.y = Math.sin(p) * 0.06 * w;
  const breathe = 1 + Math.sin(t * 2.2) * 0.012 * (1 - w);
  body.scale.set(1, breathe, 1);

  // 頭は逆位相でぷるぷる＋見回し
  head.rotation.z = -Math.sin(p) * 0.05 * w + Math.sin(t * 1.1) * 0.03 * (1 - w);
  head.rotation.y = Math.sin(t * 0.7) * 0.06 * (1 - w);

  // 桜の芽としっぽ
  sprout.rotation.z = Math.sin(p * 1.0 - 0.8) * 0.16 * w + Math.sin(t * 2.6) * 0.06;
  sprout.rotation.x = THREE.MathUtils.clamp(-yawVel * 0.04, -0.25, 0.25);
  tail.rotation.z = Math.sin(t * 3.1) * 0.25 + Math.sin(p) * 0.15 * w;

  // まばたき
  blinkT -= dt;
  if (blinkT <= 0) { blink = 0.12; blinkT = 1.8 + Math.random() * 2.4; }
  if (blink > 0) blink -= dt;
  const nextMap = blink > 0 ? faceClosed : faceOpen;
  if (M.face.map !== nextMap) {
    M.face.map = nextMap;
    M.face.needsUpdate = true;
  }

  for (const pe of petals) {
    const u = pe.userData;
    u.a += dt * 0.08 * u.s;
    pe.position.x = Math.cos(u.a) * u.r;
    pe.position.z = Math.sin(u.a) * u.r;
    pe.position.y = u.y0 + Math.sin(t * 0.7 + u.ph) * 0.18;
    pe.rotation.x += dt * 1.2 * u.s;
    pe.rotation.y += dt * 0.9 * u.s;
  }

  marker.material.opacity = Math.max(0, marker.material.opacity - dt * 0.8);
  marker.scale.setScalar(1 + Math.sin(t * 6) * 0.08);
  prism.children[1].material.opacity = 0.08 + Math.sin(t * 1.4) * 0.04;

  controls.update();
  renderer.render(scene, camera);
}
animate();

window.__poc = { chara, target };

addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
