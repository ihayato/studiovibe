// 制作レポート『AIで、ゲームは本当にちゃんと作れるのか。』（/report/deck）の中身。
// ビルド時に vite.config.js の studio-partials が <!-- @deck --> を静的HTMLへ展開する（グラフもSVGとして焼き込む）。
// 動き（ページ送り・カウントアップ・グラフの伸び・押すと開く部品）は site/deck.js。
// 厳守: 事実の出典は cn-kitan リポジトリの記録（site/deck-data.mjs）。攻撃の手がかりになる具体は書かない。
//       「イメージ図」と明記したもの以外は実データ。仮置きの料金・条件（試作パッケージ・NDA等）は載せない。
import { CHARACTERS, COMMITS_WEEKLY, TESTS_WEEKLY, TEST_FILES, REVIEWS_MONTHLY, PRIVACY, SCREENS, CI_JOBS, FAL_TOTAL_USD, FAL_BREAKDOWN, FAL_JULY_USD, USD_JPY, UNIT_COSTS, CF_USAGE, CF_R2, LLM_COST_STEPS, LLM_DAILY_CAP, AI_TOOLS, AI_TOOLS_MONTHS } from './deck-data.mjs'

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const fmt = (n) => n.toLocaleString('ja-JP')
const ILLU = '/studio/report/illu'
const COMMITS_SUM = COMMITS_WEEKLY.reduce((n, [, v]) => n + v, 0)
const illu = (name, cls = '') => `<img class="ds-illu ${cls}" src="${ILLU}/${name}.webp" alt="" loading="lazy" decoding="async" />`

let count = 0
const slides = []
const add = (title, html, { cls = '', chapter = '', id: slug } = {}) => {
  count += 1
  const id = slug || `p${String(count).padStart(2, '0')}`
  slides.push({ id, title, chapter, no: count })
  return `<section class="ds ${cls}" id="${id}" data-title="${esc(title)}" aria-label="${esc(title)}">${html}</section>`
}
const head = (kicker, title) => `<header class="ds-head">${kicker ? `<p class="ds-kicker">${kicker}</p>` : ''}<h2>${title}</h2></header>`

// ---------- グラフ（SVG を焼き込む。色は CSS のクラスで塗る） ----------
// 1系列の棒グラフ。4px 丸めの上端・基線に接地・2px の隙間。ホバーで data-tip を出す
const barChart = ({ data, unit, tip, aria, highlight = [], labelEvery = 1, h = 360 }) => {
  const W = 1000, H = h, padL = 56, padR = 8, padT = 40, padB = 44
  const max = Math.max(...data.map((d) => d[1]))
  const nice = Math.ceil(max / 500) * 500
  const band = (W - padL - padR) / data.length
  const bw = Math.min(56, band - 8)
  const y = (v) => padT + (H - padT - padB) * (1 - v / nice)
  const grid = Array.from({ length: nice / 500 + 1 }, (_, k) => k * 500).map((v) => {
    const yy = y(v)
    return `<line class="grid" x1="${padL}" x2="${W - padR}" y1="${yy}" y2="${yy}"/><text class="axis" x="${padL - 10}" y="${yy + 5}" text-anchor="end">${fmt(v)}</text>`
  }).join('')
  const bars = data.map(([label, v], i) => {
    const x = padL + band * i + (band - bw) / 2, top = y(v), base = y(0), r = 4
    const path = `M${x},${base} V${top + r} Q${x},${top} ${x + r},${top} H${x + bw - r} Q${x + bw},${top} ${x + bw},${top + r} V${base} Z`
    const hl = highlight.includes(i)
    return `<g class="bar${hl ? ' is-hl' : ''}" style="--i:${i}" data-tip="${esc(tip(label, v))}"${hl ? ' tabindex="0"' : ''}>
      <rect class="hit" x="${padL + band * i}" y="${padT}" width="${band}" height="${H - padT - padB}"/>
      <path class="mark" d="${path}"/>
      ${hl ? `<text class="val" x="${x + bw / 2}" y="${top - 12}" text-anchor="middle">${fmt(v)}${unit}</text>` : ''}
      ${i % labelEvery === 0 || i === data.length - 1 ? `<text class="axis" x="${x + bw / 2}" y="${H - 14}" text-anchor="middle">${label}</text>` : ''}
    </g>`
  }).join('')
  return `<svg class="chart bar-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(aria)}">${grid}<line class="base" x1="${padL}" x2="${W - padR}" y1="${y(0)}" y2="${y(0)}"/>${bars}</svg>`
}

// 1系列の折れ線（面つき）。最初と最後だけ値を直接ラベル。各点はホバーで data-tip
const lineChart = ({ data, unit, tip, aria, h = 520 }) => {
  const W = 1000, H = h, padL = 64, padR = 40, padT = 48, padB = 44
  const max = Math.max(...data.map((d) => d[1]))
  const nice = Math.ceil(max / 500) * 500
  const step = (W - padL - padR) / (data.length - 1)
  const x = (i) => padL + step * i
  const y = (v) => padT + (H - padT - padB) * (1 - v / nice)
  const pts = data.map(([, v], i) => `${x(i)},${y(v)}`)
  const line = `M${pts.join(' L')}`
  const area = `${line} L${x(data.length - 1)},${y(0)} L${x(0)},${y(0)} Z`
  const grid = [0, 0.5, 1].map((t) => {
    const v = Math.round(nice * t), yy = y(v)
    return `<line class="grid" x1="${padL}" x2="${W - padR}" y1="${yy}" y2="${yy}"/><text class="axis" x="${padL - 10}" y="${yy + 5}" text-anchor="end">${fmt(v)}</text>`
  }).join('')
  const last = data.length - 1
  const points = data.map(([label, v], i) => `<g class="pt" data-tip="${esc(tip(label, v))}"${i === last ? ' tabindex="0"' : ''}>
      <rect class="hit" x="${x(i) - step / 2}" y="${padT}" width="${step}" height="${H - padT - padB}"/>
      <circle class="dot${i === last ? ' is-last' : ''}" cx="${x(i)}" cy="${y(v)}" r="6"/>
      ${i % 2 === 0 || i === last ? `<text class="axis" x="${x(i)}" y="${H - 14}" text-anchor="middle">${label}</text>` : ''}
    </g>`).join('')
  return `<svg class="chart line-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(aria)}">
    <defs><linearGradient id="lg-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ede8df" stop-opacity=".22"/><stop offset="1" stop-color="#ede8df" stop-opacity="0"/></linearGradient></defs>
    ${grid}<path class="area" d="${area}" fill="url(#lg-area)"/><path class="line" d="${line}" pathLength="1"/>
    <circle class="dot is-first" cx="${x(0)}" cy="${y(data[0][1])}" r="6"/>
    <text class="val" x="${x(0) + 16}" y="${y(data[0][1]) + 32}">${fmt(data[0][1])}${unit}</text>
    <text class="val is-hl" x="${x(last) - 8}" y="${y(data[last][1]) - 20}" text-anchor="end">${fmt(data[last][1])}${unit}</text>
    ${points}</svg>`
}

