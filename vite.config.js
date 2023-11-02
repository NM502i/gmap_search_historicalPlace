import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Unfonts from 'unplugin-fonts/vite'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  plugins: [
    vue(),
    VitePWA({
      manifest: {
        lang: 'ja',
        name: '史跡チェッカー',
        short_name: '史跡チェッカー',
        start_url: "/",
        background_color: '#3399E3',
        theme_color: '#3399E3',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            src: '/img/app-icons/72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: '/img/app-icons/96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: '/img/app-icons/128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: '/img/app-icons/144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: '/img/app-icons/152x152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: '/img/app-icons/192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/img/app-icons/384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: '/img/app-icons/512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
    Unfonts({
      google: {
        families: ['Sawarabi Mincho'],
      },
    }), 
  ],
})
