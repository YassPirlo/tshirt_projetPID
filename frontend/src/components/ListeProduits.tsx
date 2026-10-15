import { useState } from 'react'
import { formaterPrix, type Categorie, type Produit } from '../api'

type Props = {
  categorie: Categorie
  produits: Produit[]
  chargement: boolean
  erreur: string | null
  onAccueil: () => void
  onOuvrirProduit: (produit: Produit) => void
}

// Produits d'une catégorie en miniatures (US2)
function ListeProduits({
  categorie,
  produits,
  chargement,
  erreur,
  onAccueil,
  onOuvrirProduit,
}: Props) {
  return (
    <section className="rayon" aria-labelledby="titre-rayon">
      {/* Fil d'Ariane : montre où l'on est et permet de revenir */}
      <nav aria-label="Fil d'Ariane" className="ariane">
        <ol>
          <li>
            <button type="button" onClick={onAccueil}>
              Accueil
            </button>
          </li>
          <li aria-current="page">{categorie.nom}</li>
        </ol>
      </nav>

      <div className="rayon-titre">
        <h1 id="titre-rayon">{categorie.nom}</h1>
        {!chargement && !erreur && produits.length > 0 && (
          <p className="compteur">
            {produits.length} {produits.length > 1 ? 'modèles' : 'modèle'}
          </p>
        )}
      </div>

      {/* aria-live : les lecteurs d'écran annoncent le résultat
          quand la liste change, sans rechargement de page */}
      <div aria-live="polite" aria-busy={chargement}>
        {chargement && (
          <ul className="grille" aria-hidden="true">
            {[1, 2, 3, 4].map((n) => (
              <li key={n} className="carte carte--attente">
                <div className="carte-image" />
                <div className="carte-ligne" />
              </li>
            ))}
          </ul>
        )}

        {erreur && (
          <p className="message message--erreur" role="alert">
            {erreur}
          </p>
        )}

        {!chargement && !erreur && produits.length === 0 && (
          <div className="message">
            <p>Aucun produit disponible dans cette catégorie.</p>
            <button type="button" className="bouton" onClick={onAccueil}>
              Voir les autres catégories
            </button>
          </div>
        )}

        {!chargement && !erreur && produits.length > 0 && (
          <ul className="grille">
            {produits.map((produit) => (
              <li key={produit.id}>
                <CarteProduit produit={produit} onOuvrir={onOuvrirProduit} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

// Une miniature : image (avec un remplaçant si elle ne charge pas),
// nom et prix. Toute la carte est un bouton qui ouvre le détail (US3).
function CarteProduit({
  produit,
  onOuvrir,
}: {
  produit: Produit
  onOuvrir: (produit: Produit) => void
}) {
  const [imageCassee, setImageCassee] = useState(false)

  return (
    <button type="button" className="carte" onClick={() => onOuvrir(produit)}>
      <span className="carte-image">
        {imageCassee || !produit.imageUrl ? (
          <span className="carte-sans-image" title={produit.nom}>
            {produit.nom}
          </span>
        ) : (
          // alt vide : le nom est déjà écrit sous l'image, dans le bouton.
          // title garde l'infobulle demandée par l'US2.
          <img
            src={produit.imageUrl}
            alt=""
            title={produit.nom}
            loading="lazy"
            onError={() => setImageCassee(true)}
          />
        )}
      </span>
      <span className="carte-nom">{produit.nom}</span>
      <span className="prix">{formaterPrix(produit.prix)}</span>
    </button>
  )
}

export default ListeProduits
