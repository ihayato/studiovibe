# 月蝕綺譚ONLINE 公式ティザーサイト 設計書

- 日付: 2026-09-02
- 状態: 本人承認済み（段階=ティザー公式／CTA=月見台送客／素材=ゲーム写し+ロゴ／構成=1ページ縦長LP、いずれも推奨案で裁定）
- URL: https://vibe.co.jp/luna-occulta-mmo
- 本書の役割: 何も知らないAIがこれ1枚で「何を・どこに・どう作るか」分かること

## 1. 目的

月蝕綺譚オンライン（kitan-mmo・Godot+Cloudflare・iOS/Android向け3D MMORPG・ストア未公開）の公式ティザーサイト。
今の素材（題字ロゴ・ゲーム内の街の写し）で成立し、後からNEWSや遊び方を足せる骨組みにする。
訪問者の行動は「月見台（月蝕綺譚の会員基盤）に登録して続報を受け取る」の一本。

## 2. 置き場所と経路（A案・確定）

- リポジトリ: `~/Desktop/dev/vibe`（Vite静的サイト＋`worker.js`＋Cloudflare Workers Assets）
- ページ本体: `public/luna-occulta-mmo.html` → `dist/` にそのまま複写され `/luna-occulta-mmo` で配信される（`assets.html_handling=auto-trailing-slash`。`public/rondo.html`→`/rondo`と同じ型）
- 素材: `public/luna-occulta-mmo-assets/`（ロゴ・写し・OGP・アイコン）
- worker.jsの中継ルールは `/luna-occulta`（完全一致）と `/luna-occulta/`（前綴り）のみ＝`/luna-occulta-mmo` は静的アセットへ素通り。**worker.js・wrangler.jsonc・vite.config.jsは触らない**
- vibeリポには他セッション由来の未追跡ファイル（worker.js等）がある。コミットは自分のファイルだけ `git add <path>` で個別指定する

不採用: B案=cn-kitan-web（Next.js）に `/luna-occulta/mmo`（URLが指定と違う・中継追加が要る）／C案=新規Worker+service binding（過剰）

## 3. ページ構成（縦長LP・スマホ前提・7節）

1. **ヒーロー**: 題字ロゴ透過版（`kitan-mmo/assets2d/logo/logo_online_v1_16x9_alpha.png` 由来・WebP化）を宵闇藍の地に。背後で蝕環（喰われた筆円相）がゆっくり呼吸（CSSのみ・reduced-motion時は静止）。一言コピー／「iOS / Android 近日公開」／主CTA「月見台に登録して続報を受け取る」
2. **世界**: 月蝕綺譚（CryptoNinja外伝『月蝕綺譚 -Luna Occulta-』）の世界観を継ぐ新作3D MMORPG。「月蝕の夜に、金だけが灯る」。RO様式（ローポリ3D世界×2Dキャラ・見下ろしクォータービュー）を一段で説明。写し1枚
3. **遊びの柱（カード）**: 六道（剣士・陰陽師・神楽・隠密・狩人・商人）／昼夜サイクル（1日40分・夜が本作の顔）／月隠の里と四方の街（水の里・千枚の里・炭焼きの里・境の宿場・街ごとに役割）／淵の底（階層ダンジョン）／技の樹とパーティ
4. **街の写し（ギャラリー）**: Godot検分レーンで高解像度撮影→HUD（左下チャット欄・右上RTT・上部の場所名）を切り落として掲載。月隠の里・水の里は掲載。千枚・炭焼・境は**本人検収前**＝撮った写しを並べて本人が掲載可否を選ぶ
5. **この先の夜（文章のみ）**: 四つの街の閉じた門の先＝蝕城・天ノ浮橋・竜宮・根の国を予告。素材ボードは検収前のため画像は出さない
6. **本編との関係**: 姉妹アプリ・同じ世界・月見台ID連携予定。本編サイト `https://vibe.co.jp/luna-occulta` への導線
7. **締めのCTA＋フッター**: 月見台登録／公式X `https://x.com/luna_occulta`／YouTube `https://www.youtube.com/@luna_occulta_game`。フッター=Studio VIBE・プライバシーポリシー `https://vibe.co.jp/luna-occulta/privacy`

## 4. 見た目の規格（kitan-mmo `DESIGN_DIRECTION.md` を継承）

- 色: 地=宵闇藍 #131320/#1B1B2E、主=金泥 #D9A94C/#F0CE7E/#A67C2E（**線と粒。面ベタ禁止**）、徴=蝕紅 #C93A2E（ロゴと見出しの一点のみ・面積5%以下）、情=暗紫 #5C4470/#8E6B9E、静=月白 #E8E4D8
- 書体: 見出し=Shippori Mincho B1 800／本文=同400〜500／数字=M PLUS Rounded 1c 800（Google Fonts・OFL）
- 形: 角丸小（ボタン5px・カード9〜10px）。パネルは羽二重（金の額縁なし・面＋二層影）。すりガラス禁忌
- モーション: 押下90ms／小要素200ms／全画面420〜500ms・easeOutCubic。常時揺れ・点滅禁止。誘目は行灯の呼吸のみ
- 検収の物差し: 「5秒見て月蝕綺譚だと分かるか」＋375/390/430幅とPC幅の収まり

## 5. 導線と計測

- 主CTA: `https://vibe.co.jp/luna-occulta/tsukimidai?via=mmo`（既存会員基盤へ送客・API追加なし。`via`は流入記録用。未対応でも無害）
- 外部リンクは `rel="noopener"`・`target="_blank"`
- 解析タグは入れない（本殿の方針に合わせる）

## 6. 素材づくり

- ロゴ: 透過PNGをWebP（幅1536・q90）と2倍表示用に変換。原本は触らない
- 写し: kitan-mmoの検分レーン（`town.gd`: `--town=<id> --town-preview --shots=x:z:png|…`／`plaza.gd`: `--cam-bird`／`field.gd`: `--bird`）で撮影。解像度2560×1200・`--tod`で夜寄りに固定。**クライアントのコードは変更しない**（共有ツリー・並行セッション中）。HUDは画像の縁を切り落として除く（撮影後のトリミング＝生成画への外科ではない）。出力はWebP幅1600・q80
- OGP: ページと同じCSSで1200×630のHTMLを組み、ブラウザで撮影して `og.jpg`

## 7. 検証

1. `npm run build` が緑・`dist/luna-occulta-mmo.html` と素材が出ること
2. `vite preview` を Browser ペインで開き、375/390/430/1280幅で全節の収まりと折返しを確認（スクショ）
3. `prefers-reduced-motion` で演出が止まること
4. リンク検査（全 `href` に対してcurlで200/307）
5. `scripts/verify-deploy.sh` に `check "月蝕綺譚ONLINE" "https://vibe.co.jp/luna-occulta-mmo" 200` を1行追加
6. 本番反映=**S1。本人の一言の後**に `npm run build && npx wrangler deploy` → `bash scripts/verify-deploy.sh`

## 8. 後日の拡張余地（本書の対象外）

- NEWS節（JSON台帳駆動）・遊び方ページ・職業/街の個別ページ・ストアバッジ（公開時）・公式PV埋め込み
