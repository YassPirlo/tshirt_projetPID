// Utilitaires de rendu pour les tests.
//
// App appelle useAuth(), donc il doit être affiché à l'intérieur d'un
// FournisseurAuth. Plutôt que de le répéter dans chaque fichier de test,
// on passe par rendreApp().
//
// Les tests des US4 à US7 utiliseront aussi rendreAvecAuth() pour
// afficher un composant isolé en ayant accès au contexte.

import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router'
import App from '../App'
import { FournisseurAuth } from '../FournisseurAuth'

// Affiche toute l'application, contexte d'authentification et routeur
// compris, comme dans main.tsx.
//
// adresse : la page sur laquelle « arrive » le visiteur. On la remet à
// chaque appel, parce que jsdom garde la même barre d'adresse d'un test
// à l'autre.
export function rendreApp(adresse = '/') {
  window.history.replaceState(null, '', adresse)
  return render(
    <FournisseurAuth>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </FournisseurAuth>,
  )
}

// Affiche un composant isolé qui a besoin de useAuth().
export function rendreAvecAuth(contenu: ReactNode) {
  return render(<FournisseurAuth>{contenu}</FournisseurAuth>)
}
