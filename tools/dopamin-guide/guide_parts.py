"""攻略帖の部品と図解（月蝕綺譚 攻略帖＝cn-kitan-web/components/guide の ui.tsx・figs.tsx と同じ型）。

図はすべてコード描画の SVG／HTML。数字は guide_data.json から渡す＝定数が変われば図も追随する。
配色は昼（生成り）の正典: 地 #f5f3ec・墨 #28263c・金泥 #8a661a・蝕紅 #a8352a・五行色。
"""
import html
import math

e = html.escape

INK = '#28263c'
INK_SOFT = '#5a5870'
GOLD = '#8a661a'
GOLD_BR = '#d9a94c'
SHOKKO = '#a8352a'
NIGHT = '#131320'
LINE = 'rgba(40,38,60,0.14)'
ELEM = {'火': '#e0562f', '水': '#4f7fb8', '木': '#5f9e6e', '金': '#9c968a', '土': '#b98a4a'}
KANJI_NUM = '一二三四五六七八九十'


# ---------- 数の書き方 ----------
def num(v, d=2):
    """1.035 → 1.035 / 1.6 → 1.6 / 3.0 → 3 / 90 → 90（整数の0は落とさない）"""
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


# ---------- 文の部品 ----------
def p(t, cls=''):
    return f'<p{f" class=\"{cls}\"" if cls else ""}>{t}</p>'


def ul(items):
    return '<ul class="g-list">' + ''.join(f'<li>{i}</li>' for i in items) + '</ul>'


def b(v):
    return f'<b class="n">{v}</b>'


def sec(id_, title, body):
    return f'<section class="g-sec" id="{id_}" aria-labelledby="{id_}-h"><h2 id="{id_}-h"><span class="dia" aria-hidden="true">◆ </span>{title}</h2>{body}</section>'


def subh(t):
    return f'<h3><span class="tri" aria-hidden="true">▸ </span>{t}</h3>'


def shiori(text, up='../../'):
    """栞の一言（月蝕綺譚 攻略帖の署名要素・ちび栞が器の上へはみ出す）"""
    return (f'<aside class="shiori-note"><img class="shiori-chibi" src="{up}assets/img/guide/shiori_chibi.webp" alt="" width="308" height="560">'
            f'<p class="shiori-label">栞の一言</p><p class="shiori-text">{text}</p></aside>')


def kaname(items):
    """先に答え（一、二、…で持ち帰れる結論だけ）"""
    lis = ''.join(f'<li><span class="kn" aria-hidden="true">{KANJI_NUM[i]}、</span><span>{t}</span></li>' for i, t in enumerate(items))
    return f'<aside class="kaname"><p class="kaname-label">◆ 先に答え</p><ul>{lis}</ul></aside>'


def toc(items):
    lis = ''.join(f'<li><a href="#{i}"><span class="tn">{k + 1}.</span>{t}</a></li>' for k, (i, t) in enumerate(items))
    return f'<nav class="toc" aria-label="目次"><p class="toc-label">目次</p><ol>{lis}</ol></nav>'


def formula(*lines, note=''):
    body = ''.join(f'<div class="f-line">{l}</div>' for l in lines)
    n = f'<p class="f-note">{note}</p>' if note else ''
    return f'<div class="formula" role="note"><p class="formula-label">式</p>{body}{n}</div>'


def table(head, rows, cls='', stack=True):
    """表。stack=True はスマホ幅で1行=1枚の札に積み替える（月蝕綺譚の tbl-stack）"""
    th = ''.join(f'<th scope="col">{h}</th>' for h in head)
    trs = ''.join('<tr>' + ''.join(f'<td data-label="{e(str(head[i]))}">{c}</td>' for i, c in enumerate(r)) + '</tr>' for r in rows)
    return f'<div class="tbl-wrap{" tbl-stack" if stack else ""}"><table class="tbl {cls}"><thead><tr>{th}</tr></thead><tbody>{trs}</tbody></table></div>'


def fig(caption, inner, max_w=460, cls=''):
    return f'<figure class="fig {cls}" style="max-width:{max_w}px"><div class="fig-body">{inner}</div><figcaption>{caption}</figcaption></figure>'


