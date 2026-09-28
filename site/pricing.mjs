// 料金台帳（トップの「サービスと料金」と /services の唯一の出どころ）。
// 2026-09-28 本人裁定: 確定しているのは「ゲーム開発・アニメ/MV/PV 各30万円〜」だけ。
// それ以外の金額・期間・修正回数・支払い条件は「ご依頼ごとに決める」（数字を置かない）。制作レポートの記述と揃えること。
export const MENUS = [
  {
    key: 'game',
    title: 'ゲーム開発',
    lead: 'ブラウザで遊べる小さなゲームから、iOS・Androidアプリ、運営型のタイトルまで。',
    tiers: [
      { price: '30', unit: '万円〜', name: 'ミニゲーム', detail: 'ブラウザで遊べる販促・キャンペーン用のゲームなど' },
      { price: 'お見積もり', unit: '', name: 'スマホアプリ', detail: 'iOS・Android向けのゲーム。ストアへの申請まで' },
      { price: 'お見積もり', unit: '', name: '運営・更新', detail: 'リリース後のイベント・更新・不具合への対応' },
    ],
    includes: ['企画・ゲームデザイン', 'キャラクター・シナリオ', 'イラスト・演出・効果音', 'スマホ・PCでの動作確認'],
    cta: 'ゲーム開発を相談する',
  },
  {
    key: 'anime',
    title: 'アニメ・MV・PV',
    lead: '生成AIを使ったアニメーションで、短い映像からシリーズまで。',
    tiers: [
      { price: '30', unit: '万円〜', name: 'PV・SNS向け映像', detail: '短い映像（横型・縦型）など' },
      { price: 'お見積もり', unit: '', name: 'MV・ショートアニメ', detail: '数分の作品' },
      { price: 'お見積もり', unit: '', name: 'アニメシリーズ', detail: 'キャラクターと世界観の設計から' },
    ],
    includes: ['構成・字コンテ', 'キャラクター設定・デザイン', '映像の生成・編集', '字幕・効果音の仕上げ'],
    cta: 'アニメ・MV・PVを相談する',
  },
]

export const TRIAL = {
  title: 'まずは試作から',
  lead: '本制作の前に、小さな試作で絵柄や手触りを確かめることもできます。',
  note: '試作の内容・費用・期間と、本制作に進むかを決める条件は、ご相談のうえでお見積もりします。',
}

export const TERMS = [
  '金額・期間・修正の範囲・お支払いの条件は、ご依頼ごとにお見積もりと契約書で決めます。',
  '「30万円〜」は最小の目安です。この金額に含む範囲も、お見積もりでご確認ください。',
  '声優の収録、楽曲の制作、広告の運用は別途お見積もりです。',
]

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const price = (t) => t.unit === ''
  ? `<span class="tier-price is-word">${esc(t.price)}</span>`
  : `<span class="tier-price">${esc(t.price)}<span class="unit">${esc(t.unit)}</span></span>`

// mode: compact（トップ）/ full（/services）
export const renderPricing = (mode) => {
  const menus = MENUS.map((m) => `
<section class="menu reveal" aria-labelledby="menu-${m.key}-${mode}">
  <h3 class="h-item" id="menu-${m.key}-${mode}">${esc(m.title)}</h3>
  ${mode === 'full' ? `<p class="lead">${esc(m.lead)}</p>` : ''}
  <ol class="tiers">
    ${m.tiers.map((t) => `<li class="tier">${price(t)}<span class="tier-body"><b>${esc(t.name)}</b><span>${esc(t.detail)}</span></span></li>`).join('')}
  </ol>
  ${mode === 'full' ? `<p class="caption">どのプランにも含まれるもの: ${m.includes.map(esc).join('・')}</p>` : ''}
  <a class="btn btn-primary menu-cta" href="/contact?kind=${m.key}">${esc(m.cta)}<span class="arrow" aria-hidden="true">→</span></a>
</section>`).join('')
  const trial = `
<aside class="trial reveal" aria-labelledby="trial-${mode}">
  <div>
    <p class="trial-badge">まずは小さく</p>
    <h3 class="h-item" id="trial-${mode}">${esc(TRIAL.title)}</h3>
    <p class="lead">${esc(TRIAL.lead)}${esc(TRIAL.note)}</p>
  </div>
  <a class="btn btn-ghost" href="/contact?kind=trial">試作から相談する<span class="arrow" aria-hidden="true">→</span></a>
</aside>`
  const terms = mode === 'full'
    ? `<ul class="terms reveal">${TERMS.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`
    : `<p class="caption terms-short reveal">「30万円〜」は最小の目安です。金額・期間・修正の範囲は、ご依頼ごとにお見積もりで決めます。</p>`
  return `<div class="menus">${menus}</div>${trial}${terms}`
}
