#!/usr/bin/env python3
"""どーぱみんくりっかー！ 攻略帖（public/dopamin/guide/）を組み立てる。

見た目は月蝕綺譚 攻略帖（vibe.co.jp/luna-occulta/guide/）に合わせる＝方向宣言 DESIGN_DIRECTION.md。
数字はすべて guide_data.json（ゲーム本体の定数から書き出したもの）から取る＝頁に数字を手書きしない。
書き出し（kitan-clicker の app で）:
  GUIDE_OUT=<このフォルダ>/guide_data.json flutter test test/tool_export_guide_test.dart
  GUIDE_SHOTS=<このフォルダ>/shots flutter test test/tool_shot_guide_test.dart   ← 画面写真
組み立て:
  python3 tools/dopamin-guide/build_guide.py [--clicker ~/Desktop/dev/kitan-clicker-wt-stats] [--kitan-web ~/Developer/Recovered-GitHub/cn-kitan-web]
"""
import argparse
import datetime
import json
import math
import re
import shutil
import subprocess
from pathlib import Path

from guide_parts import (ELEM, GOLD_BR, SHOKKO, b, e, elem_chip, fig, formula, hours, html_chain, html_ladder, html_party,
                         html_pity, html_rate_bar, html_stat_bars, kaname, more, num, p, pct, sec, shiori, shot, steps, subh,
                         svg_awaken, svg_bar_steps, svg_hbars, svg_cycle, svg_gogyo, svg_growth, svg_night_road, svg_number_line, svg_train_curve, table,
                         toc, ul)

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
SITE = ROOT / 'public' / 'dopamin'
OUT = SITE / 'guide'
IMG = SITE / 'assets' / 'img' / 'guide'
BASE_URL = 'https://vibe.co.jp/dopamin/guide/'
TF_URL = 'https://testflight.apple.com/join/e11TtzhJ'
V = '20260930b'
TOMO_ECLIPSE = json.loads((HERE / 'measured.json').read_text())['tomoEclipse']['v']  # 灯の単位が変わった（guide_data の tomoOnBest は旧単位）

PAGES = [
    ('hajimekata', 'はじめかた', 'はじめかた 最初の一日', '画面の見方、夜と大妖、タップと育成、放置のしくみ'),
    ('gesshoku', '月蝕・暁', '月蝕・暁 押しどきと倍率の式', '押しどき計算機、失うもの・残るもの、暁の恵み'),
    ('nisen', '第2000夜', '第2000夜の越え方 早い人のやり方', '番付の記録と運営の計測から、月蝕の押しどき・叩き方・毎日のこと'),
    ('nakama', 'なかま・装備', 'なかま・絵巻・装備', '全なかまの攻・速・技、絵巻の率と天井、装備と開眼'),
    ('komatta', '困ったとき', '困ったとき よくある質問', '夜が進まない、大妖に勝てない、引き継ぎ'),
]


def layout(slug, title, desc, body, updated, jsonld=None, script=False, foot=None):
    here = f'{BASE_URL}{slug + "/" if slug else ""}'
    up = '../' if slug else ''
    site = '../../' if slug else '../'
    nav = f'<a href="{up or "./"}"{" aria-current=\"page\"" if not slug else ""}>ホーム</a>' + ''.join(
        f'<a href="{up}{s}/"{" aria-current=\"page\"" if s == slug else ""}>{short}</a>' for s, short, _, _ in PAGES)
    crumb = (f'<nav class="crumb" aria-label="現在地"><a href="{up or "./"}">攻略帖</a><span aria-hidden="true">›</span><span>{e(title.split(" ")[0])}</span></nav>'
             if slug else '')
    ld = [{
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'どーぱみんくりっかー！', 'item': 'https://vibe.co.jp/dopamin/'},
            {'@type': 'ListItem', 'position': 2, 'name': '攻略帖', 'item': BASE_URL},
        ] + ([{'@type': 'ListItem', 'position': 3, 'name': title, 'item': here}] if slug else []),
    }] + ([jsonld] if jsonld else [])
    ld_html = ''.join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>' for x in ld)
    full_title = f'{title}｜どーぱみん 攻略帖' if slug else 'どーぱみん 攻略帖｜どーぱみんくりっかー！公式攻略'
    js = f'<script src="{site}assets/guide.js?v={V}" defer></script>' if script else ''
    return f'''<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{e(full_title)}</title>
<meta name="description" content="{e(desc)}">
<meta name="theme-color" content="#f5f3ec">
<link rel="canonical" href="{here}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="どーぱみんくりっかー！">
<meta property="og:title" content="{e(full_title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{here}">
<meta property="og:image" content="https://vibe.co.jp/dopamin/assets/img/ogp.jpg?v=20260928">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{site}assets/img/icon.png">
<link rel="apple-touch-icon" href="{site}assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@500;700;800&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{site}assets/guide.css?v={V}">
{ld_html}
</head>
<body class="guide-root">
<header class="g-head">
  <div class="g-head-in">
    <a class="g-brand" href="{up or './'}"><img src="{site}assets/img/icon.png" alt="" width="30" height="30"><span>どーぱみん 攻略帖</span></a>
    <a class="g-play" href="{TF_URL}" rel="noopener" data-analytics-event="cta_click" data-analytics-item="testflight" data-analytics-context="guide_header">先行プレイ</a>
  </div>
  <nav class="g-nav" aria-label="攻略帖の頁"><div class="g-nav-in">{nav}</div></nav>
</header>
<main class="g-main">
  <article class="g-article">
    {crumb}
    <h1>{e(title)}</h1>
    <p class="g-updated">最終更新: <time>{updated}</time></p>
    {body}
    {f'<p class="g-back"><a href="{up}">← 攻略帖トップへ戻る</a></p>' if slug else ''}
  </article>
</main>
<footer class="g-foot">
  <p>{foot or '運営による公式攻略。数値はゲーム本体の定数から自動で写しています。テスト版のため、調整で変わることがあります。'}</p>
  <nav aria-label="サイト情報"><a href="{site}">公式サイト</a><a href="{site}terms/">利用規約</a><a href="{site}privacy/">プライバシーポリシー</a><a href="{site}support/">サポート</a></nav>
  <p class="g-copy">© Studio VIBE — どーぱみんくりっかー！</p>
</footer>
{js}
</body>
</html>
'''


# ---------- 頁 ----------
def page_index(d, updated):
    ec = d['eclipse']
    shelf = ''.join(f'<a class="shelf" href="{s}/"><span class="shelf-n">{"一二三四五六"[i]}</span><span class="shelf-b"><span class="shelf-t">{t.split(" ")[0]}</span><span class="shelf-d">{desc}</span></span></a>'
                    for i, (s, _, t, desc) in enumerate(PAGES))
    body = (
        p('運営による公式攻略。数値はゲームの中身そのまま、画面に出ない数字も式ごと載せています。', 'lead')
        + shiori('上から順にどうぞ。月蝕の押しどきは「月蝕・暁」の頁に計算機がございます。', up='../')
        + f'<div class="shelves">{shelf}</div>'
        + sec('yoku', 'よく聞かれること',
              kaname([
                  f'月蝕は、押せるようになってすぐより、進みが鈍るまで潜ってから。上乗せ分は10夜で約×{num(ec["per10"], 2)}（<a href="gesshoku/#oshidoki">押しどき</a>）',
                  '第2000夜を早く越える人のやり方は、番付の記録と運営の計測から<a href="nisen/">第2000夜の越え方</a>にまとめました',
                  'お金はかかりません。ダウンロード無料、アプリ内課金なし',
                  f'なかまはいま{len(d["allies"])}人（<a href="nakama/#ichiran">一覧</a>）',
              ])))
    return layout('', 'どーぱみん 攻略帖', 'どーぱみんくりっかー！の公式攻略。月蝕の押しどき、倍率の式、なかまの攻・速・技、絵巻の率と天井、装備と開眼まで、ゲームの定数から写した数字でまとめています。', body, updated)