def steps(items):
    lis = ''.join(f'<li><span class="step-n">{i + 1}</span><div><p class="step-t">{t}</p><p class="step-b">{body}</p></div></li>' for i, (t, body) in enumerate(items))
    return f'<ol class="steps">{lis}</ol>'


def elem_chip(el):
    if not el:
        return ''
    return f'<span class="elem" style="--el:{ELEM[el]}">{el}</span>'


def more(title, inner):
    """詳しい表の折りたたみ（要点は図と文に、数字の表はここへ）"""
    return f'<details class="kuwashiku"><summary>{title}<span class="open-hint">（ひらく）</span></summary><div class="kuwashiku-body">{inner}</div></details>'


# ---------- 実画面に番号を振った図 ----------
def shot(src, caption, marks, w=300, alt=''):
    """marks: [(番号, x%, y%, 説明, 枠(w%,h%)|None)]。x,y は画像に対する割合（枠なら左上）。凡例は図の下に"""
    pins = []
    for n, x, y, _t, box in marks:
        if box:
            pins.append(f'<span class="shot-box" style="left:{x}%;top:{y}%;width:{box[0]}%;height:{box[1]}%"><span class="shot-pin">{n}</span></span>')
        else:
            pins.append(f'<span class="shot-pin solo" style="left:{x}%;top:{y}%">{n}</span>')
    legend = ''.join(f'<li><span class="shot-pin in">{n}</span><span>{t}</span></li>' for n, _x, _y, t, _b in marks)
    return (f'<figure class="shot" style="max-width:{w}px"><div class="shot-img"><img src="{src}" alt="{e(alt or caption)}" width="780" height="1688" loading="lazy">{"".join(pins)}</div>'
            f'<figcaption>{caption}</figcaption></figure><ol class="shot-legend">{legend}</ol>')


# ---------- 図解（SVG） ----------
def svg_night_road(n):
    """1〜50夜の道のり: 1夜=妖{killsPerNight}体、10夜ごとに大妖、50夜は章の鬼（スマホ幅で字が11px以上になる寸法）"""
    W, H = 380, 150
    x0, x1 = 16, 356
    y = 82
    parts = [f'<text x="{x0}" y="22" font-size="15" fill="{INK}">・＝1夜（妖を{n["killsPerNight"]}体倒すと明ける）</text>',
             f'<text x="{x0}" y="42" font-size="15" fill="{GOLD}" font-weight="700">10夜ごとに大妖（刻限{num(n["bossTime"])}秒）</text>',
             f'<line x1="{x0}" y1="{y}" x2="{x1}" y2="{y}" stroke="{LINE}" stroke-width="2"/>']
    for k in range(1, 51):
        x = x0 + (x1 - x0) * (k - 1) / 49
        if k % n['chapterEvery'] == 0:
            parts.append(f'<circle cx="{x:.1f}" cy="{y}" r="13" fill="{SHOKKO}"/><text x="{x:.1f}" y="{y + 5}" text-anchor="middle" font-size="15" font-weight="700" fill="#fff">章</text>')
            parts.append(f'<text x="{x + 8:.1f}" y="{y + 54}" text-anchor="end" font-size="15" fill="{SHOKKO}" font-weight="700">第{k}夜は章の鬼</text>')
        elif k % n['bossEvery'] == 0:
            parts.append(f'<circle cx="{x:.1f}" cy="{y}" r="11" fill="{NIGHT}" stroke="{GOLD_BR}" stroke-width="1.6"/><text x="{x:.1f}" y="{y + 4.5}" text-anchor="middle" font-size="15" font-weight="700" fill="{GOLD_BR}">妖</text>')
            parts.append(f'<text x="{x:.1f}" y="{y + 32}" text-anchor="middle" font-size="15" fill="{INK}">{k}夜</text>')
        else:
            parts.append(f'<circle cx="{x:.1f}" cy="{y}" r="2.4" fill="{INK_SOFT}" opacity=".55"/>')
    return f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="第1夜から第50夜までの道のり。10夜ごとに大妖、50夜目は章の鬼" class="svg">{"".join(parts)}</svg>'


