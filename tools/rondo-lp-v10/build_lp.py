import re, sys
SP = '/private/tmp/claude-501/-Users-hayatoikeda-Desktop-dev-cn-kitan-wt-webpoc/8697ea86-6ed8-42e6-aef7-38f6022836bd/scratchpad/'
LP = '/Users/hayatoikeda/Desktop/dev/vibe-wt-rondo-v10/public/rondo.html'
s = open(LP, encoding='utf-8').read()
rd = lambda f: open(SP + f, encoding='utf-8').read()

def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count:
        sys.exit(f'NG: {n}件 (期待{count}): {old[:70]!r}')
    s = s.replace(old, new)

def cut(start_marker, end_marker, new):
    """start_marker から end_marker(含む) までを new に"""
    global s
    a = s.find(start_marker)
    if a < 0: sys.exit(f'NG start: {start_marker[:60]!r}')
    b = s.find(end_marker, a)
    if b < 0: sys.exit(f'NG end: {end_marker[:60]!r}')
    s = s[:a] + new + s[b + len(end_marker):]

# 1. head
rep('ステップメール、LINE配信、SNS、売上、顧客台帳を1つのダッシュボードに統合し、あなたのAIで運用する。βテスター先行販売¥4,980（正式版価格¥9,800予定）。',
    'ステップメール、LINE配信、Instagram、予約ページ、売上、顧客台帳を1つのダッシュボードに統合し、あなたのAIで運用する。正式版 v1.0・買い切り¥9,800。')
rep('CRM・セグメント配信・自動見張りまで同梱、CodexやClaude Codeで作り込む買い切り。βテスター先行販売¥4,980（正式版価格¥9,800予定）。',
    'CRM・セグメント配信・予約ページ・自動見張りまで同梱、CodexやClaude Codeで作り込む買い切り。正式版 v1.0・¥9,800。', count=2)

# 2. header nav
rep('''      <a href="#cover" data-rondo-label="ヘッダー できること">できること</a>
      <a href="#manifest" data-rondo-label="ヘッダー 同梱物">同梱物</a>''',
    '''      <a href="#switch" data-rondo-label="ヘッダー できること">できること</a>
      <a href="#booking" data-rondo-label="ヘッダー 予約">予約</a>
      <a href="#dist-tree" data-rondo-label="ヘッダー 同梱物">同梱物</a>''')
rep('<a class="btn primary head-cta" href="#reserve" data-rondo-label="CTA ヘッダー先行販売" data-rondo-cta="reserve">先行販売に申し込む</a>',
    '<a class="btn primary head-cta" href="#reserve" data-rondo-label="CTA ヘッダー購入" data-rondo-cta="reserve">購入する</a>')

# 3. hero
rep('<span class="hero-pill">βテスター先行販売（審査制）・買い切り <span class="mono">¥4,980</span>・正式版価格 <span class="mono">¥9,800</span> 予定</span>',
    '<span class="hero-pill">正式版 <span class="mono">v1.0</span>・買い切り <span class="mono">¥9,800</span>・月額なし</span>')
rep('<span class="ph">ステップメール、LINE、SNS、売上、</span><span class="ph">顧客台帳を1画面に。</span>',
    '<span class="ph">ステップメール、LINE、Instagram、</span><span class="ph">予約、売上、顧客台帳を1画面に。</span>')
rep('<a class="btn primary" href="#reserve" data-rondo-label="CTA ヒーロー先行販売" data-rondo-cta="reserve">先行販売の審査に申し込む</a>',
    '<a class="btn primary" href="#reserve" data-rondo-label="CTA ヒーロー購入" data-rondo-cta="reserve">購入する（¥9,800）</a>')
rep('<a class="btn ghost" href="#cover" data-rondo-label="ヒーロー できること">できることを見る</a>',
    '<a class="btn ghost" href="#switch" data-rondo-label="ヒーロー できること">できることを見る</a>')

# 4. 管理画面見本の中のLP縮図
rep('<span class="hm-mini">先行販売・審査制</span>', '<span class="hm-mini">正式版 v1.0</span>')
rep('<span class="hm-cta">先行販売に申し込む</span>', '<span class="hm-cta">購入する</span>')

# 5. テスト件数
rep('1,789件', '1,970件', count=3)

# 6. #cover → 乗り換え＋予約
cut('  <!-- MyASP・Lステップ代替 -->', '</section>\n', rd('new_switch.html') + '\n' + rd('new_booking.html'))

