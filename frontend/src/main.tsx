import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
// Police Barlow hébergée avec le site (paquet @fontsource) au lieu de
// Google Fonts : le visiteur ne contacte aucun serveur tiers (RGPD)
import '@fontsource/barlow/400.css'
import '@fontsource/barlow/500.css'
import '@fontsource/barlow/600.css'
import '@fontsource/barlow/700.css'
import '@fontsource/archivo-black/400.css'
import './index.css'
import App from './App.tsx'
import { FournisseurAuth } from './FournisseurAuth.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* FournisseurAuth entoure toute l'application : useAuth() ne
        fonctionne que pour les composants placés à l'intérieur. */}
    <FournisseurAuth>
      {/* BrowserRouter relie l'application à la barre d'adresse : chaque
          page a sa propre adresse, sans rechargement */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </FournisseurAuth>
  </StrictMode>,
)
