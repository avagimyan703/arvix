// defineConfig берётся из 'vitest/config', а не из 'vite': это надмножество
// конфига Vite, которое дополнительно знает про секцию test. Нужно для Vitest 4.
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // GitHub Pages отдаёт проект с подпути (username.github.io/arvix/), а не
  // с корня домена. Без base все ссылки на ассеты и манифест PWA целились
  // бы в корень, где ничего нет, и офлайн-режим на реальном хостинге
  // просто не собрался бы.
  base: '/arvix/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // includeAssets не нужен: globPatterns ниже уже ловит всё из public/,
      // которое Vite копирует в dist. Иначе иконки попадают в предкеш дважды.
      manifest: {
        name: 'Arvix — тренажёрный помощник',
        short_name: 'Arvix',
        description: 'Техника, подходы и прогрессия под рукой в зале',
        lang: 'ru',
        // Абсолютные '/' указывали бы на корень домена, а не на подпуть
        // GitHub Pages — из-за этого «добавить на экран» открывало бы 404.
        start_url: '/arvix/',
        scope: '/arvix/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0f1115',
        theme_color: '#0f1115',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Кадры и ролики упражнений — такая же часть офлайна, как код:
        // связь пропадает как раз в зале, в подвале с железом. Раньше
        // сюда попадали только js/css/html/json, и без сети разбор
        // движения оставался пустым прямоугольником.
        globPatterns: ['**/*.{js,css,html,json,png,jpg,svg,webmanifest,mp4}'],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
