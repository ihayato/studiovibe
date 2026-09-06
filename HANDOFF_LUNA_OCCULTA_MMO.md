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

## 🆕 09-06 夜 「今の開発状況を見て改善」便（本人発注）＝コミット済み・**未デプロイ・本人GO待ち**
- 節を4つ足した: `#sato` 里でできること（能力/装い/鍛冶場/高札場/依頼/里の窓＝Codexの羽二重UI写し `docs/reports/images/2026-09-06-panels-refinement/` を16:9に切ってそのまま流用）／`#party` 集う。そして、狩る（社交=縁・耳打ち・衆／野の戦い=`--text-demo --shot-burst=6 --quit-after=3.9` の4枚目／横持ちの札=`ui-vitals-state/field.png`）／`#log` 開発だより（9/2〜9/6の10件・「反映済み」=開発版で動く／「検分中」=S1待ち）／街に「里の人々」＝`_boards/kitan_mmo_npc/talk_a2v2_2lines_2532.png` の16:9切り出し。
- 差し替え: 世界の主役画像＝タイトル画面（`KITAN_TITLE_FAKE=ready … title.tscn -- --title-shot=`）／技の樹＝新UI（`waza_no_ki.tscn -- --waza-shot=` を1320x610で撮り窓まわりを等倍切り出し）／街5つ＝新キット（09-06 462点焼き直し後）で撮り直し・**千枚/炭焼/境の `data-pending` を外して5街表示**（本人が柱モザイク＝千枚/境入りをデプロイGOしたので掲載可と判断。NGなら属性を戻す）／四つの門の先＝「北から城下の焼け野と本丸三層、西の焔の峡と黄泉比良坂を制作中」を追記。
- 撮影の型（追加）: `--cam-at=x:z`（town）・sakaiの1回目は窓が1092x876に化けた→撮り直しで正常（原因不明・サイズ検査を挟む）／`--slash-demo` は連写でも斬撃の瞬間が薄い（赤い命中フラッシュが乗る）→浮き文字の `--text-demo` の方が絵になる／UI窓は解像度に追従しない（2560で撮ると小さい）＝1320x610か報告画像の844x390をそのまま使う／NPC会話の実写しは自分の頭が立ち絵に被る→ボードの単体写しを使った／月蝕の紅い空は `GET /moon` 駆動でCLI固定不可（`_boards/kitan_mmo/sora_20260906_*` に写しあり）。
- ボード=`main/_boards/kitan_mmo_site/{world_title,battle_slash,npc_talk,ui_waza,pillar_towns,shot_*}_20260906.webp`・`ui_board_20260906.png`。素材合計4.3MB。

## 🆕 09-06 夜 マーケ型LPへ全面改版（本人「カタログみたい。もっとマーケ目線で刺さるLPを」→軍配で裁定・**🎉本番デプロイ済み 09-06夜・Version e3355c1b・本人「いいね、この方向で」+「下書きのままデプロイGO」**）
- 裁定（本人）: ヒーローで刺す部族＝**RO世代のノスタルジー**（副=本編ファンへ「御霊を装備」）。変化の一文＝「MMOで夜更かしした頃の熱を、スマホで、仲間と、もう一度取り戻す」。行動は月見台登録の1種類。
- 構成: ヒーロー（「あの頃の夜を、もう一度。」・背景=月隠の里の写しをぼかし）→共感（露店/狩場の朝＋栞の一言）→約束3つ（歩く／連れと淵へ／御霊を装備して転職=札絵動画6本）→証拠（姿12種の帯・作り手の言葉・開発だより3件）→FAQ5問→CTA。**姿の台帳・里の6窓・街ギャラリー・柱5枚・開発だより10件は落とした**（素材は assets に残置＝復活可）。
- ⚠️**「作り手から」の文は結の下書き**（軍配の掟＝本人の声はAIが置き換えない）。本人の加筆・差し替え待ち。一人称は「ぼく」。
- 事実検品: 四つの街／一日四十分／最大四人（PARTY_MAX=4は仮値）／四百点あまり（462点）／縁・耳打ち・衆（実装済み・S1待ちだが「実装」と記載）／料金は未定のため「決まり次第」。リーガル: 煽り語なし・価格表示なし・登録無料は事実。
- 検分: build緑・linkcheck全OK・AI臭0・390/1280はみ出しゼロ・見出しはスマホで2行（`<br class="sp">`）・CTA1行。

