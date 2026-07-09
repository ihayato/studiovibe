import * as THREE from 'three';
import { canvasTex, toon, addOutlines } from './toon.js';

// ---------- テクスチャ ----------
const GREEN = '#b9e19f';
const GREEN_HI = '#d6f0bf';
const GREEN_SHADE = '#9ccb85';

const drawFace = (ctx, w, h, closed) => {
  ctx.fillStyle = GREEN;
  ctx.fillRect(0, 0, w, h);
  const cx = w * 0.25;
  const ey = h * 0.48;

  // セル塗りハイライト
  ctx.fillStyle = GREEN_HI;
  ctx.beginPath();
  ctx.ellipse(cx - 60, ey - 150, 90, 46, -0.35, 0, 7);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 120, ey - 130, 30, 16, 0.3, 0, 7);
  ctx.fill();

  // 鼻すじ
  ctx.strokeStyle = GREEN_SHADE;
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, ey - 10, 26, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();

  // ほっぺ
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
      ctx.fillStyle = '#241c26';
      ctx.beginPath();
      ctx.ellipse(ex, ey, 30, 35, 0, 0, 7);
      ctx.fill();
      ctx.fillStyle = '#4d3d50';
      ctx.beginPath();
      ctx.ellipse(ex, ey + 4, 23, 28, 0, 0, 7);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.beginPath();
      ctx.ellipse(ex, ey + 13, 15, 11, 0, 0, 7);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(ex - 9 * s, ey - 11, 6, 0, 7);
      ctx.fill();
      ctx.strokeStyle = '#241c26';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ex + 22 * s, ey - 25);
      ctx.lineTo(ex + 32 * s, ey - 34);
      ctx.stroke();
    }
  }

  // 口
  ctx.strokeStyle = '#241c26';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx + 6, ey + 46, 29, 0.25, Math.PI * 0.72);
  ctx.stroke();
};

// ---------- 甲羅の色バリアント ----------
const hsl = (h, s, l) => `hsl(${h}, ${s}%, ${l}%)`;
const mkShellPalette = (h) => ({
  base: hsl(h, 60, 84),
  plateFill: hsl(h, 62, 88),
  plateLine: hsl(h, 45, 66),
  centerLine: `hsla(${h}, 45%, 66%, 0.55)`,
  scallop: hsl(h, 55, 64),
  skirt: hsl(h, 55, 80),
  skirtLine: hsl(h, 40, 62),
  sprout: hsl(h, 72, 78),
});

export const SHELLS = [
  { // 桃 — 現行の正典カラー（手調整の原色を維持）
    name: '桃',
    base: '#f2bcc7', plateFill: '#f6ccd6', plateLine: '#d8879f',
    centerLine: 'rgba(216,135,159,0.55)', scallop: '#e2738f',
    skirt: '#eea9bb', skirtLine: '#c97690', sprout: '#f29daa',
  },
  { name: '空', ...mkShellPalette(205) },
  { name: '若草', ...mkShellPalette(105) },
  { name: '山吹', ...mkShellPalette(45) },
  { name: '藤', ...mkShellPalette(275) },
  { name: '翡翠', ...mkShellPalette(160) },
];

