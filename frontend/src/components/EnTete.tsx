import type { Categorie } from '../api'
import {
  IconeCompte,
  IconeFavoris,
  IconePanier,
  IconeRecherche,
} from './Icones'

type Props = {
  categories: Categorie[]
  chargement: boolean
  categorieActive: Categorie | null
  onChoisir: (categorie: Categorie) => void
  onAccueil: () => void
}

// Les actions de droite seront branchées plus tard :
// compte (US4 à US7) et panier (US8, US9).
const actions = [
  { nom: 'Rechercher', Icone: IconeRecherche },
  { nom: 'Mon compte', Icone: IconeCompte },
  { nom: 'Favoris', Icone: IconeFavoris },
  { nom: 'Panier', Icone: IconePanier },
]

// En-tête classique de boutique : logo à gauche, catégories au centre
// (US1), actions à droite.
function EnTete({
  categories,
  chargement,
  categorieActive,
  onChoisir,
  onAccueil,
}: Props) {
  return (
    <header className="entete">
      <button type="button" className="logo" onClick={onAccueil}>
        TshirtShop
      </button>

      <nav aria-label="Catégories" className="entete-menu">
        {chargement ? (
          <p className="entete-attente">Chargement…</p>
        ) : (
          <ul>
            {categories.map((categorie) => (
              <li key={categorie.id}>
                <button
                  type="button"
                  onClick={() => onChoisir(categorie)}
                  aria-pressed={categorieActive?.id === categorie.id}
                >
                  {categorie.nom}
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>

      <ul className="entete-actions">
        {actions.map(({ nom, Icone }) => (
          <li key={nom}>
            <button
              type="button"
              aria-label={nom}
              aria-disabled="true"
              title={nom + ' (bientôt disponible)'}
            >
              <Icone />
            </button>
          </li>
        ))}
      </ul>
    </header>
  )
}

export default EnTete
