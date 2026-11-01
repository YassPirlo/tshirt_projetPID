import { motion } from 'motion/react'
import type { Categorie } from '../api'
import LogoLoop from './LogoLoop'

const apparition = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

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

      {!chargement && !erreur && categories.length > 0 && (
        <div className="defilement" aria-hidden="true">
          <LogoLoop
            logos={categories.map((categorie) => ({
              src: imageCategorie(categorie.nom),
              alt: '',
            }))}
            logoHeight={72}
            gap={56}
            speed={60}
            pauseOnHover
            fadeOut
            fadeOutColor="var(--blanc)"
          />
        </div>
      )}

      <motion.section
        className="section"
        aria-labelledby="titre-mockup"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={apparition}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <h2 id="titre-mockup">Le t-shirt FACE</h2>
        <div className="mockup-contenu">
          <div className="mockup-image">
            <img className="mockup-tshirt" src="/images/tshirt-noir.svg" alt="T-shirt noir avec le logo FACE imprimé sur la poitrine" />
            <img className="mockup-logo" src="/images/logo-face-header.png" alt="" aria-hidden="true" />
          </div>
          <div className="mockup-texte">
            <p>
              Coupe classique en coton, logo FACE sérigraphié sur la poitrine.
              Un premier aperçu de la collection, avant la mise en vente.
            </p>
          </div>
        </div>
      </motion.section>

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
