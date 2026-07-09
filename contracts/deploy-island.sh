#!/bin/bash
# 渡島記念札コントラクトのデプロイ一括スクリプト（島専用minterを新規発行する方式）
# 実行: bash ~/Desktop/dev/vibe/contracts/deploy-island.sh
# 1回目: minterウォレットを生成してアドレスを表示 → そこへBaseのETHを0.003ほど送る
# 2回目: 残高を確認してデプロイ → vibeのVercel環境変数を設定
set -euo pipefail

VIBE_DIR="$HOME/Desktop/dev/vibe"
CONTRACTS_DIR="$VIBE_DIR/contracts"
KEY_FILE="$CONTRACTS_DIR/.minter.key"

# kitanコントラクトのownerをそのまま流用(コールドウォレット・鍵不要)
OWNER_ADDRESS="0x65F25ef76Fb837ABE98BC14a3d510C1142f24dE7"
BASE_TOKEN_URI="https://vibe.co.jp/api/nft/meta/"
MAX_SUPPLY="1000000"

cd "$CONTRACTS_DIR"

echo "== 1/5 島専用minterウォレット =="
if [ ! -f "$KEY_FILE" ]; then
  node -e "
const { generatePrivateKey, privateKeyToAccount } = require('$VIBE_DIR/node_modules/viem/accounts');
const fs = require('fs');
const key = generatePrivateKey();
fs.writeFileSync('$KEY_FILE', key, { mode: 0o600 });
console.log('新規発行しました。アドレス:', privateKeyToAccount(key).address);
"
  echo ""
  echo ">> 上のアドレスに BaseチェーンのETHを0.003ほど送金してから、このスクリプトをもう一度実行してください。"
  echo ">> 鍵は $KEY_FILE に保存済み(パスワードマネージャにも控えを)。"
  exit 0
fi
MINTER_PRIVATE_KEY=$(cat "$KEY_FILE" | tr -d '[:space:]')

echo "== 2/5 minterアドレスとBase残高を確認 =="
MINTER_INFO=$(MINTER_PRIVATE_KEY="$MINTER_PRIVATE_KEY" node -e "
const { createPublicClient, http, formatEther } = require('$VIBE_DIR/node_modules/viem');
const { privateKeyToAccount } = require('$VIBE_DIR/node_modules/viem/accounts');
const { base } = require('$VIBE_DIR/node_modules/viem/chains');
const a = privateKeyToAccount(process.env.MINTER_PRIVATE_KEY);
createPublicClient({ chain: base, transport: http('https://mainnet.base.org') })
  .getBalance({ address: a.address })
  .then(b => console.log(a.address, formatEther(b)));
")
read -r MINTER_ADDRESS BALANCE <<EOF2
$MINTER_INFO
EOF2
echo "minter: $MINTER_ADDRESS / 残高: $BALANCE ETH"
if [ "$(node -e "console.log(Number('$BALANCE') >= 0.001 ? 1 : 0)")" != "1" ]; then
  echo "!! 残高不足です。$MINTER_ADDRESS にBaseのETHを0.003ほど送ってから再実行してください。"
  exit 1
fi

echo "== 3/5 Base本番へデプロイ =="
[ -d node_modules ] || npm install --silent
DEPLOY_OUT=$(DEPLOYER_PRIVATE_KEY="$MINTER_PRIVATE_KEY" \
  OWNER_ADDRESS="$OWNER_ADDRESS" \
  MINTER_ADDRESS="$MINTER_ADDRESS" \
  BASE_TOKEN_URI="$BASE_TOKEN_URI" \
  MAX_SUPPLY="$MAX_SUPPLY" \
  npx hardhat run scripts/deploy.js --network base)
echo "$DEPLOY_OUT"
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUT" | grep 'deployed:' | grep -oE '0x[a-fA-F0-9]{40}' | head -1)
if [ -z "$CONTRACT_ADDRESS" ]; then
  echo "!! デプロイ出力からアドレスを取れませんでした。上のログを確認してください。"
  exit 1
fi
echo "コントラクト: $CONTRACT_ADDRESS"

echo "== 4/5 vibeのVercel環境変数を設定 =="
cd "$VIBE_DIR"
printf '%s' "$CONTRACT_ADDRESS" | npx vercel env add NFT_CONTRACT_ADDRESS production
printf '%s' "base" | npx vercel env add NFT_CHAIN production
printf '%s' "$MINTER_PRIVATE_KEY" | npx vercel env add MINTER_PRIVATE_KEY production --sensitive

echo "== 5/5 完了 =="
echo ""
echo "✅ デプロイ完了: $CONTRACT_ADDRESS"
echo "このアドレスを結に伝えてください（main.jsのNFT_CONTRACT定数に設定します）"
echo "Basescan: https://basescan.org/address/$CONTRACT_ADDRESS"
echo "※ $KEY_FILE は島のミント運用に使う鍵です。消さずに、パスワードマネージャにも控えてください。"
