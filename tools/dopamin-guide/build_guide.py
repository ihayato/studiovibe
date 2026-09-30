#!/usr/bin/env python3
"""どーぱみんくりっかー！ 攻略帖（public/dopamin/guide/）を組み立てる。

数字はすべて guide_data.json（ゲーム本体の定数から書き出したもの）から取る＝頁に数字を手書きしない。
書き出し: kitan-clicker の app で
  GUIDE_OUT=<このフォルダ>/guide_data.json flutter test test/tool_export_guide_test.dart
組み立て:
  python3 tools/dopamin-guide/build_guide.py [--clicker ~/Desktop/dev/kitan-clicker-wt-stats]
方向宣言: tools/dopamin-guide/DESIGN_DIRECTION.md
"""
import argparse
import datetime
import html
import json
import math
import shutil
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
SITE = ROOT / 'public' / 'dopamin'
OUT = SITE / 'guide'
BASE_URL = 'https://vibe.co.jp/dopamin/guide/'
TF_URL = 'https://testflight.apple.com/join/e11TtzhJ'
CSS_V = '20260930a'

PAGES = [
    ('hajimekata', 'はじめ方', 'はじめ方・最初の1日', '画面の見方、夜と大妖、タップと育成、放置のしくみ。'),
    ('gesshoku', '月蝕・暁', '月蝕・暁の攻略', '押しどき、倍率の式、失うもの・残るもの、暁の恵み。'),
    ('nakama', 'なかま・装備', 'なかま・絵巻・装備', '全なかまの能力値、絵巻の率と天井、覚醒、装備と開眼。'),
    ('komatta', '困ったとき', '困ったとき・よくある質問', '夜が進まない、大妖に勝てない、引き継ぎ、数字の読み方。'),
]

e = html.escape


# ---------- 数の書き方 ----------
def num(v, d=2):
    """1.035 → 1.035 / 1.6 → 1.6 / 3.0 → 3"""
    if isinstance(v, int):
        return f'{v:,}'
    s = f'{v:.{d}f}'
    if '.' in s:
        s = s.rstrip('0').rstrip('.')
    return s


def pct(v, d=2):
    return num(v * 100, d) + '%'


def hours(sec):
    return num(sec / 3600, 1) + '時間'


# ---------- 部品 ----------
def formula(*lines, note=''):
    body = ''.join(f'<div class="f-line">{l}</div>' for l in lines)
    n = f'<p class="f-note">{note}</p>' if note else ''
    return f'<div class="formula" role="note">{body}{n}</div>'


def table(head, rows, cls=''):
    th = ''.join(f'<th scope="col">{h}</th>' for h in head)
    trs = ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in r) + '</tr>' for r in rows)
    return f'<div class="tbl-wrap"><table class="tbl {cls}"><thead><tr>{th}</tr></thead><tbody>{trs}</tbody></table></div>'


def answer(q, a):
    return f'<div class="answer"><p class="answer-q">{q}</p><div class="answer-a">{a}</div></div>'


def sec(id_, title, body):
    return f'<section class="g-sec" id="{id_}" aria-labelledby="{id_}-h"><h2 id="{id_}-h">{title}</h2>{body}</section>'


def p(t):
    return f'<p>{t}</p>'


def ul(items):
    return '<ul>' + ''.join(f'<li>{i}</li>' for i in items) + '</ul>'


def ol(items):
    return '<ol>' + ''.join(f'<li>{i}</li>' for i in items) + '</ol>'


def b(v):
    """表の外で数字を立てるとき"""
    return f'<b class="n">{v}</b>'


def layout(slug, title, desc, body, toc, updated, jsonld=None, script=False):
    here = f'{BASE_URL}{slug + "/" if slug else ""}'
    up = '../' if slug else ''
    site = '../../' if slug else '../'
    nav = ''.join(
        f'<a href="{up}{s}/"{" aria-current=\"page\"" if s == slug else ""}>{short}</a>' for s, short, _, _ in PAGES)
    crumb = (f'<nav class="crumb" aria-label="現在地"><a href="{site}">公式サイト</a><span aria-hidden="true">›</span>'
             + (f'<a href="{up}">攻略帖</a><span aria-hidden="true">›</span><span>{e(title)}</span>' if slug else '<span>攻略帖</span>')
             + '</nav>')
    toc_html = ''
    if toc:
        toc_html = '<nav class="g-toc" aria-label="この頁の目次"><ul>' + ''.join(
            f'<li><a href="#{i}">{t}</a></li>' for i, t in toc) + '</ul></nav>'
    ld = [{
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'どーぱみんくりっかー！', 'item': 'https://vibe.co.jp/dopamin/'},
            {'@type': 'ListItem', 'position': 2, 'name': '攻略帖', 'item': BASE_URL},
        ] + ([{'@type': 'ListItem', 'position': 3, 'name': title, 'item': here}] if slug else []),
    }]
    if jsonld:
        ld.append(jsonld)
    ld_html = ''.join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>' for x in ld)
    full_title = f'{title}｜どーぱみんくりっかー！攻略帖' if slug else 'どーぱみんくりっかー！攻略帖｜仕組みと数字のまとめ'
    js = f'<script src="{site}assets/guide.js?v={CSS_V}" defer></script>' if script else ''
    return f'''<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{e(full_title)}</title>
<meta name="description" content="{e(desc)}">
<meta name="theme-color" content="#15121F">
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
<link href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=DotGothic16&family=M+PLUS+Rounded+1c:wght@500;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{site}assets/site.css?v=20260929e">
<link rel="stylesheet" href="{site}assets/guide.css?v={CSS_V}">
{ld_html}
</head>
<body class="guide">
<div class="sky" aria-hidden="true"></div>
<header class="head">
  <div class="wrap">
    <a class="brand" href="{up or './'}" aria-label="攻略帖のトップへ">
      <img class="icon" src="{site}assets/img/icon.png" alt="" width="34" height="34">
      <span class="brand-guide">攻略帖</span>
    </a>
    <a class="soon-pill" href="{TF_URL}" rel="noopener" data-analytics-event="cta_click" data-analytics-item="testflight" data-analytics-context="guide_header">先行プレイ</a>
  </div>
  <nav class="g-nav" aria-label="攻略帖の頁"><div class="wrap">{nav}</div></nav>
</header>
<main class="g-main">
  <div class="wrap g-col">
    {crumb}
    <h1 class="pop g-title">{e(title)}</h1>
    {toc_html}
    {body}
    <p class="g-updated">数字は {updated} 時点のゲームの中身から書き出しています。テスト版のため、調整で変わることがあります。</p>
  </div>
</main>
<footer class="foot">
  <nav class="foot-nav" aria-label="サイト情報"><a href="{site}">公式サイト</a><a href="{up or './'}">攻略帖</a><a href="{site}terms/">利用規約</a><a href="{site}privacy/">プライバシーポリシー</a><a href="{site}support/">サポート</a></nav>
  <p class="foot-copy">© 2026 CryptoNinja</p>
</footer>
{js}
</body>
</html>
'''


