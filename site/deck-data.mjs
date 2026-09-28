// 制作レポート（/report/deck）のグラフに使う実データ。2026-09-28 に cn-kitan のリポジトリから数えた値。
// 数え方を変えずに更新するときは、HANDOFF_STUDIO_RENEWAL_20260928.md の「データの数え方」を参照。
// 推測・見込みの数字は入れない（公開資料のため）。

// 週ごとのコミット数（すべての作業ブランチの合計。git log --all を ISO 週で集計。週の初日＝月曜で表記）
// 最初のコミットは 2026-07-03。9/28 からの週は集計途中のため除外。
export const COMMITS_WEEKLY = [
  ['6/29', 53], ['7/6', 129], ['7/13', 192], ['7/20', 241], ['7/27', 220], ['8/3', 116], ['8/10', 163],
  ['8/17', 204], ['8/24', 194], ['8/31', 106], ['9/7', 429], ['9/14', 624], ['9/21', 1033],
]
export const COMMITS_TOTAL = 3737 // 9/28 時点・全ブランチ

// 自動テストのケース数（各週末時点のコードで test( / testWidgets( の定義を数えた）
export const TESTS_WEEKLY = [
  ['7/12', 382], ['7/19', 619], ['7/26', 851], ['8/2', 1055], ['8/9', 1131], ['8/16', 1461],
  ['8/23', 1685], ['8/30', 1891], ['9/6', 1931], ['9/13', 2245], ['9/20', 2480], ['9/28', 2524],
]
export const TEST_FILES = { first: 82, last: 487 } // テストファイル数（7/12 → 9/28）

// 点検・レビューの報告書（依頼書を除く）。月別、うち開発とは別のAI（OpenAI Codex）によるもの
export const REVIEWS_MONTHLY = [
  { month: '7月', codex: 1, other: 1 },
  { month: '8月', codex: 2, other: 4 },
  { month: '9月', codex: 9, other: 2 },
]

// プライバシーの照合（2026年9月）
export const PRIVACY = { total: 28, matched: 25, toAdd: 3 }

// 画面サイズの自動巡回（幅×高さ、文字の大きさ 標準／1.3倍）
export const SCREENS = [
  { name: 'iPhone SE', w: 375, h: 667 },
  { name: 'iPhone 12', w: 390, h: 844 },
  { name: 'Pro Max', w: 430, h: 932 },
  { name: '拡大表示', w: 320, h: 693 },
]

// 変更のたびに走る自動チェック（9本）
export const CI_JOBS = [
  '変更範囲の判定', '公開前の一括検査', 'アプリのテスト', '品質の約束ごと', 'サーバーのテスト',
  '会話AIのテスト', '攻略AIのテスト', '運営画面の検査', 'Android 本番ビルド',
]

// 登場するキャラクター（app/lib/game_data.dart の Hero( 定義の数）
export const CHARACTERS = 37

// ---------- 費用（2026-09-28 調査） ----------
// fal（画像・動画・音声・3D の生成API）: 2025-01-01〜2026-08-13 のアカウント全体の利用実績（USD）。
// 同じアカウントで行った教材制作の生成も一部含む参考値（本人裁定 09-28: 教材分は少額のため参考値として掲載）。
// 出典: main/fal-textbook/ledger/COST_LEDGER.md（fal の usage 画面の読み取り）
export const FAL_TOTAL_USD = 3256.99
export const FAL_BREAKDOWN = [
  { key: 'video', label: '動画', usd: 1043.24, note: 'Seedance 2.0 mini（5秒720p換算で約2,600本相当）' },
  { key: 'image', label: '画像', usd: 1221.55, note: '主な3モデル（約11,900枚）' },
  { key: 'voice', label: '音声', usd: 225.32, note: '約229万文字' },
  { key: '3d', label: '3D', usd: 34.7, note: '3Dモデル化' },
  { key: 'other', label: 'そのほか', usd: 732.18, note: '上記以外のモデル（計70以上）' },
]
export const FAL_JULY_USD = 1331.53 // 2026年7月（1か月分）
export const USD_JPY = 150 // 円の目安の換算に使うレート（表示で明記する）

// 生成の単価（fal の usage 画面の単価、2026-08-13 時点）
export const UNIT_COSTS = [
  { what: '画像 1枚', usd: '0.04〜0.08', yen: '約6〜12円', note: '高品質設定の画像編集は 1枚 約0.22' },
  { what: '動画 5秒（720p）', usd: '0.40', yen: '約60円', note: 'ゲーム素材は480pで作り、手元で拡大' },
  { what: 'ボイス 1,000文字', usd: '0.10', yen: '約15円', note: 'セリフ1本は数円' },
]

// Cloudflare: 2026-08-15〜09-14 の30日間の実測（アカウント全体＝公式サイト等を含む）。出典: AUDIT_CAPACITY_20260914.md
// used / included は同じ単位。over は月額プランの範囲を超えた分の概算（USD/月）
export const CF_USAGE = [
  { what: 'アクセス処理', used: 20.2, included: 10, unit: '百万回', over: '約3ドル' },
  { what: 'データ読み取り', used: 7.7, included: 25, unit: '十億行', over: 'なし' },
  { what: 'データ書き込み', used: 16.5, included: 50, unit: '百万行', over: 'なし' },
  { what: 'メール送信', used: 3295, included: 3000, unit: '通', over: '1ドル未満' },
]
export const CF_R2 = { contentGB: 6.27, egressGB: 128 } // ゲーム素材の保存量と、30日の配信量（R2 は配信料なし）

// 会話AI（御霊と話す機能）1回あたりの費用の推移（円・目安）。出典: HANDOFF_TAKUSEN.md
export const LLM_COST_STEPS = [
  { when: '7月', yen: 1.5, how: '定額の中継サービス経由' },
  { when: '7月末', yen: 0.2, how: '中継をやめて直接利用' },
  { when: '9月', yen: 0.08, how: '低料金のAIに変更' },
]
export const LLM_DAILY_CAP = 2000 // 全体の1日あたり上限（問）

// AI開発ツール（コードを書く・調べる・レビューするAI）。月蝕綺譚の約2か月の開発で使った契約（本人申告 09-28）
export const AI_TOOLS = [
  { name: 'Claude Code', plan: 'Max（月200ドル）', accounts: 12, usdPerMonth: 200 },
  { name: 'Codex', plan: 'ChatGPT Pro（月200ドル）', accounts: 1, usdPerMonth: 200 },
]
export const AI_TOOLS_MONTHS = 2