## 🆕 09-06 夜 擬似キャラビルド＋整理（本人「姿の帯がおかしい・擬似ビルド機能を作ろう・まだ情報量が多い」・コミット済み・**未デプロイ・本人GO待ち**）
- **擬似キャラビルド `#build`**: 髪型6×髪色17（単色12+グラデ5）×肌7＝**714通りを事前描画**（目=茶固定）。素材=`public/luna-occulta-mmo-assets/build/b_{髪i}_{色i}_{肌i}.webp`（300x400・q80・計5.9MB・押した1枚だけ読む）。描画器＝**charbuildの私家コピー**（`scratchpad/charbuild_site`＝`tools/charbuild`を`cp -Rc`して`main.gd`に`--batch=<txt>`を足した。共有ツリーは触っていない。1プロセスで714枚＝約5分）。切り出し=`tools/luna-occulta-mmo/crop_build.py`。並び順の正=`client/scripts/avatar3d.gd`のHAIR_COLORS/HAIR_GRADS/SKIN_COLORSと同じ（順を変えるとindexがずれる）。
- 整理: ヒーロー副文1文／共感1段落／約束は各1段落／証拠節を廃止して「姿を組む」＋作り手の板だけ／FAQ 5→3／開発だよりの帯は撤去（素材残置）。本文≈3,400字（前回4,600字）。
- 地雷: 帯合成でgap計算が負になり重なった（12×372>1600）。以後は帯にせず擬似ビルドへ。

## 🆕 09-06 夜 Why節に絵（本人「文字しかない・栞のセリフも」・コミット済み・**未デプロイ・GO待ち**）
- 見出し→本文→**同じ里の昼と夜（pillar_daynight）**→**栞の板**（本編公式サイトの `shiori_full.webp`＝月を背にした一枚絵を左・語りを右の羽二重板。スマホは縦積み）。
- 栞の一枚絵は `cn-kitan-web/public/media/img/shiori_full.webp` を600x800に縮小して流用（出自は本編公式サイト＝同社素材）。

## 🆕 09-06 夜 サムネ（OGP）＋Why/約束02のコピー強化（本人指摘・コミット済み・**未デプロイ・GO待ち**）
- **og.jpg**＝ロゴ左・入口の御霊6人を右に扇状（本編公式サイトの立ち絵 `standing_*.webp`・咲耶を手前）・地は月隠の里の写しをぼかして宵闇に沈める。組み方は結の一時スクリプト（案A=ロゴ上/御霊下は顔にロゴが被りNG・案B=右に大きすぎ→案C採用）。写し=`main/_boards/kitan_mmo_site/og_20260906.jpg`。
- コピー: Why見出し「露店をひやかし、ギルドで集まり、ボスを追って、気づけば朝でした。」／本文「衆というギルドを立て、大鬼の夜には皆で挑む」／約束02「衆を立て、淵へ潜り、大鬼に挑む」（本人「ギルド機能・レイドボスの魅力を」「隣で刀が振られるは微妙」）。**「大鬼」「レイド」は本人の言＝実装の有無は未照合**（ボス部屋・封印素材は搬入済み）。

## 🆕 09-06 夜 サムネ＝正典シート参照の描き起こし（本人「codexに作らせようか…ちゃんと構図考えて」→GPT Image 2で2案→**A「誘い」をひとまず採用**）
- 発注器 `tools/luna-occulta-mmo/gen_kv.py`（fal gpt-image-2/edit・参照=入口6人の `canon/*_sheet.webp`＋タイトル画面写し・FLATブロック＋月ロック（蝕環）＋「シートの棒立ちを写すな」・quality medium・1536x1024）。A=参道を歩きながら咲耶が振り返って手を差し出す／B=鳥居の向こうの大鬼と六人の構え（不採用だが原画は保存）。
- og.jpg＝Aを1200x630に切り（y0=100）、左上にロゴ後合成（幅340・下に薄い暗幕）。原画=`main/_boards/kitan_mmo_site/kv_{A,B}_raw_20260906.png`、採用形=`og_kv_A_20260906.jpg`。
- 併せて: 手紙の節（FAQ後・`#letter`・タイトル画面をぼかして敷く）へ作り手の言葉を移動（結の下書き＝本人差し替え待ち）／Why見出し「ログインすれば仲間がいて、ギルドで集まり、ボスを追って、気づけば朝でした。」
- 地雷: ロゴを後合成するときは**顔の上に置かない**（1回目はカルラとイズナの顔に被った→左上の空へ・幅を340に）。

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
