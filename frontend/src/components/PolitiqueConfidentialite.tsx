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
        <strong>Si vous naviguez sans compte, aucune donnée personnelle.</strong>{' '}
        Le site n'utilise aucun cookie publicitaire et ne fait appel à aucun
        service extérieur : la police de caractères et les images sont
        hébergées avec le site.
      </p>
      <p>
        <strong>Si vous créez un compte</strong>, nous enregistrons votre
        adresse e-mail, votre nom, votre prénom, votre mot de passe et la date
        de création du compte. Ils servent uniquement à vous identifier quand
        vous vous connectez et à afficher votre profil (article 6.1.b du RGPD :
        ces données sont nécessaires au service que vous demandez). Ils sont
        conservés tant que votre compte existe ; pour le supprimer, écrivez à
        l'adresse ci-dessus.
      </p>
      <p>
        Votre mot de passe n'est jamais enregistré tel quel : nous n'en gardons
        qu'une empreinte (un <em>hachage</em>). Contrairement à un chiffrement,
        une empreinte ne peut pas être reconvertie en mot de passe, ni par nous
        ni par quelqu'un qui accéderait à la base de données. Elle permet
        seulement de vérifier, à la connexion, que le mot de passe tapé est le
        bon.
      </p>
      <p>
        Pour vous afficher une page, le serveur reçoit forcément l'adresse IP de
        votre appareil. Il s'en sert pour répondre, puis ne la conserve pas.
      </p>
      <p>
        Votre navigateur garde votre choix sur les cookies et, si vous êtes
        connecté, un cookie de session. Le détail est dans la page{' '}
        <button type="button" className="lien" onClick={onCookies}>
          Cookies
        </button>
        .
      </p>

      <h2>Et quand vous pourrez commander ?</h2>
      <p>
        Le panier, le paiement et la livraison arriveront dans les prochaines
        versions. Nous demanderons alors uniquement ce qui est nécessaire pour
        traiter votre commande : adresse de livraison et historique de vos
        commandes, en plus des données de votre compte. Vos données de paiement
        seront traitées par le prestataire de paiement, pas par FACE.
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
