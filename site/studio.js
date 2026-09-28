// Studio VIBE スタジオサイト共通スクリプト（軽量・依存なし）
import './studio.css'
import REEL from './reel.json'
import { rememberSource } from './lead.js'

rememberSource()

const root = document.documentElement
root.classList.remove('no-js')
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const saveData = navigator.connection?.saveData === true
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches

// ---- ヘッダー: スクロールで地を敷く／モバイルメニュー ----
const header = document.querySelector('.site-header')
const toggle = document.querySelector('.menu-toggle')
if (header) {
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8)
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
}
if (header && toggle) {
  const setOpen = (open) => {
    header.classList.toggle('is-open', open)
    toggle.setAttribute('aria-expanded', String(open))
    toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く')
    document.body.style.overflow = open ? 'hidden' : ''
  }
  toggle.addEventListener('click', () => setOpen(!header.classList.contains('is-open')))
  header.querySelectorAll('.nav a').forEach((a) => a.addEventListener('click', () => setOpen(false)))
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false) })
}

// ---- スクロール開示（一度だけ） ----
const reveals = document.querySelectorAll('.reveal')
if ('IntersectionObserver' in window && !reduceMotion) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) }
    }
  }, { rootMargin: '0px 0px -8% 0px' })
  reveals.forEach((el) => io.observe(el))
} else {
  reveals.forEach((el) => el.classList.add('is-in'))
}

// ---- 月窓: リールはページ表示後に読み込む（LCPはポスター） ----
const moonVideo = document.querySelector('.moon-disc video')
if (moonVideo && !reduceMotion && !saveData) {
  let inView = true
  const start = () => {
    moonVideo.src = moonVideo.dataset.src
    moonVideo.addEventListener('playing', () => moonVideo.classList.add('is-ready'), { once: true })
    if (inView) moonVideo.play().catch(() => {})
  }
  // 画面外では止めて、戻ったら再開する（CPUと電池のため）
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      inView = e.isIntersecting
      if (!moonVideo.src) return
      inView ? moonVideo.play().catch(() => {}) : moonVideo.pause()
    }).observe(moonVideo)
  }
  if (document.readyState === 'complete') start()
  else window.addEventListener('load', start, { once: true })
}

// ---- 月窓: いま映っている作品名をキャプションに出す（台帳は tools/reel/clips.txt → site/reel.json） ----
const reelTitle = document.querySelector('[data-reel-title]')
if (moonVideo && reelTitle) {
  let last = ''
  moonVideo.addEventListener('timeupdate', () => {
    const i = Math.min(REEL.titles.length - 1, Math.floor((moonVideo.currentTime + 0.15) / REEL.step))
    const t = REEL.titles[i]
    if (t !== last) { last = t; reelTitle.textContent = t }
  })
}

