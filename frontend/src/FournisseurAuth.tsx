// Composant qui fournit l'état du compte connecté à toute l'application
// (US4 à US7). Le contexte et le hook useAuth sont dans ContexteAuth.ts.
//
// CE QUE CE FICHIER NE FAIT PAS :
// il ne contient ni l'appel d'inscription (US4), ni celui de connexion
// (US5), ni celui de déconnexion (US6). Chaque page appelle son endpoint
// elle-même, puis prévient le contexte avec definirUtilisateur() ou
// oublierUtilisateur(). La logique de chaque US reste dans sa page.

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { getProfil, type Utilisateur } from './api'
import { ContexteAuth } from './ContexteAuth'

export function FournisseurAuth({ children }: { children: ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null)
  const [chargement, setChargement] = useState(true)

  // Au démarrage, on demande au back qui est connecté.
  //
  // C'est nécessaire parce que la session vit côté serveur : après un F5,
  // le front a tout oublié, mais le cookie JSESSIONID est toujours dans
  // le navigateur. Cet appel permet de retrouver l'utilisateur.
  //
  // On ne stocke volontairement RIEN dans localStorage : une information
  // de connexion conservée côté navigateur peut être modifiée par
  // l'utilisateur, et ne prouve rien. Le serveur reste seul juge.
  useEffect(() => {
    const controleur = new AbortController()

    getProfil(controleur.signal)
      .then((compte) => setUtilisateur(compte))
      .catch(() => {
        // 401 attendu quand personne n'est connecté : ce n'est pas une
        // erreur à afficher, on reste simplement déconnecté.
        if (!controleur.signal.aborted) setUtilisateur(null)
      })
      .finally(() => {
        if (!controleur.signal.aborted) setChargement(false)
      })

    return () => controleur.abort()
  }, [])

  // useCallback : ces fonctions gardent la même identité entre deux
  // rendus, ce qui évite de faire re-rendre inutilement les composants
  // qui les reçoivent.
  const definirUtilisateur = useCallback(
    (compte: Utilisateur) => setUtilisateur(compte),
    [],
  )

  const oublierUtilisateur = useCallback(() => setUtilisateur(null), [])

  return (
    <ContexteAuth.Provider
      value={{
        utilisateur,
        chargement,
        definirUtilisateur,
        oublierUtilisateur,
      }}
    >
      {children}
    </ContexteAuth.Provider>
  )
}