def page_hajimekata(d, updated):
    n, t, o, q, dw, ec = d['night'], d['tap'], d['offline'], d['quests'], d['dawn'], d['eclipse']
    kinds = [[f'<b>{k["name"]}</b><br><span class="rd">{k["read"]}</span>', k['effect'] or '特になし'] for k in n['kinds']]
    hp_rows = [[f'第{r["night"]}夜', r['hp'], r['bossHp'], r['drop'], r['bossDrop']] for r in n['hpRows']]
    ms = '・'.join(str(x) for x in t['milestones'])
    meguri = [[q['meguri'][i], q['meguriGoals'][i]] for i in range(len(q['meguri']))]
    early = n['hpEarlyUntil']
    caps = [d['offline']['capSec'] + dw['offlineAddSec'] * k for k in range(0, 9)]
    caps = [min(c, dw['offlineMaxSec']) for c in caps]
    body = (
        shiori('叩けば斬撃、放っておけばなかまが戦います。まずは画面の見方から。')
        + toc([('gamen', '画面の見方'), ('yoru', '夜と大妖'), ('tap', 'タップ'), ('ikusei', '育成'), ('houchi', '放置'), ('ichinichi', '最初の一日'), ('irai', '依頼')])
        + sec('gamen', '画面の見方',
              kaname(['戦いは忍務の画面。叩くか、放っておくだけ', '小判で鍛錬、絵巻で召喚', f'第{ec["unlockNight"]}夜で月蝕が起こせる'])
              + shot('../../assets/img/guide/shot_ninmu.webp', '忍務の画面（戦い）', [
                  (1, 4, 7.2, '今の夜。下の点は、次の大妖までの残り', (27, 5)),
                  (2, 55, 7.2, '小判（鍛錬に使う）と絵巻（召喚に使う）', (42, 5)),
                  (3, 51, 12.8, '依頼・番付・文箱・設定', (47, 5.5)),
                  (4, 52, 38.5, '妖。叩くと斬撃、なかまも自動で戦う', (46, 32)),
                  (5, 4, 75.8, '戦力＝隊の強さ', (29, 4.2)),
                  (6, 80, 77.3, '奥義。溜まると光るので押す', (17, 8.2)),
                  (7, 2, 87.2, '下のタブ（忍務・育成・装備・召喚・月蝕）', (96, 6)),
              ]))
        + sec('yoru', '夜と大妖',
              fig('第1夜から第50夜まで。1夜は妖を倒すと明け、10夜ごとに大妖、50夜目は章の鬼', svg_night_road(n), 460)
              + ul([
                  f'大妖は刻限{b(num(n["bossTime"]) + "秒")}。倒せなくても失うものはなく、同じ夜の妖狩りに戻ります。鍛えてから挑み直せます。',
                  f'章の鬼は小判×{num(n["chapCoinMul"])}。まだ越えていない章の鬼は、ひときわ手ごわくなります。',
                  '妖の属性は10夜ごとに 木→火→土→金→水 と巡ります。',
              ])
              + subh('大妖の型')
              + p(f'大妖には{len(n["kinds"])}つの型があり、夜の番号で決まります（第20夜までは「常」）。')
              + table(['型', '効き目'], kinds)
              + subh('妖の体力と小判')
              + formula(f'第{early}夜まで: 雑魚の体力 = {num(n["hpBase"])} × {num(n["hpGrow"])}<sup>(夜−1)×{num(n["hpEarlyK"])}</sup>',
                        f'第{early + 1}〜{n["hpLateFrom"]}夜: {num(n["hpBase"])} × {num(n["hpGrow"])}<sup>{num((early - 1) * n["hpEarlyK"], 1)} + (夜−{early})</sup>',
                        f'第{n["hpLateFrom"] + 1}夜から: 第{n["hpLateFrom"]}夜の体力 × {num(n["hpLateGrow"])}<sup>(夜−{n["hpLateFrom"]})</sup>',
                        f'大妖の体力 = 雑魚 × {num(n["bossHpMult"])} × 壁（第10〜200夜で1→{num(n["bossWallMax"])}倍）',
                        f'小判 = 雑魚の体力 × {num(n["dropRatio"])}（大妖は ×{num(n["bossDropMult"])}）',
                        note='実際の体力には「なかまの毎秒で決まる下限」があります。まだ倒していない大妖の下限は、初めて出会ったときの毎秒で決まり、そのあと鍛えても上がりません。負けたら鍛えて挑み直すのが正解です。')
              + more('夜ごとの体力と小判（名目値・型や章の補正前）', table(['夜', '雑魚の体力', '大妖の体力', '雑魚の小判', '大妖の小判'], hp_rows, 'num')))
        + sec('tap', 'タップ',
              p(f'叩いた一撃は、「隊でいちばん低いなかまのLvから出す威力」と「隊の毎秒の{pct(t["tapLinkRatio"])}」の大きい方に、装備と主人公レベルの倍率を掛けたもの。なかまが強くなれば、タップも一緒に強くなります。')
              + fig('一撃に重なる倍率（条件がそろったときの最大）', html_chain([
                  ('一撃', '基本', '隊の強さから'),
                  ('連撃', f'×{num(t["comboMaxMul"])}', '叩き続けると溜まる'),
                  ('会心', f'×{num(t["critMul"])}', f'{num(t["critPct"])}%の確率'),
                  ('見切り', f'×{num(t["mikiriMul"])}', f'予兆から{num(t["mikiriWindowSec"])}秒・会心つき'),
                  ('蝕', f'×{num(t["feverTapMul"])}', f'{num(t["feverSec"])}秒のあいだ'),
                  ('主人公Lv', f'〜×{num(t["heroTapCeil"] / t["heroTapFloor"])}', '叩いた回数で'),
              ]), 460)
              + ul([f'連撃は手を止めても{num(t["comboHoldSec"])}秒は減りません。',
                    '見切りが効くのは、予兆の窓の中の最初の1打だけ。',
                    f'蝕は最初が約{num(t["feverFirstSec"])}秒後、そのあと約{num(t["feverIntervalSec"])}秒ごと（暁と装備で短くなる）。月の欠片はふだん{num(t["feverWindowSec"])}秒漂い、最初の1回は触れるまで消えません。蝕の間は小判も×{num(t["feverCoinMul"])}から、大妖を討つと延び、続けて討つほど小判が増えます。',
                    '主人公レベルは月蝕でも消えません。']))
        + sec('ikusei', '育成',
              shot('../../assets/img/guide/shot_ikusei.webp', '育成の画面', [
                  (1, 3, 27.3, '主人公レベル（叩いた回数で上がる）', (94, 8.3)),
                  (2, 3, 36.3, f'隊（{d["team"]["partyMax"]}人）。顔を押すと入れ替え', (94, 11)),
                  (3, 6, 49, '隊をまとめて一段鍛錬', (68, 5.6)),
                  (4, 75, 49, 'おまかせ鍛錬の入り切り', (20, 5.6)),
                  (5, 3, 56.5, '控えと、隊への応援', (20, 4.5)),
                  (6, 75.5, 61, '控えの一括鍛錬（隊に追いつく・MAX）', (21.5, 4.8)),
              ])
              + fig('鍛錬の値段と威力の伸び（Lv1を1としたとき）', svg_train_curve(t), 460)
              + p(f'値段は1段ごとに×{num(t["costGrow"], 4)}、威力は×{num(t["dmgGrow"], 3)}。値段の方が速く伸びるぶん、節目（Lv {ms}）で威力が×{num(t["milestoneStep"])}跳ねます。<b>節目に届く一段は値打ちが大きいので、あと少しで節目なら、そこまで上げる</b>。')
              + formula(f'鍛錬の値段 = 基本の値段 × {num(t["costGrow"], 4)}<sup>Lv</sup>',
                        f'威力 = 隊の基礎 × {num(t["dmgGrow"], 3)}<sup>(Lv−1)</sup> × 節目の倍率'))
        + sec('houchi', '放置（留守の実入り）',
              fig('留守の上限（暁の回数ごと）', svg_bar_steps([f'暁{k}' for k in range(len(caps))], [c / 3600 for c in caps], '時間', dw['offlineMaxSec'] / 3600 * 1.12, fmt=lambda v: f'{num(v, 0)}h'), 460)
              + formula(f'留守の小判 = 隊の毎秒 × {num(n["dropRatio"])} × 留守の秒（上限まで）× 留守の実入り倍率',
                        '留守の実入り倍率 = (1＋提灯の主効果) × (1＋開眼の留守%) × (1＋付加の留守%) × (1＋通い路の留守%)',
                        note=f'隊の毎秒は気絶を数えません。上限ははじめ{hours(o["capSec"])}、暁のたびに+{hours(dw["offlineAddSec"])}、最大{hours(dw["offlineMaxSec"])}。')
              + ul([f'留守の間も、{hours(o["dropEverySec"])}ごとに品が1つ落ちます（最大{o["dropMax"]}つ）。',
                    '提灯の枠の装備と、開眼の「留守の灯」で実入りが増えます。']))
        + sec('ichinichi', '最初の一日',
              steps([
                  ('栞の手ほどきに沿って叩く', '最初はエマひとり。召喚で開始組のなかまが加わっていきます。'),
                  ('小判が貯まったら育成で鍛錬', '節目のLvを意識すると伸びが速い。'),
                  ('第5夜で依頼が開く', f'日替わりの3題を済ませると絵巻{q["dailyFullGekka"]}枚。'),
                  ('絵巻が貯まったら召喚', f'はじめの{d["summon"]["freeTenDays"]}日は毎日1回、十連が無料。'),
                  (f'第{ec["unlockNight"]}夜で月蝕', 'すぐ押さず、進みが鈍るまで潜ってから。'),
                  ('寝る前は放っておくだけ', '留守の間も隊が戦って小判が貯まります。'),
              ]))
        + sec('irai', '依頼',
              p(f'日替わりの3題は下の候補から選ばれます。3題すべて済ませると絵巻{b(q["dailyFullGekka"])}枚。')
              + '<div class="chips">' + ''.join(f'<span class="chip">{x}</span>' for x in q['daily']) + '</div>'
              + p(f'週ごとの宵巡りは{len(q["meguri"])}題。1題ごとに絵巻{q["meguriGekka"]}枚、全部済ませる（満願）とさらに{b(q["meguriFullGekka"])}枚。')
              + more('宵巡りの題と目標', table(['宵巡り', '目標'], meguri, 'num')))
    )
    return layout('hajimekata', 'はじめかた 最初の一日', 'どーぱみんくりっかー！のはじめかた。画面の見方、夜と大妖、タップと育成、放置の実入りの式、最初の一日の流れと依頼。', body, updated)


