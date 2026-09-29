// 制作レポート（/report/deck）の動き。依存なし。
import './studio.css'
import './deck.css'

document.documentElement.classList.remove('no-js')
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const slides = [...document.querySelectorAll('.ds')]
const nowNo = document.querySelector('[data-now-no]')
const nowTitle = document.querySelector('[data-now-title]')
const progress = document.querySelector('[data-progress]')
const [prevBtn, nextBtn] = document.querySelectorAll('.deck-nav button')
let current = 0

const go = (i) => {
  const t = slides[Math.max(0, Math.min(slides.length - 1, i))]
  if (t) t.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
}

// ---- いまのページ（画面の中央を含むページ）を追う ----
const setCurrent = (i) => {
  current = i
  const s = slides[i]
  nowNo.textContent = String(i + 1).padStart(2, '0')
  nowTitle.textContent = s.dataset.title
  progress.style.width = `${((i + 1) / slides.length) * 100}%`
  prevBtn.disabled = i === 0
  nextBtn.disabled = i === slides.length - 1
  document.querySelectorAll('[data-toc]').forEach((a) => a.setAttribute('aria-current', String(a.dataset.toc === s.id)))
  if (history.replaceState) history.replaceState(null, '', `#${s.id}`)
}
const seen = (s) => {
  if (s.classList.contains('is-seen')) return
  s.classList.add('is-seen')
  s.querySelectorAll('[data-count]').forEach(countUp)
}
const ioCenter = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue
    seen(e.target)
    setCurrent(slides.indexOf(e.target))
  }
}, { rootMargin: '-45% 0px -45% 0px' })
slides.forEach((s) => ioCenter.observe(s))
// ページの一部が見えた時点で開示を始める（長いページ・スマホ向け）
const ioSeen = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { seen(e.target); ioSeen.unobserve(e.target) }
}, { threshold: 0.25 })
slides.forEach((s) => ioSeen.observe(s))

// ---- 数字のカウントアップ ----
function countUp(el) {
  const to = Number(el.dataset.count)
  if (reduceMotion || !to) { el.textContent = to.toLocaleString('ja-JP'); return }
  const t0 = performance.now(), dur = 1100
  const tick = (t) => {
    const p = Math.min(1, (t - t0) / dur)
    const eased = 1 - Math.pow(1 - p, 3)
    el.textContent = Math.round(to * eased).toLocaleString('ja-JP')
    if (p < 1) requestAnimationFrame(tick)
  }
  el.textContent = '0'
  requestAnimationFrame(tick)
}

// ---- ページ送り（ボタン・キー） ----
document.addEventListener('click', (e) => {
  const g = e.target.closest('[data-go]')
  if (!g) return
  const v = g.dataset.go
  if (v === 'next') go(current + 1)
  else if (v === 'prev') go(current - 1)
  else { const t = document.querySelector(v); if (t) go(slides.indexOf(t)) }
})
// 操作部品にフォーカスがあるときは、キーを部品に譲る（Space でボタンを押せるように）
const INTERACTIVE = 'button, a, summary, input, textarea, select, [contenteditable], [role="tablist"], [role="tabpanel"], [tabindex]'
const fitsScreen = () => slides[current].offsetHeight <= window.innerHeight + 8
document.addEventListener('keydown', (e) => {
  if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
  if (document.querySelector('dialog[open]')) return
  if (e.target !== document.body && e.target.closest(INTERACTIVE)) return
  // 画面より長いページの途中では、Space / PageDown は普通のスクロールのまま
  if (['PageDown', 'PageUp', ' '].includes(e.key) && !fitsScreen()) return
  if (['ArrowDown', 'ArrowRight', 'PageDown'].includes(e.key) || (e.key === ' ' && !e.shiftKey)) { e.preventDefault(); go(current + 1) }
  else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key) || (e.key === ' ' && e.shiftKey)) { e.preventDefault(); go(current - 1) }
  else if (e.key === 'Home') { e.preventDefault(); go(0) }
  else if (e.key === 'End') { e.preventDefault(); go(slides.length - 1) }
})

