// defineConfig берётся из 'vitest/config', а не из 'vite': это надмножество
// конфига Vite, которое дополнительно знает про секцию test. Нужно для Vitest 4.
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
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
        start_url: '/',
        scope: '/',
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
        // Гифки тяжелее стандартного лимита в 2 МБ — поднимаем, иначе они
        // не попадут в предварительный кеш и в зале без сети не откроются.
        //
        // png в шаблоне нет намеренно: иконки в предкеш добавляет сам плагин
        // из манифеста, и шаблон продублировал бы их вторыми записями.
        globPatterns: ['**/*.{js,css,html,json,gif}'],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
