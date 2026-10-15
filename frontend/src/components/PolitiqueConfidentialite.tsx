import { infosLegales } from '../infosLegales'

type Props = {
  onAccueil: () => void
  onCookies: () => void
}

// Politique de confidentialité (RGPD) : ce que le site fait de vos données.
// À mettre à jour à chaque nouvelle fonctionnalité qui touche aux données
// personnelles (connexion, panier, commande, livraison).
function PolitiqueConfidentialite({ onAccueil, onCookies }: Props) {
  const { responsable, emailContact, miseAJour, autorite } = infosLegales

  return (
    <article className="page-texte" aria-labelledby="titre-confidentialite">
      <nav aria-label="Fil d'Ariane" className="ariane">
        <ol>
          <li>
            <button type="button" onClick={onAccueil}>
              Accueil
            </button>
          </li>
          <li aria-current="page">Confidentialité</li>
        </ol>
      </nav>

      <h1 id="titre-confidentialite">Politique de confidentialité</h1>
      <p className="page-texte-date">Dernière mise à jour : {miseAJour}</p>

      <h2>Qui est responsable de vos données ?</h2>
      <p>
        {responsable}. Pour toute question sur vos données, écrivez à{' '}
        <a href={`mailto:${emailContact}`}>{emailContact}</a>.
      </p>

      <h2>Quelles données collectons-nous aujourd'hui ?</h2>
      <p>
        <strong>Aucune donnée personnelle.</strong> Le site ne propose pas
        encore de compte, de formulaire ni de commande. Il n'utilise aucun
        cookie publicitaire et ne fait appel à aucun service extérieur : la
        police de caractères et les images sont hébergées avec le site.
      </p>
      <p>
        Pour vous afficher une page, le serveur reçoit forcément l'adresse IP de
        votre appareil. Il s'en sert pour répondre, puis ne la conserve pas.
      </p>
      <p>
        Votre navigateur garde seulement votre choix sur les cookies, sur votre
        appareil. Le détail est dans la page{' '}
        <button type="button" className="lien" onClick={onCookies}>
          Cookies
        </button>
        .
      </p>

      <h2>Et quand vous pourrez commander ?</h2>
      <p>
        La création de compte, le panier, le paiement et la livraison arriveront
        dans les prochaines versions. Nous demanderons alors uniquement ce qui
        est nécessaire pour traiter votre commande : nom, adresse e-mail,
        adresse de livraison et historique de vos commandes. Votre mot de passe
        sera enregistré sous une forme chiffrée que personne ne peut relire, et
        vos données de paiement seront traitées par le prestataire de paiement,
        pas par TshirtShop.
      </p>
      <p>
        Ces données serviront à exécuter votre commande (article 6.1.b du RGPD)
        et à respecter nos obligations comptables (article 6.1.c). Elles ne
        seront jamais vendues. Cette page sera mise à jour avant la mise en
        ligne de ces fonctionnalités, avec la durée de conservation de chaque
        donnée.
      </p>

      <h2>Vos droits</h2>
      <p>
        Vous pouvez à tout moment demander à consulter, corriger ou supprimer
        vos données, limiter leur utilisation, vous y opposer, les recevoir dans
        un format réutilisable, ou retirer votre consentement. Écrivez à{' '}
        <a href={`mailto:${emailContact}`}>{emailContact}</a> : nous vous
        répondons dans un délai d'un mois.
      </p>
      <p>
        Si vous pensez que vos droits ne sont pas respectés, vous pouvez
        introduire une plainte auprès de l'{autorite.nom} :{' '}
        <a href={autorite.site} target="_blank" rel="noreferrer">
          {autorite.site.replace('https://', '')}
        </a>
        .
      </p>
    </article>
  )
}

export default PolitiqueConfidentialite