// ---- 映像を観る: サムネを押すと大きな再生ポップアップで YouTube を開く ----
// ネイティブ <dialog>（Esc・背景タップ・閉じるボタンで閉じる）。閉じたら iframe を捨てて再生を止める
let player = null
const openPlayer = (id, title) => {
  if (!player) {
    player = document.createElement('dialog')
    player.className = 'player'
    player.innerHTML = `<div class="player-inner">
  <div class="player-head"><p class="player-title"></p><button type="button" class="player-close" aria-label="閉じる">×</button></div>
  <div class="player-frame"></div>
</div>`
    document.body.appendChild(player)
    // 閉じたら iframe をその場で捨てる（close イベントは遅れて届くことがあるので、先に同期で止める）
    const teardown = () => {
      player.querySelector('.player-frame').replaceChildren()
      document.documentElement.classList.remove('is-player-open')
    }
    const closePlayer = () => { teardown(); if (player.open) player.close() }
    player.querySelector('.player-close').addEventListener('click', closePlayer)
    // 背景（dialog 自身）を押したら閉じる。中身を押したときは閉じない
    player.addEventListener('click', (e) => { if (e.target === player) closePlayer() })
    player.addEventListener('cancel', teardown) // Esc
    player.addEventListener('close', () => { teardown(); player._opener?.focus() })
  }
  const iframe = document.createElement('iframe')
  iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`
  iframe.title = title
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'
  iframe.allowFullscreen = true
  iframe.referrerPolicy = 'strict-origin-when-cross-origin'
  player.querySelector('.player-title').textContent = title
  player.querySelector('.player-frame').replaceChildren(iframe)
  player._opener = document.activeElement
  document.documentElement.classList.add('is-player-open')
  player.showModal()
}
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.video-play[data-yt]')
  if (!btn) return
  openPlayer(btn.dataset.yt, btn.getAttribute('aria-label').replace(/ を再生$/, ''))
})

// ---- 映像の列: 前へ／次へ（マウス向け。端では押せない） ----
document.querySelectorAll('.video-series').forEach((series) => {
  const rail = series.querySelector('.video-rail')
  const [prev, next] = series.querySelectorAll('[data-rail]')
  if (!rail || !prev) return
  const sync = () => {
    prev.disabled = rail.scrollLeft < 8
    next.disabled = rail.scrollLeft + rail.clientWidth > rail.scrollWidth - 8
  }
  // 送り先はカードの頭にそろえる（スナップと滑らかスクロールの取り合いで戻されるのを防ぐ）
  const items = [...rail.children]
  const pad = items[0] ? items[0].offsetLeft : 0
  series.querySelectorAll('[data-rail]').forEach((b) => b.addEventListener('click', () => {
    const dir = Number(b.dataset.rail)
    const want = rail.scrollLeft + dir * rail.clientWidth * 0.75
    const stops = items.map((el) => el.offsetLeft - pad)
    const max = rail.scrollWidth - rail.clientWidth
    let target = dir > 0 ? (stops.find((x) => x >= want - 1) ?? max) : ([...stops].reverse().find((x) => x <= want + 1) ?? 0)
    target = Math.max(0, Math.min(max, target))
    const from = rail.scrollLeft
    rail.scrollTo({ left: target, behavior: reduceMotion ? 'auto' : 'smooth' })
    // 滑らかスクロールが動かない環境（非表示タブ等）では、そのまま飛ばす
    setTimeout(() => { if (rail.scrollLeft === from && from !== target) rail.scrollLeft = target; sync() }, 600)
  }))
  rail.addEventListener('scroll', sync, { passive: true })
  sync()
})

// ---- 月窓: スクロールで蝕の影が横切る ----
const moon = document.querySelector('.moon')
const hero = document.querySelector('.hero')
if (moon && hero && !reduceMotion) {
  let ticking = false
  const update = () => {
    ticking = false
    const h = hero.offsetHeight
    // 静止時から薄く欠けを見せ（スクロールの誘い）、ヒーローの半分ほどで皆既になる
    const p = Math.min(1, Math.max(0, window.scrollY / (h * 0.5)))
    moon.style.setProperty('--ecl', (0.14 + p * 0.86).toFixed(3))
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update) } }, { passive: true })
  update()
}

// ---- 作品カード・柱: ホバー（タッチ端末は画面中央付近）でループ再生 ----
const playable = document.querySelectorAll('.work[data-video], .pillar[data-video]')
if (playable.length && !reduceMotion && !saveData) {
  const ensureVideo = (card) => {
    let v = card.querySelector('video')
    if (!v) {
      v = document.createElement('video')
      v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none'
      v.setAttribute('aria-hidden', 'true')
      v.src = card.dataset.video
      card.querySelector('.work-media, .pillar-media').appendChild(v)
    }
    return v
  }
  const play = (card) => {
    const v = ensureVideo(card)
    v.play().then(() => card.classList.add('is-playing')).catch(() => {})
  }
  const stop = (card) => {
    const v = card.querySelector('video')
    card.classList.remove('is-playing')
    if (v) v.pause()
  }
  if (finePointer) {
    playable.forEach((card) => {
      const link = card.querySelector('.work-link') || card
      link.addEventListener('mouseenter', () => play(card))
      link.addEventListener('mouseleave', () => stop(card))
      link.addEventListener('focus', () => play(card))
      link.addEventListener('blur', () => stop(card))
    })
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) e.isIntersecting ? play(e.target) : stop(e.target)
    }, { rootMargin: '-35% 0px -35% 0px' })
    playable.forEach((card) => io.observe(card))
  }
}

// ---- 作品一覧の絞り込み ----
const filters = document.querySelector('.filters')
if (filters) {
  const cards = document.querySelectorAll('.works-grid .work')
  const count = document.querySelector('[data-work-count]')
  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-filter]')
    if (!btn) return
    const f = btn.dataset.filter
    filters.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)))
    let n = 0
    cards.forEach((c) => {
      const show = f === 'all' || c.dataset.cat.split(' ').includes(f)
      c.hidden = !show
      if (show) n++
    })
    if (count) count.textContent = `${n}作品`
  })
}

// ---- モバイル下部の相談バー: ヒーローを過ぎたら出し、最後の誘導とフッターでは隠す ----
const bar = document.querySelector('.cta-bar')
if (bar && 'IntersectionObserver' in window) {
  const heroEl = document.querySelector('.hero, .page-hero')
  const endEls = document.querySelectorAll('.closing, .site-footer, .form')
  const state = { pastHero: false, atEnd: new Set() }
  const render = () => bar.classList.toggle('is-shown', state.pastHero && state.atEnd.size === 0)
  if (heroEl) {
    new IntersectionObserver(([e]) => { state.pastHero = !e.isIntersecting; render() }).observe(heroEl)
  }
  const endIo = new IntersectionObserver((entries) => {
    for (const e of entries) e.isIntersecting ? state.atEnd.add(e.target) : state.atEnd.delete(e.target)
    render()
  })
  endEls.forEach((el) => endIo.observe(el))
}
