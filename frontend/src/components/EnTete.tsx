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
  // US4 à US7 : ouvre le profil si connecté, la connexion sinon
  onCompte: () => void
  connecte: boolean
}

// Actions encore sans US : favoris et panier (US8, US9).
// La recherche et le compte sont écrits à la main plus bas, le premier
// parce qu'il garde sa place dans l'ordre, le second parce qu'il est
// désormais cliquable.
const actionsInactives = [
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
  onCompte,
  connecte,
}: Props) {
  return (
    <header className="entete">
      <button
        type="button"
        className="logo entete-logo"
        onClick={onAccueil}
      >
        <img
          src="/images/logo-face-header.png"
          alt="FACE, retour à l'accueil"
          width={162}
          height={96}
        />
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
        <li>
          <button
            type="button"
            aria-label="Rechercher"
            aria-disabled="true"
            title="Rechercher (bientôt disponible)"
          >
            <IconeRecherche />
          </button>
        </li>
        <li>
          {/* Le libellé change selon l'état : un lecteur d'écran annonce
              « Mon profil » ou « Se connecter », pas une icône muette. */}
          <button
            type="button"
            aria-label={connecte ? 'Mon profil' : 'Se connecter'}
            title={connecte ? 'Mon profil' : 'Se connecter'}
            onClick={onCompte}
          >
            <IconeCompte />
          </button>
        </li>
        {actionsInactives.map(({ nom, Icone }) => (
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
