import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Police Barlow hébergée avec le site (paquet @fontsource) au lieu de
// Google Fonts : le visiteur ne contacte aucun serveur tiers (RGPD)
import '@fontsource/barlow/400.css'
import '@fontsource/barlow/500.css'
import '@fontsource/barlow/600.css'
import '@fontsource/barlow/700.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
