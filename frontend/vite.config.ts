import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Les appels à /api sont transmis au serveur Spring (port 8080).
    // 127.0.0.1 plutôt que localhost : sur certains Mac, localhost est
    // d'abord résolu en IPv6 (::1) et la connexion au back échoue.
    //
    // On retire l'en-tête Origin avant de transmettre. Pour le navigateur,
    // /api est sur la même adresse que le site : ce n'est PAS une requête
    // cross-origin. Mais il ajoute quand même Origin à chaque POST, et le
    // back, qui ne voit que cet en-tête, la prendrait pour une requête
    // venant d'un autre site. Il répondrait alors 403 dès que l'adresse
    // n'est pas exactement http://localhost:5173 (autre port, 127.0.0.1…),
    // donc sur l'inscription, la connexion et la déconnexion.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        configure: (proxy) => {
          proxy.on('proxyReq', (requete) => requete.removeHeader('origin'))
        },
      },
    },
  },
  // Tests unitaires (npm test) : jsdom simule un navigateur dans Node
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
