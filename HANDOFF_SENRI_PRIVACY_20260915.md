# 手控え: SENRI プライバシーポリシー頁の配信（2026-09-15・結）

- **公開**: https://vibe.co.jp/senri/privacy（`public/senri/privacy.html`・TestFlight 外部テストと審査に出す URL。消すと審査 URL が 404）。
- **本番の状態（09-15 15:3x）**: Worker `vibe` に、それまでの本番バンドル（Version fda0a12b の script を CF API から取得）＋ dist（この枝 `codex/meikyo-island` の build）で deploy。verify-deploy.sh 全項目OK。
- **地雷（新 Mac）**: ①`worker.js`・`wrangler.jsonc`・`https-redirect.js`・`api/luster-claim.js`・`public/.assetsignore` は **git に入っていない**（旧 Mac の作業木にだけあった）。この clone には旧 Mac の Time Machine 写し（`~/Developer/Recovered-TimeMachine/dev-second-20260912/vibe`）から `wrangler.jsonc` と `.assetsignore` を写し、worker は本番バンドル `worker.deployed.js` を使った（`wrangler deploy worker.deployed.js --no-autoconfig`）。旧 Mac 写しの `worker.js` には **未デプロイの https→https リダイレクト（09-11）** が入っているので、それを本番に出すかは本人裁定。②`public/video/hero-bg.mp4` は git の版（28.8MB）が 25MiB 上限を超えて deploy できない → 旧 Mac 写しの 23.6MB 版（本番と同じ）に差し替えて build。③wrangler 4.131 の framework 自動設定は Vite 5 で止まる → `--no-autoconfig`。
- **次に誰かが本番へ出すとき**: 上の未追跡ファイルを揃えてから。`worker.js` を git に入れるかは本人裁定（秘密は含まないか確認してから）。