// 月別の積み上げ棒（2系列: 別のAIによるレビュー／そのほかの点検）
const stackedBars = (data) => {
  const W = 1000, H = 360, padL = 56, padR = 8, padT = 32, padB = 48
  const max = Math.ceil((Math.max(...data.map((d) => d.codex + d.other)) + 3) / 5) * 5
  const band = (W - padL - padR) / data.length
  const bw = 120
  const y = (v) => padT + (H - padT - padB) * (1 - v / max)
  const grid = Array.from({ length: max / 5 + 1 }, (_, k) => k * 5).map((v) => `<line class="grid" x1="${padL}" x2="${W - padR}" y1="${y(v)}" y2="${y(v)}"/><text class="axis" x="${padL - 10}" y="${y(v) + 5}" text-anchor="end">${v}</text>`).join('')
  const bars = data.map((d, i) => {
    const x = padL + band * i + (band - bw) / 2
    const total = d.codex + d.other
    const yCodexTop = y(d.codex), yTotalTop = y(total), base = y(0)
    return `<g class="bar" style="--i:${i}" data-tip="${esc(`${d.month}: 報告書${total}本（うち別のAI ${d.codex}本）`)}">
      <rect class="hit" x="${padL + band * i}" y="${padT}" width="${band}" height="${H - padT - padB}"/>
      <rect class="mark seg-a" x="${x}" y="${yCodexTop}" width="${bw}" height="${base - yCodexTop}"/>
      ${d.other ? `<rect class="mark seg-b" x="${x}" y="${yTotalTop}" width="${bw}" height="${yCodexTop - yTotalTop - 2}" rx="4"/>` : ''}
      <text class="val" x="${x + bw / 2}" y="${yTotalTop - 12}" text-anchor="middle">${total}本</text>
      <text class="axis" x="${x + bw / 2}" y="${H - 16}" text-anchor="middle">${d.month}</text>
    </g>`
  }).join('')
  return `<svg class="chart stack-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(data.map((d) => `${d.month} ${d.codex + d.other}本（うち別のAI ${d.codex}本）`).join('、'))}">${grid}<line class="base" x1="${padL}" x2="${W - padR}" y1="${y(0)}" y2="${y(0)}"/>${bars}</svg>`
}

// イメージ図: 見る人が増えたときのデータベースへのアクセス（キャッシュなし＝比例／あり＝ほぼ一定）
const cacheConcept = () => `<svg class="chart concept-chart" viewBox="0 0 1000 360" role="img" aria-label="イメージ図">
  <line class="base" x1="60" x2="980" y1="300" y2="300"/><line class="base" x1="60" x2="60" y1="30" y2="300"/>
  <text class="axis" x="980" y="336" text-anchor="end">見る人の数 →</text>
  <text class="axis" x="72" y="44">データベースへのアクセス</text>
  <path class="line ghost" d="M60,296 L960,60" pathLength="1"/>
  <path class="line" d="M60,292 C200,262 260,258 960,250" pathLength="1"/>
  <text class="axis" x="48" y="306" text-anchor="end">0</text>
  <text class="lbl dim" x="950" y="48" text-anchor="end">キャッシュなし</text>
  <text class="lbl" x="950" y="232" text-anchor="end">キャッシュあり（月蝕綺譚）</text>
</svg>`

// ---------- 費用のグラフ ----------
const usd = (n) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
const yenMan = (usdN) => `約${Math.round((usdN * USD_JPY) / 10000)}万円`
const TOOLS_MONTHLY = AI_TOOLS.reduce((n, t) => n + t.accounts * t.usdPerMonth, 0)
const TOOLS_TOTAL = TOOLS_MONTHLY * AI_TOOLS_MONTHS

// fal の内訳: 横一本の積み上げバー＋凡例（値は直接ラベル）
const falBar = () => {
  const total = FAL_BREAKDOWN.reduce((n, d) => n + d.usd, 0)
  return `<div class="stackbar" role="img" aria-label="${esc(FAL_BREAKDOWN.map((d) => `${d.label} ${usd(d.usd)}`).join('、'))}">
    ${FAL_BREAKDOWN.map((d, i) => `<span class="sb sb-${d.key}" style="--w:${(d.usd / total) * 100}%;--i:${i}" data-tip="${esc(`${d.label}：${usd(d.usd)}（${d.note}）`)}"><b>${d.label}</b></span>`).join('')}
  </div>
  <ul class="sb-legend">${FAL_BREAKDOWN.map((d) => `<li><i class="sb-${d.key}"></i><b>${d.label}</b><span>${usd(d.usd)}</span><em>${d.note}</em></li>`).join('')}</ul>`
}

// Cloudflare: 月額プランの範囲に対する使用率のバー（100% の位置に目印）
const cfBars = () => `<div class="util">
  ${CF_USAGE.map((d, i) => {
    const pct = (d.used / d.included) * 100
    const w = Math.min(pct, 220) / 2.2 // 220% を横幅いっぱいとする
    return `<div class="util-row" style="--i:${i}">
      <p class="util-name">${d.what}</p>
      <div class="util-track"><span class="util-bar${pct > 100 ? ' is-over' : ''}" style="--w:${w}%"></span><span class="util-line" aria-hidden="true"></span></div>
      <p class="util-val"><b>${Math.round(pct)}%</b><span>${fmt(d.used)} / 範囲 ${fmt(d.included)} ${d.unit}</span><em>超過の費用 ${d.over}</em></p>
    </div>`
  }).join('')}
  <p class="util-key"><i aria-hidden="true"></i>縦の線が月額プランの範囲（100%）。斜線は範囲を超えた項目</p>
</div>`

// 会話AI 1回あたり: 下がっていく棒
const llmBars = () => {
  const max = LLM_COST_STEPS[0].yen
  return `<div class="steps-cost" role="img" aria-label="${esc(LLM_COST_STEPS.map((d) => `${d.when} ${d.yen}円`).join('、'))}">
    ${LLM_COST_STEPS.map((d, i) => `<div class="sc" style="--h:${(d.yen / max) * 100}%;--i:${i}"><span class="sc-val">${d.yen}<small>円</small></span><span class="sc-bar${i === LLM_COST_STEPS.length - 1 ? ' is-hl' : ''}"></span><b>${d.when}</b><em>${d.how}</em></div>`).join('')}
  </div>`
}