def html_chain(items):
    """掛け算の鎖（例: 一撃 → ×連撃 → ×会心 …）。items=[(題, 数字, 注)]"""
    cells = []
    for i, (t, v, note) in enumerate(items):
        if i:
            cells.append('<span class="chain-x" aria-hidden="true">×</span>')
        cells.append(f'<span class="chain-c{" first" if i == 0 else ""}"><span class="chain-t">{t}</span><span class="chain-v">{v}</span><span class="chain-n">{note}</span></span>')
    return f'<div class="chain">{"".join(cells)}</div>'


def svg_train_curve(t, lv_max=220):
    """鍛錬: 威力（節目で跳ねる）と値段の伸び（対数の縦軸）。Lv1=1 にそろえる"""
    W, H, L, R, T, B = 380, 260, 50, 10, 30, 40
    pw, ph = W - L - R, H - T - B

    def mm(lv):
        m = 1.0
        for st in t['milestones']:
            if lv >= st:
                m *= t['milestoneStep']
        return m

    pw_pts = [(lv, math.log10(t['dmgGrow'] ** (lv - 1) * mm(lv) / mm(1))) for lv in range(1, lv_max + 1)]
    cost_pts = [(lv, math.log10(t['costGrow'] ** (lv - 1))) for lv in range(1, lv_max + 1)]
    ymax = math.ceil(max(v for _, v in pw_pts + cost_pts))

    def X(lv):
        return L + pw * (lv - 1) / (lv_max - 1)

    def Y(v):
        return T + ph * (1 - v / ymax)

    def path(pts):
        return 'M' + ' L'.join(f'{X(a):.1f},{Y(v):.1f}' for a, v in pts)
    g = [f'<line x1="{L}" y1="12" x2="{L + 22}" y2="12" stroke="{SHOKKO}" stroke-width="2.6"/><text x="{L + 28}" y="16" font-size="15" fill="{SHOKKO}" font-weight="700">威力（節目で×{num(t["milestoneStep"])}）</text>',
         f'<line x1="{L + 190}" y1="12" x2="{L + 212}" y2="12" stroke="{INK_SOFT}" stroke-width="2" stroke-dasharray="5 3"/><text x="{L + 218}" y="16" font-size="15" fill="{INK_SOFT}">値段</text>']
    for k in range(0, ymax + 1, 2 if ymax > 6 else 1):
        g.append(f'<line x1="{L}" y1="{Y(k):.1f}" x2="{W - R}" y2="{Y(k):.1f}" stroke="{LINE}"/>')
        g.append(f'<text x="{L - 6}" y="{Y(k) + 4:.1f}" text-anchor="end" font-size="14" fill="{INK_SOFT}">×10<tspan dy="-5" font-size="11">{k}</tspan></text>')
    for st in t['milestones']:
        if st <= lv_max:
            g.append(f'<line x1="{X(st):.1f}" y1="{T}" x2="{X(st):.1f}" y2="{T + ph}" stroke="{GOLD_BR}" stroke-dasharray="3 3" opacity=".8"/>')
    for st in [x for x in t['milestones'] if x <= lv_max and x >= 25]:
        g.append(f'<text x="{X(st):.1f}" y="{H - 22}" text-anchor="middle" font-size="14" fill="{GOLD}">{st}</text>')
    g.append(f'<path d="{path(cost_pts)}" fill="none" stroke="{INK_SOFT}" stroke-width="2" stroke-dasharray="6 4"/>')
    g.append(f'<path d="{path(pw_pts)}" fill="none" stroke="{SHOKKO}" stroke-width="2.6"/>')
    g.append(f'<text x="{L + pw / 2:.1f}" y="{H - 4}" text-anchor="middle" font-size="14" fill="{INK_SOFT}">なかまのLv（金の点線＝節目）</text>')
    return f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="鍛錬の値段と威力の伸び。威力は節目のLvで跳ねる" class="svg">{"".join(g)}</svg>'