# ---------- 頁 ----------
def page_index(d, updated):
    ec = d['eclipse']
    doors = ''.join(f'''<a class="door" href="{s}/"><span class="door-t">{t}</span><span class="door-d">{desc}</span><span class="door-go" aria-hidden="true">›</span></a>'''
                    for s, _, t, desc in PAGES)
    body = (
        p('どーぱみんくりっかー！の仕組みと数字を、ゲームの中身そのままにまとめた攻略帖です。画面には出ない数字（月蝕の蝕片など）も、式ごと載せています。')
        + f'<div class="doors">{doors}</div>'
        + sec('yoku', 'よく聞かれること',
              answer('月蝕は、押せるようになったらすぐ押すべき？',
                     p(f'1回の月蝕でもらえる分は、すぐ押さない方が大きくなります。月蝕の盆の「◯倍」のうち1を超えた分（上乗せ分）は、今の巡りでいちばん深く進んだ夜で決まり、10夜深く潜るごとに約{b("×" + num(ec["per10"], 2))}になります。')
                     + p('ただ、潜るほど夜の進みは遅くなります。時間あたりで得かどうかは進む速さしだいなので、目安は「夜の進みが目に見えて鈍ったら押す」です。<a href="gesshoku/#oshidoki">押しどき計算機へ</a>'))
              + answer('お金はかかる？', p('ダウンロード無料、アプリ内課金はありません。'))
              + answer('何人のなかまがいる？', p(f'いま {b(str(len(d["allies"])))}人です。一覧と能力値は<a href="nakama/#ichiran">なかまの頁</a>に。')))
    )
    return layout('', '攻略帖', 'どーぱみんくりっかー！の攻略帖。月蝕の押しどき、倍率の式、なかまの能力値、絵巻の率と天井、装備と開眼まで、ゲームの定数から書き出した数字でまとめています。', body, None, updated)


