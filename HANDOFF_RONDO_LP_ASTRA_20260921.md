# HANDOFF — Rondo公式サイト「Astra/Fableユーザーのための」改稿（2026-09-21）

> ## 🔴 10-10 朝 価格を ¥29,800 に（本番 vibe a9992ce・Version 35f4fa31・下書き f4a2e4f）
> - 本人「価格を29800円に。事前登録で期間限定10%オフ。Brainで発売予定。明鏡購入者は30%オフリンクを提供予定」。
> - ヒーロー ¥29,800→¥26,820・「Brainで発売予定・発売日は未定」／価格節 ¥29,800・10%オフ ¥26,820・「明鏡」購入者30%オフ ¥20,860（専用リンクを届ける予定）／FAQ 発売日に「販売はBrainで行う予定」・FAQ「明鏡を買っています」（faq-8）を追加。
> - OGP の絵も ¥29,800 に（旧Mac救出/rondo-lp-v10_20261009/og/a.html → shoot.mjs → sips jpg 88）。rondo.html は **rondo-ogp-v11.jpg**（SNSキャッシュ避け・build.py で差し替え）、他の rondo 頁が使う rondo-ogp-v10.jpg も同じ絵で上書き。
> - 同朝 追い（vibe 73d7e01・Version 3be86d14）: 購入特典「Rondo活用チャンネル」（「明鏡」の中のユーザーコミュニティ）を価格欄の札（.perk）と FAQ「サポートはありますか？」に。技術サポートの窓口はない、の線は維持（向かない人の「サポート窓口が必要な人」もそのまま）。
> - 発売時の宿題（景表法）: ¥26,820 の期間を日付で明示し、終わったら ¥29,800 で売り続ける（将来価格との二重価格＝その価格で実際に売る必要がある）。明鏡30%オフは条件付きの値引きとして条件をはっきり書く。
>
> ## 🟡 10-09 夜 更新: /rondo を **v5＝事前登録版** に差し替え（本番 vibe ecee6b1・Version 979a255b・下書き d0c3e4e）
> - 本人「終盤の見出しが崩れてる」「文字が多すぎ。だれも読めない。もっといいLPに。codex/fableにもマーケ目線で点検」。
> - **下書きの正本は `public/rondo-v5.html`**（v4 は旧版として残す）。v5 は手で直さず、`~/Desktop/旧Mac救出/rondo-lp-v10_20261009/v5/` の `body.html`（本文）・`style.css`・`build.py`（v4 から頭のmeta・全機能の一覧・声3件・スクリプトを借りて組む）を直して `python3 v5/build.py public/rondo-v4.html public/rondo-v5.html` → 公開版は `make_publish_v5.py`（noindex を外す・heat.js を `data-page="rondo-lp-pre"` で有効化）→ vibe の public/ と dist/ の rondo.html へ。
> - 構成（8節）: ヒーロー（事前登録の札＝主役・¥9,800→¥8,820）→ 配信・返信・予約・売上 → 実際の画面（5タブ＋つながるもの＋全機能の折りたたみ＋連携の条件）→ 声3件 → 設置と運用（あなた/AI＋向かない人の一段落）→ 価格（運用費・更新/サポート/返金の条件）→ FAQ7 → 終盤。見える本文 約1,700字（v4 は約8,900字）。適性診断・設定の節・全機能の常時表示は外した。
> - CTA は5か所すべて `https://ihayato.substack.com/?utm_source=rondo-lp&utm_medium=lp&utm_campaign=rondo-presale`（トップ。/subscribe は使わない）。Substack の購読者一覧で utm_source=rondo-lp を絞れば LP 経由の登録が数えられる。
> - 点検: Astra r1 要修正→r2 要修正（P1 3件＝終盤の説明・Resend 1日100通・料金欄の320px）→全部直して出荷。Fable r1 要修正→r2 出荷可。講評は `旧Mac救出/rondo-lp-v10_20261009/v5/review/`。
> - 計測キーは **rondo-lp-pre**（v4 の rondo-lp-v10 と混ぜない）。Rondo の HEAT_PAGE_LABELS には未登録＝LP分析では「その他」にキー名で出る。名前を付けるなら Rondo の wrangler.jsonc に `"rondo-lp-pre":"Rondo LP 事前登録版"` を足して次の Rondo 配信に相乗り（並行 deploy の地雷に注意）。
> - **10-09 夜 追い（本番 Version 614b4e68・下書き 0115f25）**: ①ヒーローの実績の数字（β版284・読者・LINE友だち）を削除（本人「いらない」「LINE友だち数も違う」＝数字は v4 からの転記で未検証だった。**復活させない**）②ヒーロー直後の節を「Lステップ、MyASP、iステップ。その主な機能を、ひとつに。」（#vs）に差し替え。インスタのDM自動返信のカードを主役（幅広・枠色）に。小見出しは「○○の領域」（他社の機能を断定しない＝Fable 指摘）・注記に「コメントへの自動返信には、Metaの追加の許可が要ります」と商標。「同等」とは書かない。③β版の声を Xの埋め込み（崩れていた）→ X風の静的カード3枚＋元ポストへのリンクに。元データは `v5/voices/tw_*.json`（cdn.syndication.twimg.com の tweet-result）、`v5/make_voices.py` → `v5/voices.html`、アイコンは `public/rondo-assets/voices/<screen_name>.webp`（96px・vibe 本番にも配置）。widgets.js は読まない。
> - **同夜 さらに（Version 3551847b）**: 本人「サービス名は出さないでおこうか」で #vs から他社名を全部外した。見出しは「LINE、メール、インスタ。別々だった配信ツールを、ひとつに。」・「○○の領域」と商標の注記も削除・LINE欄の「LステップのCSV」も削除。**LP の比較ブロックに他社のサービス名を戻さない**。FAQ「乗り換え」と全機能の折りたたみにある「LステップのCSV」は取り込み形式の説明として残した（消すなら本人に確認）。
> - **同夜 さらに（Version 590534cc）**: ①#vs の3枚は同じ扱い（本人「インスタは強調しないでいい」）・並びは LINE→メール→Instagram。②受信箱の節 #inbox を新設（#vs の直後・実画面＋4項目・Instagram 24時間/YouTube 30日の注記）。画面タブの「受信箱」は外した。③β版の声は v4 の5件に戻してカルーセル（#vtrack・前後ボタン・scroll-snap。build.py の CAROUSEL）。5件の元データは v5/voices/tw_*.json、長文判定は note_tweet の有無。節は9つ。
> - 地雷: 見出しで `<span class="ph">`（inline-block）に長い句を入れ `text-wrap:balance` と重ねると、PC 幅で句の中が割れて崩れる（終盤の見出しと #vs で2回）。v5 の h2 は `<br>` と auto-phrase で割る。見た目の確認はアプリ内ブラウザが非表示だと撮れない→ `node shoot.mjs v5/check/s.json`（CDP・終わると閉じる）で撮る。
> - 残り（本人裁定・確認待ち）: ①Substack で登録すると有料プランの案内が挟まるか、捨てアドレスで1回確認（挟まるなら札の注記に「無料のままで届きます」を足す）②Substack の embed フォームを LP に埋め込むか（離脱が減るが要裁定）③OGP に「事前登録で10%オフ」を入れるか ④発売時は割引リンクの期限を日付で明示し、割引後も ¥9,800 で売り続ける（二重価格の注意）⑤声3件の投稿者が自腹購入か（「依頼・謝礼なし」の裏取り）。

