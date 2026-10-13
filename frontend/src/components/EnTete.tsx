import type { Categorie } from '../api'

type Props = {
  categories: Categorie[]
  chargement: boolean
  categorieActive: Categorie | null
  onChoisir: (categorie: Categorie) => void
  onAccueil: () => void
}

// Barre du haut, toujours visible : le nom du site ramène à l'accueil,
// les catégories servent de menu principal (US1).
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
    </header>
  )
}

export default EnTete
