// Tout ce qui parle au back-end est regroupé ici : les types renvoyés par
// l'API et les fonctions d'appel. Les composants n'écrivent jamais d'URL.

// L'adresse du back peut être changée dans un fichier .env
// (VITE_API_URL=http://...) sans toucher au code.
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export type Categorie = {
  id: number
  nom: string
}

export type Produit = {
  id: number
  nom: string
  prix: number
  imageUrl: string
}

// Lit une réponse JSON et lève une erreur si le serveur répond 4xx ou 5xx.
// Le signal permet d'annuler la requête si l'utilisateur change d'avis.
async function lireJson<T>(chemin: string, signal?: AbortSignal): Promise<T> {
  const reponse = await fetch(API_URL + chemin, { signal })
  if (!reponse.ok) throw new Error('Erreur ' + reponse.status)
  return reponse.json()
}

// US1
export const getCategories = (signal?: AbortSignal) =>
  lireJson<Categorie[]>('/api/categories', signal)

// US2
export const getProduitsDeCategorie = (id: number, signal?: AbortSignal) =>
  lireJson<Produit[]>(`/api/categories/${id}/produits`, signal)

// Prix à la française : « 19,99 € » et non « 19.99 € »
const formatEuro = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})

export const formaterPrix = (prix: number) => formatEuro.format(prix)
