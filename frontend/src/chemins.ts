// Toutes les adresses du site sont écrites ici, une seule fois.
// Les composants n'écrivent jamais une adresse « à la main » : ils
// passent par ces fonctions, comme ils passent par api.ts pour le back.

export const chemins = {
  accueil: '/',
  categorie: (id: number) => `/categories/${id}`,
  produit: (categorieId: number, produitId: number) =>
    `/categories/${categorieId}/produits/${produitId}`,
  inscription: '/inscription',
  connexion: '/connexion',
  profil: '/profil',
  mentions: '/mentions-legales',
  confidentialite: '/confidentialite',
  cookies: '/cookies',
}

// Les mêmes adresses sous forme de modèles, pour <Route path="…"> :
// « :categorieId » est remplacé par ce qui se trouve dans l'adresse.
export const modeles = {
  categorie: '/categories/:categorieId',
  produit: '/categories/:categorieId/produits/:produitId',
}

// Lit un identifiant dans l'adresse. Tout ce qui n'est pas un nombre
// entier (« /categories/abc ») donne null : la page est introuvable.
export function lireId(texte: string | undefined): number | null {
  return texte && /^\d+$/.test(texte) ? Number(texte) : null
}
