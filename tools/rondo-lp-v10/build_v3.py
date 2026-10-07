import re, sys
SP = '/private/tmp/claude-501/-Users-hayatoikeda-Desktop-dev-cn-kitan-wt-webpoc/8697ea86-6ed8-42e6-aef7-38f6022836bd/scratchpad/'
LP = '/Users/hayatoikeda/Desktop/dev/vibe-wt-rondo-v10/public/rondo.html'
rd = lambda f: open(SP + f, encoding='utf-8').read()
s = open(LP, encoding='utf-8').read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count: sys.exit(f'NG {n}/{count}: {old[:70]!r}')
    s = s.replace(old, new)
# 本文を差し替え
main = rd('main_v3.html')
fit = rd('part_fit.html')
fit = fit.replace('<p class="lede" style="text-align:center;margin:0 auto 40px">サポート窓口はありません。<br>自信がない人は、買わないでください。</p>', '<p class="lede" style="text-align:center;margin:0 auto 40px">サポート窓口はありません。<br>自信がない人は、買わないでください。</p>')
for k, v in {'__SWITCH_BLOCKS__': rd('part_switch_blocks.html'), '__BOOKING__': rd('part_booking.html'), '__MERGE__': rd('part_itch_merge.html'),
             '__SEG__': rd('part_itch_seg.html'), '__CC__': rd('part_cc.html'), '__DISTTREE__': '  ' + rd('part_disttree.html'), '__FIT__': '  ' + fit,
             '__COST__': rd('part_cost.html'), '__RESERVE__': rd('part_reserve.html')}.items():
    if main.count(k) != 1: sys.exit('NG placeholder ' + k)
    main = main.replace(k, v)
a = s.find('<main id="top">'); b = s.find('</main>') + len('</main>')
s = s[:a] + main + s[b:]
# ヘッダー
a = s.find('<nav class="head-nav">'); b = s.find('</nav>', a) + len('</nav>')
s = s[:a] + '''<nav class="head-nav">
      <a href="#switch" data-rondo-label="ヘッダー できること">できること</a>
      <a href="#booking" data-rondo-label="ヘッダー 予約">予約</a>
      <a href="#cost" data-rondo-label="ヘッダー 費用">費用</a>
      <a href="#faq" data-rondo-label="ヘッダー FAQ">FAQ</a>
    </nav>''' + s[b:]
rep('<a class="btn primary head-cta" href="#reserve" data-rondo-label="CTA ヘッダー購入" data-rondo-cta="reserve">購入する</a>',
    '<a class="btn primary head-cta" href="/rondo-apply" data-rondo-label="CTA ヘッダー購入" data-rondo-cta="apply">購入手続きへ</a>')
# メタ
s = s.replace('正式版 v1.0・買い切り¥9,800。', '正式版 v1.0・本体¥9,800（税込・買い切り）。運用費は別途。')
s = s.replace('CodexやClaude Codeで作り込む買い切り。正式版 v1.0・¥9,800。', 'CodexやClaude Codeで作り込む。正式版 v1.0・本体¥9,800（税込・買い切り）。')
# タイトル
s = s.replace('Rondo | Codex/Claude Codeユーザーのための、マーケティングOS', 'Rondo | 全部入りのマーケ基盤を、¥9,800で所有する')
# 適性診断の結果
rep('<a class="btn primary" href="/rondo-apply" data-rondo-label="CTA 診断A購入" data-rondo-cta="apply">条件を確かめて購入する</a>',
    '<a class="btn primary" href="/rondo-apply" data-rondo-label="CTA 診断A購入" data-rondo-cta="apply">購入手続きへ（¥9,800）</a>')
# CSS
s = s.replace('</style>', '''  /* ---- v3（10-07 Fable/Astra 点検後） ---- */
  .hero-kicker{font-size:14px;font-weight:600;color:var(--dim);letter-spacing:.04em;margin:18px 0 6px}
  .hero-proof{font-size:13.5px;color:var(--ink);margin-top:22px;line-height:1.9}
  .hero-proof .nb{color:var(--dim)}
  .hero-note a{color:var(--accent);margin-left:6px}
  .proof-shot{max-width:980px;margin:0 auto}
  .proof-shot img{display:block;width:100%;height:auto}
  .proof-shot figcaption{font-size:12px;color:var(--note);padding:10px 16px 12px}
  .proof-facts{list-style:none;margin:24px auto 0;padding:0;display:flex;justify-content:center;flex-wrap:wrap;gap:10px 28px;max-width:980px}
  .proof-facts li{font-size:14px;color:var(--dim);display:flex;align-items:baseline;gap:6px;flex-wrap:wrap}
  .proof-facts b{font-family:var(--mono);font-size:20px;color:var(--ink)}
  .proof-facts small{font-size:11.5px;color:var(--note)}
  .bk-one{max-width:400px;margin:40px auto 0}
  .ai-grid{display:grid;grid-template-columns:1.1fr 1fr;gap:40px;align-items:center;max-width:1000px;margin:0 auto}
  .ai-demo{margin:0;min-width:0}
  .roles{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .role{background:var(--glass-strong);border:1px solid var(--hair);border-radius:var(--r-card);box-shadow:var(--hi);padding:18px 18px 14px}
  .role.ai{background:var(--accent-soft);border-color:rgba(46,92,230,.18)}
  .role-h{font-weight:700;font-size:15px;margin-bottom:8px}
  .role ul{margin:0;padding:0 0 0 18px;font-size:14px;color:var(--dim);line-height:1.9}
  .role-note{grid-column:1/-1;font-size:13px;color:var(--note)}
  .role-note a{color:var(--accent)}
  .care-notes{text-align:center;font-size:14px;color:var(--dim);line-height:1.9;margin-top:8px}
  .movie-shot{max-width:900px;margin:0 auto}
  .movie-shot video{display:block;width:100%;height:auto;background:#111}
  .movie-shot figcaption{font-size:12px;color:var(--note);padding:10px 16px 12px}
  .buy-list{margin:12px auto 0;padding:0 0 0 20px;max-width:560px;text-align:left;font-size:14px;line-height:1.9;color:var(--dim)}
  .buy-terms{max-width:560px;margin:18px auto 0;text-align:left;font-size:13px;line-height:1.85;color:var(--ink);background:var(--warn-soft);border-radius:12px;padding:12px 14px}
  @media(max-width:860px){ .ai-grid{grid-template-columns:1fr} }
  @media(max-width:520px){ .roles{grid-template-columns:1fr} .proof-facts{flex-direction:column;align-items:flex-start;gap:6px;padding-left:4px} }
</style>''', 1)
for bad in ['自動投稿', '94%', '647', '月額なし', '維持費ほぼゼロ', '一切応じ', '外部への通信は入っていません', 'βテスター', '審査制', '購入する（', '条件を確かめて購入する', '発信の場が4つ']:
    if bad in s:
        i = s.find(bad); print('残り:', bad, repr(re.sub(r'<[^>]+>', '', s[max(0, i - 60):i + 30])))
open(LP, 'w', encoding='utf-8').write(s); print('OK v3', len(s))
