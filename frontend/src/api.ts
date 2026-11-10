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
  // Champs facultatifs : certains produits de test n'ont pas de fiche détaillée.
  description?: string
  matiere?: string
  entretien?: string
  marque: Marque
  // Renvoyée par le back sur le détail d'un produit. Sert à corriger une
  // adresse qui placerait le produit dans la mauvaise catégorie.
  categorie?: Categorie
}

// Compte client (US4 à US7). Le mot de passe n'y figure pas : le back
// ne le renvoie jamais, même haché.
export type Utilisateur = {
  id: number
  email: string
  nom: string
  prenom: string
}

// Erreur qui conserve le code HTTP, pour que l'appelant puisse réagir
// différemment selon le cas : 409 = email déjà pris (US4),
// 401 = identifiants refusés (US5), 404 = pas connecté (US7).
export class ErreurHttp extends Error {
  readonly statut: number

  constructor(statut: number, message?: string) {
    super(message ?? 'Erreur ' + statut)
    this.statut = statut
  }
}

// credentials: 'include' est indispensable dès qu'il y a une session :
// sans lui, le navigateur n'envoie pas le cookie JSESSIONID et le back
// considère chaque appel comme anonyme. On le met sur TOUS les appels,
// pas seulement ceux du compte, pour ne pas avoir à y penser plus tard.
const optionsCommunes: RequestInit = { credentials: 'include' }

// Lit une réponse JSON et lève une erreur si le serveur répond 4xx ou 5xx.
// Le signal permet d'annuler la requête si l'utilisateur change d'avis.
async function lireJson<T>(chemin: string, signal?: AbortSignal): Promise<T> {
  const reponse = await fetch(API_URL + chemin, { ...optionsCommunes, signal })
  if (!reponse.ok) throw new ErreurHttp(reponse.status)
  return reponse.json()
}

// Envoie un POST en JSON. Utilisé par l'inscription (US4), la connexion
// (US5) et la déconnexion (US6).
//
// Le back peut répondre sans corps (déconnexion) : on renvoie alors null,
// d'où le type de retour T | null.
async function envoyerJson<T>(
  chemin: string,
  corps?: unknown,
  signal?: AbortSignal,
): Promise<T | null> {
  const reponse = await fetch(API_URL + chemin, {
    ...optionsCommunes,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: corps === undefined ? undefined : JSON.stringify(corps),
    signal,
  })

  if (!reponse.ok) {
    // On tente de lire le message d'erreur du back s'il en a mis un,
    // sinon on garde le message par défaut lié au code HTTP.
    let message: string | undefined
    try {
      const donnees = await reponse.json()
      if (typeof donnees?.message === 'string') message = donnees.message
    } catch {
      // Réponse sans JSON exploitable : on ignore.
    }
    throw new ErreurHttp(reponse.status, message)
  }

  // 204 No Content, ou corps vide : rien à décoder.
  if (reponse.status === 204) return null
  const texte = await reponse.text()
  return texte ? (JSON.parse(texte) as T) : null
}

export { envoyerJson }

// US1
export const getCategories = (signal?: AbortSignal) =>
  lireJson<Categorie[]>('/api/categories', signal)

// US2
export const getProduitsDeCategorie = (id: number, signal?: AbortSignal) =>
  lireJson<Produit[]>(`/api/categories/${id}/produits`, signal)

// US3
export const getProduit = (id: number, signal?: AbortSignal) =>
  lireJson<Produit>(`/api/produits/${id}`, signal)

// US7 : le compte actuellement connecté, d'après le cookie de session.
// Lève une ErreurHttp 401 si personne n'est connecté : c'est ce que
// ContexteAuth utilise au démarrage pour savoir s'il reste une session.
export const getProfil = (signal?: AbortSignal) =>
  lireJson<Utilisateur>('/api/profil', signal)

// Prix à la française : « 19,99 € » et non « 19.99 € »
const formatEuro = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})

export const formaterPrix = (prix: number) => formatEuro.format(prix)
