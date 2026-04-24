import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                about: resolve(__dirname, 'about.html'),
                blog: resolve(__dirname, 'blog.html'),
                blogPost: resolve(__dirname, 'blog-post.html'),
                virtualOffice: resolve(__dirname, 'vertual-office.html'),
            },
        },
    },
})
