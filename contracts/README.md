# 渡島記念札 VibeIslandCommemorative

Studio VIBEの島(3Dバーチャルスタジオ)で、衝動のかけらを7つ集めた旅人へ配布する記念NFT(ERC-721)のコントラクト。

月蝕綺譚公式サイト(cn-kitan-web)の`KitanCommemorative`をそのまま流用。ロジックは無変更・コントラクト名とname/symbolのみ変更。

- 上限はデプロイ時固定・オープンエディション(既定100万枚。`MAX_SUPPLY`環境変数で変更可)
- 1ウォレット1枚(譲渡後も再ミント不可)
- ミントは`minter`アドレスのみ(サイトのサーバーAPIが実行)
- 譲渡制限なし・二次流通可
- `tokenURI` = `baseURI + tokenId`(サイトの`/api/nft/meta/[id]`が配信)

## 既存ウォレットの流用

kitanのNFTで使っているowner/minterウォレットをそのまま使い回してよい。役割分担は同一。

| 役割 | 持ち物 | 保管 |
|---|---|---|
| owner | `setMinter` / `setBaseURI` | コールドウォレット。ETH不要 |
| minter | `mintTo`のみ | サーバーのホットウォレット。ガス代分のETHだけ入れる |

minterの鍵が漏れても被害は「無償NFTの勝手なミント」まで。ownerから`setMinter`で即差し替えできる。

## 手順

```bash
cd contracts
npm install
npm test
```

### 1. テストネット(Base Sepolia)

```bash
cp .env.example .env   # 値を埋める
export $(grep -v '^#' .env | xargs)
npm run deploy:sepolia
```

- デプロイ用ETHは https://portal.cdp.coinbase.com/products/faucet 等のfaucetで入手
- 出力されたアドレスをサイト側Vercel環境変数`NFT_CONTRACT_ADDRESS`へ
- サイト側は`NFT_CHAIN=baseSepolia`

### 2. 本番(Base)

```bash
npm run deploy:base
```

- `BASE_TOKEN_URI=https://vibe.co.jp/api/nft/meta/`(末尾スラッシュ必須)
- `MAX_SUPPLY=1000000`(オープンエディション。省略時も既定値として同じ)
- minterウォレットに0.005 ETHほど入金(サーバーミントのガス代。実費は数百円規模)
- サイト側は`NFT_CHAIN=base`
- デプロイ後、出力される`npx hardhat verify ...`でBasescan検証

### ローカル検証

```bash
npx hardhat node   # chainId 84532でBase Sepolia互換
DEPLOYER_PRIVATE_KEY=<hardhatテスト鍵#0> MINTER_ADDRESS=<テストアドレス#1> \
BASE_TOKEN_URI="http://localhost:3000/api/nft/meta/" \
npx hardhat run scripts/deploy.js --network localhost
```

## デプロイ後にサイト側で設定するVercel環境変数

- `NFT_CONTRACT_ADDRESS` … デプロイされたコントラクトアドレス
- `NFT_CHAIN` … `base`(本番) | `baseSepolia`(テスト)
- `MINTER_PRIVATE_KEY` … minterウォレットの秘密鍵
- `NFT_RPC_URL` … 省略時は公式RPCのフォールバック多重化。専用RPC推奨
- `SITE_ORIGIN` … メタデータのimage/animation_url/external_urlに使う公開オリジン。省略時`https://vibe.co.jp`

また、`poc/island/main.js`冒頭の`NFT_CONTRACT`定数にもデプロイ後のアドレスを設定する(フロント側でBasescanリンクとミント可否判定に使用)。
