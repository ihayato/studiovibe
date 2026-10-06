#!/usr/bin/env python3
# Rondoガイドの公開写し同期。正本=配布物の guides/(noindex・heat無し)。
# 使い方: python3 tools/sync-rondo-guides.py [<guidesフォルダ>]
#   既定は make-dist が出した dist/rondo-dist/guides(作者固有の語を置き換えた後の版)。2026-10-07 以降、本番系列と main が分かれているので
#   必ず「配った ZIP と同じ版」の guides を渡す(main の guides は古い)。
# 公開用変換: noindex除去 / canonical+OG / heat計測タグ / ナビに「Rondoとは」 / リンクをcleanUrls化
# (cleanUrls のため .html 付きは308になる。正典= main/marketing-crm/DESIGN_DIRECTION_SITE.md v12)
import os, re, shutil, sys

DEFAULT_SRC = os.path.expanduser('~/Desktop/dev/rondo-v100-dist/rondo/dist/rondo-dist/guides')
SRC = os.path.abspath(os.path.expanduser(sys.argv[1])) if len(sys.argv) > 1 else DEFAULT_SRC
DST = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public/rondo-guides')
PAGES = {
    'setup.html': 'rondo-guide-setup',
    'settings.html': 'rondo-guide-settings',
    'update.html': 'rondo-guide-update',
}

if not os.path.isfile(os.path.join(SRC, 'setup.html')):
    sys.exit(f'guides が見つからない: {SRC}')

shutil.rmtree(DST, ignore_errors=True)
# 公開するのは HTML と assets だけ(作者向けのメモ .md などは出さない)
shutil.copytree(SRC, DST, ignore=shutil.ignore_patterns('*.md'))

LINK = re.compile(r'href="(setup|settings|update)\.html(#[^"]*)?"')

for name, heat_page in PAGES.items():
    p = os.path.join(DST, name)
    if not os.path.isfile(p):
        sys.exit(f'正本に {name} が無い: {SRC}')
    s = open(p, encoding='utf-8').read()
    if '  <meta name="robots" content="noindex">\n' not in s:
        sys.exit(f'変換対象が想定と違う(noindex行なし): {name}')
    s = s.replace('  <meta name="robots" content="noindex">\n', '')
    clean = name.replace('.html', '')
    title = re.search(r'<title>([^<]+)</title>', s).group(1)
    inject = f'''
  <link rel="canonical" href="https://vibe.co.jp/rondo-guides/{clean}">
  <meta property="og:title" content="{title}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="https://vibe.co.jp/rondo-assets/rondo-ogp.jpg">
  <meta property="og:site_name" content="Studio VIBE">
  <script src="https://rondo.nubonba.workers.dev/heat.js" data-page="{heat_page}" defer></script>'''
    i = s.index('</title>') + len('</title>')
    s = s[:i] + inject + s[i:]
    s = LINK.sub(lambda m: f'href="/rondo-guides/{m.group(1)}{m.group(2) or ""}"', s)
    # ガイドのナビ(class="guide-nav")の末尾に「Rondoとは」を足す
    nav = s.find('class="guide-nav"')
    end = s.find('      </nav>', nav)
    if nav < 0 or end < 0:
        sys.exit(f'ナビが見つからない: {name}')
    s = s[:end] + '        <a href="/rondo">Rondoとは</a>\n' + s[end:]
    if re.search(r'href="(setup|settings|update)\.html', s):
        sys.exit(f'.html 付きのリンクが残った: {name}')
    open(p, 'w', encoding='utf-8').write(s)
    print(f'sync: {name} -> /rondo-guides/{clean} (heat={heat_page})')

print('done:', DST, '<-', SRC)
