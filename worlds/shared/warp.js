const TRANSIT_KEY = 'vibe.world.transit.v1';
const WARP_MS = 720;

let active = false;

const ensureLayer = () => {
  let layer = document.getElementById('world-warp');
  if (layer) return layer;

  const style = document.createElement('style');
  style.textContent = `
    #world-warp {
      position: fixed;
      inset: 0;
      z-index: 10000;
      display: grid;
      place-items: center;
      overflow: hidden;
      pointer-events: none;
      opacity: 0;
      background: rgba(239, 248, 250, 0);
      transition: opacity 180ms ease, background 480ms ease;
    }
    #world-warp::before,
    #world-warp::after {
      content: '';
      position: absolute;
      width: min(62vmin, 560px);
      aspect-ratio: 1;
      border-radius: 50%;
      transform: scale(0.04);
      opacity: 0;
    }
    #world-warp::before {
      border: 2px solid rgba(255, 255, 255, 0.92);
      box-shadow:
        0 0 0 10px rgba(150, 208, 220, 0.22),
        0 0 80px rgba(178, 231, 238, 0.72),
        inset 0 0 70px rgba(255, 255, 255, 0.94);
      transition: transform 620ms cubic-bezier(.2,.8,.2,1), opacity 140ms ease;
    }
    #world-warp::after {
      width: min(44vmin, 400px);
      background: radial-gradient(circle, #fff 0 16%, #c8ebef 38%, rgba(255,255,255,0) 72%);
      filter: blur(8px);
      transition: transform 540ms cubic-bezier(.2,.8,.2,1), opacity 180ms ease;
    }
    #world-warp span {
      position: relative;
      z-index: 1;
      color: #10252d;
      font: 700 13px/1.4 "Zen Kaku Gothic New", "Hiragino Sans", sans-serif;
      letter-spacing: 0;
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 180ms ease 180ms, transform 260ms ease 180ms;
    }
    #world-warp.is-active {
      opacity: 1;
      background: rgba(239, 248, 250, 0.52);
      backdrop-filter: blur(7px) saturate(.72);
    }
    #world-warp.is-active::before { transform: scale(3.5); opacity: 1; }
    #world-warp.is-active::after { transform: scale(4.6); opacity: .96; }
    #world-warp.is-active span { opacity: 1; transform: none; }
    #world-warp.is-arrival {
      opacity: 1;
      background: rgba(239, 248, 250, 0.62);
      transition-duration: 620ms;
    }
    #world-warp.is-arrival::before { transform: scale(3.5); opacity: 1; }
    #world-warp.is-arrival::after { transform: scale(4.6); opacity: .96; }
    #world-warp.is-arrival.is-leaving { opacity: 0; background: rgba(239, 248, 250, 0); }
    #world-warp.is-arrival.is-leaving::before,
    #world-warp.is-arrival.is-leaving::after { transform: scale(.06); opacity: 0; }
    @media (prefers-reduced-motion: reduce) {
      #world-warp, #world-warp::before, #world-warp::after, #world-warp span {
        transition-duration: 1ms !important;
        transition-delay: 0ms !important;
      }
    }
  `;
  document.head.appendChild(style);

  layer = document.createElement('div');
  layer.id = 'world-warp';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = '<span></span>';
  document.body.appendChild(layer);
  return layer;
};

export const warpTo = ({ href, from, to, label = '世界をわたる' }) => {
  if (active) return;
  active = true;
  try {
    sessionStorage.setItem(TRANSIT_KEY, JSON.stringify({ from, to, at: Date.now() }));
  } catch {}

  const layer = ensureLayer();
  layer.querySelector('span').textContent = label;
  requestAnimationFrame(() => layer.classList.add('is-active'));
  setTimeout(() => location.assign(href), WARP_MS);
};

export const playArrival = (world) => {
  let transit = null;
  try {
    transit = JSON.parse(sessionStorage.getItem(TRANSIT_KEY) || 'null');
    sessionStorage.removeItem(TRANSIT_KEY);
  } catch {}
  if (!transit || transit.to !== world || Date.now() - Number(transit.at || 0) > 20_000) return null;

  const layer = ensureLayer();
  layer.classList.add('is-arrival');
  requestAnimationFrame(() => requestAnimationFrame(() => layer.classList.add('is-leaving')));
  setTimeout(() => layer.remove(), WARP_MS + 80);
  return transit;
};

export const studioWorldHref = () => (
  ['localhost', '127.0.0.1'].includes(location.hostname) ? '/poc/island/' : '/'
);
