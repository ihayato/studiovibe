import { defineConfig } from 'vite'
import { resolve } from 'path'

const islandRootEntry = () => ({
    name: 'island-root-entry',
    enforce: 'post',
    generateBundle(_, bundle) {
        const root = bundle['index.html']
        const island = bundle['poc/island/index.html']
        if (!root || root.type !== 'asset' || !island || island.type !== 'asset') return
        const islandHtml = String(island.source).replace(
            '<head>',
            '<head>\n  <base href="/poc/island/" />',
        )
        root.source = islandHtml
    },
})

export default defineConfig({
    plugins: [islandRootEntry()],
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
                about: resolve(__dirname, 'about.html'),
                contact: resolve(__dirname, 'contact.html'),
                blog: resolve(__dirname, 'blog.html'),
                blogPost: resolve(__dirname, 'blog-post.html'),
                virtualOffice: resolve(__dirname, 'vertual-office.html'),
                lunaOccultaPrivacy: resolve(__dirname, 'luna-occulta/privacy.html'),
                licenses: resolve(__dirname, 'licenses.html'),
                island: resolve(__dirname, 'poc/island/index.html'),
            },
        },
    },
})
