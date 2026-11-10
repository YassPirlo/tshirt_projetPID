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
import App from '../App'
import { FournisseurAuth } from '../FournisseurAuth'

// Affiche toute l'application, contexte d'authentification compris.
export function rendreApp() {
  return render(
    <FournisseurAuth>
      <App />
    </FournisseurAuth>,
  )
}

// Affiche un composant isolé qui a besoin de useAuth().
export function rendreAvecAuth(contenu: ReactNode) {
  return render(<FournisseurAuth>{contenu}</FournisseurAuth>)
}
