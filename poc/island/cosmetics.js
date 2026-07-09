import * as THREE from 'three';

export const COSMETIC_ITEMS = Object.freeze([
  { id: 'moon-halo', name: '月光の輪', detail: '頭上に浮かぶ金の月輪', cost: 4, slot: 'head', color: '#f0c869', glyph: '○' },
  { id: 'sakura-crown', name: '桜の花冠', detail: '咲耶の花をまとう冠', cost: 6, slot: 'head', color: '#f48fb8', glyph: '✿' },
  { id: 'starlight-aura', name: '星灯りのオーラ', detail: 'からだを淡く照らす星光', cost: 8, slot: 'aura', color: '#7be0ff', glyph: '✦' },
]);

const ALL_MASK = (1 << COSMETIC_ITEMS.length) - 1;

export const cosmeticsToMask = (equipped) => {
  const ids = equipped instanceof Set ? equipped : new Set(equipped || []);
  return COSMETIC_ITEMS.reduce((mask, item, index) => mask | (ids.has(item.id) ? (1 << index) : 0), 0);
};

const safeMask = (mask) => Math.max(0, Math.floor(Number(mask) || 0)) & ALL_MASK;

let auraTexture = null;
const getAuraTexture = () => {
  if (auraTexture) return auraTexture;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(64, 64, 2, 64, 64, 62);
  grad.addColorStop(0, 'rgba(255,255,255,0.9)');
  grad.addColorStop(0.28, 'rgba(180,235,255,0.42)');
  grad.addColorStop(1, 'rgba(120,210,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  auraTexture = new THREE.CanvasTexture(canvas);
  auraTexture.colorSpace = THREE.SRGBColorSpace;
  return auraTexture;
};

const basic = (color, opacity = 1) => new THREE.MeshBasicMaterial({
  color,
  transparent: opacity < 1,
  opacity,
  blending: opacity < 1 ? THREE.AdditiveBlending : THREE.NormalBlending,
  depthWrite: opacity >= 1,
  side: THREE.DoubleSide,
});

export function createCosmeticRig(initialMask = 0, { illuminate = true } = {}) {
  const group = new THREE.Group();
  group.name = 'cosmetics';
  const parts = [];

  // 月光の輪。小さな光珠を一つだけ添え、回転が写真にも読み取れる形にする。
  const halo = new THREE.Group();
  halo.name = COSMETIC_ITEMS[0].id;
  halo.position.y = 1.15;
  const haloRing = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.022, 10, 48), basic(0xf0c869));
  haloRing.rotation.x = Math.PI / 2;
  haloRing.userData.noOutline = true;
  const haloBead = new THREE.Mesh(new THREE.SphereGeometry(0.04, 14, 10), basic(0xfff2b8));
  haloBead.position.x = 0.27;
  haloBead.userData.noOutline = true;
  halo.add(haloRing, haloBead);
  group.add(halo);
  parts.push(halo);

  // 桜の花冠。若葉を隠し切らないよう、額の周囲に小花を散らす。
  const crown = new THREE.Group();
  crown.name = COSMETIC_ITEMS[1].id;
  crown.position.y = 1.01;
  const crownBand = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.012, 8, 40), basic(0xd9a46f));
  crownBand.rotation.x = Math.PI / 2;
  crownBand.userData.noOutline = true;
  crown.add(crownBand);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const flower = new THREE.Group();
    flower.position.set(Math.cos(a) * 0.24, 0.018 + (i % 2) * 0.018, Math.sin(a) * 0.24);
    flower.rotation.y = -a;
    for (let p = 0; p < 5; p++) {
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), basic(i % 2 ? 0xffdbe8 : 0xf48fb8));
      const pa = (p / 5) * Math.PI * 2;
      petal.position.set(Math.cos(pa) * 0.034, Math.sin(pa) * 0.034, 0);
      petal.scale.set(1.35, 0.72, 0.38);
      petal.userData.noOutline = true;
      flower.add(petal);
    }
    const center = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), basic(0xffe7a8));
    center.position.z = 0.012;
    center.userData.noOutline = true;
    flower.add(center);
    crown.add(flower);
  }
  group.add(crown);
  parts.push(crown);

  // 星灯り。発光スプライトと足元の輪、実際に周囲を照らす小さな光源の三層。
  const aura = new THREE.Group();
  aura.name = COSMETIC_ITEMS[2].id;
  const auraSprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: getAuraTexture(),
    color: 0x9fe8ff,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }));
  auraSprite.position.y = 0.55;
  auraSprite.scale.set(1.25, 1.25, 1);
  auraSprite.userData.noOutline = true;
  const auraRing = new THREE.Mesh(new THREE.RingGeometry(0.32, 0.4, 40), basic(0x7be0ff, 0.46));
  auraRing.rotation.x = -Math.PI / 2;
  auraRing.position.y = 0.015;
  auraRing.userData.noOutline = true;
  const auraLight = illuminate ? new THREE.PointLight(0x7be0ff, 0.38, 2.1, 2) : null;
  if (auraLight) auraLight.position.y = 0.55;
  const auraMotes = new THREE.Group();
  const motes = [];
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const mote = new THREE.Group();
    mote.position.set(Math.cos(a) * (0.36 + (i % 2) * 0.06), 0.25 + i * 0.16, Math.sin(a) * (0.36 + (i % 2) * 0.06));
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.027), basic(i % 2 ? 0xffffff : 0x7be0ff));
    core.userData.noOutline = true;
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: getAuraTexture(), color: 0x7be0ff, transparent: true, opacity: 0.48,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    glow.scale.set(0.18, 0.18, 1);
    glow.userData.noOutline = true;
    mote.add(core, glow);
    auraMotes.add(mote);
    motes.push(mote);
  }
  aura.add(auraSprite, auraRing, auraMotes);
  if (auraLight) aura.add(auraLight);
  group.add(aura);
  parts.push(aura);

  let mask = -1;
  const apply = (nextMask) => {
    mask = safeMask(nextMask);
    parts.forEach((part, index) => { part.visible = Boolean(mask & (1 << index)); });
  };
  apply(initialMask);

  return {
    group,
    apply,
    get mask() { return mask; },
    update(_dt, t) {
      if (halo.visible) {
        halo.rotation.y = t * 0.9;
        halo.position.y = 1.15 + Math.sin(t * 1.8) * 0.018;
      }
      if (crown.visible) crown.position.y = 1.01 + Math.sin(t * 1.5 + 0.7) * 0.012;
      if (aura.visible) {
        const pulse = 1 + Math.sin(t * 2.4) * 0.07;
        auraSprite.scale.set(1.25 * pulse, 1.25 * pulse, 1);
        auraSprite.material.opacity = 0.16 + Math.sin(t * 2.4) * 0.04;
        auraRing.scale.setScalar(0.96 + Math.sin(t * 2.4 + 0.8) * 0.06);
        auraRing.material.opacity = 0.4 + Math.sin(t * 2.4 + 0.8) * 0.12;
        if (auraLight) auraLight.intensity = 0.34 + Math.sin(t * 2.4) * 0.08;
        auraMotes.rotation.y = t * 1.1;
        motes.forEach((mote, index) => {
          mote.position.y = 0.25 + index * 0.16 + Math.sin(t * 2.2 + index * 1.4) * 0.045;
        });
      }
    },
  };
}
