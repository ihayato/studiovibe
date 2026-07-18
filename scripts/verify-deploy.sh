#!/bin/bash
# vibe.co.jp デプロイ後の生存確認。
# 経緯: 2026-07-17 13:11のCLIデプロイで、worktree(codex/botid-routing)にしか
# なかったBotIDチャレンジ経路のrewriteが本番vercel.jsonから消え、月蝕綺譚の
# 御用板(/goyo)の勾玉付与POSTが全停止した(クライアント側でc.js 404→送信不能。
# ページは200のまま・登録も通るため気づきにくい)。vibeを本番へ上げたら毎回これを回す。
# 使い方: bash scripts/verify-deploy.sh
set -u
fail=0

check() { # label url expected
  local label=$1 url=$2 expect=$3
  local code
  code=$(curl -s -o /dev/null -m 20 -w '%{http_code}' "$url")
  if [ "$code" = "$expect" ]; then
    echo "OK  $label ($code)"
  else
    echo "NG  $label -> $code (期待 $expect)"
    fail=1
  fi
}

check "本殿" "https://vibe.co.jp/" 200
check "月蝕綺譚ティザー" "https://vibe.co.jp/luna-occulta" 200
check "御用板" "https://vibe.co.jp/luna-occulta/goyo" 200
check "BotIDチャレンジ経路(勾玉付与の生命線)" \
  "https://vibe.co.jp/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/a-4-a/c.js?i=0&v=3&h=vibe.co.jp" 200

# 詣でAPIは素curlで401(session)が正常。404/503は経路破損・設定退行を疑う
code=$(curl -s -o /dev/null -m 20 -w '%{http_code}' -X POST \
  -H 'content-type: application/json' -H 'origin: https://vibe.co.jp' -d '{}' \
  https://vibe.co.jp/luna-occulta/api/en/email/checkin)
if [ "$code" = "401" ]; then
  echo "OK  詣でAPI到達(401=未ログインの正常応答)"
else
  echo "NG  詣でAPI -> $code (期待401)"
  fail=1
fi

# ---- vercel.json全経路の自動網羅チェック(2026-07-18追加) ----
# 経緯: 手動列挙だけだと/sagetsu等のrewrite消失(2026-07-18発覚・約数日404)を
# 取りこぼした。vercel.jsonのredirects/rewritesのsourceを機械列挙し、
# 「404/接続不能でないこと」を検査する。:path*等のパラメータ付きsourceは
# 基底の具体パスentryが別にあるためスキップ(BotID経路は上の専用checkが担う)。
echo "---- vercel.json経路の網羅チェック"
while IFS= read -r src; do
  case "$src" in
    *:*|*"("*) continue ;;
  esac
  code=$(curl -s -o /dev/null -m 20 -w '%{http_code}' "https://vibe.co.jp$src")
  if [ "$code" = "404" ] || [ "$code" = "000" ]; then
    echo "NG  経路消失? $src -> $code"
    fail=1
  else
    echo "OK  $src ($code)"
  fi
done < <(node -e '
  const v = require("./vercel.json");
  const seen = new Set();
  for (const r of [...(v.redirects || []), ...(v.rewrites || [])]) seen.add(r.source);
  console.log([...seen].join("\n"));
')

# vercel.jsonに現れない静的頁(public/直下)の代表。増えたらここに足す
check "Roblox紹介シート(静的)" "https://vibe.co.jp/20260715_sheet" 200

if [ "$fail" = "0" ]; then
  echo "---- 全項目OK"
else
  echo "---- NGあり。vercel.jsonのrewrites/redirects消失(ブランチ分岐デプロイ)を疑う"
fi
exit $fail