// 技術構成（実際の構成: cn-kitan の worker/・worker-takusen/ の wrangler.toml で確認 09-28）
const ARCH_NODES = [
  ['Cloudflare Workers', 'サーバーの処理', '機能ごとに別々のWorkerで動かし、1つの不具合が全体に広がらないようにしています。'],
  ['Cloudflare D1', 'データベース', 'プレイヤーのデータを保存します。本番とテスト用は分けています。'],
  ['Cloudflare KV', 'ランキングの集計', 'ランキングは集計済みの結果を配り、データベースへの読み込みを減らしています。'],
  ['Cloudflare R2', '素材の配信', 'アプリには最初の素材だけを入れ、絵・動画・声は必要なときに配信します。'],
  ['Turnstile', 'ボット対策・回数制限', '会員登録などの入口でボットを見分け、回数の上限と組み合わせています。'],
  ['OpenAI', 'キャラと話すAI（外部）', '軽量モデルをサーバー経由で呼び、端末ごと・1日あたりの回数に上限を設けています。'],
]

// ---------- 詳しく見る（実物の素材を並べるパネル） ----------
// スライドは結論、パネルは証拠。素材はすべて月蝕綺譚の制作で実際に出たもの（public/studio/report/more/）。
// media: { img|video|audio: パス, tag: 札（生成したまま／直した後／見本 など）, w, h, alt }
const MORE = '/studio/report/more'
const media = (m) => {
  const tag = m.tag ? `<span class="mm-tag${m.good ? ' is-good' : ''}">${esc(m.tag)}</span>` : ''
  const cap = m.cap ? `<figcaption>${esc(m.cap)}</figcaption>` : ''
  if (m.video) return `<figure class="mm is-video">${tag}<video src="${MORE}/${m.video}" ${m.poster ? `poster="${MORE}/${m.poster}" ` : ''}muted loop playsinline controls preload="none" width="${m.w}" height="${m.h}" aria-label="${esc(m.alt || m.tag || '')}"></video>${cap}</figure>`
  if (m.audio) return `<figure class="mm is-audio">${tag}<audio src="${MORE}/${m.audio}" controls preload="none" aria-label="${esc(m.tag || '')}の声"></audio>${cap}</figure>`
  return `<figure class="mm">${tag}<img src="${MORE}/${m.img}" alt="${esc(m.alt || '')}" width="${m.w}" height="${m.h}" loading="lazy" decoding="async" />${cap}</figure>`
}
// cases: [{ id, title, body, media: [...], cols }]
const more = (key, title, cases) => `
  <dialog class="more" id="more-${key}" aria-labelledby="more-${key}-t">
    <div class="more-head"><div><p class="ds-kicker">詳しく見る</p><p class="more-title" id="more-${key}-t">${title}</p></div><button type="button" class="player-close" data-more-close aria-label="閉じる">×</button></div>
    <div class="more-body" tabindex="-1" autofocus>
      ${cases.map((c) => `<section class="more-case" id="mc-${c.id}">
        <h3 tabindex="-1">${c.title}</h3>${c.body ? `<p>${c.body}</p>` : ''}
        <div class="mm-row" style="--cols:${c.cols || c.media.length}">${c.media.map(media).join('')}</div>
      </section>`).join('')}
    </div>
  </dialog>`
const fitItem = (label, caseId) => `<button type="button" data-more="fit" data-more-case="${caseId}"><b>${label}</b></button>`
const moreBtn = (key, label = '詳しく見る') => `<button type="button" class="btn btn-ghost more-open" data-more="${key}">${label}<span class="arrow" aria-hidden="true">→</span></button>`

// ---------- スライド ----------
// 型: 「Q. 読者の疑問」→ 答えの見出し → 図1つ → 一言。注記は数え方のページにまとめる。
const S = []
const go = (id, label) => `<button type="button" class="a" data-go="#${id}">${label}</button>`
const q = (text) => `<p class="ds-kicker q-kicker">Q. ${text}</p>`
const h = (question, title) => `<header class="ds-head">${q(question)}<h2>${title}</h2></header>`

S.push(add('表紙', `
  <div class="cover-eclipse" aria-hidden="true"></div>
  <div class="ds-in">
    <p class="ds-kicker">STUDIO VIBE REPORT ／ 2026年9月</p>
    <h1>AIで、ゲームは<br>本当にちゃんと<br>作れるのか。</h1>
    <p class="cover-sub">月蝕綺譚 制作・運用レポート</p>
    <p class="ds-lead">AIを使ったゲーム開発を外注する前に出てくる疑問に、私たちが開発・運用しているスマホゲーム『月蝕綺譚』の記録でお答えします。</p>
    <button type="button" class="btn btn-primary ds-start" data-go="next">はじめる<span class="arrow" aria-hidden="true">↓</span></button>
  </div>${illu('shiori_chibi_eclipse', 'is-cover')}`, { cls: 'is-cover', id: 'cover' }))

S.push(add('気になるところから', `
  <div class="ds-in">
    ${head('はじめに', '気になるところから、どうぞ。')}
    <div class="roles">
      ${[
        ['ゲームの品質は？', [['real', '実物'], ['fit', '向き・不向き'], ['pipeline', '作り方'], ['botsu', 'ボツ素材']]],
        ['費用はいくら？', [['cost-gen', 'AIの費用'], ['cost-run', '公開後の費用'], ['cost-kinds', '発注の費用']]],
        ['公開後も安全？', [['arch', '構成'], ['security', 'セキュリティ'], ['restore', '止まったら']]],
        ['何を決めれば発注できる？', [['approval', '確認の流れ'], ['agree', '決めること'], ['checklist', 'チェックリスト']]],
      ].map(([qq, links]) => `<div class="role-card"><p class="role-name">${qq}</p><div class="role-links">${links.map(([id, l]) => go(id, `${l} →`)).join('')}</div></div>`).join('')}
    </div>
  </div>`, { id: 'roles' }))

S.push(add('実物を見る', `
  <div class="ds-in split real">
    <div>
      ${h('AIで、どんな品質のゲームができる？', 'まず、月蝕綺譚をご覧ください。')}
      <div class="stats">
        <div><b data-count="${CHARACTERS}">${CHARACTERS}</b><span>キャラクター</span></div>
        <div><b data-count="850">850</b><span>ボイス（本以上）</span></div>
        <div><b class="is-text">iOS<br>Android</b><span>配信中</span></div>
      </div>
      <p class="ds-note">2026年7月から社内で開発・運用している和風ファンタジーです。<a href="/luna-occulta" target="_blank" rel="noopener">公式サイト↗</a>　アニメの実績は<a href="/hankacho/" target="_blank" rel="noopener">ニンジャ犯科帳↗</a></p>
      ${moreBtn('real', '画面を見る')}
    </div>
    <figure class="phone-video">
      <video data-autoplay muted loop playsinline preload="none" poster="/studio/report/kitan_play.webp" src="/studio/report/kitan_play.mp4" aria-label="月蝕綺譚の画面を収めた紹介映像"></video>
    </figure>
  </div>${more('real', '月蝕綺譚の画面', [
    { id: 'screens', title: '実際のゲーム画面', cols: 4, media: [
      { img: 'ss_home.webp', w: 390, h: 846, tag: 'ホーム', alt: 'ホーム画面。留守の間に集まった小判と経験値を受け取る' },
      { img: 'ss_battle.webp', w: 390, h: 846, tag: '戦闘', alt: '戦闘画面。ダメージの数字と、必殺技を放つボタン' },
      { img: 'ss_summon.webp', w: 390, h: 846, tag: '召喚', alt: '召喚の演出。月蝕の下で札を解放する' },
      { img: 'ss_hensei.webp', w: 390, h: 846, tag: '編成', alt: '編成画面。キャラクターの能力と立ち絵' },
    ] },
  ])}`, { id: 'real' }))

