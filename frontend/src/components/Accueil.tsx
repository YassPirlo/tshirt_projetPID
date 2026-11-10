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
  // « femme » avant « homme » : aucun des deux mots ne contient l'autre,
  // mais l'ordre resterait le bon si on ajoutait « Hommes et femmes »
  if (n.includes('femme')) return '/images/categorie-femme.svg'
  if (n.includes('homme')) return '/images/categorie-homme.svg'
  if (n.includes('enfant')) return '/images/categorie-enfant.svg'
  return '/images/categorie-classiques.svg'
}

// Page d'accueil (US1) : un grand titre, le t-shirt FACE, les photos
// portées, puis les catégories en images.
function Accueil({ categories, chargement, erreur, onChoisir }: Props) {
  const premiere = categories[0]

  return (
    <>
      <section className="bandeau" aria-labelledby="titre-accueil">
        <div className="bandeau-texte">
          <h1 id="titre-accueil">Les essentiels en coton</h1>
          <p>Des coupes classiques et ajustées, pour femme et homme.</p>
          <div className="bandeau-actions">
            {premiere && (
              <button
                type="button"
                className="bouton"
                onClick={() => onChoisir(premiere)}
              >
                Découvrir : {premiere.nom}
              </button>
            )}
            <a className="bouton bouton--contour" href="#categories">
              Voir les catégories
            </a>
          </div>
        </div>
      </section>

      <section className="section mockup" aria-labelledby="titre-mockup">
        <div className="mockup-image">
          <img
            src="/images/tshirt-face-produit-noir.jpg"
            alt="T-shirt noir avec le logo FACE imprimé sur la poitrine, posé sur un fond texturé"
            width={1200}
            height={1200}
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="mockup-texte">
          <h2 id="titre-mockup">Le t-shirt FACE</h2>
          <p>
            Coupe classique en coton, logo FACE sérigraphié sur la poitrine. Un
            premier aperçu de la collection, avant la mise en vente.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="titre-galerie">
        <h2 id="titre-galerie">Portée par tous</h2>
        {/* width/height : le navigateur réserve la place avant le
            chargement, la page ne saute pas. loading="lazy" : ces photos
            sont sous le premier écran, elles ne ralentissent pas l'arrivée. */}
        <ul className="galerie">
          <li>
            <img
              src="/images/tshirt-face-lifestyle-solo.jpg"
              alt="Un homme porte un t-shirt FACE gris dans la rue"
              width={1200}
              height={1200}
              loading="lazy"
              decoding="async"
            />
          </li>
          <li>
            <img
              src="/images/tshirt-face-lifestyle-groupe.jpg"
              alt="Quatre personnes portent des t-shirts FACE de couleurs différentes"
              width={1200}
              height={669}
              loading="lazy"
              decoding="async"
            />
          </li>
          <li>
            <img
              src="/images/tshirt-face-lifestyle-enfants.jpg"
              alt="Trois enfants portent des vêtements FACE dans un skatepark"
              width={1200}
              height={669}
              loading="lazy"
              decoding="async"
            />
          </li>
        </ul>
      </section>

      <section
        id="categories"
        className="section"
        aria-labelledby="titre-categories"
      >
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
