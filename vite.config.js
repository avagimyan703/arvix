// defineConfig берётся из 'vitest/config', а не из 'vite': это надмножество
// конфига Vite, которое дополнительно знает про секцию test. Нужно для Vitest 4.
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
