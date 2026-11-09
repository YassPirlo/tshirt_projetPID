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
  description:
    'Un blanc franc et intemporel, ce t-shirt à col rond se porte seul ou sous une veste.',
  matiere: '100 % coton peigné, 180 g/m²',
  entretien: 'Lavage à 30 °C, repassage doux',
  marque: { id: 1, nom: 'Nike' },
}

export const tshirtNoir: Produit = {
  id: 2,
  nom: 'T-shirt noir',
  prix: 19.99,
  imageUrl: '/images/tshirt-noir.svg',
  description:
    'Le noir essentiel de la garde-robe. Sa maille dense garde sa couleur lavage après lavage.',
  matiere: '100 % coton peigné, 185 g/m²',
  entretien: "Lavage à 30 °C sur l'envers, pas de sèche-linge",
  marque: { id: 2, nom: 'Adidas' },
}
