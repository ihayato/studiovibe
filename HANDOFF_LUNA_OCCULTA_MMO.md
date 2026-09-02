# 月蝕綺譚ONLINE 公式ティザーサイト 引き継ぎ（HANDOFF）

2026-09-02 作成。何も知らないAIがこれ1枚で再開できることを目標にする。

## 現在地
- ページ本体 `public/luna-occulta-mmo.html`（静的1枚・7節=ヒーロー/世界/遊びの柱/夜の街々/四つの門の先/本編との関係/締めCTA）と素材 `public/luna-occulta-mmo-assets/`（logo.webp・shot_*.webp・og.jpg・icon.svg）を**コミット済み・未デプロイ**。
- 本番URL予定: https://vibe.co.jp/luna-occulta-mmo （worker.jsの中継ルールは `/luna-occulta` 完全一致と `/luna-occulta/` 前綴りのみ＝この頁は静的アセットへ素通り。worker.js/wrangler.jsonc/vite.config.jsは触っていない）
- 検証済み: `npx vite build`緑・`bash scripts/linkcheck-luna-occulta-mmo.sh`全OK（自分自身のURLはデプロイ前404のため対象外）・375/320/390/430/1280幅で横はみ出しゼロ・ボタン高44px以上・AI臭検査 ERROR0/WARN0・Google Fonts（Shippori Mincho B1 / M PLUS Rounded 1c）読み込み確認。
- 本人検分: ヒーローを本人が見て「コード描画の円環が邪魔」→**撤去済み**（ロゴの紅の円相のみ）。他節は未検分。
- 設計書=`docs/superpowers/specs/2026-09-02-luna-occulta-mmo-site-design.md`／計画=`docs/superpowers/plans/2026-09-02-luna-occulta-mmo-site.md`

## 次にやること（順）
1. **本人GO（S1）→本番反映**: `cd ~/Desktop/dev/vibe && npm run build && npx wrangler deploy && bash scripts/verify-deploy.sh`（verify-deploy.shに「月蝕綺譚ONLINE」の生存確認1行を追加済み）。node_modulesが空なら先に `npm ci`。
2. 千枚・炭焼・境の写しの**掲載可否**を本人に聞く。可なら `public/luna-occulta-mmo.html` の該当 `<figure … data-pending="1">` から属性を外すだけ（CSS `[data-pending]{display:none}`）。写しは `~/Desktop/main/_boards/kitan_mmo_site/` にも置いてある。
3. 野（フィールド）の写しは未契約403で撮れなかった（`KITAN_SPIRIT=sakuya`でも不可）。契約済みキャラで撮るなら `godot --path client --resolution 2560x1200 res://scenes/field.tscn -- --field=1 --cam-at=0,14 --tod=0.80 --quit-after=14 --shot=<png>` → `python3 tools/luna-occulta-mmo/crop_shots.py <src_dir> <dst_dir>`。
4. 公開後にNEWS節・ストアバッジ・PV埋め込みを足す（設計書§8）。

## 裁定事項（勝手に変えない）
- 段階=ティザー公式／CTA=月見台送客（`https://vibe.co.jp/luna-occulta/tsukimidai?via=mmo`・API追加なし）／素材=ゲーム写し+ロゴ／構成=1ページ縦長LP（2026-09-02 本人）
- **ヒーローにコード描画の円環を置かない**（本人「邪魔ですw」2026-09-02）。ロゴの紅円相が唯一の輪。
- 色・書体は kitan-mmo/DESIGN_DIRECTION.md 継承（金泥は線と粒・蝕紅は「近日公開」札のみ）。

## 地雷
- vibeの `node_modules` は空のことがある→ `npm ci`（package.jsonは他セッションが触っている＝`npm install`で書き換えない）。
- Browserペインは非表示中に `computer` 系が30秒タイムアウトする。JSスクロール後のスクショが真っ黒になる型あり→ `navigate` で `#anchor` 付きURLへ飛ばしてからスクショが確実。
- `scripts/verify-deploy.sh`・`package.json` は他セッションの未コミット差分が同居＝自分のハンクだけ一時インデックスでコミットした（`reference_git_selective_commit_temp_index`）。
- kitan-mmoの `--town-preview --shots=` は同一プロセスの2地点が同じ画になった（a/b同一サイズ）。1地点1プロセスで撮る方が確実。
- ブランチは `codex/meikyo-island`（vibeの実運用ブランチ・main停滞）。wrangler deployは作業ツリーから上がるのでブランチは無関係。
