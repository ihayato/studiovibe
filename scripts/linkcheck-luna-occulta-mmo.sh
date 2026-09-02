#!/bin/bash
# public/luna-occulta-mmo.html の外部 href を全数 curl（200/301/302/307 を合格）＋ローカル素材の実在確認
set -u; fail=0
cd "$(dirname "$0")/.."
# preconnect(ホスト根)と自分自身のURL(デプロイ前は404)は対象外
for u in $(grep -vE 'rel="preconnect"|rel="canonical"|og:url' public/luna-occulta-mmo.html | grep -oE 'href="https?://[^"]+"' | sed 's/href="//;s/"$//' | sort -u); do
  code=$(curl -s -o /dev/null -m 20 -A 'Mozilla/5.0 (linkcheck)' -w '%{http_code}' "$u")
  case "$code" in 200|301|302|307) echo "OK  $code $u";; *) echo "NG  $code $u"; fail=1;; esac
done
for a in $(grep -oE '(src|href|content)="(https://vibe.co.jp)?/luna-occulta-mmo-assets/[^"]+"' public/luna-occulta-mmo.html | sed 's/.*="//;s/"$//;s#https://vibe.co.jp##' | sort -u); do
  [ -f "public$a" ] && echo "OK  file $a" || { echo "NG  missing $a"; fail=1; }
done
exit $fail
