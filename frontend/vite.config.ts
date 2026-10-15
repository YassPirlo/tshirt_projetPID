import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Les appels à /api sont transmis au serveur Spring (port 8080).
    // 127.0.0.1 plutôt que localhost : sur certains Mac, localhost est
    // d'abord résolu en IPv6 (::1) et la connexion au back échoue.
    proxy: {
      '/api': 'http://127.0.0.1:8080',
    },
  },
  // Tests unitaires (npm test) : jsdom simule un navigateur dans Node
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
