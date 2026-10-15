// Données de test communes, reprises de database/schema.sql
import type { Categorie, Produit } from '../api'

export const classiques: Categorie = { id: 1, nom: 'T-shirts classiques' }
export const slim: Categorie = { id: 2, nom: 'T-shirts slim' }
export const nouveautes: Categorie = { id: 3, nom: 'Nouveautes' }

export const tshirtBlanc: Produit = {
  id: 1,
  nom: 'T-shirt blanc',
  prix: 19.99,
  imageUrl: '/images/tshirt-blanc.svg',
  marque: { id: 1, nom: 'Nike' },
}

export const tshirtNoir: Produit = {
  id: 2,
  nom: 'T-shirt noir',
  prix: 19.99,
  imageUrl: '/images/tshirt-noir.svg',
  marque: { id: 2, nom: 'Adidas' },
}
