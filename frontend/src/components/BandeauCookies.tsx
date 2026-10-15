import { useState } from 'react'

type Props = {
  // Choix déjà fait (quand on rouvre le bandeau depuis le pied de page)
  mesureAudienceInitiale: boolean
  onEnregistrer: (mesureAudience: boolean) => void
  onEnSavoirPlus: () => void
}

// Bandeau de consentement aux cookies, en bas de l'écran.
// Règles suivies : refuser est aussi simple qu'accepter (deux boutons
// identiques), rien n'est coché par défaut, et le visiteur peut
// choisir catégorie par catégorie.
function BandeauCookies({
  mesureAudienceInitiale,
  onEnregistrer,
  onEnSavoirPlus,
}: Props) {
  const [details, setDetails] = useState(false)
  const [mesureAudience, setMesureAudience] = useState(mesureAudienceInitiale)

  return (
    <section className="cookies" aria-labelledby="titre-cookies">
      <div className="cookies-contenu">
        <h2 id="titre-cookies">Vos choix sur les cookies</h2>
        <p>
          TshirtShop utilise uniquement ce qui est nécessaire au fonctionnement
          du site. Avec votre accord, nous pourrons aussi mesurer la
          fréquentation pour améliorer la boutique. Vous pouvez changer d'avis à
          tout moment avec le lien « Gérer les cookies » en bas de page.{' '}
          <button type="button" className="lien" onClick={onEnSavoirPlus}>
            En savoir plus
          </button>
        </p>

        {details && (
          <fieldset className="cookies-choix">
            <legend>Choisir par catégorie</legend>
            <label>
              <input type="checkbox" checked disabled />
              <span>
                <strong>Nécessaires</strong> : mémoriser vos choix sur les
                cookies. Toujours actifs.
              </span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={mesureAudience}
                onChange={(e) => setMesureAudience(e.target.checked)}
              />
              <span>
                <strong>Mesure d'audience</strong> : compter les visites, de
                façon anonyme. Aucun outil n'est encore installé.
              </span>
            </label>
          </fieldset>
        )}
      </div>

      <div className="cookies-actions">
        {details ? (
          <button
            type="button"
            className="bouton"
            onClick={() => onEnregistrer(mesureAudience)}
          >
            Enregistrer mes choix
          </button>
        ) : (
          <button
            type="button"
            className="bouton bouton--secondaire"
            onClick={() => setDetails(true)}
          >
            Personnaliser
          </button>
        )}
        <button
          type="button"
          className="bouton"
          onClick={() => onEnregistrer(false)}
        >
          Tout refuser
        </button>
        <button
          type="button"
          className="bouton"
          onClick={() => onEnregistrer(true)}
        >
          Tout accepter
        </button>
      </div>
    </section>
  )
}

export default BandeauCookies
