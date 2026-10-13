import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Les appels à /api sont transmis au serveur Spring (port 8080)
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})