S.push(add('向き・不向き', `
  <div class="ds-in">
    ${h('ゲーム制作で、AIが苦手なことは？', '細かい動きと文字は苦手。試作で確かめます。')}
    <div class="fit">
      <div class="fit-col is-good"><p class="lane-label">AIが得意</p><ul>
        <li>${fitItem('キャラクターの絵を数多く作る', 'many')}</li>
        <li>${fitItem('短い演出動画をたくさん作る', 'movie')}</li>
        <li><b>企画の段階で、素早く試作する</b></li>
        <li>${fitItem('キャラクターごとに声をつける', 'voice')}</li>
      </ul></div>
      <div class="fit-col is-care"><p class="lane-label">AIが苦手</p><ul>
        <li>${fitItem('手や道具の細かい形と動き', 'hands')}</li>
        <li>${fitItem('既存キャラクターの厳密な再現', 'likeness')}</li>
        <li><b>長く途切れない演技</b></li>
        <li>${fitItem('絵の中の文字', 'text')}</li>
      </ul></div>
    </div>
    ${moreBtn('fit', '実例を見る')}
  </div>${illu('shiori_chibi_story')}${more('fit', 'AIの得意・苦手を、実物で', [
    { id: 'many', title: 'キャラクターの絵を数多く作る', body: '同じ画風で、仲間のキャラクターを描き分けています。ゲームで使っている立ち絵の一部です。', media: [
      { img: 'lineup.webp', w: 1600, h: 840, alt: '月蝕綺譚のキャラクター16人の立ち絵を並べたもの' },
    ] },
    { id: 'movie', title: '短い演出動画をたくさん作る', body: 'キャラクター紹介の動画と、動く札の絵。どちらもAIで作った5秒ほどの動画です。', media: [
      { video: 'showcase_sasura.mp4', poster: 'showcase_sasura_poster.webp', w: 432, h: 768, tag: 'キャラクター紹介' },
      { video: 'gisho_anim.mp4', poster: 'gisho_poster.webp', w: 540, h: 748, tag: '動く札' },
    ] },
    { id: 'voice', title: 'キャラクターごとに声をつける', body: 'ゲームの中で流れている声です。', media: [
      { audio: 'voice_oto.m4a', tag: '於兎' },
      { audio: 'voice_shiori.m4a', tag: '栞' },
    ] },
    { id: 'hands', title: '手や道具の細かい形と動き', body: '手を合わせて祈るポーズのはずが、指が組み合わさり、付け根がねじれていました。手元だけ作り直して差し替えました。', media: [
      { img: 'hz_before.webp', w: 480, h: 480, tag: '修正前', alt: '指が組み合わさり、付け根がねじれた手' },
      { img: 'hz_after.webp', w: 480, h: 480, tag: '直した後', good: true, alt: '手のひらを合わせた合掌' },
    ] },
    { id: 'likeness', title: '既存キャラクターの厳密な再現', body: 'サスラの眼鏡は、下の縁だけの形で、目はレンズの内側に入るのが正解。AIは目の下に四角い枠を描きました。於兎には牙がないのに、口元に牙が描かれています。', cols: 4, media: [
      { img: 'glasses_before.webp', w: 560, h: 982, tag: '修正前', alt: '目の下に四角い枠がある眼鏡' },
      { img: 'glasses_after.webp', w: 560, h: 982, tag: '直した後', good: true, alt: '目がレンズの内側に入った眼鏡' },
      { img: 'fang_before.webp', w: 515, h: 870, tag: '修正前', alt: '口元に牙がある於兎' },
      { img: 'fang_after.webp', w: 515, h: 870, tag: '直した後', good: true, alt: '牙のない於兎' },
    ] },
    { id: 'text', title: '絵の中の文字', body: '文字を入れる場所を空けた下地に、文言を指定してAIに文字を描かせます。誤字が出たり、指定していない場所まで描き直されたりするので、全行を目で照合してから使います。', media: [
      { img: 'thumb_base.webp', w: 960, h: 540, tag: '下地', alt: 'キャラクターの顔を並べ、右側を空けたサムネイル' },
      { img: 'thumb_final.webp', w: 960, h: 540, tag: 'AIが文字を描いた完成版', good: true, alt: '「キャラクター紹介ムービー」の文字が入ったサムネイル' },
    ] },
  ])}`, { id: 'fit' }))

S.push(add('AIの費用', `
  <div class="ds-in">
    ${h('月蝕綺譚で、AIの利用料はいくらかかった？', '開発用AIに約78万円。素材づくりのAIに約49万円。')}
    <div class="cost-hero three">
      <div class="cost-total"><p class="lane-label">開発用AI（プログラム／約${AI_TOOLS_MONTHS}か月）</p><b>${usd(TOOLS_TOTAL)}</b><span>${yenMan(TOOLS_TOTAL)}</span>
        <ul class="tool-list">${AI_TOOLS.map((t) => `<li>${t.name} ${t.plan} × ${t.accounts}</li>`).join('')}</ul></div>
      <div class="cost-total is-sub"><p class="lane-label">素材づくりのAI（画像・動画・音声／fal）</p><b>${usd(FAL_TOTAL_USD)}</b><span>${yenMan(FAL_TOTAL_USD)}</span></div>
    </div>
    <figure class="figure"><figcaption>素材づくりのAIの内訳</figcaption>${falBar()}</figure>
    <p class="ds-note">数え方は「<button type="button" class="inline-go" data-go="#method">数字の読み方</button>」に。</p>
  </div>`, { id: 'cost-gen' }))

