import type { Categorie } from '../api'

type Props = {
  categories: Categorie[]
  chargement: boolean
  erreur: string | null
  onChoisir: (categorie: Categorie) => void
}

// Page d'accueil (US1) : un bandeau d'accroche, puis une tuile par catégorie.
function Accueil({ categories, chargement, erreur, onChoisir }: Props) {
  return (
    <>
      <section className="hero" aria-labelledby="titre-accueil">
        <p className="surtitre">Femme · Homme · Toutes les tailles</p>
        <h1 id="titre-accueil">
          Trouvez le <span className="insecable">t-shirt</span> qui vous va
        </h1>
        <p className="hero-texte">
          Des basiques en coton aux coupes ajustées : choisissez une catégorie
          pour voir tous les modèles.
        </p>
      </section>

      <section className="rayons" aria-labelledby="titre-rayons">
        <h2 id="titre-rayons">Nos catégories</h2>

        {erreur && (
          <p className="message message--erreur" role="alert">
            {erreur} Vérifiez que le serveur est démarré, puis rechargez la
            page.
          </p>
        )}

        {chargement && (
          <ul className="tuiles" aria-hidden="true">
            {[1, 2, 3].map((n) => (
              <li key={n} className="tuile tuile--attente" />
            ))}
          </ul>
        )}

        {!chargement && !erreur && (
          <ul className="tuiles">
            {categories.map((categorie) => (
              <li key={categorie.id}>
                <button
                  type="button"
                  className="tuile"
                  onClick={() => onChoisir(categorie)}
                >
                  <span className="tuile-nom">{categorie.nom}</span>
                  <span className="tuile-lien">Voir les modèles</span>
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
