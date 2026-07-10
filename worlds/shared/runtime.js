import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createAvatar, loadIdentity } from '../../poc/island/avatars.js';
import { COSMETIC_ITEMS, cosmeticsToMask, createCosmeticRig } from '../../poc/island/cosmetics.js';
import { initPresence, makeNameLabel } from '../../poc/island/net.js';
import { addOutlines, canvasTex, toon } from '../../poc/island/toon.js';
import { setupWorldSound } from './sound-control.js';
import { playArrival } from './warp.js';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);
const SEARCH = new URLSearchParams(location.search);
const UP = THREE.Object3D.DEFAULT_UP;

const readCosmeticMask = () => {
  try {
    const raw = JSON.parse(localStorage.getItem('vibe.island.cosmetics.v1') || 'null');
    const valid = new Set(COSMETIC_ITEMS.map((item) => item.id));
    return cosmeticsToMask((Array.isArray(raw?.equipped) ? raw.equipped : []).filter((id) => valid.has(id)));
  } catch {
    return 0;
  }
};

export const loadTexture = async (url) => {
  const texture = await new THREE.TextureLoader().loadAsync(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

export const makeImagePlane = (texture, width, height, { transparent = true, opacity = 1 } = {}) => {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent,
      opacity,
      side: THREE.DoubleSide,
      depthWrite: !transparent,
      alphaTest: transparent ? 0.025 : 0,
    }),
  );
  mesh.userData.noOutline = true;
  return mesh;
};

export const makeWorldLabel = (en, jp, {
  width = 640,
  height = 176,
  color = '#152c32',
  ink = '#121c20',
  paper = 'rgba(250, 249, 243, .92)',
  border = 'rgba(25, 50, 58, .22)',
  scale = [2.25, 0.62],
} = {}) => {
  const texture = canvasTex(width, height, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = paper;
    ctx.beginPath();
    ctx.roundRect(22, 18, w - 44, h - 36, 12);
    ctx.fill();
    ctx.strokeStyle = border;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = color;
    ctx.font = '700 25px Inter, sans-serif';
    ctx.fillText(en, w / 2, 62);
    ctx.fillStyle = ink;
    ctx.font = '800 50px "Shippori Mincho B1", serif';
    ctx.fillText(jp, w / 2, 126);
  });
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  sprite.scale.set(scale[0], scale[1], 1);
  return sprite;
};

