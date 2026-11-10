// Le contexte d'authentification et son hook de lecture (US4 à US7).
//
// Ce fichier ne contient volontairement AUCUN composant : le composant
// fournisseur est dans FournisseurAuth.tsx. C'est une contrainte de
// l'outillage React (le rafraîchissement à chaud ne fonctionne que si un
// fichier exporte soit des composants, soit autre chose, pas les deux),
// et ESLint la vérifie.
//
// POURQUOI UN CONTEXTE ET PAS UN useState DANS App ?
// Plusieurs composants éloignés ont besoin de savoir qui est connecté :
// l'en-tête (afficher « Mon profil » ou « Se connecter »), la page de
// connexion, la page de profil. Passer l'information de parent en enfant
// à travers tous les niveaux serait lourd. Le contexte la rend accessible
// partout, sans la faire traverser les composants intermédiaires.

import { createContext, useContext } from 'react'
import type { Utilisateur } from './api'

export type ValeurContexteAuth = {
  // null = personne n'est connecté
  utilisateur: Utilisateur | null
  // true pendant la vérification initiale de la session, pour éviter
  // d'afficher « Se connecter » une fraction de seconde à un utilisateur
  // qui est en fait déjà connecté
  chargement: boolean
  // À appeler après une connexion ou une inscription réussie
  definirUtilisateur: (utilisateur: Utilisateur) => void
  // À appeler après une déconnexion réussie
  oublierUtilisateur: () => void
}

export const ContexteAuth = createContext<ValeurContexteAuth | null>(null)

// Raccourci utilisé par les composants : const { utilisateur } = useAuth()
//
// L'erreur explicite évite un bug difficile à diagnostiquer : sans elle,
// un composant placé en dehors du FournisseurAuth recevrait null et
// planterait plus loin avec un message incompréhensible.
export function useAuth() {
  const valeur = useContext(ContexteAuth)
  if (valeur === null) {
    throw new Error('useAuth doit être utilisé dans un FournisseurAuth')
  }
  return valeur
}