def page_hajimekata(d, updated):
    n, t, o, q, dw = d['night'], d['tap'], d['offline'], d['quests'], d['dawn']
    kinds = [[f'<span class="nw">{k["name"]}</span><br><span class="rd">{k["read"]}</span>', k['effect'] or '特になし'] for k in n['kinds']]
    hp_rows = [[f'第{r["night"]}夜', r['hp'], r['bossHp'], r['drop'], r['bossDrop']] for r in n['hpRows']]
    ms = '・'.join(str(x) for x in t['milestones'])
    daily = [[q['daily'][i]] for i in range(len(q['daily']))]
    meguri = [[q['meguri'][i], q['meguriGoals'][i]] for i in range(len(q['meguri']))]
    early = n['hpEarlyUntil']
    toc = [('gamen', '画面の見方'), ('yoru', '夜と大妖'), ('tap', 'タップ'), ('ikusei', '育成'), ('houchi', '放置'), ('ichinichi', '最初の1日'), ('irai', '依頼')]
    body = (
        p('はじめて遊ぶ人が、最初の月蝕までに知っておくと迷わないことをまとめました。')
        + sec('gamen', '画面の見方',
              p('下のタブは5つです。')
              + table(['タブ', 'すること'], [
                  ['忍務', '戦いの画面。叩く・奥義を放つ・大妖に挑む'],
                  ['育成', '小判でなかまを鍛錬する。覚醒（★）もここ'],
                  ['装備', '9つの枠に品を付ける。鍛冶場と開眼'],
                  ['召喚', '絵巻でなかまを呼ぶ（召喚の儀）'],
                  ['月蝕', '夜を1に戻して、全ダメージの倍率を上げる'],
              ])
              + p('上の段には、依頼（第5夜で開く）・番付（大妖を討つと開く）・文箱（お知らせと届き物）・設定が並びます。'))
        + sec('yoru', '夜と大妖',
              ul([
                  f'妖を{b(n["killsPerNight"])}体倒すと夜が明けて、次の夜へ進みます。',
                  f'{n["bossEvery"]}夜ごとに大妖が出ます。刻限は{b(num(n["bossTime"]) + "秒")}。',
                  f'{n["chapterEvery"]}夜ごとの大妖は「章の鬼」です。小判×{num(n["chapCoinMul"])}。まだ越えていない章の鬼は、ひときわ手ごわくなります。',
                  '刻限までに倒せなくても、失うものはありません。同じ夜の妖狩りに戻るので、鍛え直してから挑み直せます。',
                  '妖の属性は10夜ごとに 木→火→土→金→水 と巡ります。',
              ])
              + '<h3>大妖の型</h3>' + p(f'大妖には{len(n["kinds"])}つの型があり、夜の番号で決まります（第20夜までは「常」）。')
              + table(['型', '効き目'], kinds)
              + '<h3>妖の体力と小判</h3>'
              + formula(f'第{early}夜まで: 雑魚の体力 = {num(n["hpBase"])} × {num(n["hpGrow"])}<sup>(夜−1)×{num(n["hpEarlyK"])}</sup>',
                        f'第{early + 1}〜{n["hpLateFrom"]}夜: {num(n["hpBase"])} × {num(n["hpGrow"])}<sup>{num((early - 1) * n["hpEarlyK"], 1)} + (夜−{early})</sup>',
                        f'第{n["hpLateFrom"] + 1}夜から: 第{n["hpLateFrom"]}夜の体力 × {num(n["hpLateGrow"])}<sup>(夜−{n["hpLateFrom"]})</sup>',
                        f'大妖の体力 = 雑魚 × {num(n["bossHpMult"])} × 壁（第10〜200夜で1→{num(n["bossWallMax"])}倍）',
                        f'小判 = 雑魚の体力 × {num(n["dropRatio"])}（大妖は ×{num(n["bossDropMult"])}）',
                        note='表は名目値で、型・章の鬼・装備などの補正は入っていません。実際の体力には「なかまの毎秒で決まる下限」があります。まだ倒していない大妖の下限は、初めて出会ったときの毎秒で決まり、そのあと鍛えても上がりません。負けたら鍛えて挑み直すのが正解です。')
              + table(['夜', '雑魚の体力', '大妖の体力', '雑魚の小判', '大妖の小判'], hp_rows, 'num'))
        + sec('tap', 'タップ',
              p(f'叩いた一撃は、「隊でいちばん低いなかまのLvから出す威力」と「隊の毎秒の{pct(t["tapLinkRatio"])}」の大きい方に、装備と主人公レベルの倍率を掛けたものです。なかまが強くなれば、タップも一緒に強くなります。')
              + table(['しくみ', '数字'], [
                  ['連撃', f'叩くほど溜まり最大×{num(t["comboMaxMul"])}。手を止めて{num(t["comboHoldSec"])}秒は減らない'],
                  ['会心', f'{num(t["critPct"])}%の確率で×{num(t["critMul"])}（装備・開眼で上がる）'],
                  ['見切り', f'妖の予兆から{num(t["mikiriWindowSec"])}秒以内の最初の1打が、必ず会心でさらに×{num(t["mikiriMul"])}'],
                  ['蝕', f'月の欠片がふだん{num(t["feverWindowSec"])}秒漂う（最初の1回は触れるまで消えない）。触れると基本{num(t["feverSec"])}秒のあいだタップ×{num(t["feverTapMul"])}・小判×{num(t["feverCoinMul"])}から。蝕の間に大妖を討つと延び、続けて討つほど小判が増える'],
                  ['主人公レベル', f'叩いた回数で上がる。タップは最大×{num(t["heroTapCeil"] / t["heroTapFloor"])}まで伸びる。月蝕でも消えない'],
              ])
              + p(f'蝕は最初が約{num(t["feverFirstSec"])}秒後、そのあとは約{num(t["feverIntervalSec"])}秒ごとに来ます（暁と装備で短くなる）。'))
        + sec('ikusei', '育成',
              p('育成タブで小判を払うと、なかまが一段ずつ鍛錬されます。')
              + formula(f'鍛錬の値段 = 基本の値段 × {num(t["costGrow"], 4)}<sup>Lv</sup>',
                        f'威力 = 隊の基礎 × {num(t["dmgGrow"], 3)}<sup>(Lv−1)</sup> × 節目の倍率',
                        note=f'節目（Lv {ms}）に届くたび、威力が ×{num(t["milestoneStep"])} されます。')
              + p('値段の伸び（×' + num(t['costGrow'], 4) + '）の方が威力の伸び（×' + num(t['dmgGrow'], 3) + '）より大きいので、節目の手前が値打ちどころです。')
              + p('控えのなかまも「一括鍛錬」でまとめて上げられます。「隊に追いつく」は隊でいちばん低いLvまで、「MAX」は買えるだけ上げます。'))
        + sec('houchi', '放置（留守の実入り）',
              formula(f'留守の小判 = 隊の毎秒 × {num(d["night"]["dropRatio"])} × 留守の秒（上限まで）× 留守の実入り倍率',
                      '留守の実入り倍率 = (1＋提灯の主効果) × (1＋開眼の留守%) × (1＋付加の留守%) × (1＋通い路の留守%)',
                      note=f'隊の毎秒は気絶を数えません。上限ははじめ{hours(o["capSec"])}。暁のたびに+{hours(dw["offlineAddSec"])}、最大{hours(dw["offlineMaxSec"])}まで延びます。')
              + ul([f'留守の間も、{hours(o["dropEverySec"])}ごとに品が1つ落ちます（最大{o["dropMax"]}つ）。',
                    '提灯の枠の装備と、開眼の「留守の灯」で実入りが増えます。']))
        + sec('ichinichi', '最初の1日の流れ',
              ol(['栞の手ほどきに沿って叩く。開始組のなかまが順に加わります。',
                  '小判が貯まったら育成で鍛錬。節目のLvを意識すると伸びが速い。',
                  '第5夜で依頼が開きます。日替わりの3題を済ませると絵巻がもらえます。',
                  f'絵巻が貯まったら召喚。はじめの{d["summon"]["freeTenDays"]}日は毎日1回、無料で十連が引けます。',
                  f'第{d["eclipse"]["unlockNight"]}夜で月蝕が起こせるようになります。すぐ押さず、進みが鈍るまで潜ってから。',
                  '寝る前は放っておくだけでOK。留守の間も隊が戦って小判が貯まります。']))
        + sec('irai', '依頼',
              p(f'日替わりの3題は、この中から選ばれます。3題すべて済ませると絵巻{b(q["dailyFullGekka"])}枚。')
              + table(['今日の依頼（候補）'], daily)
              + p(f'週ごとの宵巡りは{len(q["meguri"])}題。1題ごとに絵巻{q["meguriGekka"]}枚、全部済ませる（満願）とさらに{b(q["meguriFullGekka"])}枚。')
              + table(['宵巡り', '目標'], meguri, 'num'))
    )
    return layout('hajimekata', 'はじめ方・最初の1日', 'どーぱみんくりっかー！のはじめ方。画面の見方、夜と大妖、タップと育成、放置の実入りの式、最初の1日の流れと依頼の一覧。', body, toc, updated)


