# どーぱみんくりっかー！ 攻略帖 HANDOFF

公開先: https://vibe.co.jp/dopamin/guide/ （公式サイトの下・静的HTML）**09-30 本番配信済み**
始まり: 2026-09-30 本人「どぱくりに攻略サイトも作ろうか。月蝕綺譚みたいに」→ 裁定: 置き場=公式サイトの下／数字=**式も全部出す**／最初の頁=はじめ方・月蝕暁・なかま絵巻装備・困ったとき

## しくみ（数字は手書きしない）
1. ゲーム側の書き出し器 `kitan-clicker/app/test/tool_export_guide_test.dart`（枝 feat/guide-export-0930・作業木 dev/kitan-clicker-wt-guide・commit 8dc2df6c。本線 feat/ally-stats-20260923 へはまだ入れていない）
   ```
   cd <kitan-clicker の作業木>/app
   GUIDE_OUT=<vibe>/tools/dopamin-guide/guide_data.json flutter test test/tool_export_guide_test.dart
   ```
   本番の Bal / Econ / roster / gear / kaigan / quests をそのまま読む。定数が変わったら書き出し直すだけで頁が追いつく。
2. 組み立て `python3 tools/dopamin-guide/build_guide.py [--clicker <kitan-clicker 作業木>]`
   → `public/dopamin/guide/{,hajimekata,gesshoku,nakama,komatta}/index.html`・顔の絵 `public/dopamin/assets/img/face/<id>.webp`（ゲームの同梱 face_<id>.webp を写す）
3. 見た目 `public/dopamin/assets/guide.css`（site.css のトークンだけ）・押しどき計算機 `assets/guide.js`（式の定数は頁の data-grow / data-step）
4. 方向宣言 `tools/dopamin-guide/DESIGN_DIRECTION.md`
5. 公式サイトのトップ（public/dopamin/index.html）の上の帯に「攻略」、足元に「攻略帖」のリンクを足した

## 10-02 月神於兎の顔を杵の版へ（本人「攻略帖差し替えで」）
- ゲームで於兎URを肉球→黄金の杵へ作り直した（clicker ea8e2cfa）のに合わせ、`public/dopamin/assets/img/face/oto_getto.webp` だけ差し替え。本番枝 vibe e1eed22・Worker Version af44229c・dist 照合の差は顔1枚・verify-deploy 全項目OK。
- **本番 worker は 10-01 のセキュリティ修正版**（vibe c322999〜e116fc5・Origin 照合）。出し直すときは dev/vibe の HEAD の worker.prod-20260918.js を使う（古い写しで出すと修正が巻き戻る）。

## 09-30 本番配信（本人GO「5頁と公式トップの導線をまとめて出す」）
- vibe ae904b1（feat/dopamin-guide を本番枝 codex/meikyo-island へ早送り・push 済み）・Worker Version af70b175・verify-deploy 全項目OK・5頁と guide.css/js・顔・画面写真・栞が 200、公式トップの「攻略」リンク2つを本番で確認
- 配信前の照合: 本番 worker に今の worker.prod-20260918.js が丸ごと含まれる（取得 3.65MB）＝一致。dist 1383件のうち差は新しい攻略帖の頁と素材、公式トップの導線2行だけ。**本番の HTML はどれも +367 バイト＝Cloudflare Web Analytics の beacon の注入**（差に見えるが正常）
- 直して出し直すとき: build_guide.py → vibe-wt-guide でコミット → dev/vibe（本番枝）で早送り → 上の照合 → `wrangler deploy worker.prod-20260918.js --no-bundle --no-autoconfig --keep-vars` → `bash scripts/verify-deploy.sh`

