// 問い合わせ・資料請求の共通部品。
// - 流入元: そのタブで最初に開いたページと参照元を sessionStorage に控え、送信本文の先頭に添える（サーバーは変えない）
// - 送信: 既存の /api/contact（Turnstile検証 → Discord通知）へ送る
// - 計測: 完了時に擬似URL（?sent=1）へ置き換える。Cloudflare Web Analytics（spa）がページビューとして数える
const KEY = 'vibe_src'

export const rememberSource = () => {
  try {
    if (sessionStorage.getItem(KEY)) return
    const ref = document.referrer && !document.referrer.startsWith(location.origin) ? document.referrer : '直接'
    sessionStorage.setItem(KEY, JSON.stringify({ landing: location.pathname + location.search, ref }))
  } catch { /* 保存できない環境では何もしない */ }
}

export const sourceLine = () => {
  try {
    const s = JSON.parse(sessionStorage.getItem(KEY) || 'null')
    if (!s) return null
    return `【流入元】${s.ref}（最初のページ ${s.landing}）`
  } catch { return null }
}

export const submitLead = async ({ name, email, type, message, turnstileToken }) => {
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, type, message, turnstileToken }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || '送信できませんでした。時間をおいて、もう一度お試しください。')
  return json
}

export const markSent = () => {
  try { history.replaceState(history.state, '', `${location.pathname}?sent=1`) } catch { /* noop */ }
}