def svg_bar_steps(labels, values, unit, vmax, accent_last=True, fmt=lambda v: v):
    """横に並ぶ段の棒（暁で延びる留守の上限など）"""
    n = len(values)
    W, H, L, T, B = 380, 200, 6, 30, 30
    bw = (W - 2 * L) / n
    g = [f'<text x="{L}" y="14" font-size="15" fill="{INK_SOFT}">{unit}</text>']
    for i, (lab, v) in enumerate(zip(labels, values)):
        h = (H - T - B) * v / vmax
        x = L + i * bw + bw * .14
        y = H - B - h
        last = accent_last and i == n - 1
        g.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{bw * .72:.1f}" height="{h:.1f}" rx="3" fill="{SHOKKO if last else GOLD_BR}" opacity="{1 if last else .85}"/>')
        g.append(f'<text x="{x + bw * .36:.1f}" y="{y - 5:.1f}" text-anchor="middle" font-size="14" font-weight="700" fill="{INK}">{fmt(v)}</text>')
        g.append(f'<text x="{x + bw * .36:.1f}" y="{H - B + 16:.1f}" text-anchor="middle" font-size="14" fill="{INK_SOFT}">{lab}</text>')
    return f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="{unit}" class="svg">{"".join(g)}</svg>'


def svg_cycle(nodes, center):
    """めぐりの図（4つの箱を時計回りに矢印でつなぐ）。nodes=[(題, 注)]×4"""
    W, H, cx, cy, r = 380, 340, 190, 170, 108
    pos = [(cx, 44), (302, cy), (cx, 296), (78, cy)]
    g = [f'<defs><marker id="cyc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="{GOLD}"/></marker></defs>']
    for i in range(4):
        a1 = math.radians(-90 + i * 90 + 30)
        a2 = math.radians(-90 + (i + 1) * 90 - 30)
        x1, y1 = cx + r * math.cos(a1), cy + r * math.sin(a1)
        x2, y2 = cx + r * math.cos(a2), cy + r * math.sin(a2)
        g.append(f'<path d="M{x1:.1f},{y1:.1f} A{r},{r} 0 0 1 {x2:.1f},{y2:.1f}" fill="none" stroke="{GOLD}" stroke-width="2.4" marker-end="url(#cyc)"/>')
    g.append(f'<text x="{cx}" y="{cy - 2}" text-anchor="middle" font-size="16" font-weight="700" fill="{SHOKKO}">{center[0]}</text>')
    g.append(f'<text x="{cx}" y="{cy + 18}" text-anchor="middle" font-size="15" fill="{INK_SOFT}">{center[1]}</text>')
    for (x, y), (t, note) in zip(pos, nodes):
        g.append(f'<rect x="{x - 75}" y="{y - 28}" width="150" height="56" rx="10" fill="#fff" stroke="{LINE}"/>')
        g.append(f'<text x="{x}" y="{y - 5}" text-anchor="middle" font-size="16" font-weight="700" fill="{INK}">{t}</text>')
        g.append(f'<text x="{x}" y="{y + 15}" text-anchor="middle" font-size="15" fill="{INK_SOFT}">{note}</text>')
    return f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="{center[0]}のめぐり" class="svg">{"".join(g)}</svg>'


