import { useState } from 'react'
import { formaterPrix, type Categorie, type Produit } from '../api'

type Props = {
  categorie: Categorie
  produit: Produit | null
  chargement: boolean
  erreur: string | null
  onAccueil: () => void
  onRetour: () => void
}

// Détail d'un produit (US3) : image, marque, nom et prix,
// affiché sans recharger la page.
function FicheProduit({
  categorie,
  produit,
  chargement,
  erreur,
  onAccueil,
  onRetour,
}: Props) {
  const [imageCassee, setImageCassee] = useState(false)

  return (
    <section className="fiche" aria-labelledby="titre-produit">
      <nav aria-label="Fil d'Ariane" className="ariane">
        <ol>
          <li>
            <button type="button" onClick={onAccueil}>
              Accueil
            </button>
          </li>
          <li>
            <button type="button" onClick={onRetour}>
              {categorie.nom}
            </button>
          </li>
          {produit && <li aria-current="page">{produit.nom}</li>}
        </ol>
      </nav>

      <div aria-live="polite" aria-busy={chargement}>
        {chargement && (
          <div className="fiche-contenu" aria-hidden="true">
            <div className="fiche-image carte--attente">
              <div className="carte-image" />
            </div>
            <div className="fiche-infos">
              <div className="carte-ligne" />
              <div className="carte-ligne" />
            </div>
          </div>
        )}

        {erreur && (
          <div className="message message--erreur" role="alert">
            <p>{erreur}</p>
            <button type="button" className="bouton" onClick={onRetour}>
              Retour à {categorie.nom}
            </button>
          </div>
        )}

        {!chargement && !erreur && produit && (
          <div className="fiche-contenu">
            <div className="fiche-image carte-image">
              {imageCassee || !produit.imageUrl ? (
                <span className="carte-sans-image">{produit.nom}</span>
              ) : (
                <img
                  src={produit.imageUrl}
                  alt={produit.nom}
                  onError={() => setImageCassee(true)}
                />
              )}
            </div>

            <div className="fiche-infos">
              <p className="fiche-marque">{produit.marque.nom}</p>
              <h1 id="titre-produit">{produit.nom}</h1>
              <p className="fiche-prix">{formaterPrix(produit.prix)}</p>

              <button type="button" className="bouton" onClick={onRetour}>
                Retour à {categorie.nom}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default FicheProduit