// 甲羅（Latheドーム用UV）
const drawShell = (ctx, w, h, pal) => {
  const SEG = w / 5;
  ctx.fillStyle = pal.base;
  ctx.fillRect(0, 0, w, h);

  for (let k = 0; k < 5; k++) {
    const cx = k * SEG + SEG / 2;
    ctx.fillStyle = pal.plateFill;
    ctx.strokeStyle = pal.plateLine;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.ellipse(cx, 255, SEG * 0.42, 175, 0, 0, 7);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = pal.base;
    ctx.beginPath();
    ctx.moveTo(cx - 20, 452);
    ctx.lineTo(cx + 20, 452);
    ctx.lineTo(cx, 396);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = pal.plateLine;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx - 18, 448);
    ctx.lineTo(cx, 400);
    ctx.lineTo(cx + 18, 448);
    ctx.stroke();
    ctx.lineWidth = 4;
    ctx.strokeStyle = pal.centerLine;
    ctx.beginPath();
    ctx.moveTo(cx, 150);
    ctx.lineTo(cx, 330);
    ctx.stroke();
  }

  ctx.strokeStyle = pal.plateLine;
  ctx.lineWidth = 7;
  for (let k = 0; k < 5; k++) {
    const x = k * SEG;
    ctx.beginPath();
    ctx.moveTo(x, 95);
    ctx.quadraticCurveTo(x + 10, 260, x, 465);
    ctx.stroke();
  }

  ctx.fillStyle = pal.scallop;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  for (let x = 0; x <= w; x += 8) {
    const b = 72 + 30 * Math.cos((x / w) * Math.PI * 10);
    ctx.lineTo(x, b);
  }
  ctx.lineTo(w, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = pal.skirt;
  ctx.fillRect(0, 468, w, h - 468);
  ctx.strokeStyle = pal.skirtLine;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, 466);
  ctx.lineTo(w, 466);
  ctx.stroke();
};

