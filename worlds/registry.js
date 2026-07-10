export const WORLDS = Object.freeze({
  studio: {
    id: 'studio',
    name: 'Studio VIBE島',
    shortName: 'VIBE島',
    en: 'STUDIO VIBE',
    href: '/',
    localHref: '/poc/island/',
    room: 'island',
    accent: '#ef8fb2',
    description: '作品と人が集まる、Studio VIBEのメインアイランド。',
  },
  hub: {
    id: 'hub',
    name: '世界港',
    shortName: '世界港',
    en: 'WORLD PORT',
    href: '/worlds/',
    room: 'world-port',
    accent: '#75c8cf',
    description: 'VIBEの世界を結ぶ、島々への出発港。',
  },
  meikyo: {
    id: 'meikyo',
    name: '明鏡島',
    shortName: '明鏡島',
    en: 'MEIKYO',
    href: '/worlds/meikyo/',
    room: 'meikyo',
    accent: '#6faaa5',
    description: '三つの鏡を巡り、マーケティングの道筋を澄ませる島。',
    status: 'open',
  },
  luna: {
    id: 'luna',
    name: '月蝕綺譚島',
    shortName: '月蝕島',
    en: 'LUNA OCCULTA',
    href: '/worlds/luna/',
    room: 'luna-occulta',
    accent: '#a52e3c',
    description: '喰われた月の下、御霊と間合いに触れる夜の社。',
    status: 'open',
  },
  hankacho: {
    id: 'hankacho',
    name: 'ニンジャ犯科帳島',
    shortName: '犯科町',
    en: 'NINJA HANKACHO',
    href: '/worlds/hankacho/',
    room: 'ninja-hankacho',
    accent: '#257684',
    description: '忍びたちの日常と、小さな事件が待つ城下町。',
    status: 'open',
  },
});

export const worldHref = (id) => {
  const world = WORLDS[id];
  if (!world) return WORLDS.hub.href;
  if (id === 'studio' && ['localhost', '127.0.0.1'].includes(location.hostname)) {
    return world.localHref;
  }
  return world.href;
};

export const destinationWorlds = () => ['meikyo', 'luna', 'hankacho'].map((id) => WORLDS[id]);
