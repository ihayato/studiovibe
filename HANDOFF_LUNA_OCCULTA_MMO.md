# HANDOFF: 月蝕綺譚ONLINE 公式LP（vibe.co.jp/luna-occulta-mmo）

2026-09-06 更新。この1ファイルだけ読めば仕事を再開できることを目標にした引き継ぎ文書。読み手は「このプロジェクトを何も知らないAI」。

## 現在地（どこまで終わっているか）

- **公開中の本番**: https://vibe.co.jp/luna-occulta-mmo ＝ 2026-09-06夜の **Version e3355c1b**（マーケ型LP第1版。「あの頃の夜を、もう一度。」共感→約束3→証拠→FAQ→CTA）。
- **ローカル先端（コミット済み・未デプロイ・本人GO待ち）**: ブランチ `codex/meikyo-island` の `7783bda` まで。本番との差分＝下の「次にやること 1」の中身。
  - 擬似キャラビルド（髪型6×髪色17×肌7＝714通りを事前描画・`assets/build/b_{髪i}_{色i}_{肌i}.webp`・押した1枚だけ読む）
  - 整理（ヒーロー副文1文・共感1段落・約束各1段落・FAQ 5→3・証拠節と開発だよりの帯を撤去）
  - Why節に絵（同じ里の昼夜の写し＋栞の一枚絵の板）・見出し「ログインすれば仲間がいて、ギルドで集まり、ボスを追って、気づけば朝でした。」
  - 御霊の札＝職業名を主・御霊名を副（「剣士／御霊 咲耶」）
  - コピー強化＝衆（ギルド）と大鬼（レイド）を前面に（Why本文・約束02）
  - 手紙の節 `#letter`（FAQの後・作り手の言葉をエモ寄せで移動・**結の下書き＝本人差し替え待ち**）
  - サムネ（OGP）＝正典シート参照でGPT Image 2に描き起こした**A「誘い」**（ロゴは左上に後合成）
  - Why節の昼夜の写しを組み直し（`7783bda`）＝右端で「写し番」の名札が「写し」に切れていた→昼cx800／夜cx1350で名札を全部収める（`tools/luna-occulta-mmo/compose_daynight.py`）
- ページ構成（先端）: ヒーロー → `#why` 共感 → `#promise` 約束3（歩く／衆と大鬼／御霊を装備して転職＝札絵動画6本） → `#build` 姿を組んでみる → `#faq` 3問 → `#letter` 手紙 → `#join` CTA。行動は月見台登録の1種類（`https://vibe.co.jp/luna-occulta/tsukimidai?via=mmo`）。
- 検証状態: `npx vite build` 緑・`bash scripts/linkcheck-luna-occulta-mmo.sh` 全OK・AI臭検査 ERROR0/WARN0・390/1280幅の横はみ出しゼロ・ビルダーの切替は機械検査済み。**見た目＝09-06 21時にPlaywright(python)でPC1280/SP390の全節を撮って結が目視済み**（写し＝`main/_boards/kitan_mmo_site/kenbun_20260906/`・大きな崩れなし・手紙の節の背景にタイトル画面のボタンが薄く透ける＝意匠の範囲として残置）。本人の目視は本番反映後に。

## 次にやること（上から着手順）

1. **本人GO（S1）→本番反映**。node_modulesが空なら先に `npm ci`。
   ```bash
   cd ~/Desktop/dev/vibe && npm run build && npx wrangler deploy && bash scripts/verify-deploy.sh
   ```
   反映後の確認: `curl -s https://vibe.co.jp/luna-occulta-mmo | grep -c 'id="build"'` が1、`https://vibe.co.jp/luna-occulta-mmo-assets/build/b_2_0_0.webp` と `/og.jpg` が200。
2. **手紙（`#letter`）の本文を本人の言葉に差し替える**（軍配の掟＝本人の声はAIが置き換えない。一人称は「ぼく」・です・ます）。届いたら差し込み→build→deploy。
3. サムネの再検討があれば `tools/luna-occulta-mmo/gen_kv.py` で再発注（B「大鬼との対峙」の原画は `main/_boards/kitan_mmo_site/kv_B_raw_20260906.png` に保存済み）。
4. 公開後の伸びしろ（設計書§8）: ストアバッジ・公式PV埋め込み・開発だよりの復活（素材は `assets/` に残置）。

## 決定済みの事項（理由つき）

