import { DUREE_VALIDITE_JOURS, type Consentement } from '../consentement'
import { infosLegales } from '../infosLegales'

type Props = {
  consentement: Consentement | null
  onAccueil: () => void
  onModifierChoix: () => void
}

const dureeEnMois = Math.round(DUREE_VALIDITE_JOURS / 30.4)

// Politique cookies : la liste de tout ce que le site enregistre dans
// votre navigateur, et votre choix actuel.
function PolitiqueCookies({ consentement, onAccueil, onModifierChoix }: Props) {
  return (
    <article className="page-texte" aria-labelledby="titre-page-cookies">
      <nav aria-label="Fil d'Ariane" className="ariane">
        <ol>
          <li>
            <button type="button" onClick={onAccueil}>
              Accueil
            </button>
          </li>
          <li aria-current="page">Cookies</li>
        </ol>
      </nav>

      <h1 id="titre-page-cookies">Cookies et traceurs</h1>
      <p className="page-texte-date">
        Dernière mise à jour : {infosLegales.miseAJour}
      </p>

      <h2>Qu'est-ce qu'un cookie ?</h2>
      <p>
        Un cookie, ou plus largement un traceur, est une petite information
        qu'un site enregistre dans votre navigateur pour la relire plus tard.
        Certains sont indispensables au site, d'autres servent par exemple à
        compter les visites : pour ceux-là, nous demandons votre accord.
      </p>

      <h2>Ce que TshirtShop enregistre</h2>
      <div className="tableau-defilant">
        <table>
          <thead>
            <tr>
              <th scope="col">Nom</th>
              <th scope="col">À quoi il sert</th>
              <th scope="col">Durée</th>
              <th scope="col">Catégorie</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>tshirtshop-consentement</code>
              </td>
              <td>Se souvenir de vos choix sur les cookies</td>
              <td>{dureeEnMois} mois</td>
              <td>Nécessaire, sans consentement</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        C'est tout : aucun cookie publicitaire, aucun réseau social, aucun
        service extérieur. Si un outil de mesure d'audience est ajouté, il
        apparaîtra dans ce tableau et ne s'activera que si vous l'acceptez.
      </p>

      <h2>Votre choix actuel</h2>
      <p>
        {consentement === null
          ? "Vous n'avez pas encore fait de choix."
          : `Mesure d'audience : ${
              consentement.mesureAudience ? 'acceptée' : 'refusée'
            }, le ${new Date(consentement.date).toLocaleDateString('fr-FR')}.`}{' '}
        Votre choix est conservé {dureeEnMois} mois, puis nous vous le
        redemandons.
      </p>
      <button type="button" className="bouton" onClick={onModifierChoix}>
        Modifier mes choix
      </button>

      <h2>Supprimer les données de votre navigateur</h2>
      <p>
        Vous pouvez aussi tout effacer depuis les réglages de votre navigateur,
        dans la rubrique « Confidentialité » ou « Données de navigation ». Le
        site vous redemandera alors votre choix.
      </p>
    </article>
  )
}

export default PolitiqueCookies