# 7. #itch → v4の図つき＋守り
v4 = rd('v4_switch_itch.html')
a = v4.find('  <!-- かゆいところ台帳（図解つき） -->'); b = v4.find('</section>', a) + len('</section>\n')
itch = v4[a:b]
itch = itch.replace('定時ジョブの監視・障害記録・毎朝の送達テスト・日次バックアップ。', '定時ジョブの監視・障害記録・毎朝の送達テスト・毎日のバックアップ。')
if '毎日のバックアップ' not in itch: sys.exit('NG itch backup text')
cut('  <!-- かゆいところ台帳 -->', '</section>\n', itch + '\n' + rd('new_care.html'))

# 8. 実物証明に予約
rep('            <span>LINEの診断・特典・セグメント配信も運用中</span>',
    '            <span>LINEの診断・特典・セグメント配信も運用中</span>\n            <span>セミナーの募集もRondoの予約ページで</span>')

# 9. 同梱物の一覧は同梱物ツリーへ一本化
cut('  <!-- 同梱物 -->\n', '</section>\n', '')
s = s.replace('\n\n\n  <!-- 同梱物ツリー', '\n\n  <!-- 同梱物ツリー')

# 10. 導入に必要なもの → 月々の費用
cut('  <!-- 導入に必要なもの -->', '</section>\n', rd('new_cost.html'))

# 11. 価格と購入
cut('  <!-- 価格と先行販売(審査制)。#priceアンカーはヘッダーナビ用に温存 -->', '</section>\n', rd('new_reserve.html'))

# 12. FAQ
rep('サポート窓口が必要なら、MyASPやLステップなどのSaaSが合っています。', 'サポート窓口が必要なら、月額の配信サービスの方が合っています。')
rep('''<div class="a">読者リストと原稿を書き出せるツール（MyASP、Lステップなど）であれば、移行作業そのものを開発AIに任せる想定です。<br>Rondoの原稿はMarkdownなので、既存のステップメールをそのまま持ち込めます。<br>購入者リストのCSV取込スクリプトも同梱しています。<br>イケハヤ自身も、長年使った配信スタンドから628通のステップメールを移し替えて運用しています。</div>''',
    '''<div class="a">はい。引っ越しの道具を同梱しています。<br>メールの読者はCSVで取り込め、解除・不達の人は配信停止の台帳へ入り、旧ツールの登録日から「続きの通」で始められます。まず数人で試してから全員を入れる手順です。<br>LINEは、LステップのCSVからタグと友だち情報を持ち込めます（友だちとの結び付けは人が確かめます）。購入者リストのCSVも読めます。<br>Rondoの原稿はMarkdownなので、既存のステップメールの移し替えは開発AIに頼めます。<br>イケハヤ自身も、長年使った配信スタンドから628通のステップメールを移し替えて運用しています。</div>
        </details>
        <details>
          <summary data-rondo-label="FAQ 予約">セミナーや個別相談の予約にも使えますか？</summary>
          <div class="a">使えます。v1.0で予約ページが入りました。<br>セミナーは回ごとの定員・申し込み状況のゲージ・キャンセル待ちと自動の繰り上げ・終わった後のアーカイブの案内まで、個別相談は曜日ごとの受付時間から空き枠を出し、1枠1人で受け付けます。<br>LINEの友だち・メールの読者・URLを開いた誰でもから申し込め、前日と直前のお知らせ、Googleカレンダーへの追加にも対応しています。<br>参加費の決済は含みません。</div>''')
rep('''次の大きな版（v2）は別商品として出し、既購入者には優待価格でご案内する予定です。<br>なお、更新を出す時期や内容のお約束はしていません。</div>
        </details>''',
    '''次の大きな版（v2）は別商品として出し、既購入者には優待価格でご案内する予定です。<br>なお、更新を出す時期や内容のお約束はしていません。</div>
        </details>
        <details>
          <summary data-rondo-label="FAQ 先行販売の購入者">先行販売（β版）で買った人はどうなりますか？</summary>
          <div class="a">追加の支払いなしで、v1.0に更新できます。<br>購入したときの納品メールのリンクから、そのまま最新版を受け取れます。<br>更新の手順は同梱の更新ガイドにまとめてあり、適用もあなたのAIに任せられます。</div>
        </details>''')

# 13. 終盤CTA
rep('<a class="btn primary" href="/rondo-apply" data-rondo-label="CTA 最終先行販売" data-rondo-cta="apply">先行販売の審査に申し込む</a>',
    '<a class="btn primary" href="#reserve" data-rondo-label="CTA 最終購入" data-rondo-cta="reserve">購入する（¥9,800・買い切り）</a>')

# 14. 適性診断の結果文
rep("先行販売の審査に進んでください。<br>事前登録済みの方は10%オフが適用されます。</p>'", "購入の条件を確かめて、進んでください。</p>'")
rep('<a class="btn primary" href="/rondo-apply" data-rondo-label="CTA 診断A先行販売" data-rondo-cta="apply">先行販売に申し込む（審査制）</a>',
    '<a class="btn primary" href="/rondo-apply" data-rondo-label="CTA 診断A購入" data-rondo-cta="apply">条件を確かめて購入する</a>')