- **部族と旗**（2026-09-06・本人裁定）: ヒーローで刺す部族＝**RO世代のノスタルジー**、副で本編ファンへ「御霊を装備」。変化の一文＝「MMOで夜更かしした頃の熱を、スマホで、仲間と、もう一度取り戻す」。行動は月見台登録の1種類。根拠＝勘（部族調査未実施）。
- **カタログ禁止**（2026-09-06・本人「情報量が多い・カタログみたい」）: 機能の列挙をしない。変化の一文→共感→約束→証拠→FAQ→CTA の順。見送った案＝遊びの柱5枚・姿の組み合わせ台帳・里の6窓・街ギャラリー5枚・開発だより10件（素材は残置）。
- **ヒーローにコード描画の円環を置かない**（2026-09-02・本人「邪魔ですw」）。ロゴの紅円相が唯一の輪。
- **サムネは描き起こし**（2026-09-06・本人「そういうんじゃなくて」）: 立ち絵PNGの並べ貼りは不可。正典シート参照でGPT Image 2に新規構図を描かせ、ロゴだけ後合成（字形保証）。見送った案＝立ち絵6体の扇状配置（案C）。
- **御霊の札は職業名を主に**（2026-09-06・本人「キャラ名より職業名を強調」）。
- **コピーの語**（2026-09-06）: 「露店をひやかし」は本人「ピンとこない」で不採用→「ログインすれば仲間がいて」。「野へ出れば隣で刀が振られる」は本人「微妙」で不採用→衆（ギルド）と大鬼（レイド）の文へ。「大鬼」「レイド」は本人の言＝実装の有無は未照合。
- **数値はコピーに出さない**（Lv10/25等は仮値のため）。料金は未定＝FAQは「決まり次第」。
- 置き場所＝vibeリポの静的1枚（`public/luna-occulta-mmo.html`＋`public/luna-occulta-mmo-assets/`）。worker.js／wrangler.jsonc／vite.config.js は触らない（`/luna-occulta-mmo` は中継ルールに当たらず静的配信へ素通り）。
- 色・書体＝kitan-mmo/DESIGN_DIRECTION.md 継承（宵闇藍・金泥は線と粒・蝕紅は「近日公開」札のみ・Shippori Mincho B1／M PLUS Rounded 1c）。

## このプロジェクトのルールと地雷

- **S1**: `wrangler deploy` は本人の一言の後だけ。承認は便ごと（前の便のGOは次に効かない）。
- **並行セッション同居のリポ**: `git status` に他セッションの未追跡（worker.js等）や未コミット差分（package.json・verify-deploy.sh）が出る。**コミットは一時インデックス法で自分のパスだけ**（memory `reference_git_selective_commit_temp_index`）。素の `git add -A`／`git commit -a` は禁止。
- **kitan-mmoの共有ツリーは変更しない**（並行セッション中）。撮影は既存レーンの引数だけ。ツールを改造したいときは `cp -Rc` で私家コピー（例: `scratchpad/charbuild_site`＝`tools/charbuild`に `--batch=<txt>` を足した）。
- **Godotの撮影レーン**（kitan-mmo・`cd ~/Desktop/dev/kitan-mmo`）:
  - 街: `godot --path client --resolution 2560x1200 res://scenes/town.tscn -- --town=<mizu|senmai|sumiyaki|sakai> --town-preview --cam-at=x:z --quit-after=12 --shot=<png>`（通信なし）。1回だけ窓が1092x876に化けた＝撮ったらサイズを検査。
  - 里・野・台帳: 本番サーバーに使い捨てキャラ `KITAN_DEVICE_SUFFIX=site`（契約済み・咲耶）。里 `plaza.tscn -- --tod=0.80 --shot=`／野 `field.tscn -- --field=N --cam-at=x,z --tod=0.80 --shot=`／浮き文字 `--text-demo --quit-after=3.9 --shot-burst=6`／御霊台帳 `KITAN_FAKE_SPIRITS=1 keiyaku.tscn -- --keiyaku-shot=`／技の樹 `KITAN_FAKE_SKILLS=onmyoji waza_no_ki.tscn -- --waza-shot=`（UI窓は解像度に追従しない＝1320x610で撮る）／タイトル `KITAN_TITLE_FAKE=ready title.tscn -- --title-shot=`。
  - 姿: charbuild `--hero-angle=4.71` が正面（0＝右横・3.14＝左横）・`--zoom=0.55`・UIが左x<800に出るので中央400幅で切る（`tools/luna-occulta-mmo/crop_vars.py`／`crop_build.py`）。無指定だと自動回転で向きが運任せ。
  - 淵の底は固定の闇＝写しは露出を持ち上げた（構図の外科はしない）。