> ## 🟡 10-09 夕 更新（最新）: 購入ボタンを全部「事前登録で10%オフ」へ（本番 vibe 7780b2f・Version 6ae1a608）
> - 本人「事前登録で10%オフ。Substackにメール登録を促す。発売当日に期間限定の10%オフリンクを提供。発売日は未定」。
> - ボタン（ヘッダー・ヒーロー・価格・終盤・下の固定・診断A）は全部 https://ihayato.substack.com/ （トップ・別タブ。**/subscribe は有料課金ページなので使わない**＝本人 10-09）。`data-rondo-cta="presale"`・ラベルは「CTA ○○事前登録」。/rondo-apply への導線は0。
> - 「発売日は未定」と「発売当日に期間限定の10%オフのリンク」をヒーロー下・価格の箱・終盤・FAQ先頭（faq-13）に書いた。¥8,820 のような割引後の額は書いていない。
> - **発売日の宿題**: 発売当日に Substack で10%オフのリンクを送る（割引リンクの作成は未着手）。販売再開時は CTA を /rondo-apply（または決済）へ戻し、「発売日未定」の文言を消す。

> ## 🟢 10-09 更新（最新）: v1.0 の LP を **本番 /rondo に公開済み**（vibe 本番枝 a5cb557・Version beaa4543・Astra LP r13 出荷可）。下書きの正本は `public/rondo-v4.html`（枝 c30db94）、公開版は make_publish.py で作る
> - 実画面（管理画面のダミーデータ）とv1.0の全機能一覧の版。正本の記録は `~/Desktop/main/marketing-crm/HANDOFF.md` 冒頭の 🖥️ 節（撮り直しの手順・Astra r4〜の講評・載せないと決めたこと）。
> - 画像は `public/rondo-assets/rondo-admin-{channels,channels@2x,home,mailch,line,inbox,robes}.webp` と各 `-sp.webp`（スマホ版）。**`rondo-admin-mail.webp` は公開中の rondo.html 用＝上書き禁止**。
> - 公開（rondo.html への差し替え・noindex を外す・heat.js を有効化）は v1.0 の ZIP 配布と同じ日に（本人裁定 10-05）。