S.push(add('1回あたりの料金', `
  <div class="ds-in split">
    <div>
      ${h('AIで素材を1つ作ると、いくら？', '画像1枚6〜12円、動画5秒60円ほど。')}
      <table class="unit-table">
        <tbody>${UNIT_COSTS.map((u) => `<tr><th>${u.what}</th><td>${u.yen}<small>$${u.usd}</small></td></tr>`).join('')}</tbody>
      </table>
      <p class="ds-note">総額を左右するのは、単価より作り直しの回数です。</p>
      ${moreBtn('cost-unit', '実際の例を見る')}
    </div>
    <div class="saving">
      <p class="lane-label">費用を抑える工夫</p>
      <ol>
        <li><b>低い解像度で作り、手元で拡大</b></li>
        <li><b>1本の動画に、複数の動きをまとめる</b></li>
        <li><b>構図と合格の基準を先に決める</b></li>
      </ol>
    </div>
  </div>${more('cost-unit', '料金と、作り直しの実物', [
    { id: 'video', title: '5秒の動画を、480pで作る', body: 'タルトの紹介動画です。動画の料金は画素の数に比例するので、480pで作ると720pの半分ほどで済みます。ゲームに入れる素材は、これを手元で拡大して使います。', cols: 2, media: [
      { video: 'tart_480p.mp4', poster: 'tart_480p_poster.webp', w: 496, h: 864, tag: '480p・5秒', alt: 'タルトの紹介動画' },
    ] },
    { id: 'retake', title: '作り直しの回数：タルトの見た目は、8版目で決まった', body: '1枚の単価が安くても、作り直すほど総額は増えます。キャラクターの見た目は、何版も作って比べてから決めています。', cols: 4, media: [
      { img: 'tart_v1.webp', w: 360, h: 540, tag: '1版目', alt: '大きな盾を持つ、短い髪のタルト' },
      { img: 'tart_v3.webp', w: 360, h: 540, tag: '3版目', alt: '長い髪になったタルト' },
      { img: 'tart_v6.webp', w: 360, h: 540, tag: '6版目', alt: '羽衣が加わったタルト' },
      { img: 'tart_v8.webp', w: 360, h: 540, tag: '8版目・採用', good: true, alt: '盾をやめ、浮かぶ札をまとったタルト' },
    ] },
  ])}`, { id: 'cost-unit' }))

S.push(add('公開後の費用', `
  <div class="ds-in">
    ${h('ゲームを公開した後は、毎月いくらかかる？', 'サーバー代は定額＋数ドル。キャラと話すAIは1回0.08円。')}
    <div class="split wide-chart even">
      <figure class="figure"><figcaption>サーバー（Cloudflare）月額プランの範囲に対する使用量・30日間</figcaption>${cfBars()}</figure>
      <figure class="figure"><figcaption>キャラと話すAI：1回あたりの費用（円）</figcaption>${llmBars()}</figure>
    </div>
    <p class="ds-note">キャラと話すAIは、1日${fmt(LLM_DAILY_CAP)}回までに制限しています。</p>
  </div>`, { id: 'cost-run' }))

S.push(add('発注の費用', `
  <div class="ds-in">
    ${h('発注すると、何に費用がかかる？', '制作費・実費・運用費・保守費の4つです。')}
    <div class="cost-kinds">
      ${[
        ['制作費', '企画から実装・確認まで'],
        ['外部の実費', 'AIや素材サービスの利用料'],
        ['運用費', 'サーバー代、使うたびのAI利用料'],
        ['保守・更新', '修正、OS対応、追加'],
      ].map(([t, d], i) => `<div class="ck" style="--i:${i}"><b>${t}</b><p>${d}</p></div>`).join('')}
    </div>
    <p class="ds-note">制作費はゲーム・アニメとも30万円〜。運用費は、アプリなど公開後も動かす案件だけにかかります。</p>
  </div>`, { id: 'cost-kinds' }))

S.push(add('作り方', `
  <div class="ds-in">
    ${h('AIに任せきりで、ゲームの品質は大丈夫？', 'AIが作り、検査プログラムが見張り、人が選びます。')}
    <ol class="pipe">
      <li style="--i:0"><b>見本</b><span>人が基準の絵を決める</span></li>
      <li style="--i:1"><b>生成</b><span>AIが作る</span></li>
      <li style="--i:2"><b>自動の検査</b><span>欠けや動かない素材を探す</span></li>
      <li style="--i:3" class="is-human"><b>人の確認</b><span>見て、聴いて、選ぶ</span></li>
      <li style="--i:4"><b>採用</b><span>一覧に記録</span></li>
    </ol>
    <svg class="pipe-back" viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden="true"><path d="M690,0 V34 H310 V6" /><path class="head" d="M302,14 L310,2 L318,14" /></svg>
    <p class="pipe-loop-label">不合格なら、見分け方を基準に足して作り直す</p>
    ${moreBtn('pipeline', '実際の例を見る')}
  </div>${more('pipeline', '作り方を、実物で', [
    { id: 'sample', title: '見本：キャラクターごとに、基準の絵を決めておく', body: '正面・横・後ろの姿と表情をまとめた見本です。絵を作るたびに、これをAIに渡します。', media: [
      { img: 'atoza_sheet.webp', w: 1024, h: 768, alt: '阿都座の正面・横・後ろの姿と、表情4種をまとめた見本' },
    ] },
    { id: 'notice', title: '人の確認：公開後に、指の崩れが見つかった', body: '栞の札の絵です。縮小した全体では気づきにくい崩れ方で、公開後に見つかりました。拡大して確かめています。', cols: 2, media: [
      { img: 'hands_zoom.webp', w: 600, h: 642, tag: '拡大', alt: '指が組み合わさった手の拡大' },
    ] },
    { id: 'gen', title: '作り直し：手元だけを描き直した候補を並べる', body: '絵はそのままに、手元だけを描き直した候補を並べて比べました。', media: [
      { img: 'candidates.webp', w: 1400, h: 702, alt: '手元だけを描き直した栞の札の候補を並べた一覧', cap: '左端が修正前。右の4枚が作り直しの候補で、左から4枚目を採用しました。' },
    ] },
    { id: 'adopt', title: '採用：直した絵を、動く札に', body: '手元を直した絵を動画にして、札を差し替えました。', cols: 2, media: [
      { video: 'gisho_anim.mp4', poster: 'gisho_poster.webp', w: 540, h: 748, tag: '採用', good: true, alt: '手元を直した栞の札の動画' },
    ] },
  ])}`, { id: 'pipeline' }))

S.push(add('失敗から', `
  <div class="ds-in">
    ${h('AIの素材で失敗したら、どうなる？', '失敗するたびに、検査を増やしています。')}
    <div class="fixes">
      ${[
        ['キャラの攻撃動画が、構えたまま動かない', '動かない動画を、公開前に自動で検出'],
        ['作った素材が、ゲームに入っていない', '素材の一覧と照合し、漏れがあれば公開を止める'],
        ['同じキャラの顔が、少しずつ変わる', '毎回、同じ見本の絵をAIに渡す'],
      ].map(([a, b]) => `<div class="fix"><div class="fix-a"><span class="lane-label">起きたこと</span><p>${a}</p></div><div class="fix-arrow" aria-hidden="true">↓</div><div class="fix-b"><span class="lane-label">いま</span><p>${b}</p></div></div>`).join('')}
    </div>
    ${moreBtn('fixes', '実際の例を見る')}
  </div>${more('fixes', '見逃しから、検査を足した例', [
    { id: 'head', title: 'パンダの頭に、黒い影が出た', body: '食べる動きの動画の一部のコマで、頭の上に黒い影が残っていました。確認では顔だけを見ていて、見逃しました。いまは、頭の輪郭の外にある黒い点も数えています。', media: [
      { img: 'riri_before.webp', w: 480, h: 380, tag: '見逃したコマ', alt: '頭の上に黒い影があるパンダ' },
      { img: 'riri_after.webp', w: 480, h: 380, tag: '直した後', good: true, alt: '同じコマの、影のないパンダ' },
    ] },
  ])}`, { id: 'fixes' }))