def svg_number_line(best, nxt, relief, unlock, relief_min=30):
    """押せる夜の数直線（前の月蝕・次に押せる大妖の夜・九割の救済）。ラベルは上下に振り分けて重ねない"""
    W, H, y = 380, 176, 92
    lo, hi = relief - 30, nxt + 30

    def X(v):
        return 16 + 348 * (v - lo) / (hi - lo)
    g = [f'<line x1="16" y1="{y}" x2="364" y2="{y}" stroke="{INK_SOFT}" stroke-width="2"/>']
    g.append(f'<rect x="{X(relief):.1f}" y="{y - 10}" width="{X(best) - X(relief):.1f}" height="20" fill="{GOLD_BR}" opacity=".2"/>')
    g.append(f'<path d="M{X(relief):.1f},{y - 30} v40" stroke="{GOLD}" stroke-width="2"/>'
             f'<text x="{X(relief) - 4:.1f}" y="{y - 52}" font-size="15" font-weight="700" fill="{GOLD}">第{relief}夜 九割</text>'
             f'<text x="{X(relief) - 4:.1f}" y="{y - 36}" font-size="14" fill="{GOLD}">{relief_min}分止まったら</text>')
    g.append(f'<path d="M{X(best):.1f},{y - 30} v40" stroke="{INK}" stroke-width="2"/>'
             f'<text x="{X(best) + 4:.1f}" y="{y - 52}" text-anchor="end" font-size="15" font-weight="700" fill="{INK}">第{best}夜</text>'
             f'<text x="{X(best) + 4:.1f}" y="{y - 36}" text-anchor="end" font-size="14" fill="{INK}">前の月蝕</text>')
    g.append(f'<circle cx="{X(nxt):.1f}" cy="{y}" r="8" fill="{SHOKKO}"/><path d="M{X(nxt):.1f},{y + 8} v22" stroke="{SHOKKO}" stroke-width="2"/>'
             f'<text x="{X(nxt) + 6:.1f}" y="{y + 48}" text-anchor="end" font-size="15" font-weight="700" fill="{SHOKKO}">第{nxt}夜 次に押せる</text>'
             f'<text x="{X(nxt) + 6:.1f}" y="{y + 64}" text-anchor="end" font-size="14" fill="{SHOKKO}">その先の大妖の夜</text>')
    return f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="前の月蝕が第{best}夜なら、次は第{nxt}夜から。止まったら第{relief}夜から" class="svg">{"".join(g)}</svg>'


def svg_growth(grow, step, max_ahead=200, marks=(50, 100, 200)):
    """押す夜をのばしたときの上乗せ分の伸び（指数の曲線）"""
    W, H, L, R, T, B = 380, 262, 40, 12, 30, 40
    pw, ph = W - L - R, H - T - B
    vmax = grow ** (max_ahead / step)
    ytop = math.ceil(vmax / 2) * 2

    def X(k):
        return L + pw * k / max_ahead

    def Y(v):
        return T + ph * (1 - (v - 1) / (ytop - 1))
    g = []
    for v in range(1, ytop + 1, 2 if ytop > 8 else 1):
        g.append(f'<line x1="{L}" y1="{Y(v):.1f}" x2="{W - R}" y2="{Y(v):.1f}" stroke="{LINE}"/><text x="{L - 6}" y="{Y(v) + 4:.1f}" text-anchor="end" font-size="14" fill="{INK_SOFT}">×{v}</text>')
    pts = ' L'.join(f'{X(k):.1f},{Y(grow ** (k / step)):.1f}' for k in range(0, max_ahead + 1, 2))
    g.append(f'<path d="M{pts}" fill="none" stroke="{SHOKKO}" stroke-width="2.8"/>')
    for k in marks:
        v = grow ** (k / step)
        # 下に凸で右上へ上がる曲線＝点の左上はいつも空いている
        anchor, dx, dy = 'end', -8, -8
        g.append(f'<circle cx="{X(k):.1f}" cy="{Y(v):.1f}" r="4.5" fill="{SHOKKO}"/><text x="{X(k) + dx:.1f}" y="{Y(v) + dy:.1f}" text-anchor="{anchor}" font-size="15" font-weight="700" fill="{INK}">+{k}夜 ×{num(v, 2)}</text>')
    for k in range(0, max_ahead + 1, 50):
        g.append(f'<text x="{X(k):.1f}" y="{H - 22}" text-anchor="{"end" if k == max_ahead else "middle"}" font-size="14" fill="{INK_SOFT}">+{k}</text>')
    g.append(f'<text x="{L + pw / 2:.1f}" y="{H - 4}" text-anchor="middle" font-size="14" fill="{INK_SOFT}">押す夜を先へのばした夜数</text>')
    return f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="押す夜をのばすと上乗せ分は指数で伸びる" class="svg">{"".join(g)}</svg>'


