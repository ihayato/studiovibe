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

## 次にやること（順）
0. **「姿」節のデプロイ（本人GO待ち・S1）**: `cd ~/Desktop/dev/vibe && npm run build && npx wrangler deploy && bash scripts/verify-deploy.sh`
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
