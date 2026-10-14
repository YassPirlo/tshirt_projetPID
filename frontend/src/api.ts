// Tout ce qui parle au back-end est regroupé ici : les types renvoyés par
// l'API et les fonctions d'appel. Les composants n'écrivent jamais d'URL.

// Par défaut, les appels partent vers /api sur le serveur Vite, qui les
// transmet au back (voir le proxy dans vite.config.ts). Le navigateur ne
// parle qu'à une seule adresse : pas de blocage CORS, même si le site est
// ouvert via 127.0.0.1 ou si Vite démarre sur un autre port que 5173.
// Pour viser un autre back, définir VITE_API_URL dans un fichier .env.
const API_URL = import.meta.env.VITE_API_URL ?? ''

export type Categorie = {
  id: number
  nom: string
}

export type Marque = {
  id: number
  nom: string
}

export type Produit = {
  id: number
  nom: string
  prix: number
  imageUrl: string
  marque: Marque
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

// US3
export const getProduit = (id: number, signal?: AbortSignal) =>
  lireJson<Produit>(`/api/produits/${id}`, signal)

// Prix à la française : « 19,99 € » et non « 19.99 € »
const formatEuro = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})

export const formaterPrix = (prix: number) => formatEuro.format(prix)