def page_gesshoku(d, updated):
    ec, dw = d['eclipse'], d['dawn']
    step, grow = ec['fragExpStep'], ec['fragExpGrow']
    ex = lambda k: num(1 + 0.6 * ec['per10'] ** k, 1)  # 例: 第1520夜で1.6倍のとき、10夜ごとの見込み
    frag_rows = [[f'第{r["night"]}夜', r['frags']] for r in ec['fragRows']]
    ahead = [[f'+{k}夜', '×' + num(grow ** (k / step), 2)] for k in (10, 20, 30, 50, 100, 200)]
    g0 = d['gear']
    mr_top = g0['rankPct'][-1] + (g0['rankPct'][-1] * g0['mrGradeTop'] - g0['rankPct'][-1]) * (g0['gradeMax'] - 1) / g0['gradeMax']
    fever_full = math.ceil(dw['feverSubMax'] / dw['feverSubSec'] - 1e-9)
    carry_full = math.ceil(dw['carryMax'] / dw['carryPer'] - 1e-9)
    off_full = math.ceil((dw['offlineMaxSec'] - d['offline']['capSec']) / dw['offlineAddSec'] - 1e-9)
    toc = [('saki', '先に答え'), ('shikumi', '月蝕のしくみ'), ('oseru', '押せる夜'), ('shiki', '倍率の式'), ('oshidoki', '押しどき'), ('fuda', '札と巻物'), ('akatsuki', '暁'), ('kage', '宿が陰る')]
    body = (
        sec('saki', '先に答え',
            answer('月蝕は、押せるようになってもすぐ押さない方が得？',
                   p(f'1回の月蝕でもらえる分は、深く潜るほど大きくなります。盆の「◯倍」のうち1を超えた分（上乗せ分）は、今の巡りの最深夜が10夜深くなるごとに約{b("×" + num(ec["per10"], 2))}です。')
                   + p(f'たとえば第1520夜で「1.6倍」なら、第1530夜で約{ex(1)}倍、第1540夜で約{ex(2)}倍。月蝕の盆の数字も、この式どおりに伸びます。')
                   + p('ただし潜るほど夜は重くなり、時間あたりで得かどうかは進む速さしだいです。<b>夜の進みが目に見えて鈍ったら押す</b>のが目安です。')))
        + sec('shikumi', '月蝕のしくみ',
              p('月蝕を起こすと夜は第1夜に戻りますが、全ダメージの倍率がずっと上がります。月蝕の盆には「全ダメージ ×今 → ×後」と「◯倍」が出ます。')
              + table(['失う', '残る', '得る'], [[
                  '夜・小判・なかまのLv（鍛錬）',
                  '主人公レベル・迎えたなかま・覚醒★・装備・絵巻・月の通い路の星',
                  f'全ダメージの倍率（ずっと）。最深を更新した月蝕なら絵巻+{ec["gekkaOnBest"]}・灯+{ec["tomoOnBest"]}',
              ]])
              + p(f'月蝕のあとは、なかまが妖1体に{num(ec["dashMinKillSec"])}秒以上かかる夜まで一気に駆け抜けます（最大で月蝕した夜の{pct(ec["dashCapRatio"], 0)}まで）。戻り道は思ったより短いです。'))
        + sec('oseru', '押せる夜',
              ul([f'最初の月蝕は第{b(ec["unlockNight"])}夜から。',
                  '2回目からは「前に月蝕した最深の夜より先の、大妖の夜」から押せます（第1510夜で起こしたら、次は第1520夜から）。',
                  f'一度月蝕したあと、画面を開いたまま{num(ec["reliefSec"] / 60)}分、今の巡りの最深が伸びないときは、前の最深の{pct(ec["reliefRatio"], 0)}（10夜単位で切り捨て・最低でも第{ec["unlockNight"]}夜）まで潜っていれば押せます（盆に「九割で起こせる」と出ます）。',
                  '今の巡りの最深が前の月蝕の最深を越えていない月蝕は、暁の回数に数えず、絵巻・灯のおまけもありません。']))
        + sec('shiki', '倍率の式',
              p('月蝕でもらえるのは「蝕片」です。蝕片は画面には出ませんが、全ダメージの倍率のもとになっています。')
              + formula(f'蝕片 = {num(ec["fragBase"])} × {num(grow, 3)}<sup>(最深夜 − {ec["fragAnchor"]}) ÷ {num(step)}</sup>',
                        f'全ダメージの倍率 = (1 + {num(ec["fragDmgPer"])} × 蝕片の合計) × 札の倍率',
                        note='「最深夜」は、今の巡りでいちばん深く進んだ夜です（今いる夜ではありません）。表は巻物の補正前。巻物の装備で蝕片が増えます。')
              + table(['最深夜', 'その夜で月蝕したときの蝕片'], frag_rows, 'num')
              + p('蝕片はたまり続けるので、回数を重ねるほど1回の「◯倍」は小さく見えます。弱くなったわけではありません。'))
        + sec('oshidoki', '押しどき',
              p('月蝕の盆に出る「◯倍」のうち、1を超えた分（上乗せ分）は、押す夜を先へのばすほどこう伸びます。')
              + table(['押す夜をのばす', '上乗せ分'], ahead, 'num')
              + '<div class="calc" id="calc" data-grow="' + str(grow) + '" data-step="' + str(step) + '">'
              + '<h3>押しどき計算機</h3>'
              + '<div class="calc-in">'
              + '<label><span>今の巡りの最深夜</span><input type="number" inputmode="numeric" id="c-now" value="1520" min="100" step="10"></label>'
              + '<label><span>盆の「◯倍」</span><input type="number" inputmode="decimal" id="c-x" value="1.6" min="1" step="0.1"></label>'
              + '<label><span>押したい夜</span><input type="number" inputmode="numeric" id="c-at" value="1560" min="100" step="10"></label>'
              + '</div><p class="calc-out" aria-live="polite">第<b id="c-at-o">1560</b>夜で押すと <b class="big" id="c-res">—</b></p>'
              + '<p class="f-note">見込み = 1 + (盆の倍率 − 1) × ' + num(grow, 3) + '<sup>夜差 ÷ ' + num(step) + '</sup>、夜差 = max(0, 押したい夜 − 今の巡りの最深夜) で出しています。途中で月蝕せず、巻物を替えない場合の見込みです。盆の数字は小数第1位で切り捨てなので、少しずれます。</p></div>'
              + '<h3>考え方</h3>'
              + ul(['倍率は深いほど伸びる。でも時間も使う。伸び（10夜で約×' + num(ec['per10'], 2) + '）より進みの鈍りの方が大きくなったら押しどき。',
                    f'詰まって{num(ec["reliefSec"] / 60)}分動かないなら、九割の月蝕で立て直すのも手。',
                    '月蝕のあとは駆け抜けで戻れるので、深い月蝕を怖がらなくて大丈夫。']))
        + sec('fuda', '札と巻物',
              p(f'まだ越えたことのない大妖を討って次の夜へ進むと「札」が1枚増え、全ダメージが ×{num(ec["fudaDmgPer"], 3)} ずつ重なります。札は通算でいちばん深い夜から数えるので、月蝕では減らず、同じ大妖を討ち直しても増えません。')
              + formula(f'札の倍率 = {num(ec["fudaDmgPer"], 3)}<sup>札の枚数</sup>', '札の枚数 = (通算の最深夜 − 1) ÷ 10（切り捨て）')
              + p(f'装備の巻物は「月蝕の力」。巻物の主効果 × {num(d["gear"]["fragScale"])} だけ蝕片が増えます（MR1で +{num(d["gear"]["rankPct"][-1] * d["gear"]["fragScale"], 1)}%、MR{d["gear"]["gradeMax"]}で約 +{num(mr_top * d["gear"]["fragScale"], 1)}%）。'))
        + sec('akatsuki', '暁',
              p(f'月蝕を{b(dw["every"])}回起こすたびに、自動で暁（夜明け）が来ます。選ぶものはありません。前の月蝕の最深を越えていない月蝕は数えません（表の「暁◯回」は、数える月蝕の{dw["every"]}倍の回数です）。')
              + table(['暁の恵み', '1回ごと', '上限'], [
                  ['留守の上限', f'+{hours(dw["offlineAddSec"])}', f'{hours(dw["offlineMaxSec"])}（暁{off_full}回）'],
                  ['なかまLvの持ち越し', f'+{pct(dw["carryPer"], 0)}', f'{pct(dw["carryMax"], 0)}（暁{carry_full}回）'],
                  ['蝕の間隔', f'−{num(dw["feverSubSec"])}秒', f'−{num(dw["feverSubMax"])}秒（暁{fever_full}回）'],
                  ['絵巻', f'+{dw["gekkaOnce"]}枚', '—'],
                  ['今宵の絵巻（毎日）', f'暁{dw["dailyGekkaAt"]}回目から+1枚', '+1枚まで'],
              ])
              + p('持ち越しがあると、月蝕のあともなかまのLvが一部残ります。暁の前は0%なので、Lvはいったん戻ります。'))
        + sec('kage', '月の通い路の宿が陰る',
              p('2回目からの月蝕では、陰っている宿が3つ未満なら、加護が灯っていて、まだ陰っておらず、位1・2の星が残る宿が1つ陰り、その星の効き目が止まります（最初の月蝕では陰りません）。位3の星は陰りません。宿の加護・四神・紫微垣の効き目は止まりません。陰った星は灯し直せて、灯し直すと星の位が上がります。'))
    )
    return layout('gesshoku', '月蝕・暁の攻略', 'どーぱみんくりっかー！の月蝕の押しどき。蝕片と全ダメージ倍率の式、押しどき計算機、失うもの・残るもの、札と巻物、暁の恵みまで。', body, toc, updated, script=True)


