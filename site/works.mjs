// 作品台帳（トップの「つくってきたもの」と /works の唯一の出どころ）。
// 追加・並べ替えはここだけ直す。ビルド時に vite.config.js の studio-partials が静的HTMLへ展開する。
// status: live=配信中・公開中（朱の点）／soon=近日配信／dev=開発中。事実が変わったら必ず直す。
// cat: game / anime（アニメ・MV） / web（Webサービス・ワールド）。複数はスペース区切り。
// size: 'l' でトップの格子を8列ぶんに広げる。hidden: true で掲載から外す（台帳には残す）。
export const WORKS = [
  {
    slug: 'luna-occulta', href: '/luna-occulta', cat: 'game', kind: 'ゲーム', status: 'live', statusLabel: '配信中',
    title: '月蝕綺譚 -Luna Occulta-',
    desc: '月が蝕まれる夜を舞台にした、和風ファンタジーゲーム。iOS・Androidで配信中。',
    video: true, featured: 1, size: 'l',
  },
  {
    slug: 'hankacho', href: '/hankacho/', cat: 'anime', kind: 'アニメ', status: 'live', statusLabel: 'YouTubeで配信中',
    title: 'ニンジャ犯科帳',
    desc: '忍びの日常は、今日も騒がしい。フルAIでつくる短編アニメシリーズ。第10話までYouTubeで公開中。',
    video: true, featured: 2,
  },
  {
    slug: 'hyakka', href: 'https://hyakka.vibe.co.jp/', cat: 'game', kind: 'ゲーム', status: 'live', statusLabel: '配信中',
    title: '百火繚乱3D',
    desc: '赤い月の夜空を、折り紙の紙飛行機で翔ける。指一本で舞う和風3D弾幕シューティング。iOS・Androidで配信中。',
    video: true, featured: 3,
  },
  {
    slug: 'tsukioni', href: 'https://hyakki.vibe.co.jp/', cat: 'game', kind: 'ゲーム', status: 'live', statusLabel: '配信中',
    title: 'ツキオニ 〜月夜のおにおくり〜',
    desc: '御霊を台座に置いて、里の灯を守り抜く。和風あやかしタワーディフェンス。iOS・Androidで配信中。',
    video: true, featured: 4,
  },
  {
    slug: 'mitaseo', href: '/mitaseo/', cat: 'anime', kind: 'アニメ', status: 'live', statusLabel: 'YouTubeで公開',
    title: 'おばけのミタマと死にたがりの瀬織',
    desc: '成仏する気のない少女と、山の主のおばけ。未練を残した魂を救っていく、死から始まる物語。',
    video: true, featured: 5,
  },
  {
    slug: 'sakuya', href: '/sakuya/', cat: 'anime', kind: 'MV', status: 'live', statusLabel: 'YouTubeで公開',
    title: '咲耶 — 緋桜の夜庭',
    desc: 'ダーク文学を歌うアーティスト・咲耶。MV6本をYouTubeで公開中。',
    video: true, featured: 6,
  },
  {
    slug: 'dopamin', href: '/dopamin/', cat: 'game', kind: 'ゲーム', status: 'soon', statusLabel: '近日配信',
    title: 'どーぱみんくりっかー！',
    desc: 'たたけば斬撃、放っておけば仲間が戦う。月蝕綺譚の仲間30人と夜を進む放置系クリッカー。',
    video: true, featured: 7,
  },
  {
    slug: 'tsukiawase', href: '/tsukiawase/', cat: 'game', kind: 'ゲーム', status: 'live', statusLabel: '配信中',
    title: 'ツキアワセ 〜月夜の絵あわせ〜',
    desc: '同じ絵札を三枚そろえて山を崩す、一日一局の絵あわせパズル。App Store・Google Playで配信中。',
    featured: 8,
  },
  {
    slug: 'gachiho', href: 'https://gachiho.ninja/', cat: 'web', kind: 'Webサービス', status: 'live', statusLabel: '公開中',
    title: 'Gachiho',
    desc: 'CNPと月蝕綺譚のためのNFTマーケットプレイス。非カストディ・手数料なしで売り買いできます。',
  },
  {
    slug: 'island', href: '/island', cat: 'web', kind: 'ワールド', status: 'live', statusLabel: '公開中',
    title: '夜空の島',
    desc: '夜空に浮かぶ島を歩く、ブラウザのバーチャルスタジオ。ゲーム・アニメ・音楽の三館と星屑夜市があります。スマホの縦画面で遊べます。',
  },
  {
    slug: 'senri', href: '/senri/', cat: 'game', kind: 'ゲーム', status: 'live', statusLabel: 'iOSテスト版',
    title: 'SENRI',
    desc: 'お供と歩き、草鞋を育てる。いつもの散歩が旅になる、和風ウォークゲーム。',
  },
  {
    slug: 'otetsudai', href: '/otetsudai/', cat: 'game', kind: 'アプリ', status: 'live', statusLabel: '配信中',
    title: '咲耶のおてつだいチャレンジ',
    desc: 'おうちのおてつだいを「円」にして、ほしいものまでの道のりを見える化。子ども向けの金融教育アプリ。',
  },
  // 2026-09-28 本人指示で掲載から外した（開発中のため）。hidden を外せば戻る
  {
    slug: 'luna-occulta-mmo', href: '/luna-occulta-mmo', cat: 'game', kind: 'ゲーム', status: 'dev', statusLabel: '開発中',
    title: '月蝕綺譚ONLINE',
    desc: '月蝕綺譚の世界を仲間と歩く、スマホ向けの新作MMORPG。',
    hidden: true,
  },
  {
    slug: 'luna-catenata', href: '/luna-catenata', cat: 'game', kind: 'ゲーム', status: 'dev', statusLabel: '開発中',
    title: '月蝕綺譚 鎖月 -Luna Catenata-',
    desc: '三霊をつなぎ、戦いの理を編みかえる。一夜三分の攻防を遊ぶブラウザゲーム。',
    hidden: true,
  },
]

const VISIBLE = WORKS.filter((w) => !w.hidden)

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const card = (w, { eager = false } = {}) => `
<article class="work reveal${w.size === 'l' ? ' is-large' : ''}" data-cat="${w.cat}"${w.video ? ` data-video="/studio/works/${w.slug}.mp4"` : ''}>
  <a class="work-link" href="${w.href}"${w.href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>
    <div class="work-media"><img src="/studio/works/${w.slug}.webp" alt="" width="960" height="504" ${eager ? '' : 'loading="lazy" '}decoding="async" /></div>
    <p class="work-meta"><span>${esc(w.kind)}</span><span class="status${w.status === 'live' ? ' is-live' : ''}">${esc(w.statusLabel)}</span></p>
    <h3 class="h-item work-title">${esc(w.title)}&nbsp;<span class="go" aria-hidden="true">↗</span></h3>
    <p class="work-desc">${esc(w.desc)}</p>
  </a>
</article>`

export const renderWorks = (mode) => {
  if (mode === 'featured') {
    return VISIBLE.filter((w) => w.featured).sort((a, b) => a.featured - b.featured).map((w) => card(w)).join('')
  }
  return VISIBLE.map((w) => card({ ...w, size: undefined })).join('')
}

export const WORKS_COUNT = VISIBLE.length