> ## 🔵 09-27 更新（最新・ここが正）: 「Astra/Fable推奨」を撤回し、Codex/Claude Code軸で**本番配信済み**
> 本人（2026-09-27）:「opus5.5が賢くなったので、Astra/Fable推奨という表現を取りましょう」
> - 見出し＝**「Codex/Claude Codeユーザーのための、マーケティングOS。」**（本人選択）。title/OG/Twitterも同じ。
> - **モデルの指定はしない**。「強く推奨」「最低ライン＝Astra/Fableクラス」「Opus 5やGPT 5.6では失敗」を全撤去。FAQは「モデルの指定はありません／新しめのモデルを。古い世代ほどつまずきやすい」だけ。
> - 「RondoはFableで開発し、Fableで運用」の一文も撤去（推奨の文脈で読まれるため）。
> - 料金は「CodexもClaude Codeも月3,000円ほどのプランから」（2026年9月時点の注記はFAQに残す）。
> - 適性診断: モデルの問い(旧Q3)を削除し**6問**に。判定の添字は 投資=answers[2]・ドメイン=answers[3]・設計図=answers[4]。※分析ラベル「診断 QnAm」はQ3以降の番号が1つずれた。
> - 実演パネル: 切替ボタンを Astra/Fable → **Codex/Claude Code** に。バーのアプリ名表示(#cc-app)は重複するので削除。
> - 申込フォーム条件1: 「CodexやClaude Codeなどの開発AIが使える環境」。選択肢の Claude Code は「Pro/Maxプランなど」に訂正。項目名 `fableEnv` は据え置き。
> - 審査の不合格文言（rondo `src/sales.mjs` の `REJECT_LABELS.fable_env`）も同文に直し、ikehaya-marketing-os main にコミット。**rondo Worker へは未配信**（本番は deploy/* 枝運用で main と大きく乖離。select必須のため実際にはほぼ出ない文言。次の rondo 配信に相乗りでよい）。
> - 状態: vibe **6a17f03**・本番 Version **46635f76**・verify-deploy 全項目OK。配信前にdist全67ファイルを本番と突き合わせ、差分は rondo 3頁のみを確認。
> - **以後、vibe配信時に rondo 3頁を 55c8b6c 版へ戻す運用は廃止**（memory vibe-site-deploy-new-mac も更新済み）。
> - 下の09-21の記述のうち「見出し」「Astra先頭」「Fableで開発の一文を残す」「最低ライン＝世代」は**失効**。


## 依頼
本人（2026-09-21）:「rondoの公式サイト、Astra/Fableユーザーのためのツールという感じでリニューアルします。Astraは月3000円で使えるので、だいぶ使いやすくなりますね。」

## 現在地
- 改稿は**作業木に反映・コミット済み／本番 vibe.co.jp には未配信**（配信は本人GO待ち）。
- 対象は3ファイル。見た目の骨格（IBM Plex・ガラス調・青アクセント #2E5CE6）は据え置き、訴求と小さなUIだけ直した。
  - `public/rondo.html` — title/description/OG、ヒーロー（h1・サブ・注意書き・注記）、逆転その二、cover注記、同梱物11、導入に必要なもの、向く人/向かない人、適性診断（Q2〜Q4の文言・結果文）、条件1、reco、FAQ 8問、終盤CTA。
  - `public/rondo-apply.html` — 条件1の見出し・ヒント・選択肢（Codex/Astra を先頭に追加）・チェック文言。
  - `public/rondo-setup.html` — description、リード、必要なもの（Codex / Claude Code）、手順2、Google設定の代行の説明。
- 小さなUI追加: 実演パネル（`#cc-demo`）のバーに **Astra / Fable の切替**（既定=Astra。アプリ名 Codex⇄Claude Code、発話者 Astra⇄Fable が替わるだけ）。
- ついでに直した既存の粗（スマホ幅）: ①720px以下でヘッダーCTAが右に寄らない（`.head-cta{margin-left:auto}`）②420px以下でヒーローのピルが縦割れ（inline-block化）③h1を句で折る（`nb` 2分割）。

## 決めたこと（勝手に変えない）
- 見出しは本人の言い回しどおり **「Astra/Fableユーザーのための、マーケティングOS。」**
- 並び順は Astra→Fable、Codex→Claude Code（始めやすい方を先に）。
- 値段の書き方は **「月3,000円ほど」**（ChatGPT Plus $20 相当）。断定の円額にしない。FAQにだけ「2026年9月時点」「利用枠に上限あり→作り込みが増えたら上位プラン」を書いた。
- 「RondoはFableで開発し、Fableで運用しています。」は**事実の文なので残した**（Astraで運用中とは書いていない）。
- 最低ラインの表現は「月100ドル」から **「AstraかFableクラス」＝モデルの世代**へ移した。診断Q4の足切りは「払えない・払いたくない」のまま（index 2＝C判定。ロジック不変）。
- 申込フォームの項目名 `fableEnv` は**変えない**（vibe worker と rondo `sales.mjs` の `judgeApplication` が参照。サーバは「空でない・200字以内」しか見ないので選択肢の追加は安全）。
- OGP画像 `rondo-ogp.jpg` は「自分で所有する、次世代マーケティングOS」でFable表記なし＝差し替え不要。

## 検収（2026-09-21・ローカル静的配信で実施）
- 切替ボタン: Astra⇄Fable でアプリ名・発話者・aria-pressed が替わる。
- 収まり: 320×693／375×667／390×844 で横はみ出し0、h1は句で折れる、切替はバー内、ヘッダーCTAは右端。
- 申込フォーム: 選択肢3件・横はみ出し0。コンソールの403は heat.js / Turnstile の localhost 由来で今回の変更と無関係。

## 次にやること
1. **本人GO → 配信**。型は `npm run build && wrangler deploy worker.prod-20260918.js --no-bundle --no-autoconfig --keep-vars` → `bash scripts/verify-deploy.sh`（配信前に本番Workerの最新写しを取り直すこと。09-18の写しが古い可能性）。
2. 配信後、実機で https://vibe.co.jp/rondo と /rondo-apply を目視。
3. **商品側の宿題（未着手・本人裁定待ち）**: 配布zipの診断AIは `.claude/skills/ikehaya-ai/` にあり、Codexは自動では拾わない。Astra利用者向けに `AGENTS.md` と Codex用スキル置き場への写しを配布物に足すか。LPのFAQ「マーケ相談」は「CodexやClaude Codeを開いて…」と書いたので、足すまではCodex側は SKILL.md を読ませる一手間が要る。
4. Astra（Codex）での SETUP.md 通し導入は**未検証**。LPで Astra を先頭に推す以上、1回は通しておきたい。

## 地雷
- このリポジトリの本番枝は `codex/meikyo-island`。`worker.js`・`wrangler.jsonc` は git に無い（memory: vibe-site-deploy-new-mac）。
- 作業木には無関係の未コミット（hero-bg.mp4・vite.config.js・public/senri/*）がある。**git add にフォルダを渡さない**。今回は3ファイル＋このHANDOFFだけを名指しで add。
- 検収用の `.claude/launch.json` エントリ（rondo-lp-static・8791）は作業後に削除済み。
