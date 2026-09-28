// 「映像を観る」の台帳。YouTube（チャンネル @sakuya_aimusic）で公開中の動画。
// 新作を出したら先頭に足す。id は動画URLの v= の11文字。
// 埋め込みは押したときだけ読み込む（サムネ画像だけ先に出す）ので、本数が増えてもページは重くならない。
export const CHANNEL_URL = 'https://www.youtube.com/@sakuya_aimusic'

export const VIDEO_SERIES = [
  {
    key: 'hankacho',
    title: 'ニンジャ犯科帳',
    note: 'フルAIでつくる、忍びのドタバタ短編アニメ。',
    site: '/hankacho/',
    videos: [
      { id: 'U4Xhf8YvPps', title: '第10話「野生の証明」' },
      { id: 'qKrRWRvHeeE', title: '第9話「チュロスの商人」' },
      { id: 't3zz903Yc9c', title: '第8話「鍛冶場より愛をこめて」' },
      { id: 'TNDvvCTptNY', title: '第7話「花より団子、団子より花」' },
      { id: 'oHaEioGiicA', title: '第6話「不死者は二度門を叩く」' },
      { id: 'heBXjoUd4zw', title: '第5話「幸せの青い猫」' },
      { id: '_rhso7_7XRg', title: '第4話「強さの秘訣」' },
      { id: '-7GqBPlL9J8', title: '第3話「こわいまんじゅう」' },
      { id: 'sCGdkasCXDY', title: '第2話「怒りの理由」' },
      { id: 'Kwdi9gyIKss', title: '第1話「ニンジャ犯科帳」' },
    ],
  },
  {
    key: 'sakuya',
    title: '咲耶 MV',
    note: 'ダーク文学を歌うアーティスト・咲耶のミュージックビデオ。',
    site: '/sakuya/',
    videos: [
      { id: '3iHbuneoLVc', title: '星の離乳食' },
      { id: 'JTSulkX0rmo', title: '死と乙女' },
      { id: 'hmSF1UrEovs', title: '出現' },
      { id: 'YC3hDMpvg1s', title: '妖精の園' },
      { id: 'Exp-E5AOwes', title: '黒猫' },
      { id: 'OGiROmagF0Y', title: '人間失格' },
    ],
  },
]

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const card = (v, series) => `
<li class="video">
  <button class="video-play" type="button" data-yt="${v.id}" aria-label="${esc(series.title)} ${esc(v.title)} を再生">
    <img src="https://i.ytimg.com/vi/${v.id}/mqdefault.jpg" alt="" width="320" height="180" loading="lazy" decoding="async" />
    <span class="video-icon" aria-hidden="true"></span>
  </button>
  <p class="video-title">${esc(v.title)}</p>
</li>`

// limit を渡すとシリーズごとに先頭N本だけ出す（トップ用）。全本数は /works
export const VIDEO_TOTAL = VIDEO_SERIES.reduce((n, s) => n + s.videos.length, 0)

export const renderVideos = (limit) => VIDEO_SERIES.map((s) => `
<section class="video-series reveal" aria-labelledby="vs-${s.key}">
  <div class="video-series-head">
    <h3 class="h-item" id="vs-${s.key}">${esc(s.title)}<span class="count">${s.videos.length}本</span></h3>
    <p class="caption">${esc(s.note)}　<a href="${s.site}">公式サイト</a></p>
    <div class="rail-nav">
      <button type="button" data-rail="-1" aria-label="${esc(s.title)}を前へ送る">←</button>
      <button type="button" data-rail="1" aria-label="${esc(s.title)}を次へ送る">→</button>
    </div>
  </div>
  <ul class="video-rail">${(limit ? s.videos.slice(0, limit) : s.videos).map((v) => card(v, s)).join('')}</ul>
</section>`).join('')
