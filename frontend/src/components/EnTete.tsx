import type { Categorie } from '../api'

type Props = {
  categories: Categorie[]
  chargement: boolean
  categorieActive: Categorie | null
  onChoisir: (categorie: Categorie) => void
  onAccueil: () => void
}

// Barre du haut, toujours visible : le nom du site ramène à l'accueil.
// Le menu des catégories n'apparaît qu'en dehors de l'accueil, où la
// grande liste des catégories joue déjà ce rôle.
function EnTete({
  categories,
  chargement,
  categorieActive,
  onChoisir,
  onAccueil,
}: Props) {
  return (
    <header className="entete">
      <button type="button" className="marque" onClick={onAccueil}>
        TshirtShop
      </button>

      {categorieActive && (
        <nav aria-label="Catégories">
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
      )}
    </header>
  )
}

export default EnTete