// ---- 目次 ----
const toc = document.querySelector('[data-toc]')
document.querySelector('[data-toc-open]')?.addEventListener('click', () => toc.showModal())
document.querySelector('[data-toc-close]')?.addEventListener('click', () => toc.close())
toc?.addEventListener('click', (e) => {
  if (e.target === toc) { toc.close(); return }
  const a = e.target.closest('a[data-toc]')
  if (!a) return
  e.preventDefault()
  toc.close()
  const i = slides.findIndex((s) => s.id === a.dataset.toc)
  go(i)
  const h = slides[i]?.querySelector('h1, h2')
  if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }) }
})

// ---- グラフのツールチップ（ホバー・フォーカス） ----
const tip = document.querySelector('.deck-tip')
const showTip = (el) => {
  const mark = el.querySelector('.mark, .dot') || el
  const mr = mark.getBoundingClientRect()
  tip.textContent = el.dataset.tip
  tip.hidden = false
  tip.style.left = `${Math.min(window.innerWidth - 80, Math.max(80, mr.left + mr.width / 2))}px`
  tip.style.top = `${Math.max(76, mr.top)}px`
}
const hideTip = () => { tip.hidden = true }
document.querySelectorAll('.chart [data-tip], .stackbar [data-tip]').forEach((el) => {
  if (!el.hasAttribute('tabindex')) el.tabIndex = 0
  el.addEventListener('mouseenter', () => showTip(el))
  el.addEventListener('mouseleave', hideTip)
  el.addEventListener('focus', () => showTip(el))
  el.addEventListener('blur', hideTip)
})
window.addEventListener('scroll', hideTip, { passive: true })

// ---- 分担のタブ ----
document.querySelectorAll('[data-tabs]').forEach((box) => {
  const tabs = [...box.querySelectorAll('[role="tab"]')]
  const panels = [...box.querySelectorAll('[role="tabpanel"]')]
  const select = (i) => {
    tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1 })
    panels.forEach((p, k) => { p.hidden = k !== i })
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i))
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault()
        const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length
        select(n); tabs[n].focus()
      }
    })
  })
  select(0)
})


// ---- 構成図: 押すと説明 ----
document.querySelectorAll('[data-arch]').forEach((arch) => {
  const detail = arch.querySelector('.arch-detail')
  arch.querySelectorAll('.arch-node').forEach((n) => n.addEventListener('click', () => {
    arch.querySelectorAll('.arch-node').forEach((m) => m.setAttribute('aria-pressed', String(m === n)))
    detail.textContent = n.dataset.detail
  }))
})

// ---- 事例の段階送り ----
document.querySelectorAll('[data-stepper]').forEach((box) => {
  const steps = [...box.querySelectorAll('.st')]
  let at = 0
  const render = () => steps.forEach((s, i) => {
    s.classList.toggle('is-done', i < at)
    if (i === at) s.setAttribute('aria-current', 'step'); else s.removeAttribute('aria-current')
  })
  steps.forEach((s, i) => s.querySelector('button').addEventListener('click', () => { at = i; render() }))
  box.querySelector('[data-step-next]').addEventListener('click', () => { at = Math.min(steps.length - 1, at + 1); render() })
  box.querySelector('[data-step-prev]').addEventListener('click', () => { at = Math.max(0, at - 1); render() })
  render()
})

