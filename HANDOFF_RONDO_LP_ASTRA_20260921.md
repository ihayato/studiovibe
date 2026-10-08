# HANDOFF — Rondo公式サイト「Astra/Fableユーザーのための」改稿（2026-09-21）

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

---

## 2026-10-08 β版の販売終了・LP v3 を「v1.0 開発中」で公開（本人指示）
本人「Rondoのベータ版販売を終了しよう。v1.0を開発中である旨を添えて、最新のLPに差し替えて。イケハヤのXをフォローしてお待ちくださいという感じに」。

- **公開したもの**: LP v3（枝 `feat/rondo-lp-v10` c185886）を土台に、購入ボタン7か所→イケハヤのX（https://x.com/IHayato・`data-rondo-cta="follow-x"`）、価格欄 `#reserve`→「β版の販売は、終了しました。」＋v1.0の予定（¥9,800予定・審査なし予定・v1系更新無償予定）、FAQ先頭に「いま買えますか？」、終盤CTA「正式版 v1.0、開発中です。」。`/rondo-apply` は申込フォームを撤去し「販売終了のお知らせ」頁に。`/rondo-setup` の購入ボタンも差し替え。
  - 枝 `feat/rondo-lp-closed`（作業木 `dev/vibe-wt-rondo-closed`・b4719a0）→本番枝 codex/meikyo-island に **3頁＋画像4枚だけ** 名指しで入れた（134da34）→dist へ写して配信（Version 2501e825・verify-deploy 全項目OK）。配信前に dist 全1401件を本番と照合（差は luna-occulta/privacy のみ＝正常）・worker も API で一致確認。
  - **出していないもの**: `rondo-guides/*`（v1.0配布物向けの setup/settings/update）・`rondo-report`・`rondo-thanks` は本番の旧版のまま（β購入者が v1.0 のガイドで迷わないため）。
- **サーバー側の受付停止**: ikehaya-marketing-os main 4dad416 で `SALES_OFFERS.rondo-presale.active=false` → rondo Worker 配信（Version 729a984d）。申込API=404 unknown_offer・審査通過メールの予備決済リンク=410「受付を終了しました」。購入者の再DL・Stripe webhook・報告フォームは影響なし（コードで確認）。
- **v1.0 公開時にやること**: ①rondo の SALES_OFFERS に v1.0 のオファー（review:false・¥9,800）を active で入れる ②LP は `feat/rondo-lp-v10` の購入導線へ戻す（販売終了の差分は b4719a0 の1コミット＝revert で戻る）③ガイドは scripts/rondo-dist-tree.py と tools/sync-rondo-guides.py で作り直して一緒に出す。