rep('<a class="btn ghost" href="#reserve" data-rondo-label="CTA 診断B先行販売" data-rondo-cta="reserve">先行販売の購入条件を見る</a>',
    '<a class="btn ghost" href="#reserve" data-rondo-label="CTA 診断B購入条件" data-rondo-cta="reserve">購入の条件を見る</a>')
rep("先行販売は審査制です。<br>足場がそろってからの申込をおすすめします。", "足場がそろってからの購入をおすすめします。")
rep('大手配信スタンド型SaaS（MyASP、Lステップなど）の方が合っています。', '月額の配信サービスの方が合っています。')

# 15. CSS: v4の追加分を元の位置へ、新しい節のCSSを末尾へ
m = re.search(r'(<style[^>]*>)(.*?)(</style>)', s, re.S)
lines = m.group(2).split('\n')
css = '\n'.join(lines[:630]) + '\n' + rd('v4_add.css') + '\n'.join(lines[630:])
css = css.rstrip() + '\n' + rd('new_css.css')
s = s[:m.start(2)] + css + '\n' + s[m.end(2):]

# 残っていてはいけない言葉
for bad in ['βテスター', '先行販売に申し込む', '審査制', '¥4,980', '4,980円', '#cover', '#manifest', 'MyASP、Lステップ']:
    if bad in s:
        i = s.find(bad); print('残り:', bad, repr(s[max(0, i-60):i+40]))
open(LP, 'w', encoding='utf-8').write(s)
print('OK', len(s))

# ---- 16. 文字を削る(本人 10-07「文字が多すぎる」) ----
s = open(LP, encoding='utf-8').read()
rep('<p>Rondoは正真正銘あなたのもの。<br>気に入らないところは<b>全部作り変えられます</b>。<br>月額はなく、かかるのは配信の実費だけです。</p>', '<p><b>全部作り変えられて</b>、月額はありません。</p>')
rep('<p>本質は<b>閲覧・把握用のダッシュボード</b>。<br>中身の作り込みは、あなたがいつも使っている<b>CodexやClaude Code</b>の仕事です。</p>', '<p>作り込みは、いつもの<b>CodexやClaude Code</b>の仕事です。</p>')
rep('<p><b>件名A/Bの自動判定</b>、成績の還流、<b>週次の調律レポート</b>。<br>改善は感想ではなく、仕組みで回ります。</p>', '<p><b>件名A/Bの自動判定</b>と、<b>週次の改善レポート</b>。</p>')
rep('<p>変更のたびに自動テストが走り、<b>壊れていないことを機械的に確かめてから反映</b>されます。<br><b>見た目を変えるのも自由自在</b>です。</p>', '<p>変更のたびに自動テストが走り、<b>壊れていないことを確かめてから反映</b>します。</p>')
a = s.find('<p class="hero-note">'); b = s.find('</p>', a) + 4
s = s[:a] + '<p class="hero-note">Cloudflare（月5ドル）で動作。イケハヤの実務で本番稼働中。</p>' + s[b:]
rep('<p class="lede" style="text-align:center;margin:0 auto 40px">Rondoは商品のために作られたものではありません。<br>イケハヤが自分の商売のために毎日使っている、マーケティング基盤そのものです。</p>',
    '<p class="lede" style="text-align:center;margin:0 auto 40px">イケハヤが毎日使っている基盤そのものです。</p>')
