#!/usr/bin/env python3
# Rondoガイドの公開写し同期。正本= dev/ikehaya-marketing-os/rondo/guides/(配布物同梱・noindex・heat無し)
# 公開用変換: noindex除去 / canonical+OG / heat計測タグ / ナビに「Rondoとは」 / リンクをcleanUrls化
# (vercel.jsonがcleanUrls:trueのため.html付きは308になる。正典= main/marketing-crm/DESIGN_DIRECTION_SITE.md v12)
import os, re, shutil, sys

SRC = os.path.expanduser('~/Desktop/dev/ikehaya-marketing-os/rondo/guides')
DST = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public/rondo-guides')
PAGES = {'setup.html': 'rondo-guide-setup', 'settings.html': 'rondo-guide-settings'}

shutil.rmtree(DST, ignore_errors=True)
shutil.copytree(SRC, DST)

for name, heat_page in PAGES.items():
    p = os.path.join(DST, name)
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
    s = s.replace('href="setup.html"', 'href="/rondo-guides/setup"')
    s = s.replace('href="settings.html"', 'href="/rondo-guides/settings"')
    for frag, repl in [
        ('>導入後の設定</a>\n      </nav>', '>導入後の設定</a>\n        <a href="/rondo">Rondoとは</a>\n      </nav>'),
    ]:
        # aria-current有無の両形に対応(置換できた方を採用)
        s = s.replace('<a href="/rondo-guides/settings">導入後の設定</a>\n      </nav>',
                      '<a href="/rondo-guides/settings">導入後の設定</a>\n        <a href="/rondo">Rondoとは</a>\n      </nav>')
        s = s.replace('<a href="/rondo-guides/settings" aria-current="page">導入後の設定</a>\n      </nav>',
                      '<a href="/rondo-guides/settings" aria-current="page">導入後の設定</a>\n        <a href="/rondo">Rondoとは</a>\n      </nav>')
    if '/rondo">Rondoとは' not in s:
        sys.exit(f'ナビ変換に失敗: {name}')
    open(p, 'w', encoding='utf-8').write(s)
    print(f'sync: {name} -> /rondo-guides/{clean} (heat={heat_page})')

print('done:', DST)