export function createWorldRuntime({
  worldId,
  room,
  background = 0xdfe9eb,
  fog = [0xdfe9eb, 18, 46],
  groundY = 0.2,
  walkRadius = 8,
  playerRadius = 0.3,
  start = [0, 4.8],
  cameraPosition = [1.4, 3.1, 9.2],
  cameraTarget = [0, 0.75, 4.2],
  fov = 43,
  maxDistance = 15,
  exposure = 1.05,
  presenceLabel = (count) => `いま島に ${count === 1 ? 'ひとり' : `${count}人`}`,
  fullMessage = 'この島は満員です。ソロで散策できます',
  soundtrack = null,
  soundtrackVolume = 0.3,
  loadingMinMs = 460,
  arrivalMinMs = 1120,
  terrainH = () => groundY,
  boundary = null,
} = {}) {
  const startedAt = performance.now();
  const arrivalTransit = playArrival(worldId);
  const keepLoadingForQa = LOCAL_HOSTS.has(location.hostname) && SEARCH.get('qa') === 'loading';
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || SEARCH.has('pad');
  document.body.classList.toggle('force-touch', isTouch);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isTouch ? 1.65 : 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = exposure;
  renderer.domElement.setAttribute('aria-label', '3Dワールド');
  document.body.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(background);
  if (fog) scene.fog = new THREE.Fog(...fog);

  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 120);
  camera.position.fromArray(cameraPosition);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.fromArray(cameraTarget);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 1.5;
  controls.maxDistance = maxDistance;
  controls.maxPolarAngle = 1.5;

  const viewSize = () => {
    const vv = window.visualViewport;
    const layoutW = Math.round(document.documentElement.clientWidth || innerWidth);
    const layoutH = Math.round(document.documentElement.clientHeight || innerHeight);
    const visualW = Math.round(vv ? vv.width : layoutW);
    const visualH = Math.round(vv ? vv.height : layoutH);
    const desktopLayoutOnPhone = isTouch && layoutW > visualW * 1.4;
    return {
      width: Math.max(1, desktopLayoutOnPhone ? layoutW : visualW),
      height: Math.max(1, desktopLayoutOnPhone ? layoutH : visualH),
    };
  };
  const applySize = () => {
    const { width, height } = viewSize();
    const aspect = width / height;
    camera.aspect = aspect;
    camera.fov = THREE.MathUtils.lerp(fov, fov + 14, THREE.MathUtils.clamp((0.78 - aspect) / 0.32, 0, 1));
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = `${width}px`;
    renderer.domElement.style.height = `${height}px`;
  };
  applySize();
  addEventListener('resize', applySize);
  addEventListener('orientationchange', () => setTimeout(applySize, 240));
  window.visualViewport?.addEventListener('resize', applySize);
  window.visualViewport?.addEventListener('scroll', applySize);

  const identity = loadIdentity();
  const avatar = createAvatar(identity.c, identity.v);
  avatar.group.position.set(start[0], terrainH(start[0], start[1]), start[1]);
  avatar.group.rotation.y = Math.PI;
  avatar.group.add(makeNameLabel(identity.name));
  const cosmeticRig = createCosmeticRig(readCosmeticMask());
  avatar.group.add(cosmeticRig.group);
  scene.add(avatar.group);

  const obstacles = [];
  const interactables = [];
  const frameCallbacks = [];
  const billboards = [];
  const addObstacle = (x, z, radius, enabled = () => true) => {
    obstacles.push({ kind: 'circle', x, z, r: radius, enabled });
    return obstacles[obstacles.length - 1];
  };
  const addBoxObstacle = (x, z, width, depth, rotation = 0, padding = 0, enabled = () => true) => {
    obstacles.push({
      kind: 'box',
      x,
      z,
      hx: Math.max(0.01, width / 2),
      hz: Math.max(0.01, depth / 2),
      rotation,
      padding: Math.max(0, padding),
      cos: Math.cos(rotation),
      sin: Math.sin(rotation),
      enabled,
    });
    return obstacles[obstacles.length - 1];
  };
  const addInteractable = (item) => {
    const normalized = {
      id: item.id || `interact-${interactables.length + 1}`,
      radius: 1.5,
      priority: 0,
      enabled: () => true,
      ...item,
    };
    interactables.push(normalized);
    return normalized;
  };
  const addFrame = (callback) => {
    frameCallbacks.push(callback);
    return callback;
  };
  const addBillboard = (mesh) => {
    billboards.push(mesh);
    return mesh;
  };

  const clampWalkable = (point) => {
    if (boundary) {
      boundary(point);
      return;
    }
    const length = Math.hypot(point.x, point.z);
    if (length > walkRadius) {
      point.x *= walkRadius / length;
      point.z *= walkRadius / length;
    }
  };
  const obstacleContainsPoint = (point, obstacle, epsilon = 0.002) => {
    if (!obstacle.enabled()) return false;
    const dx = point.x - obstacle.x;
    const dz = point.z - obstacle.z;
    if (obstacle.kind === 'box') {
      const localX = obstacle.cos * dx + obstacle.sin * dz;
      const localZ = -obstacle.sin * dx + obstacle.cos * dz;
      return Math.abs(localX) < obstacle.hx + playerRadius + obstacle.padding - epsilon
        && Math.abs(localZ) < obstacle.hz + playerRadius + obstacle.padding - epsilon;
    }
    return Math.hypot(dx, dz) < obstacle.r + playerRadius - epsilon;
  };
  const candidateScore = (candidate, origin, currentObstacle) => {
    if (obstacleContainsPoint(candidate, currentObstacle)) return Infinity;
    const overlaps = obstacles.reduce((count, obstacle) => (
      obstacle !== currentObstacle && obstacleContainsPoint(candidate, obstacle) ? count + 1 : count
    ), 0);
    return Math.hypot(candidate.x - origin.x, candidate.z - origin.z) + overlaps * 100;
  };
  const resolveObstacle = (point, obstacle) => {
    if (!obstacleContainsPoint(point, obstacle, 0)) return false;
    const origin = point.clone();
    const candidates = [];
    if (obstacle.kind === 'box') {
      const dx = point.x - obstacle.x;
      const dz = point.z - obstacle.z;
      const localX = obstacle.cos * dx + obstacle.sin * dz;
      const localZ = -obstacle.sin * dx + obstacle.cos * dz;
      const limitX = obstacle.hx + playerRadius + obstacle.padding;
      const limitZ = obstacle.hz + playerRadius + obstacle.padding;
      const clampedX = THREE.MathUtils.clamp(localX, -limitX, limitX);
      const clampedZ = THREE.MathUtils.clamp(localZ, -limitZ, limitZ);
      for (const [resolvedX, resolvedZ] of [
        [limitX, clampedZ], [-limitX, clampedZ], [clampedX, limitZ], [clampedX, -limitZ],
      ]) {
        candidates.push(new THREE.Vector3(
          obstacle.x + obstacle.cos * resolvedX - obstacle.sin * resolvedZ,
          point.y,
          obstacle.z + obstacle.sin * resolvedX + obstacle.cos * resolvedZ,
        ));
      }
    } else {
      const minimum = obstacle.r + playerRadius;
      const primary = new THREE.Vector2(point.x - obstacle.x, point.z - obstacle.z);
      if (primary.lengthSq() < 0.0001) primary.set(-obstacle.x, -obstacle.z);
      if (primary.lengthSq() < 0.0001) primary.set(1, 0);
      primary.normalize();
      const directions = [primary];
      for (let index = 0; index < 8; index++) {
        const angle = (index / 8) * Math.PI * 2;
        directions.push(new THREE.Vector2(Math.cos(angle), Math.sin(angle)));
      }
      for (const direction of directions) {
        candidates.push(new THREE.Vector3(
          obstacle.x + direction.x * minimum,
          point.y,
          obstacle.z + direction.y * minimum,
        ));
      }
    }
    let best = null;
    let bestScore = Infinity;
    for (const candidate of candidates) {
      clampWalkable(candidate);
      const score = candidateScore(candidate, origin, obstacle);
      if (score < bestScore) {
        best = candidate;
        bestScore = score;
      }
    }
    if (!best) return false;
    point.copy(best);
    return true;
  };
  const resolveMove = (point) => {
    clampWalkable(point);
    for (let pass = 0; pass < 8; pass++) {
      let changed = false;
      for (const obstacle of obstacles) {
        if (!obstacle.enabled()) continue;
        if (resolveObstacle(point, obstacle)) changed = true;
      }
      if (!changed) break;
    }
    clampWalkable(point);
    point.y = terrainH(point.x, point.z);
    return point;
  };

  const groundPick = new THREE.Mesh(
    new THREE.CircleGeometry(walkRadius, 72),
    new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide }),
  );
  groundPick.rotation.x = -Math.PI / 2;
  groundPick.position.y = groundY + 0.035;
  scene.add(groundPick);

  const hint = document.getElementById('hint');
  const toast = document.getElementById('toast');
  const presenceEl = document.getElementById('presence');
  let toastTimer = 0;
  const showToast = (message, duration = 2200) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), duration);
  };

  const sound = setupWorldSound({ soundtrack, volume: soundtrackVolume, showToast });

  const isModalOpen = () => Boolean(document.querySelector('[data-world-modal]:not([hidden])'));
  const playerTarget = avatar.group.position.clone();
  let clickMoving = false;
  let jumpQueued = false;
  let verticalSpeed = 0;
  let playerY = avatar.group.position.y;
  let grounded = true;
  let walkPhase = 0;
  let previousYaw = avatar.group.rotation.y;
  const previousPosition = avatar.group.position.clone();
  const keyboard = new Set();
  const cameraForward = new THREE.Vector3();
  const cameraRight = new THREE.Vector3();
  const moveVector = new THREE.Vector3();
  const nextPosition = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let pointerDown = null;

  renderer.domElement.addEventListener('pointerdown', (event) => {
    pointerDown = { x: event.clientX, y: event.clientY, at: performance.now() };
  });
  renderer.domElement.addEventListener('pointerup', (event) => {
    if (!pointerDown || isModalOpen()) return;
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
    resolveMove(playerTarget);
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
  const joystickKnob = joystick?.querySelector('span');
  const joystickInput = new THREE.Vector2();
  let joystickPointer = null;
  const updateJoystick = (event) => {
    if (!joystick || !joystickKnob) return;
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
  joystick?.addEventListener('pointerdown', (event) => {
    joystickPointer = event.pointerId;
    joystick.setPointerCapture(event.pointerId);
    updateJoystick(event);
    event.stopPropagation();
  });
  joystick?.addEventListener('pointermove', (event) => {
    if (event.pointerId === joystickPointer) updateJoystick(event);
  });
  const releaseJoystick = (event) => {
    if (event.pointerId !== joystickPointer) return;
    joystickPointer = null;
    joystickInput.set(0, 0);
    if (joystickKnob) joystickKnob.style.transform = '';
  };
  joystick?.addEventListener('pointerup', releaseJoystick);
  joystick?.addEventListener('pointercancel', releaseJoystick);
  document.getElementById('jump')?.addEventListener('pointerdown', (event) => {
    jumpQueued = true;
    event.stopPropagation();
  });

  let currentNear = null;
  const itemPosition = (item) => {
    const value = typeof item.position === 'function' ? item.position() : item.position;
    return value?.isVector3 ? value : new THREE.Vector3(value?.x || 0, value?.y || groundY, value?.z || 0);
  };
  const findNear = () => {
    let nearest = null;
    let nearestDistance = Infinity;
    for (const item of interactables) {
      if (!item.enabled()) continue;
      const p = itemPosition(item);
      const distance = Math.hypot(avatar.group.position.x - p.x, avatar.group.position.z - p.z);
      if (distance > item.radius) continue;
      if (!nearest || item.priority > nearest.priority || (item.priority === nearest.priority && distance < nearestDistance)) {
        nearest = item;
        nearestDistance = distance;
      }
    }
    return nearest;
  };
  const updateHint = (next) => {
    if (next?.id === currentNear?.id && next?.label === currentNear?.label) return;
    currentNear = next;
    if (!hint) return;
    if (!next) {
      hint.classList.remove('is-visible');
      return;
    }
    hint.textContent = typeof next.label === 'function' ? next.label() : next.label;
    hint.classList.add('is-visible');
  };
  const interact = () => {
    if (!currentNear || isModalOpen()) return;
    sound?.se.ui();
    currentNear.action?.(currentNear, api);
  };
  hint?.addEventListener('click', interact);
  addEventListener('keydown', (event) => {
    if (!event.repeat && ['Enter', 'KeyE'].includes(event.code)) interact();
  });

  const presence = initPresence({
    room,
    scene,
    terrainH,
    identity,
    getState: () => ({
      x: avatar.group.position.x,
      z: avatar.group.position.z,
      yaw: avatar.group.rotation.y,
      w: clickMoving || keyboard.size || joystickInput.lengthSq() > 0.02 ? 1 : 0,
      j: Math.max(0, playerY - terrainH(avatar.group.position.x, avatar.group.position.z)),
      a: cosmeticRig.mask,
    }),
    onCount: (count) => { if (presenceEl) presenceEl.textContent = presenceLabel(count); },
    onFull: () => showToast(fullMessage),
  });

  let running = false;
  let firstFrame = true;
  const clock = new THREE.Timer();
  clock.connect(document);
  const animate = () => {
    if (running) requestAnimationFrame(animate);
    clock.update();
    const dt = Math.min(0.05, clock.getDelta());
    const elapsed = clock.getElapsed();
    const modalOpen = isModalOpen();

    const keyboardX = (keyboard.has('KeyD') || keyboard.has('ArrowRight') ? 1 : 0) - (keyboard.has('KeyA') || keyboard.has('ArrowLeft') ? 1 : 0);
    const keyboardZ = (keyboard.has('KeyS') || keyboard.has('ArrowDown') ? 1 : 0) - (keyboard.has('KeyW') || keyboard.has('ArrowUp') ? 1 : 0);
    const inputX = modalOpen ? 0 : keyboardX + joystickInput.x;
    const inputZ = modalOpen ? 0 : keyboardZ + joystickInput.y;
    let moving = false;

    if (Math.hypot(inputX, inputZ) > 0.06) {
      cameraForward.subVectors(controls.target, camera.position).setY(0).normalize();
      cameraRight.crossVectors(cameraForward, UP).normalize();
      moveVector.copy(cameraRight).multiplyScalar(inputX).addScaledVector(cameraForward, -inputZ).normalize();
      nextPosition.copy(avatar.group.position).addScaledVector(moveVector, dt * 2.45);
      resolveMove(nextPosition);
      avatar.group.position.x = nextPosition.x;
      avatar.group.position.z = nextPosition.z;
      avatar.group.rotation.y = Math.atan2(moveVector.x, moveVector.z);
      playerTarget.copy(avatar.group.position);
      moving = true;
    } else if (clickMoving && !modalOpen) {
      moveVector.subVectors(playerTarget, avatar.group.position).setY(0);
      const distance = moveVector.length();
      if (distance > 0.06) {
        moveVector.normalize();
        const step = Math.min(distance, dt * 2.45);
        nextPosition.copy(avatar.group.position).addScaledVector(moveVector, step);
        resolveMove(nextPosition);
        avatar.group.position.x = nextPosition.x;
        avatar.group.position.z = nextPosition.z;
        avatar.group.rotation.y = Math.atan2(moveVector.x, moveVector.z);
        moving = true;
      } else {
        clickMoving = false;
      }
    }

    const floorY = terrainH(avatar.group.position.x, avatar.group.position.z);
    if (jumpQueued && grounded && !modalOpen) {
      verticalSpeed = 3.2;
      grounded = false;
      sound?.se.jump();
    }
    jumpQueued = false;
    if (!grounded) {
      verticalSpeed -= 8.8 * dt;
      playerY += verticalSpeed * dt;
      if (playerY <= floorY) {
        playerY = floorY;
        verticalSpeed = 0;
        grounded = true;
        sound?.se.land();
      }
    } else {
      playerY = floorY;
    }
    avatar.group.position.y = playerY;

    if (moving) walkPhase += dt * 7.2;
    const yawVelocity = (avatar.group.rotation.y - previousYaw) / Math.max(dt, 0.001);
    previousYaw = avatar.group.rotation.y;
    avatar.update(dt, elapsed, moving ? 1 : 0, walkPhase, yawVelocity);
    cosmeticRig.update(dt, elapsed);
    presence.update(dt, elapsed);
    sound?.update(dt);

    const cameraDelta = new THREE.Vector3().subVectors(avatar.group.position, previousPosition);
    cameraDelta.y = 0;
    camera.position.add(cameraDelta);
    controls.target.add(cameraDelta);
    previousPosition.copy(avatar.group.position);
    previousPosition.y = floorY;

    updateHint(findNear());
    for (const billboard of billboards) billboard.lookAt(camera.position);
    for (const callback of frameCallbacks) callback({ dt, elapsed, player: avatar.group.position, moving, near: currentNear, api });

    controls.enabled = !modalOpen;
    controls.update();
    renderer.render(scene, camera);

    if (firstFrame) {
      firstFrame = false;
      if (!keepLoadingForQa) {
        const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        const minimum = arrivalTransit ? (reduced ? 620 : arrivalMinMs) : (reduced ? 0 : loadingMinMs);
        const delay = Math.max(0, minimum - (performance.now() - startedAt));
        setTimeout(() => document.getElementById('loading')?.classList.add('is-done'), delay);
      }
    }
  };

  const auditInteractables = () => interactables.map((item) => {
    const origin = itemPosition(item);
    const sampleRadius = Math.max(0.3, Math.min(item.radius * 0.72, 1.05));
    let nearest = Infinity;
    let reachable = false;
    for (let index = 0; index < 24; index++) {
      const angle = (index / 24) * Math.PI * 2;
      const candidate = new THREE.Vector3(
        origin.x + Math.cos(angle) * sampleRadius,
        groundY,
        origin.z + Math.sin(angle) * sampleRadius,
      );
      const resolved = resolveMove(candidate);
      const distance = Math.hypot(resolved.x - origin.x, resolved.z - origin.z);
      nearest = Math.min(nearest, distance);
      if (distance <= item.radius - 0.02) {
        reachable = true;
        break;
      }
    }
    return { id: item.id, reachable, nearest: Math.round(nearest * 100) / 100, radius: item.radius };
  });

  const auditObstacles = () => {
    const active = obstacles.filter((obstacle) => obstacle.enabled());
    const failures = [];
    let probes = 0;
    active.forEach((obstacle, obstacleIndex) => {
      const localProbes = obstacle.kind === 'box'
        ? [[0, 0], [obstacle.hx * 0.72, 0], [-obstacle.hx * 0.72, 0], [0, obstacle.hz * 0.72], [0, -obstacle.hz * 0.72]]
        : [[0, 0], [obstacle.r * 0.62, 0], [-obstacle.r * 0.62, 0], [0, obstacle.r * 0.62], [0, -obstacle.r * 0.62]];
      for (const [localX, localZ] of localProbes) {
        probes++;
        const point = obstacle.kind === 'box'
          ? new THREE.Vector3(
            obstacle.x + obstacle.cos * localX - obstacle.sin * localZ,
            groundY,
            obstacle.z + obstacle.sin * localX + obstacle.cos * localZ,
          )
          : new THREE.Vector3(obstacle.x + localX, groundY, obstacle.z + localZ);
        const resolved = resolveMove(point);
        const blockedBy = [];
        active.forEach((candidate, candidateIndex) => {
          if (obstacleContainsPoint(resolved, candidate)) blockedBy.push(candidateIndex);
        });
        if (blockedBy.length) failures.push({ obstacle: obstacleIndex, blockedBy });
      }
    });
    return { obstacles: active.length, probes, failures };
  };

  const api = {
    scene,
    camera,
    controls,
    renderer,
    avatar: avatar.group,
    cosmeticRig,
    identity,
    groundY,
    walkRadius,
    playerRadius,
    obstacles,
    interactables,
    addObstacle,
    addBoxObstacle,
    addInteractable,
    addFrame,
    addBillboard,
    resolveMove,
    showToast,
    auditInteractables,
    auditObstacles,
    sound,
    get near() { return currentNear; },
    start() {
      if (running) return;
      running = true;
      if (LOCAL_HOSTS.has(location.hostname) && (SEARCH.get('qa') === 'audit' || SEARCH.has('qaAudit'))) {
        document.body.dataset.worldAudit = JSON.stringify(auditInteractables());
      }
      if (LOCAL_HOSTS.has(location.hostname) && (['audit', 'collision'].includes(SEARCH.get('qa')) || SEARCH.has('qaCollision'))) {
        document.body.dataset.collisionAudit = JSON.stringify(auditObstacles());
      }
      requestAnimationFrame(animate);
    },
    teleport(x, z) {
      const point = resolveMove(new THREE.Vector3(Number(x) || 0, groundY, Number(z) || 0));
      const delta = point.clone().sub(avatar.group.position).setY(0);
      avatar.group.position.copy(point);
      playerTarget.copy(point);
      previousPosition.copy(point);
      camera.position.add(delta);
      controls.target.add(delta);
      return point;
    },
    walkTo(x, z) {
      playerTarget.set(Number(x) || 0, groundY, Number(z) || 0);
      resolveMove(playerTarget);
      clickMoving = true;
    },
    interact,
  };

  if (LOCAL_HOSTS.has(location.hostname)) {
    window.__world = api;
  }
  return api;
}

export { addOutlines, canvasTex, toon };
