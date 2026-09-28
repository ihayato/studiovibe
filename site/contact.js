// 制作のご相談フォーム。送信先は既存の /api/contact（Turnstile検証 → Discord通知）。
// API が受け取るのは name / email / type / message のみなので、種別・会社名・予算・時期・参考URLは
// 本文の先頭にまとめて送る（サーバー側は変更しない）。
import './studio.js'
import { sourceLine, submitLead, markSent } from './lead.js'

const form = document.getElementById('contact-form')
const statusEl = document.getElementById('form-status')
const thanks = document.getElementById('thanks')

const setError = (id, msg) => {
  const el = document.getElementById(`${id}-error`)
  if (el) el.textContent = msg
  const input = form.querySelector(`#${id}`)
  if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false')
}

const validate = () => {
  const data = new FormData(form)
  const errors = {}
  // 画面の並び順（種類 → 相談内容 → お名前 → メール）で調べる。最初のエラーへフォーカスを送るため
  if (!data.get('kind')) errors.kind = 'ご相談の種類を選んでください。'
  if (!String(data.get('message') || '').trim()) errors.message = 'ご相談内容を入力してください。'
  if (!String(data.get('name') || '').trim()) errors.name = 'お名前を入力してください。'
  const email = String(data.get('email') || '').trim()
  if (!email) errors.email = 'メールアドレスを入力してください。'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'メールアドレスの形式をご確認ください。'
  for (const id of ['kind', 'name', 'email', 'message']) setError(id, errors[id] || '')
  return { data, errors }
}

const compose = (data) => {
  const line = (label, key) => {
    const v = String(data.get(key) || '').trim()
    return v ? `【${label}】${v}` : null
  }
  const head = [
    line('種類', 'kind'),
    line('会社名', 'company'),
    line('予算', 'budget'),
    line('希望の時期', 'deadline'),
    line('参考URL', 'refurl'),
    line('見ていた作品', 'ref'),
    sourceLine(),
  ].filter(Boolean)
  return `${head.join('\n')}\n\n${String(data.get('message')).trim()}`
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault()
  statusEl.textContent = ''
  statusEl.className = 'form-status'
  const { data, errors } = validate()
  const first = Object.keys(errors)[0]
  if (first) {
    const target = first === 'kind' ? form.querySelector('input[name="kind"]') : form.querySelector(`#${first}`)
    target?.focus()
    return
  }
  const turnstileToken = form.querySelector('[name="cf-turnstile-response"]')?.value
  if (!turnstileToken) {
    statusEl.textContent = '送信の前に、ロボットでないことの確認を済ませてください。'
    statusEl.className = 'form-status is-error'
    return
  }

  const btn = form.querySelector('button[type="submit"]')
  btn.disabled = true
  const label = btn.firstChild.textContent
  btn.firstChild.textContent = '送信しています…'
  try {
    const kind = String(data.get('kind'))
    await submitLead({
      name: String(data.get('name')).trim(),
      email: String(data.get('email')).trim(),
      type: kind === '取材・その他' ? 'other' : 'production',
      message: compose(data),
      turnstileToken,
    })
    markSent()
    form.hidden = true
    thanks.hidden = false
    thanks.focus()
    thanks.scrollIntoView({ block: 'start' })
  } catch (err) {
    statusEl.textContent = `${err.message} 急ぎの場合は info@vibe.co.jp までご連絡ください。`
    statusEl.className = 'form-status is-error'
    window.turnstile?.reset()
  } finally {
    btn.disabled = false
    btn.firstChild.textContent = label
  }
})

// 入力しなおしたらその欄のエラーを消す
form?.addEventListener('input', (e) => {
  const id = e.target.name === 'kind' ? 'kind' : e.target.id
  if (['kind', 'name', 'email', 'message'].includes(id)) setError(id, '')
})

// 料金表・作品カードから来たときは、種類と見ていた作品を引き継ぐ（/contact?kind=anime&ref=hankacho）
{
  const q = new URLSearchParams(location.search)
  const kind = q.get('kind')
  const radio = kind && form?.querySelector(`input[name="kind"][data-key="${CSS.escape(kind)}"]`)
  if (radio) radio.checked = true

  const ref = q.get('ref')
  if (ref && form) form.ref.value = ref.slice(0, 60)
}