def page_nakama(d, updated, faces):
    tm, sm, g = d['team'], d['summon'], d['gear']
    order = {'UR': 0, 'SSR': 1, 'SR': 2, 'R': 3}
    allies = sorted(d['allies'], key=lambda a: (order[a['rarity']], a['seat']))
    rows = []
    for a in allies:
        face = f'<img src="../../assets/img/face/{a["id"]}.webp" alt="" width="36" height="36" loading="lazy">' if a['id'] in faces else ''
        name = f'<span class="who">{face}<span>{e(a["name"])}</span></span>'
        rows.append([name, f'<span class="rar r-{a["rarity"].lower()}">{a["rarity"]}</span>', a['elem'], a['atk'], a['spd'], a['tech'],
                     '×' + num(a['normalMul'], 2), '×' + num(a['wazaMul'], 2)])
    sums = '・'.join(f'{r} {sorted({a["atk"] + a["spd"] + a["tech"] for a in d["allies"] if a["rarity"] == r})[0]}' for r in ['R', 'SR', 'SSR', 'UR'])
    starters = '・'.join(a['name'] for a in sorted(d['allies'], key=lambda x: x['seat']) if a['starter'])
    kz = '・'.join(f'{k}は{v}に克つ' for k, v in tm['katsu'].items())
    join = '・'.join(f'{r} ×{num(m)}' for r, m in zip(['R', 'SR', 'SSR', 'UR'], tm['joinMul']))
    ssr_pct = 1 - sm['rPct'] - sm['srPct']
    rates = [['R', pct(sm['rPct'], 2)], ['SR', pct(sm['srPct'], 2)], ['SSR', pct(ssr_pct - sm['urPct'], 2)],
             ['UR', f'{pct(sm["urPct"], 2)}（催しで最大 {pct(sm["urPct"] * sm["urMulMax"], 2)}）']]
    dupe = [[r, f'{sm["dupeShards"][i]}枚'] for i, r in enumerate(['R', 'SR', 'SSR'])]
    awaken = [[f'★{i}→★{i + 1}', f'{c}枚'] for i, c in enumerate(sm['awakenCost'])]
    slots = [[s['name'], s['main']] + s['items'] for s in g['slots']]
    mr_top = g['rankPct'][-1] + (g['rankPct'][-1] * g['mrGradeTop'] - g['rankPct'][-1]) * (g['gradeMax'] - 1) / g['gradeMax']
    cv = g['conv']
    ranks = [[r, f'+{num(g["rankPct"][i])}%', g['affixCount'][i], (f'+{g["affixPct"][i]}%' if g['affixPct'][i] else '—')] for i, r in enumerate(g['ranks'])]
    uniques = [[u['name'], u['slot'], u['affix'], u['lore']] for u in g['uniques']]
    kai = [[k['name'], k['what'], k['value']] if k['what'] != '大妖の刻限' else [k['name'], f'大妖の体力を軽くする（刻限は{num(d["night"]["bossTime"])}秒のまま）', f'刻限{k["value"]}相当'] for k in g['kaiDefs']]
    kai_ch = [[s, '・'.join(v)] for s, v in g['kaiChoices'].items()]
    ougi = [[o['name'], f'第{o["night"]}夜' + (f'／主人公Lv{o["heroLv"]}' if o['heroLv'] else ''), '×' + num(o['power']), f'{o["trait"]}：{o["traitText"].replace("育成経験", "落とし物の育成経験")}'] for o in tm['ougi']]
    toc = [('tai', '隊と五行'), ('nouryoku', '攻・速・技'), ('ichiran', 'なかま一覧'), ('emaki', '絵巻'), ('kakusei', '覚醒'), ('ougi', '技と奥義'), ('soubi', '装備'), ('kaigan', '鍛冶場と開眼')]
    body = (
        sec('tai', '隊と五行',
            ul([f'戦場に並ぶのは{b(tm["partyMax"])}人（隊）。それより多く迎えたなかまは控えになります。',
                f'控えは戦いませんが、自分の毎秒の{pct(tm["benchSupport"], 0)}を隊へ「応援」として上乗せします。',
                f'はじめは{starters.split("・")[0]}1人。開始組の残り{tm["starterCount"] - 1}人（{"・".join(starters.split("・")[1:])}）は、そろうまで召喚で優先して来ます（URが当たったときを除く）。',
                f'開始組の外から迎えるたび、隊の基礎が掛け算で強くなります（{join}）。なかまは召喚でだけ迎えます。'])
            + p(f'五行の相剋（{kz}）で、夜の属性に克つなかまは×{num(tm["elemAdv"])}、克たれるなかまは×{num(tm["elemDis"])}になります。'))
        + sec('nouryoku', '攻・速・技',
              p(f'なかまには攻・速・技の3つの値があります。合計はレア度で決まっていて（{sums}）、配分がそのなかまの持ち味です。')
              + formula(f'通常攻撃の倍率 = {num(tm["statStep"])}<sup>(攻 + 速 − 8)</sup> ÷ {num(tm["statNorm"])}',
                        f'踏み込みの速さ = {num(tm["statStep"])}<sup>(速 − 4)</sup>　・　気絶の長さ = {num(tm["spdKoStep"])}<sup>(速 − 4)</sup>',
                        f'技の威力 = {num(tm["statTechStep"])}<sup>(技 − 4)</sup>　・　技の間合い = 1 ÷ {num(tm["statTechCdStep"])}<sup>(技 − 4)</sup>',
                        note='覚醒で★が上がると、振り分けられる点が増えます（初めの★より上がった分）。'))
        + sec('ichiran', 'なかま一覧',
              p(f'いま{len(d["allies"])}人。表の「通常」「技」は、上の式で出した攻・速・技の倍率です。')
              + table(['なかま', 'レア', '属性', '攻', '速', '技', '通常', '技'], rows, 'num allies')
              + '<p class="tbl-hint">表は横に送れます。</p>')
        + sec('emaki', '絵巻（召喚）',
              p(f'絵巻{sm["cost"]}枚で単発、{sm["cost"] * 10}枚で十連、{sm["cost"] * 100}枚で百連が引けます。')
              + table(['レア', '出る率'], rates, 'num')
              + p('<span class="muted">開始組がそろったあと・天井の保証を除いた・ふだんの率です。</span>')
              + ul([f'{sm["pitySr"]}回でSR以上、{sm["pity"]}回でSSR以上が必ず出ます（天井）。天井の保証でURに上がることはありませんが、その回でもふつうの抽選でURが当たることはあります。',
                    f'百連はSSR以上が{sm["hundredSsrMin"]}体以上確定。',
                    f'始めてから{sm["freeTenDays"]}日間は、毎日1回無料で十連（繰り越しなし）。',
                    'すでに迎えたURは、もう出ません。URを全員迎えたあとは、URの当たりはSSRになります。',
                    f'催しの間は、URの率が最大{num(sm["urMulMax"])}倍になり、ピックアップのなかまに寄ります。'])
              + '<h3>被ったとき</h3>' + table(['レア', 'もらえる欠片'], dupe)
              + p(f'★5のなかまに被った分は「望月のかけら」になります（召喚は{sm["mochizukiRateSummon"]}枚で1つ、ほかは{sm["shardsPerMochizuki"]}枚で1つ）。望月のかけらは、迎えた★5未満のなかまに、次の覚醒に足りない分まで欠片として使えます。'))
        + sec('kakusei', '覚醒（★）',
              table(['段', '要る欠片'], awaken, 'num')
              + ul([f'★1つごとに、そのなかまの技 ×{num(sm["starDmgMul"])}、通常攻撃 ×{num(sm["starNormalMul"])}。最大★{sm["starMax"]}。主人公の奥義は、隊が強くなることで間接に強くなります。',
                    f'欠片は大妖を討つと隊の全員に{sm["bossShards"]}枚。初めて討つ夜は×{sm["bossShardsFirstMul"]}、章の鬼は×{sm["bossShardsChapMul"]}。']))
        + sec('ougi', '技と奥義',
              ul([f'技はなかまごとの自動の必殺。基礎は{num(tm["wazaCdSec"])}秒ごとで、威力は「技の基準値 × {num(tm["wazaSec"])}」に技の値・★・五行・装備の倍率が掛かります。隊の中で順番に放ちます。',
                  f'奥義は主人公の1本のゲージ。基礎は技の命中で+{pct(tm["ougiWazaGain"], 1)}、タップ1回で+{pct(tm["ougiTapGain"], 1)}。蝕の間は{num(tm["feverGaugeMul"])}倍速、奥義の特性「速」「暁」でも速くなります。',
                  f'奥義は最大{tm["ougiMaxCharges"]}本まで溜められ、溜めた本数を{num(tm["ougiVolleyGapSec"])}秒おきに連発します。',
                  f'大妖は見参から{num(tm["bossAtkFirstSec"])}秒後、そのあと{num(tm["bossAtkEverySec"])}秒ごとに大技を出し、隊の最大{tm["bossKoCount"]}人を基礎{num(tm["bossKoSec"])}秒気絶させます（速の値などで短くなる）。はじめての巡りでは第{tm["bossKoFromNight"]}夜から、月蝕のあとは第10夜から。'])
              + formula(f'奥義の基本の一撃 = max(隊の奥義の基準, タップ威力 × {num(tm["tapRate"])}) × {num(tm["ougiSec"])} × 奥義の係数 × 装備などの補正',
                        note='双月斬は、この一撃のあとに会心の追撃（一撃×会心の倍率）が入ります。紅蓮は5秒間の追い打ちが続きます。')
              + p('奥義は、通算の最深夜か主人公レベルのどちらか早い方で次の段が開きます。')
              + table(['奥義', '開く（どちらか早い方）', '係数', '特性'], ougi, 'num'))
        + sec('soubi', '装備',
              p('装備は9つの枠。格が上がるほど主効果が大きくなり、SSR以上には付加効果が付きます。')
              + table(['枠', '主効果'] + g['ranks'], slots, 'gear')
              + table(['格', '主効果（1段目）', '付加の数', '付加の値'], ranks, 'num')
              + p(f'主効果は格の中の段が上がるほど、次の格の値へ近づきます（MRは{g["gradeMax"]}段で約+{num(mr_top)}%）。面・装束・草鞋・巻物は、この%を次のように換えて使います。')
              + table(['枠', '主効果+100%あたり'], [
                  ['面', f'会心の率 +{num(cv["menCritPt"])}ポイント・会心の倍率 +{num(cv["menCritMul"])}'],
                  ['装束', f'刻限{num(cv["shozokuSec"])}秒ぶん大妖の体力を軽くする（刻限そのものは延びない）'],
                  ['草鞋', f'技の間合い −{num(100 / cv["warajiDiv"])}%（−{pct(cv["warajiMax"], 0)}で頭打ち。そこを越えた分は技の威力へ）'],
                  ['巻物', f'蝕片 +{num(100 * d["gear"]["fragScale"])}%'],
              ])
              + '<h3>一点物</h3>'
              + p(f'名のある品が{len(g["uniques"])}種。妖を1体倒すたび{b("1/" + format(g["uniqueOdds"], ","))}で落ち、出ないまま{b(format(g["uniquePity"], ","))}体倒すと必ず出ます。最初の1品は最初の大妖で必ず落ちます。')
              + p(f'一点物の付加効果は格によらず1つで、+{g["uniquePct"]}%です。')
              + table(['一点物', '枠', '付加効果', '言い伝え'], uniques))
        + sec('kaigan', '鍛冶場と開眼',
              ul([f'鍛冶場は1日{g["forgeDaily"]}回。ふいごを連打して火を起こし（火が強いほど判定が広い）、縮む輪に合わせて5回打ちます。',
                  f'1回で{g["forgeLevelsBase"]}〜{g["forgeLevelsMax"]}段上がります。各格は{g["gradeMax"]}段まで。{g["gradeMax"]}段からさらに育てると次の格の1段へ。MR{g["gradeMax"]}で完成です。'])
              + p(f'{g["kaiFromRank"]}以上の装備は、格の中の段が{"・".join(str(x) for x in g["kaiMarks"])}に届くたび開眼でき、3つの中から1つを選びます（1枠最大{g["kaiMax"]}回）。')
              + table(['開眼', '効き目', '1回ごと'], kai)
              + table(['枠', '選べる開眼'], kai_ch))
    )
    return layout('nakama', 'なかま・絵巻・装備', 'どーぱみんくりっかー！の全なかまの攻・速・技と倍率、絵巻の出る率と天井、覚醒、技と奥義、装備の格と一点物、鍛冶場と開眼の一覧。', body, toc, updated)