rep('<figcaption>実演ムービー 9分57秒。<br>イケハヤが実物の管理画面を音声つきで案内します。</figcaption>', '<figcaption>実演ムービー 9分57秒（音声つき）。</figcaption>')
rep('<figcaption>ステップメール台帳。<br>628通の原稿と件名A/Bの変種、配信タイミング。</figcaption>', '<figcaption>ステップメール台帳（628通）。</figcaption>')
rep('<figcaption>ファネル分析。<br>流入元→訪問→注文→売上が一本の道で見えます。</figcaption>', '<figcaption>ファネル分析。</figcaption>')
rep('<p class="gallery-note">スクリーンショットはすべて実際の運用画面です。<br>2026年8月時点。</p>', '<p class="gallery-note">すべて実際の運用画面です（2026年8月）。</p>')
a = s.find('<p class="lede" style="text-align:center;margin:16px auto 40px">エンジンも、テストも'); b = s.find('</p>', a) + 4
if a < 0: sys.exit('NG dist lede')
s = s[:a] + '<p class="lede" style="text-align:center;margin:16px auto 40px">サンプルなのは原稿だけ。あとは全部入っています。</p>' + s[b:]
# かゆいところ: 説明文を消し、問いと答えの名前だけに
a = s.find('<section id="itch"'); b = s.find('</section>', a)
sec = s[a:b]
sec = re.sub(r'(<div class="name">[^<]*</div>)\s*<p>.*?</p>', r'\1', sec, flags=re.S)
sec = sec.replace('<p class="lede" style="text-align:center;margin:0 auto 48px">実務で毎日困っていることから作ったので、答えが具体的です。</p>', '<div style="height:36px"></div>')
sec = sec.replace('<h2 style="text-align:center">マーケターのかゆいところに、<br>手が届く。</h2>', '<h2 style="text-align:center"><span class="ph">マーケターの</span><span class="ph">かゆいところに、</span><br><span class="ph">手が届く。</span></h2>')
if '<p>' in sec.split('itch-fig')[0][-400:]: pass
s = s[:a] + sec + s[b:]
# 向く人・向かない人
rep('<p class="lede" style="text-align:center;margin:0 auto 40px">Rondoは上級者向けの製品で、サポート窓口はありません。<br>導入も運用もトラブル対応も、あなたとあなたの開発AIの仕事です。<br>自分でカスタマイズできる自信がない人は、絶対に買わないでください。</p>',
    '<p class="lede" style="text-align:center;margin:0 auto 40px">サポート窓口はありません。<br>自信がない人は、買わないでください。</p>')
rep('<li>ノーコードで完結したい人。Rondoはコードが正本です</li>', '<li>ノーコードで完結したい人</li>')
rep('<li>完成品のアプリを期待する人。パッケージは「種」です</li>', '<li>完成品のアプリを期待する人</li>')
rep('<li>独自ドメインを持っていない人。メールの送信元に必須です（取得すれば使えます）</li>', '<li>独自ドメインを持っていない人</li>')
rep('<li>サポート窓口が必要な人。Rondoにサポートはありません。トラブル対応も自分とAIの仕事です</li>', '<li>サポート窓口が必要な人</li>')
# CSS: 札(チップ)と図
s = s.replace('</style>', '''  /* ---- 文字を減らす(10-07): 機能名の札と図解 ---- */
  .sw-chips{list-style:none;margin:6px 0 0;padding:0;display:flex;flex-wrap:wrap;gap:8px}
  .sw-chips li{display:inline-flex;align-items:center;gap:7px;font-size:14px;font-weight:600;color:var(--ink);background:var(--glass-strong);border:1px solid var(--hair);border-radius:999px;padding:7px 14px;box-shadow:var(--hi);line-height:1.4}
  .sw-chips li i{width:8px;height:8px;border-radius:50%;flex:none}
  .zk{margin:0}
  .zk img{display:block;width:100%;height:auto}
  .zk-wide{max-width:980px;margin:0 auto 36px}
  #switch .zk-wide{margin-bottom:28px}
  .sw-move .zk{max-width:900px;margin:0 auto}
  .bk-kind .sw-chips{margin-top:2px}
  .bk-flow-h{text-align:center;font-weight:700;font-size:18px;margin:64px 0 8px}
  #booking .zk-wide{margin-bottom:8px}
  @media(max-width:640px){ .zk-wide{max-width:420px} .sw-move .zk{max-width:420px} .sw-chips li{font-size:13.5px;padding:6px 12px} }
</style>''', 1)
open(LP, 'w', encoding='utf-8').write(s)
print('OK trim', len(s))

# ---- 17. 見出しの折れ・乗り換え3ステップの枠 ----
s = open(LP, encoding='utf-8').read()
rep('<h2>やりたいことは、<br>あなたのAIに日本語で頼むだけ。</h2>', '<h2><span class="ph">やりたいことは、</span><br><span class="ph">あなたのAIに</span><span class="ph">日本語で頼むだけ。</span></h2>')
rep('<h2>頼むだけで、本番反映まで自動。<br>安全確認つき。</h2>', '<h2><span class="ph">頼むだけで、</span><span class="ph">本番反映まで自動。</span><br><span class="ph">安全確認つき。</span></h2>')
s = s.replace('</style>', '''  #flips h2 .ph{display:inline-block}
  .sw-move{background:none;border:none;box-shadow:none;padding:0;margin-top:88px}
</style>''', 1)
open(LP, 'w', encoding='utf-8').write(s)
print('OK 17')

# ---- 18. スマホでは予約の見本を2枚に ----
s = open(LP, encoding='utf-8').read()
s = s.replace('</style>', '  @media(max-width:620px){ .bk-mocks .bk-mock:nth-child(3){display:none} }\n</style>', 1)
open(LP, 'w', encoding='utf-8').write(s); print('OK 18')