## 09-30 第2版（本人「月蝕綺譚の攻略サイトにあわせて。デザインやフォント。図解が少なくてわかりにくいな」）
- 見た目を月蝕綺譚 攻略帖の昼（生成り・Shippori Mincho B1＋Zen Kaku Gothic New・羽二重・栞の一言・◆先に答え・目次）へ作り直した。方向宣言 DESIGN_DIRECTION.md 第2版（第1版＝宵闇ポップは廃止）
- 部品と図は `tools/dopamin-guide/guide_parts.py`（SVG・数字は guide_data.json 直結）。図15種＋実画面5枚（番号と凡例つき）
- 実画面: kitan-clicker `app/test/tool_shot_guide_test.dart`（`GUIDE_SHOTS=<vibe>/tools/dopamin-guide/shots flutter test …`）→ build_guide.py が cwebp で `public/dopamin/assets/img/guide/shot_*.webp` に。shots/ は git に入れない。戦場は ninmu_0..3 の4コマから技の帯が写っていないものを ninmu.png にして組む
- 収まり: 320幅で全5頁はみ出し0・本文12px未満0・図の字は最小10.3px（相剋の環の小字だけ9.6px）
- 装備の育ちはゲーム画面の表記に合わせて「Lv」（鍛冶場の画面だけ「段」）
- **Astra の事実点検は第1版の文面で3巡済み。第2版で足した図は同じ数字から描いているが、図そのものの点検はまだ**

## 現在地（09-30・第1版の時点）
- 5頁を組んだ（作業木 dev/vibe-wt-guide・枝 feat/dopamin-guide＝本番枝 codex/meikyo-island の cfaff11 から）。コミット済み・**未配信**（本人の目視待ち）
- 収まり検査: 390×844／375×667／320×693 で全5頁 はみ出し0・12.5px未満の文字0・式の横スクロール0
- Astra（Codex）の事実点検3巡: `~/Desktop/旧Mac救出/dopamin-guide_20260930/astra_fact_audit{,_r2,_r3}.md`。1巡目28件（出荷不可18）→2巡目 残6→3巡目 残2（宿の陰りの条件・計算機の説明式）→ Astra の直し案どおりに直した（4巡目は回していない）
- 1巡目の大物: num() の rstrip('0') が整数の0まで落として 90%→9%・80%→8%・20%→2% になっていた（直した）

## 決めごと・地雷
- 数字は guide_data.json から。頁に数を書くなら build_guide.py で data から計算する（例: 1520夜の1.6倍の見込みも per10 から出す）
- 仲間の数・隊の人数はコメントを信じない（partyMax はコメント「十人」でも値は9）
- 頭目（x5夜）は miniHpMult=0 で出ない＝頁に書かない
- 蝕片の本番式は econ.dart の exp 式（balance.dart の fragMode は読まれない）
- 装備の主効果の換え方（面・装束・草鞋）は game.dart 655〜663 の直書き＝書き出し器の 'conv' に写してある。ゲーム側を変えたら書き出し器も直す
- 奥義の一覧の cuts は演出の斬線の数（ダメージ回数ではない）＝頁に出さない
- 九割の月蝕: 最低でも解放夜。暁に数えない・おまけ無しは「今の巡りの最深が前の月蝕の最深以下」のときだけ（九割で押したかどうかではない）
- 計算機: 蝕片は巡りの最深で決まる＝押したい夜が最深より浅くても減らない（夜差を max(0, …)）
- 月蝕の盆の「◯倍」＝ multAfterEclipse / mult。上乗せ分は 10夜で ×per10（=1.055^(10/4.5)）。盆の数字は小数第1位切り捨て
- 公式サイトの「広告なし」は書かない（自社の告知はある）。「アプリ内課金なし」はOK
- 配信は vibe の型（memory vibe-site-deploy-new-mac）: 本番枝へ取り込み→dist 突き合わせ→wrangler deploy。**本人の GO を取ってから**

## 次にやること
1. （済）本番配信。第2版の図そのものの Astra 点検はまだ＝次に直すときに一緒に
2. 書き出し器を本線（feat/ally-stats-20260923）へ合流
3. 次の頁候補: 月の通い路（tomoshibi.dart の kShuku/kShijin/kStars をそのまま表に）・月例試練・番付・一点物の集め方
