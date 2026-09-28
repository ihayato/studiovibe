// サイト設定。
// Cloudflare Web Analytics のトークン（ダッシュボード → Web Analytics → サイト追加で発行）。
// 空のあいだは計測タグを出さない。入れると全ページの <head> に beacon が入り、
// 問い合わせ完了（/contact?sent=1）と資料請求完了（/report?sent=1）が擬似ページビューとして数えられる。
export const CF_BEACON_TOKEN = ''
