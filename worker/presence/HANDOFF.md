# vibe-presence 引き継ぎ（HANDOFF）

- **✅ 2026-09-06 11:05 Worker本番反映済み**（本人GO）: Version `d0292906`。巻き戻し先=`732c9042`（`npx wrangler rollback 732c9042-972a-4afc-98ad-b2d59262a9ee --config wrangler.toml`）。本番WSで2クライアントの welcome/join/bye/visitors を確認。
- **✅ 2026-09-06 12:38 島クライアント(net.js)も本番反映済み**（本人GO・vibeサイト全体deploy=Version `d1df4d8e`・巻き戻し先 `925ce8ba`）。deploy前にdist 217件をliveと全数突き合わせ、変わるのは net.js のチャンク連鎖（island/island-network/registry/worldPort/luna/meikyo/hankacho＋参照html）と luna-occulta-mmo の遊びの柱カードだけと確認してから実行。live の `island-network-qxOqzLx5.js` に `visibilitychange` を確認。verify-deploy.sh の御用板307/BotID404は移行前からの古い期待値（`../../HANDOFF_LUNA_OCCULTA_MMO.md` 参照）
- **💴 2026-09-06 コスト是正（✅ Worker・net.jsとも本番反映済み＝上記2行）**: `src/index.js` の Room を `ws.accept()`（非hibernation）から **WebSocket Hibernation API**（`state.acceptWebSocket`・attachmentに接続状態・`webSocketMessage/Close/Error`・alarm掃引10秒・STALE 30秒）へ全書き換え。Board は不変。`../../poc/island/net.js` は背景タブで切断・復帰で再接続（`visibilitychange`）
  - 理由: 30日で DO duration 295時間＝口座の78%（136k GB-s／無料40万）。島ページの背景タブ放置1本が Room DO を wall-clock で起こし続けていた（1接続・約1,000通/時で1日最大20時間活性）
  - 検証: `npx wrangler dev --config wrangler.toml` で 2クライアントの hi/welcome/join/p/e/bye・visitors HTTP・stale掃引(1001)・hello timeout(1008) を実確認。ローカル限定の観測＝「1通も送らない接続」はサーバー側で掃引されるがクライアントに close フレームが届かない（実クライアントは open 直後に hi を送るので該当なし）
  - 反映: Worker は `npx wrangler deploy --config wrangler.toml`（この1本で効果の大半）。client(net.js) は vibe サイト全体の `vite build`+deploy に同乗（vibe repo は worker.js/wrangler.jsonc 未追跡＝`../../INCIDENT_20260813_VIBE403_HANDOFF.md` 参照）
  - **Codex監査反映済み(10:50)**: Roomに `leave()`（closing印で退出を一度だけ記録・CLOSING残留を集計から外す）・満員はaccept前503・accept→serialize順。net.jsは再接続タイマー解除/二重接続ガード/接続世代。再テスト: bye 1回/10回・11人目full・stale 1001 全部期待どおり。挙動差=hello timeout 5→5〜15秒・stale 15〜20→30〜40秒・visitorsは参加済み人数
  - 全体レポート `~/Desktop/main/AUDIT_cf_cost_20260906.md`
