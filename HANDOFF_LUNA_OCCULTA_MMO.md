# 月蝕綺譚ONLINE 公式ティザーサイト 引き継ぎ（HANDOFF）

2026-09-02 作成。何も知らないAIがこれ1枚で再開できることを目標にする。

## 現在地
- ページ本体 `public/luna-occulta-mmo.html`（静的1枚・7節=ヒーロー/世界/遊びの柱/夜の街々/四つの門の先/本編との関係/締めCTA）と素材 `public/luna-occulta-mmo-assets/`（logo.webp・shot_*.webp・og.jpg・icon.svg）を**コミット済み・本番デプロイ済み（2026-09-02 17:56・本人「デプロイgo」・Version ff2baabf）**。
- 本番URL予定: https://vibe.co.jp/luna-occulta-mmo （worker.jsの中継ルールは `/luna-occulta` 完全一致と `/luna-occulta/` 前綴りのみ＝この頁は静的アセットへ素通り。worker.js/wrangler.jsonc/vite.config.jsは触っていない）
- 検証済み: `npx vite build`緑・`bash scripts/linkcheck-luna-occulta-mmo.sh`全OK（自分自身のURLはデプロイ前404のため対象外）・375/320/390/430/1280幅で横はみ出しゼロ・ボタン高44px以上・AI臭検査 ERROR0/WARN0・Google Fonts（Shippori Mincho B1 / M PLUS Rounded 1c）読み込み確認。
- 本人検分: ヒーローを本人が見て「コード描画の円環が邪魔」→**撤去済み**（ロゴの紅の円相のみ）。他節は未検分。
- 設計書=`docs/superpowers/specs/2026-09-02-luna-occulta-mmo-site-design.md`／計画=`docs/superpowers/plans/2026-09-02-luna-occulta-mmo-site.md`

## 🆕 09-02夕 「姿」節（キャラビルド＋御霊装備で転職）追加＝コミット a488b33・**未デプロイ（本人GO待ち）**
- 本人発注「キャラビルドができるのも教えたいので仮の素材を」「御霊を装備して転職できるというのも入れたい」→ `#build` 節を遊びの柱と街の間に新設・ナビに「姿」追加。
- 仮素材の出所: 髪型6=`kitan-mmo/tools/charbuild/shots/kenshi_6hairs_board.png` の頭まわり切り出し（灰地のまま丸アイコン）／道7=`acc_probe.tscn -- --bare --school=<id> --shot=`で撮り直し（旅人は `--school=` 空）／御霊6=本編公式サイト `cn-kitan-web/public/media/img/standing_<id>.webp`（入口6人=咲耶/カルラ/イズナ/紫苑/雛之丞/おえん・道の対応は `server/src/protocol.ts` SPIRITS）／御霊台帳=`KITAN_FAKE_SPIRITS=1 … keiyaku.tscn -- --keiyaku-shot=`（表示中のLv8/16は旧値・転職Lv10便で変わる＝差し替え候補）。
- コピーは数値を出さない（Lv10/25等は仮値のため）。ボード=`main/_boards/kitan_mmo_site/build_board_20260902.png`。
- 地雷: `<img height>`属性がある画像に`max-width`だけ当てると縦長に伸びる→`height:auto`必須（髪型アイコンで実発生）。

## 🎉 09-02夜 「姿」節 改版2＝本人FB反映・**本番デプロイ済み（本人「デプロイ」・Version 925ce8ba・19:0x）**
- FB①「御霊を契約〜は本家の召喚時のカード券面動画を使って」→ 立ち絵を撤去し、本編 `dev/cn-kitan/files/cards/card_anim_<id>_vN.mp4`（最新版=sakuya v3/karura v2/izuna v3/shion v3/hinanojo v2/oen v2）を **420幅・CRF28・無音・faststart** で焼いて `card_<id>.mp4`＋poster webp。`<video autoplay muted loop playsinline preload=metadata>`＋IntersectionObserverで**見えている間だけ再生**（reduced-motionでは再生しない）。※札絵の枠はアプリ側合成のためサイトは絵のみ。
- FB②「バリエーションが少ない・髪色のグラデもある」→ 髪型アイコン列を撤去し、**組み合わせ台帳**（髪型6/髪色12/グラデ5/目色6/肌7＝`client/scripts/avatar3d.gd` の HAIR_COLORS/HAIR_GRADS/EYE_COLORS/SKIN_COLORS と同期・色玉はCSS近似）＋**プリセット12種の写し** `var_A..L.webp`（`tools/charbuild` の PRESETS A〜L）を新設。撮影= `godot --path <ABS>/tools/charbuild --resolution 2000x1100 -- --preset=X --zoom=0.55 --hero-angle=4.9 --shot=<png> --quit-after=6`（**4.71=正面・0=右横・3.14=左横**・UIが左x<800に出るので中央400幅で切る=`tools/luna-occulta-mmo/crop_vars.py`）。
- ボード=`main/_boards/kitan_mmo_site/vars_board_20260902.png`。素材合計3.4MB（動画6本=約2.2MB）。
- 地雷: charbuildの `--hero-angle` 無指定は自動回転で向きが運任せ／ffmpegに libwebp なし→posterはpng抽出→cwebp。