def page_gesshoku(d, updated):
    ec, dw, g0 = d['eclipse'], d['dawn'], d['gear']
    step, grow = ec['fragExpStep'], ec['fragExpGrow']
    ex = lambda k: num(1 + 0.6 * ec['per10'] ** k, 1)  # 例: 第1520夜で1.6倍のとき、10夜ごとの見込み
    frag_rows = [[f'第{r["night"]}夜', r['frags']] for r in ec['fragRows']]
    mr_top = g0['rankPct'][-1] + (g0['rankPct'][-1] * g0['mrGradeTop'] - g0['rankPct'][-1]) * (g0['gradeMax'] - 1) / g0['gradeMax']
    fever_full = math.ceil(dw['feverSubMax'] / dw['feverSubSec'] - 1e-9)
    carry_full = math.ceil(dw['carryMax'] / dw['carryPer'] - 1e-9)
    off_full = math.ceil((dw['offlineMaxSec'] - d['offline']['capSec']) / dw['offlineAddSec'] - 1e-9)
    best = 1510
    nxt = (best // 10 + 1) * 10
    relief = max(ec['unlockNight'], int(best * ec['reliefRatio']) // 10 * 10)
    carry_steps = [min(dw['carryMax'], dw['carryPer'] * k) * 100 for k in range(0, carry_full + 1, 3)]
    body = (
        shiori('夜を一に戻すかわりに、全ダメージがずっと上がります。深く潜ってから起こすほど、実りは大きゅうございます。')
        + toc([('saki', '先に答え'), ('shikumi', '月蝕のしくみ'), ('oseru', '押せる夜'), ('shiki', '倍率の式'), ('oshidoki', '押しどき'), ('fuda', '札と巻物'), ('akatsuki', '暁'), ('kage', '宿が陰る')])
        + sec('saki', '先に答え',
              kaname([
                  f'月蝕でもらえる分は、今の巡りの最深夜で決まる。盆の「◯倍」の上乗せ分は10夜深いごとに約×{num(ec["per10"], 2)}',
                  f'たとえば第1520夜で「1.6倍」なら、第1530夜で約{ex(1)}倍、第1540夜で約{ex(2)}倍',
                  '時間あたりで得かどうかは進む速さしだい。<b>夜の進みが目に見えて鈍ったら押す</b>',
              ]))
        + sec('shikumi', '月蝕のしくみ',
              fig('月蝕のめぐり', svg_cycle([
                  ('深く潜る', '巡りの最深をのばす'),
                  ('月蝕を起こす', '蝕片を得る'),
                  ('第1夜へ戻る', '見合う夜まで駆け抜け'),
                  ('全ダメージ↑', 'ずっと強いまま'),
              ], ('月蝕', 'くり返す')), 520)
              + shot('../../assets/img/guide/shot_gesshoku.webp', '月蝕の盆（押せるとき）', [
                  (1, 29, 27.8, '全ダメージ ×今 → ×後 と、何倍になるか', (42, 19.5)),
                  (2, 3, 52.5, '失うもの（夜・小判・なかまのLv）', (46, 13.6)),
                  (3, 51, 52.5, '残るもの', (46, 22)),
                  (4, 3, 75.7, f'点＝月蝕の回数。{dw["every"]}度目で暁', (94, 3.2)),
                  (5, 21, 80.5, '月蝕を起こす', (58, 5.4)),
              ])
              + table(['失う', '残る', '得る'], [[
                  '夜・小判・なかまのLv（鍛錬）',
                  '主人公レベル・迎えたなかま・覚醒★・装備・絵巻・月の通い路の星',
                  f'全ダメージの倍率（ずっと）。最深を更新した月蝕なら絵巻+{ec["gekkaOnBest"]}・灯+{TOMO_ECLIPSE}',
              ]])
              + p(f'月蝕のあとは、なかまが妖1体に{num(ec["dashMinKillSec"])}秒以上かかる夜まで一気に駆け抜けます（最大で月蝕した夜の{pct(ec["dashCapRatio"], 0)}まで）。戻り道は思ったより短いです。'))
        + sec('oseru', '押せる夜',
              fig(f'前の月蝕が第{best}夜のとき', svg_number_line(best, nxt, relief, ec['unlockNight'], int(ec['reliefSec'] // 60)), 460)
              + ul([f'最初の月蝕は第{b(ec["unlockNight"])}夜から。',
                    '2回目からは「前に月蝕した最深の夜より先の、大妖の夜」から押せます。',
                    f'一度月蝕したあと、画面を開いたまま{num(ec["reliefSec"] / 60)}分、今の巡りの最深が伸びないときは、前の最深の{pct(ec["reliefRatio"], 0)}（10夜単位で切り捨て・最低でも第{ec["unlockNight"]}夜）まで潜っていれば押せます（盆に「九割で起こせる」と出ます）。',
                    '今の巡りの最深が前の月蝕の最深を越えていない月蝕は、暁の回数に数えず、絵巻・灯のおまけもありません。']))
        + sec('shiki', '倍率の式',
              p('月蝕でもらえるのは「蝕片」。画面には出ませんが、全ダメージの倍率のもとです。')
              + formula(f'蝕片 = {num(ec["fragBase"])} × {num(grow, 3)}<sup>(最深夜 − {ec["fragAnchor"]}) ÷ {num(step)}</sup>',
                        f'全ダメージの倍率 = (1 + {num(ec["fragDmgPer"])} × 蝕片の合計) × 札の倍率',
                        note='「最深夜」は今の巡りでいちばん深く進んだ夜（今いる夜ではない）。巻物の装備で蝕片が増えます。')
              + p('蝕片はたまり続けるので、回数を重ねるほど1回の「◯倍」は小さく見えます。弱くなったわけではありません。')
              + more('最深夜ごとの蝕片（巻物の補正前）', table(['最深夜', 'その夜で月蝕したときの蝕片'], frag_rows, 'num')))
        + sec('oshidoki', '押しどき',
              fig('盆の「◯倍」の上乗せ分は、押す夜をのばすほどこう伸びる', svg_growth(grow, step), 460)
              + '<div class="calc" id="calc" data-grow="' + str(grow) + '" data-step="' + str(step) + '">'
              + '<p class="calc-label">押しどき計算機</p>'
              + '<div class="calc-in">'
              + '<label><span>今の巡りの最深夜</span><input type="number" inputmode="numeric" id="c-now" value="1520" min="100" step="10"></label>'
              + '<label><span>盆の「◯倍」</span><input type="number" inputmode="decimal" id="c-x" value="1.6" min="1" step="0.1"></label>'
              + '<label><span>押したい夜</span><input type="number" inputmode="numeric" id="c-at" value="1560" min="100" step="10"></label>'
              + '</div><p class="calc-out" aria-live="polite">第<b id="c-at-o">1560</b>夜で押すと <b class="big" id="c-res">—</b></p>'
              + '<p class="f-note">見込み = 1 + (盆の倍率 − 1) × ' + num(grow, 3) + '<sup>夜差 ÷ ' + num(step) + '</sup>、夜差 = max(0, 押したい夜 − 今の巡りの最深夜)。途中で月蝕せず、巻物を替えない場合の見込みです。盆の数字は小数第1位で切り捨てなので、少しずれます。</p></div>'
              + subh('考え方')
              + ul([f'倍率は深いほど伸びる。でも時間も使う。伸び（10夜で約×{num(ec["per10"], 2)}）より進みの鈍りの方が大きくなったら押しどき。',
                    f'詰まって{num(ec["reliefSec"] / 60)}分動かないなら、九割の月蝕で立て直すのも手。',
                    '月蝕のあとは駆け抜けで戻れるので、深い月蝕を怖がらなくて大丈夫。']))
        + sec('fuda', '札と巻物',
              p(f'まだ越えたことのない大妖を討って次の夜へ進むと「札」が1枚増え、全ダメージが ×{num(ec["fudaDmgPer"], 3)} ずつ重なります。札は通算でいちばん深い夜から数えるので、月蝕では減らず、同じ大妖を討ち直しても増えません。')
              + formula(f'札の倍率 = {num(ec["fudaDmgPer"], 3)}<sup>札の枚数</sup>', '札の枚数 = (通算の最深夜 − 1) ÷ 10（切り捨て）')
              + p(f'装備の巻物は「月蝕の力」。巻物の主効果 × {num(g0["fragScale"])} だけ蝕片が増えます（MR Lv1で +{num(g0["rankPct"][-1] * g0["fragScale"], 1)}%、MR Lv{g0["gradeMax"]}で約 +{num(mr_top * g0["fragScale"], 1)}%）。'))
        + sec('akatsuki', '暁',
              p(f'月蝕を{b(dw["every"])}回起こすたびに、自動で暁（夜明け）が来ます。選ぶものはありません。前の月蝕の最深を越えていない月蝕は数えません。')
              + fig('暁で延びるなかまLvの持ち越し', svg_bar_steps([f'暁{k}' for k in range(0, carry_full + 1, 3)], carry_steps, '持ち越し（%）', dw['carryMax'] * 100 * 1.15, fmt=lambda v: f'{num(v, 0)}%'), 460)
              + table(['暁の恵み', '1回ごと', '上限'], [
                  ['留守の上限', f'+{hours(dw["offlineAddSec"])}', f'{hours(dw["offlineMaxSec"])}（暁{off_full}回）'],
                  ['なかまLvの持ち越し', f'+{pct(dw["carryPer"], 0)}', f'{pct(dw["carryMax"], 0)}（暁{carry_full}回）'],
                  ['蝕の間隔', f'−{num(dw["feverSubSec"])}秒', f'−{num(dw["feverSubMax"])}秒（暁{fever_full}回）'],
                  ['絵巻', f'+{dw["gekkaOnce"]}枚', '—'],
                  ['今宵の絵巻（毎日）', f'暁{dw["dailyGekkaAt"]}回目から+1枚', '+1枚まで'],
              ])
              + p('持ち越しがあると、月蝕のあともなかまのLvが一部残ります。最初の暁の前は0%なので、Lvはいったん戻ります。'))
        + sec('kage', '月の通い路の宿が陰る',
              p('2回目からの月蝕では、陰っている宿が3つ未満なら、加護が灯っていて、まだ陰っておらず、位1・2の星が残る宿が1つ陰り、その星の効き目が止まります（最初の月蝕では陰りません）。位3の星は陰りません。宿の加護・四神・紫微垣の効き目は止まりません。陰った星は灯し直せて、灯し直すと星の位が上がります。'))
    )
    return layout('gesshoku', '月蝕・暁 押しどきと倍率の式', 'どーぱみんくりっかー！の月蝕の押しどき。蝕片と全ダメージ倍率の式、押しどき計算機、失うもの・残るもの、札と巻物、暁の恵みまで。', body, updated, script=True)


def page_nisen(d, updated, ps, ms):
    """第2000夜の越え方。番付の記録（player_stats.json＝pull_player_stats.py）と運営の計測（measured.json）から。
    言葉は「はじめて読む人」に合わせてかみくだく（10-03 本人「言葉がわかりにくい。実際の画像も見せてもっと丁寧に」）"""
    ec, dw, sm, n, tm, g0 = d['eclipse'], d['dawn'], d['summon'], d['night'], d['team'], d['gear']
    rs, st, goal = ms['rush'], ms['stall'], ps['goal']
    tomo = ms['tomoEclipse']['v']
    grow, step = ec['fragExpGrow'], ec['fragExpStep']
    reached = ps['reached']
    days = [r['days'] for r in reached]
    many = sum(r['dawns'] >= 3 for r in reached)
    sums = [(s, 1 / (1 - grow ** (-s / step))) for s in (200, 100, 50, 20, 10)]
    ecl50 = 50
    gekka50 = ecl50 * ec['gekkaOnBest'] + ecl50 // dw['every'] * dw['gekkaOnce']
    a15, an = ps['dawnsAt1500'], ps['dawnsNow']

    def dn(v):
        return num(float(v), 1)
    pt = ms['byPlaytime']
    pt_rows = [[f'<b>{r["short"]}</b>'] + [f'{v}' if v else '—' for v in r['v'][1:]] for r in pt['rows']]
    light = next(r for r in pt['rows'] if r['label'] == '1日30分')['v']
    sp = pt['spread']
    rush_rows = [(nm, tp, f'{tp}回で ×{mu}') for nm, mu, tp in zip(rs['names'], rs['mul'], rs['taps'])]
    ts = ms['tapStyle']
    tap_rows = [(r['short'], (r['lo'] + r['hi']) / 2, f'第{r["night"]}夜') for r in ts['rows']]
    img = '../../assets/img/guide/'
    body = (
        shiori(f'第{goal}夜まで数日で届く方もいれば、第1500夜あたりで足が止まる方もおられます。どこが違うのか、番付の記録と運営の計測から、順にご案内いたします。')
        + toc([('saki', '先に答え'), ('kotoba', 'この頁の言葉'), ('kiroku', '番付の記録'), ('hiraku', '開いているあいだだけ進む'), ('oharae', '叩いて大祓'),
               ('gesshoku', '月蝕を押すところ'), ('mainichi', '毎日のこと'), ('kabe', f'第{goal}夜の坂'), ('ichinichi', '一日の回し方')])
        + sec('saki', '先に答え',
              kaname([
                  f'早く届く人は、月蝕の回数が多い。第{goal}夜の記録が届いた{len(reached)}人のうち{many}人は、その時点で暁が3つ以上（＝前の最深を越える月蝕を30回以上）',
                  '夜が進むのは、アプリを開いているあいだだけ。閉じているあいだは小判などが貯まるだけで、夜は1つも進まない',
                  f'月蝕は「前の最深を越えて、そこで進みが止まったら」押す。止まったと見る目安は、長く遊ぶ人で{st["heavyMin"]}分、1日30分ほどの人で{st["lightMin"]}分',
              ]))
        + sec('kotoba', 'この頁の言葉',
              p('先に、よく出てくる言葉をそろえておきます。')
              + table(['言葉', '意味'], [
                  ['<b>夜</b>', '今いる場所。画面の左上に出ている数字です。'],
                  ['<b>最深</b>', '今の巡り（前の月蝕から今まで）で、いちばん深く進んだ夜。「前の最深」は、これまでに月蝕したなかでいちばん深い夜のことです。'],
                  ['<b>月蝕</b>', '夜を第1夜に戻すかわりに、全ダメージがずっと上がる仕組み。下の「月蝕」から起こします。'],
                  ['<b>蝕片</b>', '月蝕でもらえる力のもと。画面には数として出ませんが、月蝕の盆の「全ダメージ ×◯」に入っています。'],
                  ['<b>暁</b>', f'前の最深を越える月蝕を{dw["every"]}回するごとに来る、夜明けのごほうび。'],
                  ['<b>大祓</b>', '叩き続けると始まる、斬撃が何倍にもなる時間。'],
              ], stack=False))
        + sec('kiroku', '番付の記録',
              p(f'番付には、その月にいちばん深く進んだ夜と、暁の数が届きます。{ps["asOf"]}の時点で記録のある{ps["players"]}台の端末を、名前を伏せて数えました（この頁の「人」は端末1台を1人として数えています）。')
              + fig(f'第{goal}夜の記録が初めて届くまでの日数（左は、そのとき届いた暁の数）',
                    svg_hbars([(f'暁{r["dawns"]}', r['days'], f'{num(r["days"], 1)}日') for r in reached], max(days) * 1.05, accent={0}), 460)
              + table(['暁の数', '越えた人', '手前の人'], [
                  ['第1500夜の記録が届いたとき', f'{dn(a15["top"]["median"])}つ', f'{dn(a15["near"]["median"])}つ'],
                  ['いま', f'{dn(an["top"]["median"])}つ', f'{dn(an["near"]["median"])}つ'],
              ], stack=False)
              + p(f'数はどれも真ん中の人の値です。「越えた人」は第{goal}夜を越えた{len(reached)}人、「手前の人」は第1500〜{goal - 1}夜にいる{ps["nearCount"]}人。')
              + ul([f'日数は、起点の日から、第{goal}夜以上の記録が初めて届いた日まで。起点は「番付に登録した日」「最初の記録が届いた日」「届いた夜の深さから見積もった日」のうち、いちばん早い日です。実際に遊び始めた日とは限りません。',
                    '暁の数は、記録が届いたときのものです。月蝕の回数そのものは番付に届かないので、暁から「少なくとも何回」と読んでいます。',
                    '番付からわかるのはここまでで、叩いた回数や遊んだ時間は届きません。その先は運営の計測で補います。']))
        + sec('hiraku', '開いているあいだだけ進む',
              p('アプリを閉じているあいだ（留守）は、夜は進みません。戻ってきたときに受け取れるのは、小判・灯・落とし物だけです。')
              + shot(img + 'shot_n_rusu.webp', '留守から戻ったときの画面', [
                  (1, 9, 40.5, '留守のあいだに貯まった小判と灯。夜の数は増えていない', (82, 33.5)),
                  (2, 2.5, 7.2, '夜は、閉じる前と同じ第1531夜のまま', (27, 4.6)),
              ])
              + p('夜を進めるのは、画面を開いている時間です。眺めているあいだに画面が暗くならないよう、設定で「画面を消さない」を入にできます。')
              + shot(img + 'shot_n_settei.webp', '設定の画面', [
                  (1, 87, 13.6, '右上の歯車で設定を開く', (9.5, 4.4)),
                  (2, 55, 33.6, '「画面と電池」を押す', (26, 4)),
                  (3, 14, 66.4, '「画面を消さない」を入にする', (72, 5.2)),
              ])
              + fig(f'一日中開いたままにした{ts["day"]}日目に届いた夜（運営の計測・2026年9月30日の仕様。{ts["trials"]}）',
                    svg_hbars(tap_rows, 2400, accent={len(tap_rows) - 1}, label_w=84), 460)
              + p(f'どれも「{st["heavyMin"]}分止まったら月蝕」の同じ遊び方で、違うのは叩き方だけです。開いていても叩かないと、4日目で第{ts["rows"][0]["night"]}夜でした。'))
        + sec('oharae', '叩いて大祓',
              p('叩き続けると「大祓」が始まり、斬撃が何倍にもなります。叩けば叩くほど段が上がります。ここの回数や秒数は、強化していないときの基本の値です（月の通い路や装備で、時間がのびたり、始まるまでの回数が減ったりします）。')
              + shot(img + 'shot_n_rush.webp', '大祓の最中（百鬼祓）', [
                  (1, 3, 80.6, '今の段と倍率（百鬼祓 ×10）。数字は「今の回数／次の段までの回数」', (75, 5)),
                  (2, 81, 77.8, '奥義の札。光ったら押す。長押しで奥義の画面が開く', (17, 8)),
              ])
              + fig('大祓の段と、そこまでに要る斬撃の回数（大祓が始まるたびに最初の段から数え直し）', svg_hbars(rush_rows, rs['taps'][-1] * 1.45, accent={len(rush_rows) - 1}, label_w=70), 460)
              + ul([f'効いた斬撃が基本{b(rs["taps"][0])}回たまると大祓が始まり、斬撃が×{rs["mul"][0]}になります。',
                    f'残り時間は基本{rs["sec"]}秒。何もしないと1秒に1秒ずつ減り、叩くと1回ごとに{num(rs["tapSec"], 1)}秒戻ります。段が上がると、また満タンに戻ります。',
                    f'<b>1秒に8回ほど叩けば、いちばん上の月蝕祓まで届きます。</b>指を当てたままの長押しでも1秒に{rs["holdTapRate"]}回出るので届きます。',
                    f'月蝕祓になると、叩いても時間はもう延びません。大祓ぜんたいでも{rs["maxSec"]}秒までです。',
                    f'大妖との戦いでは×{rs["bossMulMax"]}まで。大祓が終わると、{num(rs["cooldownSec"] / 60)}分は次の大祓がたまりません。',
                    f'空に月の欠片が漂ったら触れてください。基本{num(d["tap"]["feverSec"])}秒のあいだ、タップが×{num(d["tap"]["feverTapMul"])}になります。']))
        + sec('gesshoku', '月蝕を押すところ',
              shot(img + 'shot_n_gesshoku.webp', '月蝕の盆（下の「月蝕」）', [
                  (1, 29, 27.6, '全ダメージが「今 → 月蝕のあと」で何倍になるか', (42, 19.4)),
                  (2, 3, 51.4, '失うもの（夜・小判・なかまのLv）', (46, 14.6)),
                  (3, 51, 51.4, '残るもの', (46, 23)),
                  (4, 3, 75.6, f'次の暁までの点。点が{dw["every"]}つたまると暁', (94, 3.2)),
                  (5, 21, 80.6, '月蝕を起こす', (58, 5.4)),
              ])
              + subh('押すまでの流れ')
              + steps([
                  ('前の最深より先の、大妖の夜まで進む', '押せるのは、前の最深より先の大妖の夜（10の倍数の夜）から。前の最深が第1510夜なら、第1520夜からです。'),
                  ('進みが止まったら押す', f'最深がしばらく伸びなくなったら押しどき。長く遊ぶ人は{st["heavyMin"]}分、1日30分ほどの人は{st["lightMin"]}分が目安です（短い人が早く押しすぎると、戻り道に時間を使ってしまうため）。'),
                  ('押す前に、小判を鍛錬に使い切る', '下の「育成」を開き、「隊を鍛錬」で小判を使ってから月蝕します。小判は月蝕で0になります。なかまのLvは、暁の「持ち越し」の分だけ残ります（<a href="../gesshoku/#akatsuki">暁</a>）。'),
                  ('月蝕のあとは自動で先へ', f'なかまの強さに見合う夜まで、自動で飛ばして進みます（いちばん先でも月蝕した夜の{pct(ec["dashCapRatio"], 0)}まで）。そこから叩いて、前の最深を越えにいきます。'),
              ])
              + subh('細かく重ねると何がいいか')
              + p('月蝕でもらえる蝕片は、月蝕のたびに足し算で貯まります。同じ夜にたどり着いたとしても、少しずつ何度も月蝕してきた人のほうが、貯まった蝕片は多くなります。')
              + fig('何夜ごとに月蝕してきたかと、貯まった蝕片（最後の1回ぶんを1としたとき）',
                    svg_bar_steps([f'{s}夜' for s, _ in sums], [v for _, v in sums], '貯まった蝕片（倍）', sums[-1][1] * 1.15, fmt=lambda v: f'×{num(v, 1)}'), 460)
              + p(f'さらに、前の最深を越えた月蝕には絵巻{ec["gekkaOnBest"]}枚と灯{tomo}が付き、{dw["every"]}回ごとの暁では絵巻{dw["gekkaOnce"]}枚が付きます。前の最深を越える月蝕を{ecl50}回すれば、絵巻だけで{b(gekka50)}枚です。')
              + ul([f'画面を開いたまま{num(ec["reliefSec"] / 60)}分、最深が伸びないと、押せる夜が「前の最深の約九割」まで下がります（九割の月蝕・<a href="../gesshoku/#oseru">押せる夜</a>）。ただし前の最深を越えずに起こした月蝕には、暁・絵巻・灯は付きません（蝕片は入ります）。詰まりをほどく手で、重ねても暁は増えません。',
                    '細かく重ねると蝕片は増えます。ただ、運営の計測では、これだけで大きく差がつくわけではありませんでした。いちばん効くのは、開いて叩いている時間です。'])
              + more('蝕片の合計の式', formula(f'蝕片の合計 ≒ 最後の1回 ÷ (1 − {num(grow, 3)}<sup>−刻み ÷ {num(step)}</sup>)',
                                            note='「刻み」は何夜ごとに月蝕するか。巻物の倍率を変えず、同じ刻みで十分な回数を重ねたときの近似です（<a href="../gesshoku/#shiki">倍率の式</a>）。')))
        + sec('mainichi', '毎日のこと',
              p('時間に関係なくもらえるものは、毎日取りこぼさないのがいちばんの近道です。')
              + shot(img + 'shot_shoukan.webp', '召喚の画面', [
                  (1, 45, 79, f'十連。始めた日から{sm["freeTenDays"]}日は毎日1回無料（繰り越しなし）', (46.5, 6.6)),
              ])
              + shot(img + 'shot_soubi.webp', '装備の画面', [
                  (1, 22, 41.6, f'鍛冶場。1日{g0["forgeDaily"]}回、装備のLvを上げられる', (26.5, 5.6)),
                  (2, 50.5, 41.6, '開眼。できる数が出ていたら選ぶ', (28.5, 5.6)),
              ])
              + shot(img + 'shot_n_ougi.webp', '奥義の画面（奥義の札を長押し）', [
                  (1, 15, 33.8, '今使っている奥義', (70, 11.4)),
                  (2, 15, 46.2, '奥義の段。右下ほど新しく強い', (70, 24.8)),
              ])
              + ul([f'依頼の3題を済ませると絵巻{d["quests"]["dailyFullGekka"]}枚。',
                    '奥義は、新しい段が開くと、次に溜め始めたときに自動で持ち替わります。ただし、この画面で古い段を自分で選ぶと、その段のままになります。選んだ覚えがあれば、いちばん新しい段を選び直してください。']))
        + sec('kabe', f'第{goal}夜の坂',
              p(f'妖の体力は、第{n["hpLateFrom"]}夜までは1夜ごとに×{num(n["hpGrow"])}、その先は×{num(n["hpLateGrow"])}で増えます。<b>第{goal}夜の手前がいちばんきつい坂</b>で、第1500夜あたりから進みが重くなるのはこのためです。越えると登りはゆるみます。')
              + p('坂を越える助けになるのは、次のような「一度で効く掛け算」です。')
              + table(['掛け算', '効き目'], [
                  ['新しいなかま', f'開始組のほかのなかまを1人迎えるごとに、隊の力が ×{num(tm["joinMul"][0])}（R）〜×{num(tm["joinMul"][-1])}（UR）'],
                  ['夜の属性', f'その夜に克つなかまは ×{num(tm["elemAdv"])}、克たれるなかまは ×{num(tm["elemDis"])}。隊を「おまかせ」にしておけば、属性が替わる10夜ごとに自動で組み直します'],
                  ['月蝕の重ね', '貯まった蝕片（上の図）'],
                  ['装備', '帯＝なかまの力、巻物＝蝕片、刀＝タップ'],
              ])
              + subh('遊ぶ時間ごとの見込み')
              + table(['遊び方'] + pt['cols'][1:], pt_rows, 'num', stack=False)
              + p(f'数は届いた夜（運営の計測・2026年9月30日の仕様）。{pt["note"]}。1日30分なら30日目で第{light[2]}夜、90日目で第{light[3]}夜ほどが目安です。')
              + p(f'召喚の運でも差がつきます。同じ遊び方でも、{sp["label"]}は第{sp["lo"]}〜{sp["hi"]}夜と幅がありました。'))
        + sec('ichinichi', '一日の回し方',
              steps([
                  ('開いたら、毎日のぶんを受け取る', f'無料の十連・依頼・鍛冶場{g0["forgeDaily"]}回。'),
                  ('遊ぶあいだは叩く', '指か長押しで大祓を回す。月の欠片が出たら触れる。奥義の札が光ったら押す。'),
                  ('前の最深を越えて止まったら月蝕', f'長く遊ぶ人は{st["heavyMin"]}分、1日30分ほどの人は{st["lightMin"]}分が目安。押す前に小判を鍛錬に使い切る。'),
                  ('閉じるときは留守に任せる', f'小判・灯・落とし物が貯まります（はじめは{hours(d["offline"]["capSec"])}まで。暁で延びる）。夜は進みません。'),
              ]))
    )
    return layout('nisen', f'第{goal}夜の越え方 早い人のやり方', f'どーぱみんくりっかー！で第{goal}夜を早く越える人のやり方。番付の記録と運営の計測から、月蝕の押しどき・叩き方・毎日のこと・第{goal}夜の坂まで、実際の画面つきで。', body, updated,
                  foot='運営による公式攻略。数値はゲーム本体の定数・番付の集計・運営の計測に基づいています。テスト版のため、調整で変わることがあります。')


def page_nakama(d, updated, faces):
    tm, sm, g = d['team'], d['summon'], d['gear']
    order = {'UR': 0, 'SSR': 1, 'SR': 2, 'R': 3}
    allies = sorted(d['allies'], key=lambda a: (order[a['rarity']], a['seat']))
    smax = max(max(a['atk'], a['spd'], a['tech']) for a in allies)
    cards = []
    for a in allies:
        face = f'<img src="../../assets/img/face/{a["id"]}.webp" alt="" width="48" height="48" loading="lazy">' if a['id'] in faces else ''
        cards.append(f'<li class="ally"><span class="ally-face">{face}</span><span class="ally-b"><span class="ally-top"><b>{e(a["name"])}</b>'
                     f'<span class="rar r-{a["rarity"].lower()}">{a["rarity"]}</span>{elem_chip(a["elem"])}</span>'
                     f'{html_stat_bars(a["atk"], a["spd"], a["tech"], smax)}'
                     f'<span class="ally-mul">通常×{num(a["normalMul"], 2)}・技×{num(a["wazaMul"], 2)}</span></span></li>')
    by_seat = sorted(d['allies'], key=lambda x: x['seat'])
    starters = [a for a in by_seat if a['starter']]
    party_faces = [(a['id'], a['name']) for a in by_seat if a['id'] in faces][:tm['partyMax'] + 4]
    sums = '・'.join(f'{r} {sorted({a["atk"] + a["spd"] + a["tech"] for a in d["allies"] if a["rarity"] == r})[0]}' for r in ['R', 'SR', 'SSR', 'UR'])
    join = '・'.join(f'{r} ×{num(m)}' for r, m in zip(['R', 'SR', 'SSR', 'UR'], tm['joinMul']))
    ssr = 1 - sm['rPct'] - sm['srPct'] - sm['urPct']
    dupe = [[r, f'{sm["dupeShards"][i]}枚'] for i, r in enumerate(['R', 'SR', 'SSR'])]
    slots = [[f'<b>{s["name"]}</b>', s['main']] + s['items'] for s in g['slots']]
    mr_top = g['rankPct'][-1] + (g['rankPct'][-1] * g['mrGradeTop'] - g['rankPct'][-1]) * (g['gradeMax'] - 1) / g['gradeMax']
    cv = g['conv']
    uniques = [[f'<b>{u["name"]}</b>', u['slot'], u['affix'], u['lore']] for u in g['uniques']]
    kai = [[f'<b>{k["name"]}</b>', k['what'], k['value']] if k['what'] != '大妖の刻限' else [f'<b>{k["name"]}</b>', f'大妖の体力を軽くする（刻限は{num(d["night"]["bossTime"])}秒のまま）', f'刻限{k["value"]}相当'] for k in g['kaiDefs']]
    kai_ch = [[f'<b>{s}</b>', '・'.join(v)] for s, v in g['kaiChoices'].items()]
    ougi = [[f'<b>{o["name"]}</b>', f'第{o["night"]}夜' + (f'／主人公Lv{o["heroLv"]}' if o['heroLv'] else ''), '×' + num(o['power']), f'{o["trait"]}：{o["traitText"].replace("育成経験", "落とし物の育成経験")}'] for o in tm['ougi']]
    rank_bars = svg_bar_steps(g['ranks'] + [f'Lv{g["gradeMax"]}'], list(g['rankPct']) + [mr_top], '主効果（Lv1・%）', mr_top * 1.12, fmt=lambda v: f'+{num(v, 0)}%')
    body = (
        shiori('なかまは召喚で迎えます。隊に並ぶのは九人、控えのみなも応援で力を貸してくれます。')
        + toc([('tai', '隊と五行'), ('nouryoku', '攻・速・技'), ('ichiran', 'なかま一覧'), ('emaki', '絵巻'), ('kakusei', '覚醒'), ('ougi', '技と奥義'), ('soubi', '装備'), ('kaigan', '鍛冶場と開眼')])
        + sec('tai', '隊と五行',
              fig('隊は戦い、控えは応援する', html_party(party_faces, '../../', tm['partyMax'], pct(tm['benchSupport'], 0)), 460)
              + ul([f'戦場に並ぶのは{b(tm["partyMax"])}人（隊）。それより多く迎えたなかまは控えになり、自分の毎秒の{pct(tm["benchSupport"], 0)}を隊へ応援として上乗せします。',
                    f'はじめは{starters[0]["name"]}ひとり。開始組の残り{tm["starterCount"] - 1}人（{"・".join(a["name"] for a in starters[1:])}）は、そろうまで召喚で優先して来ます（URが当たったときを除く）。',
                    f'開始組の外から迎えるたび、隊の基礎が掛け算で強くなります（{join}）。なかまは召喚でだけ迎えます。'])
              + fig('相剋の環。矢の元が攻め手、矢の先が制される側', svg_gogyo(tm['katsu']), 340)
              + p(f'夜の属性に克つなかまは{b("×" + num(tm["elemAdv"]))}、克たれるなかまは{b("×" + num(tm["elemDis"]))}。妖の属性は10夜ごとに巡ります。'))
        + sec('nouryoku', '攻・速・技',
              p(f'なかまには攻・速・技の3つの値があります。合計はレア度で決まっていて（{sums}）、配分がそのなかまの持ち味です。')
              + formula(f'通常攻撃の倍率 = {num(tm["statStep"])}<sup>(攻 + 速 − 8)</sup> ÷ {num(tm["statNorm"])}',
                        f'踏み込みの速さ = {num(tm["statStep"])}<sup>(速 − 4)</sup>　・　気絶の長さ = {num(tm["spdKoStep"])}<sup>(速 − 4)</sup>',
                        f'技の威力 = {num(tm["statTechStep"])}<sup>(技 − 4)</sup>　・　技の間合い = 1 ÷ {num(tm["statTechCdStep"])}<sup>(技 − 4)</sup>',
                        note='覚醒で★が上がると、振り分けられる点が増えます（初めの★より上がった分）。'))
        + sec('ichiran', 'なかま一覧',
              p(f'いま{len(d["allies"])}人。棒は攻・速・技、下の数字はその値から出した通常攻撃と技の倍率です。')
              + f'<ul class="allies">{"".join(cards)}</ul>')
        + sec('emaki', '絵巻（召喚）',
              shot('../../assets/img/guide/shot_shoukan.webp', '召喚の儀', [
                  (1, 18, 30.3, 'URの顔ぶれと出る率', (64, 4.2)),
                  (2, 66, 22.2, '提供割合（率の一覧）', (21.5, 4.6)),
                  (3, 9, 79.8, f'単発（絵巻{sm["cost"]}枚）', (34.5, 4.8)),
                  (4, 45, 79, f'十連（はじめの{sm["freeTenDays"]}日は毎日1回無料）', (46.5, 6.6)),
              ])
              + fig('ふだんの出る率（開始組がそろったあと・天井の保証を除く）', html_rate_bar([
                  ('R', sm['rPct'], '#b7b2a6'), ('SR', sm['srPct'], '#4f7fb8'), ('SSR', ssr, GOLD_BR), ('UR', sm['urPct'], SHOKKO)]), 460)
              + fig('天井（引いた回数）', html_pity(sm['pitySr'], sm['pity']), 460)
              + ul([f'絵巻{sm["cost"]}枚で単発、{sm["cost"] * 10}枚で十連、{sm["cost"] * 100}枚で百連。百連はSSR以上が{sm["hundredSsrMin"]}体以上確定。',
                    '天井の保証でURに上がることはありませんが、その回でもふつうの抽選でURが当たることはあります。',
                    f'URは{pct(sm["urPct"], 2)}。催しの間は最大{num(sm["urMulMax"])}倍（{pct(sm["urPct"] * sm["urMulMax"], 2)}）になり、ピックアップのなかまに寄ります。',
                    'すでに迎えたURは、もう出ません。URを全員迎えたあとは、URの当たりはSSRになります。'])
              + subh('被ったとき') + table(['レア', 'もらえる欠片'], dupe, stack=False)
              + p(f'★5のなかまに被った分は「望月のかけら」になります（召喚は{sm["mochizukiRateSummon"]}枚で1つ、ほかは{sm["shardsPerMochizuki"]}枚で1つ）。望月のかけらは、迎えた★5未満のなかまに、次の覚醒に足りない分まで欠片として使えます。'))
        + sec('kakusei', '覚醒（★）',
              fig(f'覚醒の段と、要る欠片（通常攻撃も★ごとに×{num(sm["starNormalMul"])}）', svg_awaken(sm['awakenCost'], sm['starDmgMul']), 460)
              + ul([f'★1つごとに、そのなかまの技 ×{num(sm["starDmgMul"])}、通常攻撃 ×{num(sm["starNormalMul"])}。主人公の奥義は、隊が強くなることで間接に強くなります。',
                    f'欠片は大妖を討つと隊の全員に{sm["bossShards"]}枚。初めて討つ夜は×{sm["bossShardsFirstMul"]}、章の鬼は×{sm["bossShardsChapMul"]}。']))
        + sec('ougi', '技と奥義',
              ul([f'技はなかまごとの自動の必殺。基礎は{num(tm["wazaCdSec"])}秒ごとで、威力は「技の基準値 × {num(tm["wazaSec"])}」に技の値・★・五行・装備の倍率が掛かります。隊の中で順番に放ちます。',
                  f'奥義は主人公の1本のゲージ。基礎は技の命中で+{pct(tm["ougiWazaGain"], 1)}、タップ1回で+{pct(tm["ougiTapGain"], 1)}。蝕の間は{num(tm["feverGaugeMul"])}倍速、奥義の特性「速」「暁」でも速くなります。',
                  f'奥義は最大{tm["ougiMaxCharges"]}本まで溜められ、溜めた本数を{num(tm["ougiVolleyGapSec"])}秒おきに連発します。',
                  f'大妖は見参から{num(tm["bossAtkFirstSec"])}秒後、そのあと{num(tm["bossAtkEverySec"])}秒ごとに大技を出し、隊の最大{tm["bossKoCount"]}人を基礎{num(tm["bossKoSec"])}秒気絶させます（速の値などで短くなる）。はじめての巡りでは第{tm["bossKoFromNight"]}夜から、月蝕のあとは第10夜から。'])
              + formula(f'奥義の基本の一撃 = max(隊の奥義の基準, タップ威力 × {num(tm["tapRate"])}) × {num(tm["ougiSec"])} × 奥義の係数 × 装備などの補正',
                        note='双月斬は、この一撃のあとに会心の追撃（一撃×会心の倍率）が入ります。紅蓮は5秒間の追い打ちが続きます。')
              + p('奥義は、通算の最深夜か主人公レベルのどちらか早い方で次の段が開きます。')
              + table(['奥義', '開く（どちらか早い方）', '係数', '特性'], ougi))
        + sec('soubi', '装備',
              shot('../../assets/img/guide/shot_soubi.webp', '装備の画面', [
                  (1, 9, 26.5, '装備の枠（左右と下に9つ）。押すと付け替え', None),
                  (2, 22, 41.6, f'鍛冶場（1日{g["forgeDaily"]}回）', (26.5, 5.6)),
                  (3, 50.5, 41.6, '開眼（できる数）', (28.5, 5.6)),
                  (4, 94, 27.8, '目の印＝開眼できる品', None),
                  (5, 2, 60, '効果の合計', (96, 20)),
              ])
              + fig('格ごとの主効果（Lv1）と、MR Lv99', rank_bars, 460)
              + ul([f'格は {"→".join(g["ranks"])}。品のLvが上がるほど次の格の値へ近づきます。SSRは付加効果1つ、UR・MRは2つ（+{g["affixPct"][3]}〜{g["affixPct"][-1]}%）。',
                    f'一点物の付加効果は格によらず1つで、+{g["uniquePct"]}%。'])
              + subh('主効果の換え方')
              + table(['枠', '主効果+100%あたり'], [
                  ['<b>面</b>', f'会心の率 +{num(cv["menCritPt"])}ポイント・会心の倍率 +{num(cv["menCritMul"])}'],
                  ['<b>装束</b>', f'刻限{num(cv["shozokuSec"])}秒ぶん大妖の体力を軽くする（刻限そのものは延びない）'],
                  ['<b>草鞋</b>', f'技の間合い −{num(100 / cv["warajiDiv"])}%（−{pct(cv["warajiMax"], 0)}で頭打ち。そこを越えた分は技の威力へ）'],
                  ['<b>巻物</b>', f'蝕片 +{num(100 * g["fragScale"])}%'],
              ])
              + more('9枠の名と格ごとの品', table(['枠', '主効果'] + g['ranks'], slots, 'gear', stack=False))
              + subh('一点物')
              + p(f'名のある品が{len(g["uniques"])}種。妖を1体倒すたび{b("1/" + format(g["uniqueOdds"], ","))}で落ち、出ないまま{b(format(g["uniquePity"], ","))}体倒すと必ず出ます。最初の1品は最初の大妖で必ず落ちます。')
              + more(f'一点物{len(g["uniques"])}種', table(['一点物', '枠', '付加効果', '言い伝え'], uniques)))
        + sec('kaigan', '鍛冶場と開眼',
              ul([f'鍛冶場は1日{g["forgeDaily"]}回。ふいごを連打して火を起こし（火が強いほど判定が広い）、縮む輪に合わせて5回打ちます。',
                  f'1回で品のLvが{g["forgeLevelsBase"]}〜{g["forgeLevelsMax"]}上がります（鍛冶場の画面では「段」）。各格はLv{g["gradeMax"]}まで。Lv{g["gradeMax"]}からさらに育てると次の格のLv1へ。MR Lv{g["gradeMax"]}で完成です。',
                  f'{g["kaiFromRank"]}以上の装備は、Lvが{"・".join(str(x) for x in g["kaiMarks"])}に届くたび開眼でき、3つの中から1つを選びます（1枠最大{g["kaiMax"]}回）。'])
              + table(['開眼', '効き目', '1回ごと'], kai)
              + more('枠ごとに選べる開眼', table(['枠', '選べる開眼'], kai_ch)))
    )
    return layout('nakama', 'なかま・絵巻・装備', 'どーぱみんくりっかー！の全なかまの攻・速・技と倍率、絵巻の出る率と天井、覚醒、技と奥義、装備の格と一点物、鍛冶場と開眼。', body, updated)


def page_komatta(d, updated):
    ec, big = d['eclipse'], d['big']['example']
    ms = '・'.join(str(x) for x in d['tap']['milestones'][:4])
    flow = steps([
        ('育成で鍛錬する', f'節目のLv（{ms}…）に届く一段は特に効く。控えも一括鍛錬で。'),
        ('召喚で新しいなかまを迎える', '開始組の外から迎えるたび、隊の基礎が掛け算で上がる。'),
        ('大妖の型に合わせる', '「タップ半分」なら任せる、「柱が半分」なら叩く。'),
        ('月蝕を起こす', f'押せないときも、画面を開いたまま{num(ec["reliefSec"] / 60)}分止まれば前の最深の{pct(ec["reliefRatio"], 0)}で起こせる。'),
    ])
    faq = [
        ('大妖に勝てない', p(f'刻限は{num(d["night"]["bossTime"])}秒。負けても失うものはなく、同じ夜の妖狩りに戻ります。型によっては「タップが半分」「柱が半分」などがあるので、型に合わせて叩くか任せるかを変えてみてください（<a href="../hajimekata/#yoru">大妖の型</a>）。まだ倒していない大妖の手ごわさは、初めて出会ったときに決まり、鍛えても上がりません。')),
        ('月蝕すると弱くならない？', p('夜とLvはいったん戻りますが、全ダメージの倍率が上がっているので、戻り道はすぐ抜けられます。月蝕のあとは強さに見合う夜まで自動で駆け抜けます。')),
        ('月蝕はいつ押せばいい？', p('深く潜るほど1回でもらえる分は大きくなりますが、時間あたりで得かどうかは進む速さしだいです。目安は「進みが目に見えて鈍ったら押す」（<a href="../gesshoku/#oshidoki">押しどき</a>）。')),
        ('機種変更でデータを引き継げる？', p('タイトル画面の「セーブ」から「コードを作る」で引き継ぎコードを作り、新しい端末で「コードで引き継ぐ」に入力します。引き継がれるのはコードを作った時点の記録なので、移る直前に作ってください。コードは一度だけ使え、30日で失効します。作り直すと前のコードは使えなくなります。')),
        ('アプリを消すとどうなる？', p('セーブは端末の中にあるので、消すとなくなります。消す前に引き継ぎコードを作ってください。')),
        ('お金はかかる？', p('ダウンロード無料、アプリ内課金はありません。第三者の広告も出ません（当社のほかのアプリのお知らせが出ることがあります）。')),
        ('番付の組はどう決まる？', p('始めてからの日数で分かれます。椿組（30日未満）・桔梗組（30〜89日）・藤組（90日から）。始めた日は、名乗った日と到達した夜から見積もった日の早い方です。組は場所（ひと月）の始まりで決まり、その場所の間は変わりません。番付に載るのは名乗った人だけです。')),
        ('数字の K や AA はなに？', p('3桁ごとに単位が変わります。Q の先は AA・AB…と英字2文字が続きます。')
         + '<div class="units">' + ''.join(f'<span class="unit"><b>{r["text"].replace("1.00", "")}</b>10<sup>{r["exp"]}</sup></span>' for r in big) + '</div>'),
        ('不具合を見つけたら', p('<a href="../../support/">サポート</a>のメールか問い合わせフォームへ。端末名・OSのバージョン・起きたことを添えてもらえると助かります。')),
    ]

    def plain(h):
        return re.sub(r'<[^>]+>', '', h)
    ld = {'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [
        {'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': plain(a)}} for q, a in [('夜が進まない', plain(flow))] + faq]}
    body = (shiori('詰まったら、まずここへ。答えを先に書いてございます。')
            + sec('susumanai', '夜が進まないとき', p('上から順に試してください。') + flow)
            + sec('faq', 'よくある質問', ''.join(f'<details class="faq"{" open" if i < 2 else ""}><summary>{e(q)}</summary><div class="faq-a">{a}</div></details>' for i, (q, a) in enumerate(faq))))
    return layout('komatta', '困ったとき よくある質問', 'どーぱみんくりっかー！で困ったとき。夜が進まない・大妖に勝てないときの手、月蝕の押しどき、機種変更の引き継ぎ、番付の組、数字の単位。', body, updated, jsonld=ld)


def copy_assets(d, clicker, kitan_web):
    IMG.mkdir(parents=True, exist_ok=True)
    # 栞のちび（月蝕綺譚 攻略帖と同じ絵）
    src = Path(kitan_web) / 'public/media/img/guide/shiori_chibi.webp'
    if src.exists():
        shutil.copyfile(src, IMG / 'shiori_chibi.webp')
    # 画面写真（tool_shot_guide_test の書き出し）→ webp
    for name in ('ninmu', 'ikusei', 'soubi', 'shoukan', 'gesshoku', 'n_rush', 'n_gesshoku', 'n_rusu', 'n_ougi', 'n_settei'):
        png = HERE / 'shots' / f'{name}.png'
        if png.exists():
            subprocess.run(['cwebp', '-quiet', '-q', '80', str(png), '-o', str(IMG / f'shot_{name}.webp')], check=True)
    # 顔（ゲームの同梱素材）
    face_dir = SITE / 'assets' / 'img' / 'face'
    face_dir.mkdir(parents=True, exist_ok=True)
    faces = set()
    for a in d['allies']:
        f = Path(clicker) / 'app' / a['face']
        if f.exists():
            shutil.copyfile(f, face_dir / f'{a["id"]}.webp')
            faces.add(a['id'])
    return faces


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--clicker', default=str(Path.home() / 'Desktop/dev/kitan-clicker-wt-stats'))
    ap.add_argument('--kitan-web', default=str(Path.home() / 'Developer/Recovered-GitHub/cn-kitan-web'))
    args = ap.parse_args()
    d = json.loads((HERE / 'guide_data.json').read_text())
    day = datetime.date.fromisoformat(d['meta']['exportedAt'][:10])
    updated = day.isoformat()
    faces = copy_assets(d, args.clicker, args.kitan_web)
    ps = json.loads((HERE / 'player_stats.json').read_text())
    ms = json.loads((HERE / 'measured.json').read_text())
    pages = {'': page_index(d, updated), 'hajimekata': page_hajimekata(d, updated), 'gesshoku': page_gesshoku(d, updated),
             'nisen': page_nisen(d, ps['asOf'][:10], ps, ms),
             'nakama': page_nakama(d, updated, faces), 'komatta': page_komatta(d, updated)}
    for slug, text in pages.items():
        dst = OUT / slug / 'index.html' if slug else OUT / 'index.html'
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_text(text)
    print(f'組み立て: {len(pages)}頁・顔{len(faces)}枚・数字は commit {d["meta"]["commit"]}')


if __name__ == '__main__':
    main()