def page_komatta(d, updated):
    ec, big = d['eclipse'], d['big']['example']
    faq = [
        ('夜が進まない', ul([
            f'育成で鍛錬する。節目のLv（{"・".join(str(x) for x in d["tap"]["milestones"][:4])}…）の手前は特に効きます。',
            '召喚で新しいなかまを迎える。開始組の外から迎えるたび、隊の基礎が掛け算で上がります。',
            f'月蝕を起こす。画面を開いたまま{num(ec["reliefSec"] / 60)}分最深が伸びないなら、前の最深の{pct(ec["reliefRatio"], 0)}の夜（最低でも第{ec["unlockNight"]}夜）でも起こせます。',
        ])),
        ('大妖に勝てない', p(f'刻限は{num(d["night"]["bossTime"])}秒です。負けても失うものはなく、同じ夜の妖狩りに戻ります。型によっては「タップが半分」「柱が半分」などがあるので、型に合わせて叩くか任せるかを変えてみてください（<a href="../hajimekata/#yoru">大妖の型</a>）。')),
        ('月蝕すると弱くならない？', p('夜とLvはいったん戻りますが、全ダメージの倍率が上がっているので、戻り道はすぐ抜けられます。月蝕のあとは強さに見合う夜まで自動で駆け抜けます。')),
        ('月蝕はいつ押せばいい？', p('深く潜るほど1回でもらえる分は大きくなりますが、時間あたりで得かどうかは進む速さしだいです。目安は「進みが目に見えて鈍ったら押す」です（<a href="../gesshoku/#oshidoki">押しどき</a>）。')),
        ('機種変更でデータを引き継げる？', p('タイトル画面の「セーブ」から「コードを作る」で引き継ぎコードを作り、新しい端末で「コードで引き継ぐ」に入力します。引き継がれるのはコードを作った時点の記録なので、移る直前に作ってください。コードは一度だけ使え、30日で失効します。作り直すと前のコードは使えなくなります。')),
        ('アプリを消すとどうなる？', p('セーブは端末の中にあるので、消すとなくなります。消す前に引き継ぎコードを作ってください。')),
        ('お金はかかる？', p('ダウンロード無料、アプリ内課金はありません。第三者の広告も出ません（当社のほかのアプリのお知らせが出ることがあります）。')),
        ('番付の組はどう決まる？', p('始めてからの日数で分かれます。椿組（30日未満）・桔梗組（30〜89日）・藤組（90日から）。始めた日は、名乗った日と到達した夜から見積もった日の早い方です。組は場所（ひと月）の始まりで決まり、その場所の間は変わりません。番付に載るのは名乗った人だけです。')),
        ('数字の K や AA はなに？', p('3桁ごとに単位が変わります。Q の先は AA・AB…と英字2文字が続きます。')
         + table(['単位', 'ケタ'], [[r['text'].replace('1.00', ''), f'10<sup>{r["exp"]}</sup>'] for r in big], 'num')),
        ('不具合を見つけたら', p('<a href="../../support/">サポート</a>のメールか問い合わせフォームへ。端末名・OSのバージョン・起きたことを添えてもらえると助かります。')),
    ]
    import re
    def plain(h):
        return re.sub(r'<[^>]+>', '', h)
    ld = {'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [
        {'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': plain(a)}} for q, a in faq]}
    body = ''.join(f'<details class="faq"{" open" if i < 2 else ""}><summary>{e(q)}</summary><div class="faq-a">{a}</div></details>' for i, (q, a) in enumerate(faq))
    return layout('komatta', '困ったとき・よくある質問', 'どーぱみんくりっかー！で困ったとき。夜が進まない・大妖に勝てないときの手、月蝕の押しどき、機種変更の引き継ぎ、番付の組、数字の単位。', body, None, updated, jsonld=ld)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--clicker', default=str(Path.home() / 'Desktop/dev/kitan-clicker-wt-stats'))
    args = ap.parse_args()
    d = json.loads((HERE / 'guide_data.json').read_text())
    updated = datetime.date.fromisoformat(d['meta']['exportedAt'][:10])
    updated_s = f'{updated.year}年{updated.month}月{updated.day}日'

    # 顔（ゲームの同梱素材をそのまま写す）
    face_dir = SITE / 'assets' / 'img' / 'face'
    face_dir.mkdir(parents=True, exist_ok=True)
    faces = set()
    for a in d['allies']:
        src = Path(args.clicker) / 'app' / a['face']
        if src.exists():
            shutil.copyfile(src, face_dir / f'{a["id"]}.webp')
            faces.add(a['id'])

    pages = {'': page_index(d, updated_s), 'hajimekata': page_hajimekata(d, updated_s), 'gesshoku': page_gesshoku(d, updated_s),
             'nakama': page_nakama(d, updated_s, faces), 'komatta': page_komatta(d, updated_s)}
    for slug, text in pages.items():
        dst = OUT / slug / 'index.html' if slug else OUT / 'index.html'
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_text(text)
    print(f'組み立て: {len(pages)}頁・顔{len(faces)}枚・数字は commit {d["meta"]["commit"]}')


if __name__ == '__main__':
    main()