## 🎉 09-02夜 遊びの柱＝画像付きカードに改版（本人「文字しかないのが微妙。ちゃんと画像を使おう」・コミット済み・**09-06 本番デプロイ済み（本人GO・Version `d1df4d8e`・巻き戻し先 `925ce8ba`）**。同便で島クライアント net.js（presenceコスト是正）も同乗。live↔dist全数一致・pillar_*.webp 5枚200・verify-deploy.sh は既知の古い期待値2件以外OK）
- 5枚に16:9の写し `pillar_{michi,daynight,towns,fuchi,waza}.webp` を上乗せ（PC=3列・1枚目は2列幅32:9／スマホ=1列）。組み方は `tools/luna-occulta-mmo/compose_pillars.py`（昼夜=同じ里の`--tod=0.30`と`0.80`を左右／淵の底=field 10の二層鳥居と結晶まわり・**暗所のため露出1.7倍+コントラスト1.15の持ち上げのみ**／技の樹=`KITAN_FAKE_SKILLS=onmyoji … waza_no_ki.tscn -- --waza-shot=`／六道=`build_*.webp`を横一列合成／街=4街の2x2）。
- 撮影の型: `KITAN_DEVICE_SUFFIX=site` の写し番キャラは **`KITAN_SPIRIT=sakuya … keiyaku.tscn`で契約済みにした**（以後 field 1〜12 に入れる）。`--cam-at`固定の野1(0,14)は土の道だけで絵にならない＝里(plaza)の方が絵になる。
- ボード=`main/_boards/kitan_mmo_site/pillar_*_20260902.webp`。地雷: モバイル用の旧`.card{padding}`上書きが残って画像が内側に縮んだ→`.card-body`側へ移した。

## 次にやること（順）
0. ~~遊びの柱（画像付き）のデプロイ~~ 済み（09-06・Version `d1df4d8e`）。次は本人の実機検分（`https://vibe.co.jp/luna-occulta-mmo#play` あたり）
1. ~~本番反映~~ 済み（Version ff2baabf）。再デプロイは `cd ~/Desktop/dev/vibe && npm run build && npx wrangler deploy && bash scripts/verify-deploy.sh`（node_modulesが空なら先に `npm ci`）。
2. 千枚・炭焼・境の写しの**掲載可否**を本人に聞く。可なら `public/luna-occulta-mmo.html` の該当 `<figure … data-pending="1">` から属性を外すだけ（CSS `[data-pending]{display:none}`）。写しは `~/Desktop/main/_boards/kitan_mmo_site/` にも置いてある。
3. 野（フィールド）の写しは未契約403で撮れなかった（`KITAN_SPIRIT=sakuya`でも不可）。契約済みキャラで撮るなら `godot --path client --resolution 2560x1200 res://scenes/field.tscn -- --field=1 --cam-at=0,14 --tod=0.80 --quit-after=14 --shot=<png>` → `python3 tools/luna-occulta-mmo/crop_shots.py <src_dir> <dst_dir>`。
4. 公開後にNEWS節・ストアバッジ・PV埋め込みを足す（設計書§8）。

## 裁定事項（勝手に変えない）
- 段階=ティザー公式／CTA=月見台送客（`https://vibe.co.jp/luna-occulta/tsukimidai?via=mmo`・API追加なし）／素材=ゲーム写し+ロゴ／構成=1ページ縦長LP（2026-09-02 本人）
- **ヒーローにコード描画の円環を置かない**（本人「邪魔ですw」2026-09-02）。ロゴの紅円相が唯一の輪。
- 色・書体は kitan-mmo/DESIGN_DIRECTION.md 継承（金泥は線と粒・蝕紅は「近日公開」札のみ）。

## 地雷
- `scripts/verify-deploy.sh` の期待値2件が**移行前のまま古い**（デプロイ起因ではない・09-02実測）: 御用板 `/luna-occulta/goyo` は08-16に撤去され `/tsukimidai` へ307が正常／BotID `c.js` 経路はcn-kitan-web側でBotID撤去済みで404が正常。他セッションの未コミット差分が同居するファイルなので当方は触っていない。直すなら期待値を307/404に更新する。
- 09-02のデプロイで上がった `worker.js`/`wrangler.jsonc` は08-13 11:42/09:33の未追跡ファイル（CF移行時のまま・mtime確認済み）＝中継ロジックは不変。
- vibeの `node_modules` は空のことがある→ `npm ci`（package.jsonは他セッションが触っている＝`npm install`で書き換えない）。
- Browserペインは非表示中に `computer` 系が30秒タイムアウトする。JSスクロール後のスクショが真っ黒になる型あり→ `navigate` で `#anchor` 付きURLへ飛ばしてからスクショが確実。
- `scripts/verify-deploy.sh`・`package.json` は他セッションの未コミット差分が同居＝自分のハンクだけ一時インデックスでコミットした（`reference_git_selective_commit_temp_index`）。
- kitan-mmoの `--town-preview --shots=` は同一プロセスの2地点が同じ画になった（a/b同一サイズ）。1地点1プロセスで撮る方が確実。
- ブランチは `codex/meikyo-island`（vibeの実運用ブランチ・main停滞）。wrangler deployは作業ツリーから上がるのでブランチは無関係。
