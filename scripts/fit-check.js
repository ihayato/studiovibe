// 三寸法の収まり検査（ブラウザのコンソール/自動操作で実行）。house-rules: 390x844 / 375x667 / 320x693
// 使い方: fitCheck(['.hero-actions .btn', ...]) → { scrollW, overflow[], bad[] }。bad が空なら合格。
window.fitCheck = async (sels) => {
  const W = innerWidth
  const out = { W, H: innerHeight, scrollW: document.documentElement.scrollWidth, overflow: [], bad: [] }
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.display === 'none') continue
    if (el.closest('.nav') && W < 768) continue
    // 横スクロールの映像列は、はみ出して正しい（ページ自体の横幅は scrollW で見る）
    if (el.closest('.moon-shadow') || el.closest('.cta-bar') || el.closest('.video-rail')) continue
    const r = el.getBoundingClientRect()
    if (!r.width) continue
    if (r.right > W + 1 || r.left < -1) out.overflow.push(`${el.className || el.tagName}:${Math.round(r.left)}-${Math.round(r.right)}`)
  }
  for (const sel of sels) {
    for (const el of document.querySelectorAll(sel)) {
      if (el.closest('[hidden]')) continue
      // 閉じた折りたたみ（details）の中身は見えていない＝押せなくて正しい
      if (el.closest('details:not([open])') && !el.closest('summary')) continue
      // 閉じたモバイルメニュー内・出ていない下部バーは対象外（見えていない＝押せなくて正しい）
      if (W < 768 && el.closest('.nav') && !el.closest('.is-open')) continue
      if (el.closest('.cta-bar') && !el.closest('.cta-bar.is-shown')) continue
      el.scrollIntoView({ block: 'center' })
      await new Promise((r) => setTimeout(r, 150))
      const r = el.getBoundingClientRect()
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      // ラベル型の選択肢は透明なinputが上に重なるのが正しい形
      const ok = hit && (hit === el || el.contains(hit) || (hit.tagName === 'INPUT' && hit.parentElement === el.parentElement))
      if (!ok || r.right > W || r.left < 0 || r.height < 44) {
        out.bad.push({ sel, text: el.textContent.trim().slice(0, 12), l: Math.round(r.left), r: Math.round(r.right), h: Math.round(r.height), hit: hit && (hit.className || hit.tagName) })
      }
    }
  }
  scrollTo(0, 0)
  return out
}
