import * as THREE from 'three';
import { canvasTex, toon, addOutlines } from './toon.js';

// リーリー（CNPのパンダ忍者）— タルトと同じパーツ階層リグ＋手続きアニメの型で造形。
// 白い頭×黒い丸耳×グレーの目パッチ×黒い腕脚×赤いバンダナ（参照画準拠）。

const WHITE = '#f6f6f4';

const drawLeleFace = (ctx, w, h, closed) => {
  ctx.fillStyle = WHITE;
  ctx.fillRect(0, 0, w, h);
  const cx = w * 0.25;
  const ey = h * 0.48;

  // セル塗りのやわらかいハイライト
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(cx - 60, ey - 150, 90, 46, -0.35, 0, 7);
  ctx.fill();

  // 目のまわりのグレーパッチ（少し傾ける）
  for (const s of [-1, 1]) {
    ctx.fillStyle = '#878d99';
    ctx.beginPath();
    ctx.ellipse(cx + 66 * s, ey - 4, 46, 60, 0.3 * s, 0, 7);
    ctx.fill();
  }

  // 目（まばたきで開閉）
  for (const s of [-1, 1]) {
    const ex = cx + 62 * s;
    if (closed) {
      ctx.strokeStyle = '#16141a';
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(ex, ey - 6, 20, 0.35, Math.PI - 0.35);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#16141a';
      ctx.beginPath();
      ctx.ellipse(ex, ey, 22, 26, 0, 0, 7);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ex - 7 * s, ey - 8, 7, 0, 7);
      ctx.fill();
    }
  }

  // 鼻とにっこり開いた口
  ctx.fillStyle = '#16141a';
  ctx.beginPath();
  ctx.ellipse(cx, ey + 34, 11, 8, 0, 0, 7);
  ctx.fill();
  ctx.fillStyle = '#4a262c';
  ctx.beginPath();
  ctx.arc(cx, ey + 52, 20, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d96a72';
  ctx.beginPath();
  ctx.arc(cx, ey + 60, 10, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
};

// バンダナの色バリアント（0=正典の赤）
export const BANDANAS = [
  { name: '紅', color: 0xc9303e },
  { name: '藍', color: 0x3e6bc9 },
  { name: '若草', color: 0x3ec98a },
  { name: '山吹', color: 0xd9a94c },
];

export function createLele(opts = {}) {
  const band = BANDANAS[((opts.bandana ?? 0) % BANDANAS.length + BANDANAS.length) % BANDANAS.length];
  const faceOpen = canvasTex(1024, 512, (c, w, h) => drawLeleFace(c, w, h, false));
  const faceClosed = canvasTex(1024, 512, (c, w, h) => drawLeleFace(c, w, h, true));

  const M = {
    face: toon(0xffffff, faceOpen),
    white: toon(0xf6f6f4),
    black: toon(0x2b2830),
    pad: toon(0x4a4650),
    bandana: toon(band.color),
  };

  const group = new THREE.Group();
  const mesh = (geo, mat, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    return m;
  };

  // 脚（黒）
  const mkLeg = (side) => {
    const hip = new THREE.Group();
    hip.position.set(0.11 * side, 0.2, 0);
    hip.add(mesh(new THREE.CapsuleGeometry(0.08, 0.09, 8, 20), M.black, 0, -0.05, 0));
    const foot = mesh(new THREE.SphereGeometry(0.082, 24, 18), M.black, 0, -0.13, 0.02);
    foot.scale.set(0.95, 0.55, 1.2);
    hip.add(foot);
    group.add(hip);
    return hip;
  };
  const legL = mkLeg(1);
  const legR = mkLeg(-1);

  // 胴（白・おなかも白）
  const body = new THREE.Group();
  group.add(body);
  const torso = mesh(new THREE.SphereGeometry(0.27, 48, 36), M.white, 0, 0.34, 0);
  torso.scale.set(1, 0.95, 0.85);
  body.add(torso);
  const tail = mesh(new THREE.SphereGeometry(0.06, 16, 12), M.white, 0, 0.22, -0.22);
  body.add(tail);

  // 腕（黒・手のひらは濃いグレーの肉球風）
  const mkArm = (side) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(0.205 * side, 0.43, 0);
    shoulder.rotation.z = 0.28 * side;
    const arm = mesh(new THREE.CapsuleGeometry(0.072, 0.13, 8, 20), M.black, 0, -0.09, 0);
    arm.scale.set(1, 1, 0.62);
    shoulder.add(arm);
    const palm = mesh(new THREE.SphereGeometry(0.06, 20, 16), M.pad, 0, -0.155, 0.012);
    palm.scale.set(0.9, 0.75, 0.5);
    shoulder.add(palm);
    body.add(shoulder);
    return shoulder;
  };
  const armL = mkArm(1);
  const armR = mkArm(-1);

  // 頭（白・顔テクスチャ）＋黒い丸耳
  const head = new THREE.Group();
  head.position.y = 0.58;
  body.add(head);
  const headMesh = mesh(new THREE.SphereGeometry(0.295, 72, 56), M.face, 0, 0.155, 0.01);
  headMesh.scale.set(1.05, 1, 0.97);
  head.add(headMesh);
  for (const s of [1, -1]) {
    const ear = mesh(new THREE.SphereGeometry(0.105, 24, 18), M.black, 0.21 * s, 0.42, -0.02);
    ear.scale.set(1, 0.92, 0.6);
    head.add(ear);
  }

  // バンダナ（首の帯＋胸の三角布）
  const neck = mesh(new THREE.TorusGeometry(0.165, 0.035, 10, 24), M.bandana, 0, 0.56, 0);
  neck.rotation.x = Math.PI / 2;
  neck.scale.set(1, 1, 0.8);
  body.add(neck);
  const kerchief = mesh(new THREE.ConeGeometry(0.13, 0.2, 3), M.bandana, 0, 0.47, 0.17);
  kerchief.rotation.x = 0.35;
  kerchief.rotation.y = Math.PI;
  // 3面コーンは法線が不連続でインバーテッドハルが割れる（胸に黒筋が出る）ため輪郭線を付けない
  kerchief.userData.noOutline = true;
  body.add(kerchief);

  addOutlines(group);

  // ---------- アニメーション（タルトと同じ骨格・耳と尻尾で個性づけ） ----------
  let blinkT = 2.0;
  let blink = 0;
  let poseT = 0;

  const update = (dt, t, w, p, yawVel) => {
    legL.rotation.x = Math.sin(p) * 0.55 * w;
    legR.rotation.x = -Math.sin(p) * 0.55 * w;
    armL.rotation.x = -Math.sin(p) * 0.4 * w + Math.sin(t * 1.9) * 0.05 * (1 - w);
    armR.rotation.x = Math.sin(p) * 0.4 * w + Math.sin(t * 1.9 + 1) * 0.05 * (1 - w);
    armL.rotation.z = 0.28 + Math.abs(Math.sin(p)) * 0.15 * w + Math.sin(t * 2.2) * 0.03 * (1 - w);
    armR.rotation.z = -0.28 - Math.abs(Math.sin(p + 1)) * 0.15 * w - Math.sin(t * 2.2 + 0.8) * 0.03 * (1 - w);
    if (poseT > 0.001) {
      const wave = Math.sin(t * 6) * 0.12;
      armL.rotation.z = THREE.MathUtils.lerp(armL.rotation.z, 2.1 + wave, poseT);
      armL.rotation.x = THREE.MathUtils.lerp(armL.rotation.x, -0.55, poseT);
    }

    body.position.y = Math.abs(Math.cos(p)) * 0.05 * w;
    body.rotation.z = Math.sin(p) * 0.09 * w;
    const breathe = 1 + Math.sin(t * 1.8) * 0.014 * (1 - w);
    body.scale.set(1, breathe, 1);

    head.rotation.z = -Math.sin(p) * 0.05 * w + Math.sin(t * 0.9) * 0.03 * (1 - w);
    head.rotation.y = Math.sin(t * 0.6) * 0.07 * (1 - w);
    if (poseT > 0.001) head.rotation.z = THREE.MathUtils.lerp(head.rotation.z, -0.14, poseT);
    tail.position.x = Math.sin(t * 2.4) * 0.015;

    blinkT -= dt;
    if (blinkT <= 0) { blink = 0.12; blinkT = 2.2 + Math.random() * 2.6; }
    if (blink > 0) blink -= dt;
    const nextMap = blink > 0 ? faceClosed : faceOpen;
    if (M.face.map !== nextMap) {
      M.face.map = nextMap;
      M.face.needsUpdate = true;
    }
  };

  return { group, update, setPose: (k) => { poseT = k; } };
}
