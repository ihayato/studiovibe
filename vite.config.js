import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    build: {
        target: 'es2022', // 島(main.js)のトップレベルawaitのため
        rollupOptions: {
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
