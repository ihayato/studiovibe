// 月蝕綺譚 制作・運用レポートの受け取りページ（リードマグネット）。
// 送信先は /api/contact（type=other・本文先頭に【資料請求】）。成功したらその場で「レポートを開く」を出す。
// 行動は1種類: 下部バーと締めのボタンは、どれもヒーローのフォームへ連れていく。受け取り済みなら直接レポートへ。
import './studio.js'
import './report.css'
import { sourceLine, submitLead, markSent } from './lead.js'

const form = document.getElementById('guide-form')
const statusEl = document.getElementById('form-status')
const thanks = document.getElementById('thanks')
const card = document.getElementById('get')
const bar = document.querySelector('.rp-bar')
const DONE_KEY = 'vibe_report_done'
const DECK_URL = '/report/deck'
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// 受け取り済みになったら、フォームを閉じて開くボタンを出し、ページ内の誘導も「開く」に変える
const showThanks = () => {
  form.hidden = true
  document.querySelectorAll('[data-form-intro]').forEach((el) => { el.hidden = true })
  thanks.hidden = false
  document.querySelectorAll('[data-to-form]').forEach((a) => {
    a.href = DECK_URL
    a.removeAttribute('data-to-form')
    a.firstChild.textContent = 'レポートを開く'
  })
  const barText = bar?.querySelector('.rp-bar-text')
  if (barText) barText.textContent = '受け取り済みです'
}

// 一度受け取った人には、再訪時もそのまま開くボタンを出す
try { if (localStorage.getItem(DONE_KEY)) showThanks() } catch { /* noop */ }

// ---- ページ内の誘導 → フォームへ（名前の欄にフォーカス） ----
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-to-form]')
  if (!a) return
  e.preventDefault()
  card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  document.getElementById('name')?.focus({ preventScroll: true })
})

// ---- 下部バー: フォームが画面外にあり、締めとフッターが見えていない間だけ出す ----
if (bar && 'IntersectionObserver' in window) {
  bar.hidden = false
  const state = { cardVisible: true, atEnd: new Set() }
  const render = () => bar.classList.toggle('is-shown', !state.cardVisible && state.atEnd.size === 0)
  new IntersectionObserver(([e]) => { state.cardVisible = e.isIntersecting; render() }, { threshold: 0.15 }).observe(card)
  const endIo = new IntersectionObserver((entries) => {
    for (const e of entries) e.isIntersecting ? state.atEnd.add(e.target) : state.atEnd.delete(e.target)
    render()
  })
  document.querySelectorAll('.rp-closing, .site-footer').forEach((el) => endIo.observe(el))
}

// ---- プレイ映像: 見えている間だけ再生（動きを減らす設定ならポスターのまま） ----
const vids = [...document.querySelectorAll('video[data-autoplay]')]
if (vids.length && 'IntersectionObserver' in window && !reduceMotion) {
  const vio = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const v = e.target
      if (e.isIntersecting) { v.preload = 'auto'; v.play().catch(() => {}) } else v.pause()
    }
  }, { threshold: 0.3 })
  vids.forEach((v) => vio.observe(v))
}

// ---- 送信 ----
const setError = (id, msg) => {
  const el = document.getElementById(`${id}-error`)
  if (el) el.textContent = msg
  form.querySelector(`#${id}`)?.setAttribute('aria-invalid', msg ? 'true' : 'false')
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault()
  statusEl.textContent = ''
  statusEl.className = 'form-status'
  const data = new FormData(form)
  const name = String(data.get('name') || '').trim()
  const email = String(data.get('email') || '').trim()
  const errors = {}
  if (!name) errors.name = 'お名前を入力してください。'
  if (!email) errors.email = 'メールアドレスを入力してください。'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'メールアドレスの形式をご確認ください。'
  setError('name', errors.name || '')
  setError('email', errors.email || '')
  const first = Object.keys(errors)[0]
  if (first) { form.querySelector(`#${first}`).focus(); return }

  const turnstileToken = form.querySelector('[name="cf-turnstile-response"]')?.value
  if (!turnstileToken) {
    statusEl.textContent = 'ロボットでないことの確認が終わるまで、少しお待ちください。'
    statusEl.className = 'form-status is-error'
    return
  }
  const company = String(data.get('company') || '').trim()
  const lines = [
    '【資料請求】月蝕綺譚 制作・運用レポート＋AIゲームプランナー',
    company ? `【会社名】${company}` : null,
    sourceLine(),
  ].filter(Boolean)

  const btn = form.querySelector('button[type="submit"]')
  btn.disabled = true
  const label = btn.firstChild.textContent
  btn.firstChild.textContent = '送信しています…'
  try {
    await submitLead({ name, email, type: 'other', message: lines.join('\n'), turnstileToken })
    try { localStorage.setItem(DONE_KEY, '1') } catch { /* noop */ }
    markSent()
    showThanks()
    thanks.focus()
  } catch (err) {
    statusEl.textContent = `${err.message} うまくいかない場合は info@vibe.co.jp までご連絡ください。レポートをお送りします。`
    statusEl.className = 'form-status is-error'
    window.turnstile?.reset()
  } finally {
    btn.disabled = false
    btn.firstChild.textContent = label
  }
})