// ボツ素材: 実際にボツにした素材と、採用した版（出典は 旧Mac救出/deck-botsu-mokuroku_20260929/MOKUROKU.md と各記憶メモ）
const BOTSU = [
  { id: 'scythe', why: '鎌の柄が、頭の後ろで折れた', kind: '形の崩れ', thumb: 'bt_scythe_before.webp', pos: '50% 0%',
    title: '鎌の柄が、頭の後ろで折れた', body: 'サスラの紹介動画の元の絵です。鎌の柄が頭の後ろを通り、途中で折れ曲がっていました。「柄は一本の直線で、体の後ろを通さない」と発注文に書き足して、描き直しました。',
    media: [{ img: 'bt_scythe_before.webp', w: 420, h: 480, tag: 'ボツ', alt: '鎌の柄が頭の後ろで折れ曲がった絵' }, { img: 'bt_scythe_after.webp', w: 420, h: 480, tag: '採用', good: true, alt: '鎌の柄がまっすぐ頭の横を通る絵' }] },
  { id: 'fingers', why: '指が、組み合わさった', kind: '形の崩れ', thumb: 'hz_before.webp', pos: '50% 40%',
    title: '祈る手の指が、組み合わさった', body: '栞の札の絵です。手を合わせて祈るポーズのはずが、指が組み合わさり、付け根がねじれていました。手元だけを描き直しました。',
    media: [{ img: 'hz_before.webp', w: 480, h: 480, tag: 'ボツ', alt: '指が組み合わさった手' }, { img: 'hz_after.webp', w: 480, h: 480, tag: '採用', good: true, alt: '手のひらを合わせた合掌' }] },
  { id: 'atoza', why: '牙がうまく描けず、設定から外した', kind: '設定の変更', thumb: 'bt_atoza_before.webp', pos: '50% 60%',
    title: '牙がうまく描けず、設定ごと外した', body: '阿都座は、口の端に小さな牙が1本ある設定でした。AIはこれを描き分けられず、牙が左右に並んでしまいます。牙そのものを設定から外して、見本を描き直しました。',
    cols: 4, media: [{ img: 'bt_atoza_before.webp', w: 420, h: 420, tag: 'ボツ', alt: '口を開けると牙が見える阿都座' }, { img: 'bt_atoza_after.webp', w: 420, h: 420, tag: '採用', good: true, alt: '牙のない阿都座' }, { img: 'bt_atoza_m_before.webp', w: 420, h: 286, tag: 'ボツ・口元', alt: '上の歯の両端がとがった口元' }, { img: 'bt_atoza_m_after.webp', w: 420, h: 286, tag: '採用・口元', good: true, alt: '平らな歯の口元' }] },
  { id: 'otofang', why: '直したはずの牙が、また生えた', kind: '見本とのずれ', thumb: 'bt_otofang_before.webp', pos: '50% 50%',
    title: '直したはずの牙が、また生えた', body: '於兎に牙はありません。8月に一度直していましたが、この場面では発注文に「小さな牙」という一語が残っていて、また牙が描かれました。発注文を直して、描き直しました。',
    media: [{ img: 'bt_otofang_before.webp', w: 600, h: 294, tag: 'ボツ', alt: '驚いて開いた口に牙がある於兎' }, { img: 'bt_otofang_after.webp', w: 600, h: 274, tag: '採用', good: true, alt: '牙のない於兎' }] },
  { id: 'obi', why: '後ろ姿なのに、前の帯飾りが背中に', kind: '見本とのずれ', thumb: 'bt_obi_before.webp', pos: '40% 70%',
    title: '後ろ姿なのに、前の帯飾りが背中に', body: 'ツキアワセの絵日記です。体の前につける帯飾りが、背中側に描かれていました。いまは後ろ姿を描かせるとき、背中から見た見本も一緒に渡しています。',
    media: [{ img: 'bt_obi_before.webp', w: 560, h: 560, tag: 'ボツ', alt: '後ろ姿の帯の結び目に、前につける飾りがある絵' }, { img: 'bt_obi_after.webp', w: 560, h: 560, tag: '採用', good: true, alt: '後ろ姿の帯の結び目だけの絵' }] },
  { id: 'glassvid', why: '動かすと、眼鏡の形が変わった', kind: '動画の崩れ', thumb: 'bt_gv_2_5.webp', pos: '50% 50%',
    title: '動かすと、眼鏡の形が変わった', body: 'サスラの目元を動画にすると、途中で目の上に、元の絵にはない縁の線が描き足されました。2回作っても直らなかったため、動画にするのをやめ、止め絵にゆっくり寄る形にしています。', cols: 3,
    media: [{ img: 'bt_gv_0_3.webp', w: 420, h: 368, tag: '0秒', alt: '目の下に縁がある眼鏡' }, { img: 'bt_gv_2_5.webp', w: 420, h: 368, tag: '2.5秒・ボツ', alt: '目の上に縁の線が出てきた眼鏡' }, { video: 'bt_glassvid.mp4', poster: 'bt_glassvid_poster.webp', w: 360, h: 624, tag: 'ボツにした動画', alt: 'サスラの目元の動画' }] },
  { id: 'shadow', why: '動画の途中で、頭に黒い影', kind: '動画の崩れ', thumb: 'riri_before.webp', pos: '50% 20%',
    title: '動画の途中で、頭に黒い影が出た', body: 'リーリーが食べる動きの動画です。一部のコマで、頭の上に黒い影が残っていました。同じコマで比べています。',
    media: [{ img: 'riri_before.webp', w: 480, h: 380, tag: 'ボツ', alt: '頭の上に黒い影があるパンダ' }, { img: 'riri_after.webp', w: 480, h: 380, tag: '採用', good: true, alt: '影のないパンダ' }] },
  { id: 'shield', why: '武器のデザインごと、作り替えた', kind: '方向の変更', thumb: 'bt_shield_before.webp', pos: '80% 40%',
    title: '武器のデザインごと、作り替えた', body: 'タルトの武器は、最初は竜の頭がついた大きな盾でした。設計の途中で、宙に浮かぶ6枚の札に作り替えています。盾の絵は、すべてボツです。',
    media: [{ img: 'bt_shield_before.webp', w: 400, h: 600, tag: 'ボツ', alt: '竜の頭がついた大きな盾を持つタルト' }, { img: 'bt_shield_after.webp', w: 400, h: 600, tag: '採用', good: true, alt: '宙に浮かぶ札をまとったタルト' }] },
]
S.push(add('ボツ素材', `
  <div class="ds-in">
    ${h('AIが作ったものは、そのまま使える？', 'そのままでは使えないものも多い。ボツにした実物です。')}
    <div class="botsu-grid">
      ${BOTSU.map((b) => `<button type="button" class="botsu-card" data-more="botsu" data-more-case="${b.id}"><img src="${MORE}/${b.thumb}" alt="" loading="lazy" decoding="async" style="object-position:${b.pos}" /><span class="botsu-meta"><em>${b.kind}</em><b>${b.why}</b></span></button>`).join('')}
    </div>
  </div>${more('botsu', 'ボツにした素材と、採用した版', BOTSU.map((b) => ({ id: b.id, title: b.title, body: b.body, cols: b.cols, media: b.media })))}`, { id: 'botsu' }))

