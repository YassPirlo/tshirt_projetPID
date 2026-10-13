import type { Categorie } from '../api'

type Props = {
  categories: Categorie[]
  chargement: boolean
  erreur: string | null
  onChoisir: (categorie: Categorie) => void
}

// Image provisoire d'une catégorie, dans frontend/public/images.
// La table categorie n'a pas encore de colonne image : en attendant,
// on la choisit d'après le nom.
function imageCategorie(nom: string) {
  const n = nom.toLowerCase()
  if (n.includes('slim')) return '/images/categorie-slim.svg'
  if (n.includes('nouveaut')) return '/images/categorie-nouveautes.svg'
  return '/images/categorie-classiques.svg'
}

// Page d'accueil (US1) : un grand visuel, puis les catégories en images.
function Accueil({ categories, chargement, erreur, onChoisir }: Props) {
  const premiere = categories[0]

  return (
    <>
      <section className="bandeau" aria-labelledby="titre-accueil">
        <img src="/images/bandeau.svg" alt="" />
        <div className="bandeau-texte">
          <h1 id="titre-accueil">Les essentiels en coton</h1>
          <p>Des coupes classiques et ajustées, pour femme et homme.</p>
          {premiere && (
            <button
              type="button"
              className="bouton"
              onClick={() => onChoisir(premiere)}
            >
              Découvrir : {premiere.nom}
            </button>
          )}
        </div>
      </section>

      <section className="section" aria-labelledby="titre-categories">
        <h2 id="titre-categories">Acheter par catégorie</h2>

        {erreur && (
          <p className="message message--erreur" role="alert">
            {erreur} Vérifiez que le serveur est démarré, puis rechargez la
            page.
          </p>
        )}

        {chargement && (
          <ul className="categories" aria-hidden="true">
            {[1, 2, 3].map((n) => (
              <li key={n}>
                <div className="vignette vignette--attente" />
              </li>
            ))}
          </ul>
        )}

        {!chargement && !erreur && (
          <ul className="categories">
            {categories.map((categorie) => (
              <li key={categorie.id}>
                <button
                  type="button"
                  className="categorie"
                  onClick={() => onChoisir(categorie)}
                >
                  <span className="vignette">
                    <img src={imageCategorie(categorie.nom)} alt="" />
                  </span>
                  <span className="categorie-nom">{categorie.nom}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

export default Accueil