def svg_gogyo(katsu):
    """五行の相剋の環（月蝕綺譚の GogyoWheel と同じ描き方）。katsu={'木':'土',...}"""
    wheel = ['木', '火', '土', '金', '水']
    cx, cy, r, nr = 160, 158, 104, 26

    def pos(i):
        a = math.radians(i * 72 - 90)
        return cx + r * math.cos(a), cy + r * math.sin(a)
    nodes = {el: pos(i) for i, el in enumerate(wheel)}
    g = [f'<defs><marker id="katsu" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="{SHOKKO}"/></marker></defs>']
    g.append(f'<text x="{cx}" y="{cy + 4}" text-anchor="middle" font-size="15" letter-spacing="2" fill="{SHOKKO}">相剋</text>')
    g.append(f'<text x="{cx}" y="{cy + 22}" text-anchor="middle" font-size="11" fill="{INK_SOFT}">相手を制す</text>')
    for a, bb in katsu.items():
        (x1, y1), (x2, y2) = nodes[a], nodes[bb]
        dx, dy = x2 - x1, y2 - y1
        ln = math.hypot(dx, dy)
        ux, uy = dx / ln, dy / ln
        g.append(f'<line x1="{x1 + ux * nr:.1f}" y1="{y1 + uy * nr:.1f}" x2="{x2 - ux * (nr + 6):.1f}" y2="{y2 - uy * (nr + 6):.1f}" stroke="{SHOKKO}" stroke-width="1.8" stroke-dasharray="5 4" marker-end="url(#katsu)" opacity=".9"/>')
    for el, (x, y) in nodes.items():
        g.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{nr}" fill="{NIGHT}" stroke="{ELEM[el]}" stroke-width="1.8"/>'
                 f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{nr - 3.5}" fill="none" stroke="{GOLD_BR}" stroke-width=".5" opacity=".5"/>'
                 f'<text x="{x:.1f}" y="{y + 6:.1f}" text-anchor="middle" font-size="17" font-weight="700" fill="#e8e4d8">{el}</text>')
    lab = '・'.join(f'{a}は{bb}' for a, bb in katsu.items())
    return f'<svg viewBox="0 0 320 316" role="img" aria-label="相剋の環: {lab}を制す" class="svg">{"".join(g)}</svg>'


def html_rate_bar(rows):
    """出る率の帯。rows=[(名, 率0..1, 色)]。細すぎる帯は最小幅を持たせ、数字は帯の下に"""
    segs = ''.join(f'<span class="rate-seg" style="flex:{max(r, .012)};background:{c}" title="{n} {pct(r, 2)}"></span>' for n, r, c in rows)
    keys = ''.join(f'<li><span class="rate-dot" style="background:{c}"></span>{n}<b class="n">{pct(r, 2)}</b></li>' for n, r, c in rows)
    return f'<div class="rate"><div class="rate-bar">{segs}</div><ul class="rate-keys">{keys}</ul></div>'


def html_pity(sr, ssr):
    """天井のものさし（0→SR以上確定→SSR以上確定）"""
    return (f'<div class="pity"><div class="pity-track"><span class="pity-mark" style="left:{sr / ssr * 100:.1f}%"><b>{sr}回</b>SR以上</span>'
            f'<span class="pity-mark end" style="left:100%"><b>{ssr}回</b>SSR以上</span></div></div>')


def html_ladder(costs, star_waza, star_normal):
    """覚醒の段梯子（月蝕綺譚の AwakenLadder と同じ型）"""
    cells = []
    for i in range(len(costs) + 1):
        if i:
            cells.append(f'<div class="lad-step"><span>欠片{costs[i - 1]}</span><span class="arr">→</span></div>')
        top = i == len(costs)
        cells.append(f'<div class="lad-box{" top" if top else ""}" style="height:{56 + i * 14}px"><b>★{i}</b><span>技×{num(star_waza ** i, 2)}</span><span>通常×{num(star_normal ** i, 2)}</span></div>')
    return f'<div class="ladder-wrap"><div class="ladder">{"".join(cells)}</div></div>'