S.push(add('確認の流れ', `
  <div class="ds-in">
    ${h('発注したら、どの段階で確認できる？', '試作・途中・納品の3回、確認できます。')}
    <ol class="approval">
      ${[
        ['ご相談', '作りたいものを伺う'],
        ['お見積もり', '範囲・費用・修正の扱い'],
        ['試作', '見て、進めるか決める'],
        ['制作', '途中経過を見る'],
        ['納品', '合意どおりかを見る'],
      ].map(([t, what], i) => `<li style="--i:${i}"${i === 2 ? ' class="is-key"' : ''}><b>${t}</b><p>${what}</p></li>`).join('')}
    </ol>
  </div>`, { id: 'approval' }))

S.push(add('技術構成', `
  <div class="ds-in">
    ${h('月蝕綺譚は、何で作られている？', 'アプリはFlutter、サーバーはCloudflare。')}
    <div class="arch" data-arch>
      <div class="arch-app"><b>アプリ</b><span>Flutter</span><span>iOS・Android・Web を<br>1つのコードで</span></div>
      <div class="arch-wire" aria-hidden="true"><span>データのやりとり</span><span>素材のダウンロード</span></div>
      <div class="arch-cloud">
        <p class="arch-title">サーバー<span>押すと説明</span></p>
        <div class="arch-grid">
          ${ARCH_NODES.map(([t, sub, d], i) => `<button type="button" class="arch-node" aria-pressed="${i === 0}" data-detail="${esc(d)}"><b>${t}</b><span>${sub}</span></button>`).join('')}
        </div>
        <p class="arch-detail" aria-live="polite">${ARCH_NODES[0][2]}</p>
      </div>
    </div>
    <div class="arch-cost">
      <div class="arch-cost-text">
        <p class="lane-label">Cloudflareを選んだ理由</p>
        <p class="arch-cost-lead">費用を、大きく抑えられるからです。</p>
        <p>サーバーを借りて常に動かしておく必要がなく、使った分だけの料金です。素材の配信料もかかりません。ご依頼の案件でも、基本はこの構成をおすすめしています。</p>
      </div>
      <dl class="arch-cost-facts">
        <div><dt>月の定額</dt><dd>5<small>ドル</small></dd></div>
        <div><dt>30日のアクセス</dt><dd>2,020<small>万回</small></dd></div>
        <div><dt>素材の配信料</dt><dd>0<small>円</small></dd></div>
      </dl>
    </div>
  </div>`, { id: 'arch' }))

S.push(add('セキュリティ', `
  <div class="ds-in">
    ${h('セキュリティは大丈夫？', '基本の守りは、点検済みです。')}
    <div class="sec3">
      <div class="sec-col" style="--i:0"><p class="lane-label">守っていること</p><ul>
        <li>パスワード不要のログイン（パスキー）</li>
        <li>パスワード類は保管庫で一元管理</li>
        <li>ボット対策と、入口ごとの回数制限</li>
        <li>ランキングの記録を改ざんから守る</li>
      </ul></div>
      <div class="sec-col" style="--i:1"><p class="lane-label">確かめたこと</p><ul>
        <li>別のAIによる総合点検で、最優先の指摘をすべて修正</li>
        <li>プライバシーポリシーを実装と${PRIVACY.total}項目照合</li>
        <li>設定が抜けていたら、通さず止まる作り</li>
      </ul></div>
    </div>
    <p class="ds-note">専門家による第三者診断が必要な案件は、見積もりに含めてご相談します。</p>
  </div>`, { id: 'security' }))

S.push(add('確かめ方', `
  <div class="ds-in split wide-chart">
    <div>
      ${h('プログラムの品質は、どう確かめている？', '変更のたびに自動テスト、節目ごとに別のAIが点検。')}
      <div class="stats">
        <div><b data-count="2524">2,524</b><span>自動テストの数</span></div>
        <div><b>4</b><span>自動で確かめる画面サイズ</span></div>
        <div><b data-count="19">19</b><span>点検・レビュー</span></div>
      </div>
      ${moreBtn('checks', '実際の例を見る')}
    </div>
    <figure class="figure">
      <figcaption>点検・レビューの報告書（月別）</figcaption>
      <p class="legend"><span class="sw a"></span>別のAI（OpenAI Codex）<span class="sw b"></span>そのほか</p>
      ${stackedBars(REVIEWS_MONTHLY)}
    </figure>
  </div>${more('checks', '画面サイズを変えて、自動で確かめる', [
    { id: 'sizes', title: 'キーボードが出ても、閉じるボタンを押せるか', body: 'テストプレイで、キーボードが出たまま戻ると「受け取る」が隠れて、この画面を閉じられなくなりました。右上に閉じるボタンを付け、3つの画面サイズでキーボードが出た状態を再現して、ボタンがキーボードより上にあり押せることを自動テストで確かめています。灰色の帯がキーボードです。', media: [
      { img: 'size_320x693.webp', w: 360, h: 708, tag: '拡大表示 320×693', alt: '幅320の画面。キーボードの上に閉じるボタンがある' },
      { img: 'size_375x667.webp', w: 360, h: 568, tag: 'iPhone SE 375×667', alt: '幅375の画面。キーボードの上に閉じるボタンがある' },
      { img: 'size_390x844.webp', w: 360, h: 708, tag: 'iPhone 12 390×844', alt: '幅390の画面。キーボードの上に閉じるボタンがある' },
    ] },
  ])}`, { id: 'checks' }))

S.push(add('止まったら', `
  <div class="ds-in">
    ${h('サーバーが止まったら、どこまで戻せる？', 'プレイヤーのデータは、最大1日分の損失が目標。復元は2回試しました。')}
    <div class="dr" role="table">
      <div class="dr-row" role="row"><b role="rowheader">プレイヤーデータ</b><div role="cell" class="dr-goal">最大24時間分まで（目標）</div><p role="cell"><span class="done">実施</span>復元を2回確認</p></div>
      <div class="dr-row" role="row"><b role="rowheader">ゲーム素材</b><div role="cell" class="dr-goal">改ざんを検知できる形で保管</div><p role="cell"><span class="done">実施</span>一部の復元を確認</p></div>
    </div>
  </div>${illu('shiori_chibi_eclipse_fumizukai')}`, { id: 'restore' }))