// ---------- タルト本体 ----------
export function createTarte(opts = {}) {
  const pal = SHELLS[((opts.shell ?? 0) % SHELLS.length + SHELLS.length) % SHELLS.length];
  const faceOpen = canvasTex(1024, 512, (c, w, h) => drawFace(c, w, h, false));
  const faceClosed = canvasTex(1024, 512, (c, w, h) => drawFace(c, w, h, true));
  const shellTex = canvasTex(1024, 512, (c, w, h) => drawShell(c, w, h, pal));

  const M = {
    face: toon(0xffffff, faceOpen),
    green: toon(0xb9e19f),
    belly: toon(0xf2f6e8),
    shell: toon(0xffffff, shellTex),
    sprout: toon(new THREE.Color(pal.sprout).getHex()),
    claw: toon(0xe6e0ac),
  };

  const group = new THREE.Group();

  const mesh = (geo, mat, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    return m;
  };

  // 脚
  const mkLeg = (side) => {
    const hip = new THREE.Group();
    hip.position.set(0.11 * side, 0.2, 0);
    hip.add(mesh(new THREE.CapsuleGeometry(0.078, 0.09, 8, 20), M.green, 0, -0.05, 0));
    const foot = mesh(new THREE.SphereGeometry(0.08, 24, 18), M.green, 0, -0.13, 0.02);
    foot.scale.set(0.95, 0.55, 1.2);
    hip.add(foot);
    for (let i = -1; i <= 1; i++) {
      const claw = mesh(new THREE.ConeGeometry(0.016, 0.045, 8), M.claw, i * 0.035, -0.15, 0.11);
      claw.rotation.x = Math.PI / 2.4;
      hip.add(claw);
    }
    group.add(hip);
    return hip;
  };
  const legL = mkLeg(1);
  const legR = mkLeg(-1);

  // 胴
  const body = new THREE.Group();
  group.add(body);

  const torso = mesh(new THREE.SphereGeometry(0.27, 48, 36), M.green, 0, 0.34, 0);
  torso.scale.set(1, 0.95, 0.85);
  body.add(torso);
  const belly = mesh(new THREE.SphereGeometry(0.24, 48, 36), M.belly, 0, 0.31, 0.115);
  belly.scale.set(0.75, 0.85, 0.5);
  body.add(belly);

  // 甲羅（縁リップ＋しっぽの切り欠き）
  {
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
    m.rotation.x = -Math.PI / 2;
    m.position.set(0, 0.37, -0.115);
    body.add(m);
  }
  const tail = mesh(new THREE.ConeGeometry(0.05, 0.18, 12), M.green, 0, 0.15, -0.24);
  tail.rotation.x = Math.PI / 2 + 0.35;
  body.add(tail);

  // 腕
  const mkArm = (side) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(0.205 * side, 0.43, 0);
    shoulder.rotation.z = 0.28 * side;
    const arm = mesh(new THREE.CapsuleGeometry(0.07, 0.13, 8, 20), M.green, 0, -0.09, 0);
    arm.scale.set(1, 1, 0.62);
    shoulder.add(arm);
    const palm = mesh(new THREE.SphereGeometry(0.062, 20, 16), M.belly, 0, -0.155, 0.012);
    palm.scale.set(0.9, 0.75, 0.5);
    shoulder.add(palm);
    for (let i = -1; i <= 1; i++) {
      shoulder.add(mesh(new THREE.BoxGeometry(0.026, 0.03, 0.02), M.claw, i * 0.032, -0.185, 0.01));
    }
    body.add(shoulder);
    return shoulder;
  };
  const armL = mkArm(1);
  const armR = mkArm(-1);

  // 頭
  const head = new THREE.Group();
  head.position.y = 0.58;
  body.add(head);

  const headMesh = mesh(new THREE.SphereGeometry(0.295, 72, 56), M.face, 0, 0.155, 0.01);
  headMesh.scale.set(1.05, 1, 0.97);
  head.add(headMesh);

  // 若葉
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

  addOutlines(group);

  // ---------- アニメーション ----------
  let blinkT = 1.6;
  let blink = 0;
  let poseT = 0; // 片手あげポーズの重み（0..1・写真用）

  const update = (dt, t, w, p, yawVel) => {
    legL.rotation.x = Math.sin(p) * 0.55 * w;
    legR.rotation.x = -Math.sin(p) * 0.55 * w;

    armL.rotation.x = -Math.sin(p) * 0.4 * w + Math.sin(t * 2.1) * 0.05 * (1 - w);
    armR.rotation.x = Math.sin(p) * 0.4 * w + Math.sin(t * 2.1 + 1) * 0.05 * (1 - w);
    armL.rotation.z = 0.28 + Math.abs(Math.sin(p)) * 0.15 * w + Math.sin(t * 2.4) * 0.03 * (1 - w);
    armR.rotation.z = -0.28 - Math.abs(Math.sin(p + 1)) * 0.15 * w - Math.sin(t * 2.4 + 0.8) * 0.03 * (1 - w);

    // 片手をあげてポーズ（通常アニメの上から重ねる。斜め上に挙げて手のひらをこちらへ・小さくふりふり）
    if (poseT > 0.001) {
      const wave = Math.sin(t * 6) * 0.12;
      armL.rotation.z = THREE.MathUtils.lerp(armL.rotation.z, 2.1 + wave, poseT);
      armL.rotation.x = THREE.MathUtils.lerp(armL.rotation.x, -0.55, poseT);
    }

    body.position.y = Math.abs(Math.cos(p)) * 0.05 * w;
    body.rotation.x = 0.05 * w;
    body.rotation.z = Math.sin(p) * 0.09 * w;
    body.rotation.y = Math.sin(p) * 0.06 * w;
    const breathe = 1 + Math.sin(t * 2.2) * 0.012 * (1 - w);
    body.scale.set(1, breathe, 1);

    head.rotation.z = -Math.sin(p) * 0.05 * w + Math.sin(t * 1.1) * 0.03 * (1 - w);
    head.rotation.y = Math.sin(t * 0.7) * 0.06 * (1 - w);
    if (poseT > 0.001) head.rotation.z = THREE.MathUtils.lerp(head.rotation.z, -0.14, poseT); // ポーズ中は小首をかしげる

    sprout.rotation.z = Math.sin(p - 0.8) * 0.16 * w + Math.sin(t * 2.6) * 0.06;
    sprout.rotation.x = THREE.MathUtils.clamp(-yawVel * 0.04, -0.25, 0.25);
    tail.rotation.z = Math.sin(t * 3.1) * 0.25 + Math.sin(p) * 0.15 * w;

    blinkT -= dt;
    if (blinkT <= 0) { blink = 0.12; blinkT = 1.8 + Math.random() * 2.4; }
    if (blink > 0) blink -= dt;
    const nextMap = blink > 0 ? faceClosed : faceOpen;
    if (M.face.map !== nextMap) {
      M.face.map = nextMap;
      M.face.needsUpdate = true;
    }
  };

  return { group, update, setPose: (k) => { poseT = k; } };
}
