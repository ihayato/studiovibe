import { defineConfig } from 'vite'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { renderWorks, WORKS_COUNT } from './site/works.mjs'
import { renderVideos, CHANNEL_URL, VIDEO_TOTAL } from './site/videos.mjs'
import { renderPricing } from './site/pricing.mjs'
import { renderFaq, faqJsonLd } from './site/faq.mjs'
import { renderDeck, renderDeckToc, DECK_COUNT } from './site/deck.mjs'
import { CF_BEACON_TOKEN } from './site/config.mjs'

// スタジオサイトの共通部品（head/header/footer）を各ページへ差し込む。
// 書式: <!-- @head --> / <!-- @header works --> / <!-- @footer --> / <!-- @footer nobar -->
//       <!-- @works featured|all --> / {{worksCount}}（作品台帳は site/works.mjs）
//       <!-- @videos [N] --> / {{channelUrl}} / {{videoTotal}}（YouTube台帳は site/videos.mjs）
//       <!-- @pricing compact|full -->（料金台帳は site/pricing.mjs）/ <!-- @guide-banner --> / <!-- @analytics -->（site/config.mjs）
// 旧: 島(poc/island)をトップに差し替えていた island-root-entry は 2026-09-28 のリニューアルで廃止。
// 島は Worker の /island → /poc/island/ で配信している。
const partial = (name) => readFileSync(resolve(__dirname, 'site/partials', `${name}.html`), 'utf8')
const CTA_BAR = `<div class="cta-bar" aria-label="制作のご相談">
  <p class="caption">ゲーム・アニメ制作 30万円〜<br>3営業日以内にお返事します</p>
  <a class="btn btn-primary" href="/contact">相談する</a>
</div>`
const studioPartials = () => ({
    name: 'studio-partials',
    transformIndexHtml: {
        order: 'pre',
        handler(html) {
            return html
                .replace('<!-- @head -->', () => partial('head'))
                .replace(/<!-- @header ?(\w*) -->/, (_, page) =>
                    partial('header').replace(/\{\{(\w+)\}\}/g, (_m, key) => (key === page ? ' aria-current="page"' : '')))
                .replace(/<!-- @footer ?(\w*) -->/, (_, flag) =>
                    partial('footer').replace('{{ctaBar}}', flag === 'nobar' ? '' : CTA_BAR))
                .replace(/<!-- @works (\w+) -->/, (_, mode) => renderWorks(mode))
                .replaceAll('{{worksCount}}', String(WORKS_COUNT))
                .replace(/<!-- @videos ?(\d*) -->/, (_, n) => renderVideos(n ? Number(n) : 0))
                .replaceAll('{{channelUrl}}', CHANNEL_URL)
                .replaceAll('{{videoTotal}}', String(VIDEO_TOTAL))
                .replace(/<!-- @pricing (\w+) -->/, (_, mode) => renderPricing(mode))
                .replace('<!-- @guide-banner -->', () => partial('guide-banner'))
                .replace('<!-- @faq -->', () => renderFaq())
                .replace('<!-- @deck -->', () => renderDeck())
                .replace('{{deckToc}}', () => renderDeckToc())
                .replaceAll('{{deckCount}}', () => String(DECK_COUNT()))
                .replace('<!-- @faq-jsonld -->', () => `<script type="application/ld+json">${faqJsonLd()}</script>`)
                .replace('<!-- @analytics -->', () => (CF_BEACON_TOKEN
                    ? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${CF_BEACON_TOKEN}", "spa": true}'></script>`
                    : ''))
        },
    },
    // dev サーバーでも本番（Worker の auto-trailing-slash）と同じく /works で works.html を返す
    configureServer(server) {
        server.middlewares.use((req, _res, next) => {
            const clean = { '/works': '/works.html', '/services': '/services.html', '/about': '/about.html', '/contact': '/contact.html', '/report': '/report.html', '/report/deck': '/report/deck.html' }
            const [path, q] = req.url.split('?')
            if (clean[path]) req.url = clean[path] + (q ? `?${q}` : '')
            next()
        })
    },
})

// dev サーバーでは、本番で別Worker／別の場所から配信している作品サイトを本番へ中継する。
// （作品カードを押しても「飛ばない」＝devに無いので トップへ戻ってしまう、の対策。本番の挙動は Worker 側で変わらない）
const PROD = 'https://vibe.co.jp'
const PROD_PATHS = ['/luna-occulta', '/hankacho', '/mitaseo', '/sakuya', '/luna-catenata', '/dopamin', '/tsukiawase', '/otetsudai', '/senri', '/island', '/ikkyo', '/rondo']
const devProxy = Object.fromEntries(PROD_PATHS.map((p) => [`^${p}(/|$|\\?)`, { target: PROD, changeOrigin: true, secure: true }]))

export default defineConfig({
    plugins: [studioPartials()],
    server: { proxy: devProxy },
    build: {
        target: 'es2022', // 島(main.js)のトップレベルawaitのため
        // Three.js は島の描画ランタイムとして 592kB に固定。アプリ本体は別チャンクへ分離済み。
        chunkSizeWarningLimit: 600,
        // HUDボタン等の小さなUI画像(9〜13KB)をdata URIで埋め込み、モバイル回線での読み込み失敗を根絶する
        assetsInlineLimit: 16384,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules/three/')) return 'island-three'
                    if (id.includes('/poc/island/net.js')) return 'island-network'
                },
            },
            input: {
                main: resolve(__dirname, 'index.html'),
                works: resolve(__dirname, 'works.html'),
                services: resolve(__dirname, 'services.html'),
                report: resolve(__dirname, 'report.html'),
                reportDeck: resolve(__dirname, 'report/deck.html'),
                about: resolve(__dirname, 'about.html'),
                contact: resolve(__dirname, 'contact.html'),
                blog: resolve(__dirname, 'blog.html'),
                blogPost: resolve(__dirname, 'blog-post.html'),
                virtualOffice: resolve(__dirname, 'vertual-office.html'),
                // 月蝕綺譚のプライバシーポリシー(ASC/Play Console提出URL=消すと審査URLが404)。
                // 2026-07-24監査P0-3で千夜AI利用・引き継ぎ30日失効を反映した改定版
                lunaOccultaPrivacy: resolve(__dirname, 'luna-occulta/privacy.html'),
                licenses: resolve(__dirname, 'licenses.html'),
                island: resolve(__dirname, 'poc/island/index.html'),
                worldPort: resolve(__dirname, 'worlds/index.html'),
                meikyo: resolve(__dirname, 'worlds/meikyo/index.html'),
                luna: resolve(__dirname, 'worlds/luna/index.html'),
                hankacho: resolve(__dirname, 'worlds/hankacho/index.html'),
            },
        },
    },
})
