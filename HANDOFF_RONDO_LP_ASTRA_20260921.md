# HANDOFF — Rondo公式サイト「Astra/Fableユーザーのための」改稿（2026-09-21）

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