def html_party(faces, up, party, bench_pct):
    """隊（戦う）と控え（応援）"""
    fs = ''.join(f'<img src="{up}assets/img/face/{i}.webp" alt="{e(nm)}" width="44" height="44" loading="lazy">' for i, nm in faces[:party])
    bs = ''.join(f'<img src="{up}assets/img/face/{i}.webp" alt="{e(nm)}" width="36" height="36" loading="lazy">' for i, nm in faces[party:party + 4])
    return (f'<div class="party"><div class="party-row"><p class="party-l">隊 {party}人<span>戦う</span></p><div class="party-faces">{fs}</div></div>'
            f'<div class="party-arrow" aria-hidden="true">↑ 毎秒の{bench_pct}を応援</div>'
            f'<div class="party-row bench"><p class="party-l">控え<span>戦わない</span></p><div class="party-faces">{bs}<span class="more">…</span></div></div></div>')


def html_stat_bars(atk, spd, tech, mx=10):
    def bar(lbl, v, c):
        return f'<span class="sb"><span class="sb-l">{lbl}</span><span class="sb-t"><span class="sb-f" style="width:{v / mx * 100:.0f}%;background:{c}"></span></span><span class="sb-v">{v}</span></span>'
    return f'<span class="sbars">{bar("攻", atk, SHOKKO)}{bar("速", spd, "#4f7fb8")}{bar("技", tech, GOLD_BR)}</span>'


def svg_awaken(costs, star_waza):
    """覚醒の階段（★0→★5）。段の上に要る欠片、段の中に技の倍率"""
    n = len(costs) + 1
    W, H, L, B = 380, 230, 6, 26
    sw = (W - 2 * L) / n
    g = []
    for i in range(n):
        h = 50 + i * 26
        x = L + i * sw
        y = H - B - h
        top = i == n - 1
        g.append(f'<rect x="{x + 2:.1f}" y="{y}" width="{sw - 4:.1f}" height="{h}" rx="4" fill="{SHOKKO if top else "#fff"}" stroke="{LINE}"/>')
        g.append(f'<text x="{x + sw / 2:.1f}" y="{y + 22}" text-anchor="middle" font-size="16" font-weight="700" fill="{"#fff" if top else INK}">★{i}</text>')
        g.append(f'<text x="{x + sw / 2:.1f}" y="{y + 42}" text-anchor="middle" font-size="14" fill="{"#fff" if top else INK_SOFT}">技×{num(star_waza ** i, 2)}</text>')
        if i:
            g.append(f'<text x="{x + sw / 2:.1f}" y="{y - 8}" text-anchor="middle" font-size="14" font-weight="700" fill="{GOLD}">欠片{costs[i - 1]}</text>')
    g.append(f'<text x="{W / 2}" y="{H - 6}" text-anchor="middle" font-size="14" fill="{INK_SOFT}">段の上＝その段へ上がるのに要る欠片</text>')
    return f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="覚醒の段と要る欠片" class="svg">{"".join(g)}</svg>'


def svg_hbars(rows, vmax, unit='', accent=None, label_w=56):
    """横棒（人ごと・遊び方ごとの比べ）。rows=[(左の札, 値, 棒の先の字)]。accent=強調する行の番号の集合"""
    W, R, rh = 380, 64, 34
    L = label_w
    top = 26 if unit else 4
    H = top + 6 + rh * len(rows)
    g = [f'<text x="6" y="16" font-size="14" fill="{INK_SOFT}">{unit}</text>'] if unit else []
    for i, (lab, v, txt) in enumerate(rows):
        y = top + i * rh
        w = (W - L - R) * v / vmax
        hot = accent is not None and i in accent
        g.append(f'<text x="{L - 8}" y="{y + 21}" text-anchor="end" font-size="14" fill="{INK}">{lab}</text>')
        g.append(f'<rect x="{L}" y="{y + 6}" width="{max(w, 2):.1f}" height="20" rx="3" fill="{SHOKKO if hot else GOLD_BR}" opacity="{1 if hot else .85}"/>')
        g.append(f'<text x="{L + w + 6:.1f}" y="{y + 21}" font-size="14" font-weight="700" fill="{INK}">{txt}</text>')
    return f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="{e(unit)}" class="svg">{"".join(g)}</svg>'