- **素材の掟**: 動画はCRF28（`card_*.mp4`＝本編の召喚札絵を420幅で）・見えている間だけ再生（IntersectionObserver・reduced-motionでは再生しない）／写しのHUDは切り落としで除く／PIL合成はレイアウトのみ（生成画の外科はしない）／`<img height>`属性がある画像に`max-width`だけ当てると縦長に伸びる→`height:auto`必須／帯合成はgap計算が負になって重なった実例あり（12×372>1600）＝帯は作らない。
- **ブラウザペインの癖**: 非表示中は `computer` 系が30秒タイムアウト・スクショが真っ黒・遅延画像が読まれない。検分は `javascript_tool` の機械検査を正にし、見た目は本人目視に委ねる。`preview_start` は `~/Desktop/main/.claude/launch.json` に一時エントリ `vibe-preview-mmo`（bash -lc "cd ~/Desktop/dev/vibe && npx vite preview --port 4179 --strictPort"）を足して使い、**終わったら削る**。プレビューを止めると本人が見ていたページの画像が読めなくなる＝本人が見終わるまで止めない。
- **ブラウザペイン非表示時の撮影の正道**＝python Playwright（`pip`済み・chromium入り）で `http://localhost:4179/luna-occulta-mmo.html` を撮る（今回の撮影スクリプト＝各節 `scrollIntoView` → screenshot・`full_page=True`も可）。ペイン経由の `scrollIntoView` は smooth で止まり、JSスクロール後のスクショは真っ黒になる。
- **写しの名札**: 撮影用キャラの名は「写し番」。切り出しの端に名札がかかると「写し」だけ残ってHUD残りに見える＝切り出し後に四隅の名札を検査する（09-06に実発生→7783bdaで是正）。
- **4179のvite previewは前セッション（別チャット）が起動したまま**のことがある。`preview_start` は他チャットのサーバーと衝突して失敗する→ `preview_start` に `url` で直接 `http://localhost:4179/...` を開けばよい。止めるのは本人の一言の後（PID確認＝`lsof -nP -iTCP:4179`）。
- **画像はチャットに貼るときSendUserFile**（boardsへのリンクは本人環境で「見えない」ことがあった 2026-09-06）。
- **本人の声**: `#letter` の文は結の下書き。本人の加筆なしに「完成」扱いしない。
- verify-deploy.sh の期待値は別セッションが2026-09-06に今の仕様（御用板307・BotID404）へ更新済み＝全項目OKが正常。

## 再開手順

1. このファイルを読む。
2. `cd ~/Desktop/dev/vibe && git log --oneline -5 -- public/luna-occulta-mmo.html` で先端がこの文書の記述と合うか確認（ズレていたら他セッションが動いている）。
3. `npx vite build` → `bash scripts/linkcheck-luna-occulta-mmo.sh` が緑なら、上の「次にやること」から。
4. 記憶の正本＝`~/.claude/projects/-Users-hayatoikeda-Desktop-main/memory/project_kitan_mmo_site.md`。設計書＝`docs/superpowers/specs/2026-09-02-luna-occulta-mmo-site-design.md`（初版のティザー構成）。

## 主要ファイル

- `public/luna-occulta-mmo.html` — ページ本体（HTML+CSS+小さなJS。1ファイル完結）
- `public/luna-occulta-mmo-assets/` — logo.webp／og.jpg／shot_*.webp（街の写し）／card_*.mp4+poster／world_title.webp／battle_slash.webp／pillar_daynight.webp／shiori.webp／build/b_*.webp（714枚）／ui_*.webp・var_*.webp・pillar_*.webp（撤去節の素材・残置）
- `tools/luna-occulta-mmo/` — crop_shots.py（街の写し）・crop_vars.py／crop_build.py（姿）・compose_pillars.py・make_og.py（旧OGP）・gen_kv.py（サムネ発注器）
- `scripts/linkcheck-luna-occulta-mmo.sh` — ページ内hrefと素材の到達検査
- 本人向けの写し置き場: `~/Desktop/main/_boards/kitan_mmo_site/`

## 過去ログ（新しい順・要点のみ）

- 09-06 21時: 先端の見た目検分（Playwright撮影・PC/SP全節）→ Why節の写しの名札切れを是正（`7783bda`）。launch.jsonの一時エントリ `vibe-preview-mmo` は削除済み（サーバー本体は前セッションのものを残置）。
- 09-06夜: サムネ描き起こし2案→A採用（`ffab4dd`）／手紙の節・見出し差し替え（`07003b9`）／衆と大鬼のコピー（`380e131`）／職業名を主（`c2fab5e`）／Why節に絵（`613a6f1`）／擬似ビルド＋整理（`ce8e4b9`）／**マーケ型LP第1版を本番へ e3355c1b**（`c2c72d1`）／開発状況反映便＝里の6窓・集う・開発だより・タイトル画面・新キット5街（`a8cd99d`・後にカタログとして撤去）。
- 09-06昼: 遊びの柱＝画像付き5枚を本番へ（Version d1df4d8e・別セッションのnet.js便に同乗）。
- 09-02: 初版ティザー本番へ（ff2baabf）→「姿」節（キャラビルド＋御霊装備で転職）→改版2（本編の召喚札絵動画＋12種の写し）を本番へ（925ce8ba）。本人裁定＝コード描画の円環は不採用・段階はティザー・CTAは月見台送客・構成は1ページ。