S.push(add('事例', `
  <div class="ds-in">
    ${h('公開後に、実際に問題は起きた？', 'あります。ボットによる大量の会員登録です。')}
    <div class="stepper" data-stepper>
      <ol class="steps-rail">
        ${[
          ['気づく', '登録数が不自然に急増'],
          ['突き止める', 'ボットの自動登録が混ざっていた'],
          ['塞ぐ', 'ボット対策と回数制限を強化'],
          ['見張る', '不正な登録を削除し、急増時は自動で入口を絞る'],
        ].map(([t, d], i) => `<li class="st" data-step="${i}"${i ? '' : ' aria-current="step"'}><button type="button"><span class="st-no">${i + 1}</span>${t}</button><p>${d}</p></li>`).join('')}
      </ol>
      <div class="stepper-nav"><button type="button" class="btn btn-ghost" data-step-prev>← 前へ</button><button type="button" class="btn btn-ghost" data-step-next>次へ →</button></div>
    </div>
  </div>`, { id: 'incident' }))

S.push(add('決めること', `
  <div class="ds-in">
    ${h('発注の前に、何を決める？', 'この12項目を、見積もりと契約でお客さまと決めます。')}
    <div class="agree">
      ${[
        ['作るもの', '成果物・数量・形式'],
        ['期間', '試作・確認・納品の日程'],
        ['修正', '範囲と、承認後の変更'],
        ['費用', '4つの費用の分け方'],
        ['支払い', '時期と、中止時の精算'],
        ['試作', '作るもの・費用・やめる条件'],
        ['権利', '譲渡か利用許諾か、改変、編集データ'],
        ['AIの使い方', '使うAI・参考資料・AI使用の表記'],
        ['資料', 'AIに入れる範囲と削除'],
        ['運用', '契約名義・月の予算・連絡'],
        ['窓口', '担当と不在時の連絡'],
        ['終了', 'データと管理権限の引き渡し'],
      ].map(([k, v], i) => `<div class="ag" style="--i:${i}"><b>${k}</b><p>${v}</p></div>`).join('')}
    </div>
  </div>`, { id: 'agree' }))

// 発注前チェックリスト: [済んだら入れられる文, 制作会社への質問（コピー用）, 解説ページ]
const CHECK_GROUPS = [
  ['相談のとき', [
    ['その会社のゲームを、実際に遊んだ', '実際に作ったゲームを見せてもらえますか？', 'real'],
    ['AIに向く企画かどうか、聞いた', 'この企画で、AIが苦手な部分はどこですか？', 'fit'],
  ]],
  ['見積もりのとき', [
    ['費用が、制作・実費・運用・保守に分かれている', '費用を、制作費・実費・運用費・保守費に分けて出してもらえますか？', 'cost-kinds'],
    ['公開後の月額と、AI利用料の上限がわかる', '公開後の月額と、AI利用料の上限はいくらですか？', 'cost-run'],
    ['確認する時期（試作・途中・納品）が決まっている', 'どの段階で、何を確認できますか？', 'approval'],
  ]],
  ['契約の前に', [
    ['ログインや不正対策の説明を受けた', 'ログインや不正対策は、どうしていますか？', 'security'],
    ['テストや点検の結果を見せてもらった', 'テストや点検の結果を見せてもらえますか？', 'checks'],
    ['障害時にどこまで戻せるか、聞いた', '障害が起きたら、データはどこまで戻せますか？', 'restore'],
    ['権利とAIの使い方が、契約書にある', '権利とAIの使い方を、契約書に書いてもらえますか？', 'agree'],
    ['担当者と、終了時の引き継ぎ方が決まっている', '担当者と、終了時の引き継ぎ方を決めてもらえますか？', 'agree'],
  ]],
]
const CHECKS = CHECK_GROUPS.flatMap(([, items]) => items)
S.push(add('チェックリスト', `
  <div class="ds-in">
    ${h('制作会社に、何を確かめればいい？', 'この10個を確かめてから、発注を。')}
    <div class="clist" data-checklist>
      ${(() => { let n = 0; return CHECK_GROUPS.map(([g, items]) => `<section class="cl-group"><p class="lane-label">${g}</p><ul>${items.map(([t, ask, pg]) => { const i = n++; return `<li><label class="cl-item"><input type="checkbox" data-q="${i}" data-ask="${esc(ask)}" /><span class="cl-box" aria-hidden="true"></span><span class="cl-text">${t}</span></label><button type="button" class="cl-go" data-go="#${pg}" aria-label="解説のページへ">→</button></li>` }).join('')}</ul></section>`).join('') })()}
    </div>
    <div class="q-actions"><span class="q-count" aria-live="polite">済み <b data-q-count>0</b> / ${CHECKS.length}</span><button type="button" class="btn btn-ghost" data-copy-questions>まだの項目を、質問としてコピー</button><span class="ds-note q-save">制作会社へのメールに、そのまま貼れます。</span></div>
  </div>`, { id: 'checklist' }))

S.push(add('ご相談', `
  <div class="ds-in split">
    <div>
      ${head('Studio VIBE', 'つくりたいものを、<br>お聞かせください。')}
      <p class="ds-lead">ゲーム開発と、アニメ・MV・PV。月蝕綺譚で培った作り方で、ご依頼の作品をつくります。</p>
      <div class="cta-row"><a class="btn btn-primary" href="/contact?ref=report">制作の相談をする<span class="arrow" aria-hidden="true">→</span></a><a class="text-link" href="/services">料金<span aria-hidden="true">→</span></a></div>
      <p class="ds-note">3営業日以内にお返事します。決まっていないことは「未定」で大丈夫です。</p>
    </div>
  </div>${illu('shiori_chibi_okaeri', 'is-end')}`, { cls: 'is-end', id: 'contact' }))

S.push(add('数字の読み方', `
  <div class="ds-in">
    ${head('補足', '数字の読み方。')}
    <dl class="method">
      <div><dt>開発用AI</dt><dd>約2か月の開発で契約した定額プランの合計（Claude Code ×12、Codex ×1）</dd></div>
      <div><dt>素材づくりのAI</dt><dd>fal の利用実績（2025年1月〜2026年8月13日）。教材制作の分を一部含む</dd></div>
      <div><dt>円換算</dt><dd>1ドル=${USD_JPY}円</dd></div>
      <div><dt>人件費</dt><dd>含みません</dd></div>
      <div><dt>サーバー</dt><dd>Cloudflare の30日の実測（2026年8月15日〜9月14日）。公式サイトなども含む全体の値。月の定額は Workers の有料プラン</dd></div>
      <div><dt>キャラと話すAI</dt><dd>1回の入出力量からの目安</dd></div>
      <div><dt>自動テスト</dt><dd>コードに書かれたテストの数</dd></div>
    </dl>
  </div>`, { id: 'method' }))

export const DECK_CHECKS = CHECKS
export const renderDeck = () => S.join('\n')
export const renderDeckToc = () => slides.map((s, i) => `<li><a href="#${s.id}" data-toc="${s.id}"><span>${String(i + 1).padStart(2, '0')}</span>${esc(s.title)}</a></li>`).join('')
export const DECK_COUNT = () => slides.length