// ---- 発注チェックリスト: チェックはこの端末に保存。まだの項目を質問としてコピー ----
const QKEY = 'vibe_report_checklist_v3'
const qBoxes = [...document.querySelectorAll('[data-checklist] input[type="checkbox"]')]
const qCount = document.querySelector('[data-q-count]')
const renderCount = () => { if (qCount) qCount.textContent = String(qBoxes.filter((b) => b.checked).length) }
try {
  const saved = JSON.parse(localStorage.getItem(QKEY) || '[]')
  qBoxes.forEach((b, i) => { b.checked = saved[i] === 1 })
} catch { /* noop */ }
qBoxes.forEach((b) => b.addEventListener('change', () => {
  renderCount()
  try { localStorage.setItem(QKEY, JSON.stringify(qBoxes.map((x) => (x.checked ? 1 : 0)))) } catch { /* 保存できない環境では無視 */ }
}))
renderCount()
document.querySelector('[data-copy-questions]')?.addEventListener('click', async (e) => {
  const btn = e.currentTarget
  const todo = qBoxes.filter((b) => !b.checked)
  const list = (todo.length ? todo : qBoxes).map((b, i) => `${i + 1}. ${b.dataset.ask}`)
  const text = `ご確認させてください。\n${list.join('\n')}\n\n（参考: Studio VIBE『月蝕綺譚 制作・運用レポート』 https://vibe.co.jp/report）`
  const label = btn.textContent
  try { await navigator.clipboard.writeText(text); btn.textContent = 'コピーしました' } catch { btn.textContent = 'コピーできませんでした' }
  setTimeout(() => { btn.textContent = label }, 2000)
})

// ---- 画面に入ったら映像を再生、出たら止める ----
const vids = [...document.querySelectorAll('video[data-autoplay]')]
if (vids.length && 'IntersectionObserver' in window) {
  const ioV = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const v = e.target
      if (e.isIntersecting && !reduceMotion) { v.preload = 'auto'; v.play().catch(() => {}) } else v.pause()
    }
  }, { threshold: 0.4 })
  vids.forEach((v) => ioV.observe(v))
}

// ---- 検品用: ?shot=p05 で、そのページだけを表示して開示済みにする（スクリーンショット撮影用） ----
const shot = new URLSearchParams(location.search).get('shot')
if (shot) {
  document.documentElement.classList.add('is-shot')
  // &bare: 上部バーとページ送りも隠す（/report の中身見本の撮影用）
  if (new URLSearchParams(location.search).has('bare')) document.documentElement.classList.add('is-bare')
  slides.forEach((s) => { if (s.id !== shot) s.style.display = 'none'; else seen(s) })
  // &more=<key>: 詳しく見るパネルを開いた状態で撮る
  const m = new URLSearchParams(location.search).get('more')
  if (m) addEventListener('load', () => openMore(m, new URLSearchParams(location.search).get('case')))
}

// ---- 最初のページ（#p05 などで来たらそこへ） ----
if (location.hash && document.querySelector(location.hash)) {
  const i = slides.findIndex((s) => `#${s.id}` === location.hash)
  if (i > 0) { slides[i].scrollIntoView({ block: 'start' }); setCurrent(i) } else setCurrent(0)
} else setCurrent(0)

// スマホで横スクロールになるグラフは、最新（右端）が見える位置から始める
document.querySelectorAll('.chart-scroll').forEach((f) => { if (f.scrollWidth > f.clientWidth) f.scrollLeft = f.scrollWidth })

// ---- 詳しく見る: 実物の素材パネル ----
function openMore(key, caseId) {
  const d = document.getElementById(`more-${key}`)
  if (!d) return
  d.showModal()
  d.querySelectorAll('.more-case').forEach((c) => c.classList.toggle('is-target', c.id === `mc-${caseId}`))
  const t = caseId && d.querySelector(`#mc-${caseId}`)
  const body = d.querySelector('.more-body')
  body.scrollTop = t ? t.offsetTop - body.offsetTop - 8 : 0
  if (t) t.querySelector('h3')?.focus({ preventScroll: true })
  if (!reduceMotion) d.querySelectorAll('video').forEach((v) => { v.preload = 'auto'; v.play().catch(() => {}) })
}
document.addEventListener('click', (e) => {
  const o = e.target.closest('[data-more]')
  if (o) { openMore(o.dataset.more, o.dataset.moreCase); return }
  const d = e.target.closest('dialog.more')
  if (d && (e.target === d || e.target.closest('[data-more-close]'))) d.close()
})
document.querySelectorAll('dialog.more').forEach((d) => d.addEventListener('close', () => {
  d.querySelectorAll('video, audio').forEach((m) => m.pause())
}))
