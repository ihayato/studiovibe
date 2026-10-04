# Worker の管理元 (2026-10-01)

本番の写し `worker.prod-20260918.js` と `wrangler.jsonc` を追跡対象にした。
元の写しのSHA-256: `5edabebd6c03fd2e184dc65bdcb87679bb47e18226879cb60d71e8f0ecd30cf8`。
今回の変更は6つの入口のOrigin/Referer照合だけ。メール通知や他サイトへの中継は元の写しを維持する。
`api/` 側も同じ照合関数で修正。Workers側は既存のno-bundle配信のため関数を内包する。

配信前には本番Workerと元の写しの一致を再確認し、更新があれば最新ソースへ修正を移す。
未追跡の `public/senri/` 等の現行配信素材はこの隔離作業場所に含まれていないため、
この場所からサイト全体を直接配信しない。既存の本番配信手順と素材検査を使う。

## 2026-10-05: 公開3Dビューアの同一サイト内プレビュー

`/luna-occulta/media/models/<character>-<YYYYMMDD>/` と `index.html` だけ、
SAMEORIGIN と CSP `frame-ancestors 'self'` を許可する。他のページの DENY と
既存 BotID の例外は維持する。既存 CSP の他の制限も維持する。

今回は本番の main が管理ソース SHA-256
`5649323df807bdb8880b5a4ce5191854ecc1cbd3e686af72eef6a56a3c412b1b`
と一致することを確認し、107モジュールのうち main の6行だけ更新した。
静的素材の再送を避けるため Cloudflare の
[コードのみ置換 API](https://developers.cloudflare.com/api/resources/workers/subresources/scripts/subresources/content/methods/update/)
を使用した。`GET .../content/v2` で全モジュールを取得・保存・照合し、
各名前・MIME型・内容を保持して `PUT .../content` に渡す。metadata は
`main_module` だけ指定する。認証失敗・本番との差異があれば停止する。
本番更新後も全モジュールと `/settings` を再取得・照合する。
Cloudflare管理の `workers/triggered_by` 注釈だけは配信手段に応じて変わる。
`node --test test/*.test.js` と `bash scripts/verify-deploy.sh` で確認する。
