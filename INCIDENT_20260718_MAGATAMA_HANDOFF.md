# 引き継ぎ: 月蝕綺譚 勾玉付与全停止インシデント (2026-07-17〜18) — 対応完了・残課題あり

最終更新: 2026-07-18 / 記録者: 結（Claude）
ステータス: **復旧済み（実ユーザーの付与再開を本番D1で確認済み）**。push未・残課題は §6。

---

## 1. 事象サマリ

- **症状**: 御用板 https://vibe.co.jp/luna-occulta/goyo で勾玉がもらえない、というユーザー報告。
- **実体**: 7/17 13:11 JST 〜 7/18 09:50 JST の約21時間、BotID保護対象のPOST
  （**詣で(checkin)・日課クイズ(quiz)・follow・PV・novel**）が**ブラウザから送信すらされない**状態。
- **無事だった経路**: メール会員登録(email/register=BotID非保護)、講座のlesson付与
  （/learn の講座ページは素HTML+member.jsでBotIDクライアントが載っていない）。
  → ページ自体は200・登録も通るため、外形監視では見えない「静かな全停止」だった。
- **被害規模**: camp_quests の日次付与 例日約300件 → 7/18は事故中13件。データ破損なし。
  取り逃した分の**お詫び勾玉配布は本人未裁定**（§6）。

## 2. 根本原因（実証済み）

原因は **vibe.co.jp（このrepo）のvercel.jsonからBotIDチャレンジ経路のrewriteが消えた**こと。

1. **7/11**: BotID(Vercel BotID/Kasada)のチャレンジ経路
   `/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/:path*`
   → `https://cn-kitan-web.vercel.app/luna-occulta/...` の中継rewriteを、
   **worktree `Desktop/dev/vibe-botid-routing`（ブランチ codex/botid-routing、コミット da66c93）だけに入れてCLIデプロイ**。本流には未マージ。
2. **7/17 13:11:11**: 契約書ページ(/contract_202607)を**本流worktree（ブランチ codex/meikyo-island）からCLIデプロイ**
   → worktreeにしか無かったBotID経路が本番から消失。
   （最後の成功checkin=13:10:59。デプロイと秒単位で一致。）
3. cn-kitan-webの/goyoはBotIdClient(app/layout.tsx)が checkin/quiz/follow/pv/novel 等のPOSTを
   インターセプトし、チャレンジスクリプト `.../a-4-a/c.js` を要求する。これが404になると
   **fetchがエラーまたは永久ハングし、リクエストがVercelに到達しない**（ブラウザ実測で確認）。

## 3. 実施した対処（すべてローカルコミット済み・push未）

vibe repo・ブランチ `codex/meikyo-island`:

| コミット | 内容 |
|---|---|
| `87c9c2b` | vercel.jsonへBotID経路の **rewrite + headers(X-Frame-Options SAMEORIGIN / CSP frame-ancestors 'self')** を恒久復元 |
| （直後） | `scripts/verify-deploy.sh` 新設（§4） |

- 本番デプロイ済み: `vibe-prtmziia6`（7/18）。CLIデプロイだが、作業ツリーは事故時の本番（13:14デプロイ）と同一内容＋修正のみ、を確認の上で実施。
- **検証結果**:
  - `c.js` → 200（修正前404）
  - ブラウザconsoleから保護POST3本 → 即時401（未ログインの正常応答。修正前はエラー/8秒タイムアウト）
  - 本番D1 camp_quests: 修正数十秒後に `daily:2026-07-18`(09:54:20)・`quizd:194`(09:54:28) — **20時間ぶりの実ユーザー付与を確認**

## 4. 運用の掟（再発防止）

- **vibeを本番へ上げたら毎回**: `bash scripts/verify-deploy.sh`
  （本殿/ティザー/御用板の200・**BotID経路c.jsの200**・詣でAPIの401到達を機械検査。NGならvercel.jsonのrewritesを疑う）
- **vercel.json等の環境設定をworktree/ブランチ分岐のまま別系統からデプロイしない**。
  設定変更は必ずデプロイ元の系にマージしてから上げる（今回の事故の根っこ）。
- rewrite中継配下のLocationは相対で返す等、既知の罠はメモリ `reference_vercel_index_html_loop` 参照。

## 5. 同種障害の切り分けプレイブック（15分で当たる手順）

1. **いつから・何が止まったか**: 本番D1で quest種別×日次を見る
   ```
   cd Desktop/dev/cn-kitan/worker
   npx wrangler d1 execute cn-kitan-banzuke --remote --json --command \
     "SELECT quest, date(created_at/1000,'unixepoch','+9 hours') d, COUNT(*) c
      FROM camp_quests WHERE created_at > <ms> GROUP BY quest, d"
   ```
   ※ daily/quizd/pv/follow/novel だけ死んで email/lesson が生きていたら、まずBotID経路を疑う。
2. **リクエストは「来て失敗」か「来ない」か**: cn-kitan-webのVercelログ
   ```
   cd Desktop/dev/cn-kitan-web
   npx vercel logs --environment production --json --limit 1000 \
     --query "requestPath:/luna-occulta/api/en/email/checkin"
   ```
   「来ない」＝クライアント側。「来て4xx/5xx」＝サーバー側（session/origin/bot/worker）。
3. **クライアント側の直接観測**: /goyo をブラウザで開き、consoleで
   保護POSTを `Promise.race([fetch(...), timeout])` で発火 → ハング/エラーならBotID、
   networkで `149e9513` を検索 → c.jsが404ならこの事故の再発。
4. 対処: vercel.jsonのBotID rewriteを復元してデプロイ → `verify-deploy.sh`。

## 6. 残課題（本人判断・未着手）

1. **push**: `codex/meikyo-island` の修正2コミットがローカルのみ。並行セッションと調整の上push。
2. **お詫び勾玉**: 7/17午後〜7/18朝に詣で・日課を取り逃した会員への補填をするか。
   （workerのgrantQuestは冪等・台帳PK方式なので、専用questキーでの一括付与が安全）
3. **ブランチ整理**: 本番の実体が `codex/meikyo-island` のCLIデプロイになっている。
   `codex/botid-routing` の `46203ef`（プライバシーポリシー統一）も本流未マージ。
   どこかでmainへ集約し、Git連携デプロイに一本化するのを推奨。
4. **BotID分類の回復確認**: 事故前からcheckBotId()が isBot=true を返す
   「Possible misconfiguration」警告あり（BOTID_ENFORCE未設定＝観測モードなので実害なし）。
   経路復旧後に警告が消えたかログで確認してから、enforceを検討すること。
   **警告が残ったままBOTID_ENFORCE=1にすると全ユーザー遮断の恐れがあるので厳禁**。
5. **監視**: 「camp_questsのdaily付与が24時間ゼロなら警報」の定期チェックが未整備。
   結ノ座の朝の口上等に組み込むかは本人判断（正本routines/*.mdの自動書き換え禁止のため）。

## 7. 関連ファイル・記録

- 修正: `vercel.json`（このrepo・BotID経路のrewrite/headers 2ブロック）
- 検証: `scripts/verify-deploy.sh`（このrepo）
- 事故記録メモリ: `~/.claude/projects/-Users-hayatoikeda-Desktop-main/memory/reference_vibe_botid_route_incident.md`
- BotID保護対象パスの正本: cn-kitan-web `app/layout.tsx` の botProtectedRoutes
- BotID経路のオリジナル実装: worktree `Desktop/dev/vibe-botid-routing`（da66c93）
