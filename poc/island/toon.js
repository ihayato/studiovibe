import * as THREE from 'three';

// Canvasテクスチャ
export const canvasTex = (w, h, draw) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

// トゥーン2階調
export const gradientMap = (() => {
  const g = new THREE.DataTexture(new Uint8Array([184, 255]), 2, 1, THREE.RedFormat);
  g.minFilter = THREE.NearestFilter;
  g.magFilter = THREE.NearestFilter;
  g.needsUpdate = true;
  return g;
})();

// extra: emissive等の追加マテリアルパラメータ（発光する花冠などに使う）
export const toon = (color, map = null, extra = {}) => new THREE.MeshToonMaterial({ color, map, gradientMap, ...extra });

// 輪郭線（インバーテッドハル）
const outlineMat = (thickness, color) => new THREE.ShaderMaterial({
  side: THREE.BackSide,
  uniforms: { uT: { value: thickness }, uC: { value: new THREE.Color(color) } },
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

export const addOutlines = (root, { k = 0.12, min = 0.006, max = 0.016, color = 0x171219 } = {}) => {
  const targets = [];
  root.traverse((o) => {
    if (o.isMesh && !o.userData.noOutline && !o.userData.isOutline) targets.push(o);
  });
  for (const m of targets) {
    m.geometry.computeBoundingSphere();
    const r = m.geometry.boundingSphere.radius;
    const outline = new THREE.Mesh(m.geometry, outlineMat(THREE.MathUtils.clamp(r * k, min, max), color));
    outline.userData.isOutline = true;
    m.add(outline);
  }
};
