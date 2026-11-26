import { infosLegales } from '../infosLegales'

type Props = {
  onAccueil: () => void
  onConfidentialite: () => void
}

// Conditions générales de vente : exigées pour un site e-commerce par la
// « définition de fini » du product backlog. La case « J'accepte les
// conditions générales de vente » de l'inscription renvoie ici.
//
// FACE est un projet d'école : ces conditions décrivent ce que serait la
// vente si la boutique était réelle. Elles seront complétées quand le
// panier, la livraison et le paiement seront développés (US8 à US11).
function ConditionsGenerales({ onAccueil, onConfidentialite }: Props) {
  const { responsable, emailContact, miseAJour } = infosLegales

  return (
    <article className="page-texte" aria-labelledby="titre-cgv">
      <nav aria-label="Fil d'Ariane" className="ariane">
        <ol>
          <li>
            <button type="button" onClick={onAccueil}>
              Accueil
            </button>
          </li>
          <li aria-current="page">Conditions générales de vente</li>
        </ol>
      </nav>

      <h1 id="titre-cgv">Conditions générales de vente</h1>
      <p className="page-texte-date">Dernière mise à jour : {miseAJour}</p>

      <p>
        FACE est un <strong>projet pédagogique</strong> : aucun produit n’est
        réellement vendu et aucun paiement n’est encaissé. Ces conditions
        décrivent les règles qui s’appliqueraient si la boutique était réelle.
      </p>

      <h2>1. Qui vend ?</h2>
      <p>
        Le vendeur est {responsable}. Pour toute question :{' '}
        <a href={`mailto:${emailContact}`}>{emailContact}</a>.
      </p>

      <h2>2. À quoi s’appliquent ces conditions ?</h2>
      <p>
        Elles s’appliquent à toute commande passée sur le site par un
        consommateur. En créant un compte, vous déclarez les avoir lues et
        acceptées ; la date de votre accord est enregistrée avec votre compte.
      </p>

      <h2>3. Produits et prix</h2>
      <p>
        Les prix sont indiqués en euros, toutes taxes comprises (TVA
        incluse). Les frais de livraison sont affichés avant la validation
        de la commande et s’ajoutent au prix des articles.
      </p>

      <h2>4. Commande</h2>
      <p>
        Vous ajoutez les articles à votre panier, choisissez la livraison,
        vérifiez le récapitulatif puis payez. La vente est conclue quand le
        paiement est confirmé ; un récapitulatif de la commande vous est
        alors envoyé.
      </p>

      <h2>5. Paiement</h2>
      <p>
        Le paiement est traité par un prestataire de paiement sécurisé :
        FACE n’a jamais accès à vos numéros de carte.
      </p>

      <h2>6. Livraison</h2>
      <p>
        Les livraisons se font en Belgique uniquement, à l’adresse que vous
        indiquez lors de la commande. Les délais annoncés sont indicatifs.
      </p>

      <h2>7. Droit de rétractation</h2>
      <p>
        Vous pouvez renoncer à votre achat sans donner de raison pendant{' '}
        <strong>14 jours</strong> à partir du jour où vous recevez la
        commande, comme le prévoit le Code de droit économique. Il suffit de
        nous l’écrire à l’adresse ci-dessus, puis de renvoyer les articles.
        Nous vous remboursons au plus tard 14 jours après votre demande, une
        fois les articles reçus. Les frais de retour restent à votre charge.
      </p>

      <h2>8. Garantie</h2>
      <p>
        Les articles bénéficient de la garantie légale de conformité de deux
        ans à partir de la livraison.
      </p>

      <h2>9. Données personnelles</h2>
      <p>
        Ce que nous faisons de vos données est expliqué dans la page{' '}
        <button type="button" className="lien" onClick={onConfidentialite}>
          Confidentialité
        </button>
        .
      </p>

      <h2>10. Litiges</h2>
      <p>
        Ces conditions sont soumises au droit belge. En cas de désaccord,
        écrivez-nous d’abord : nous chercherons une solution avec vous. Vous
        pouvez aussi vous adresser gratuitement au Service de médiation pour
        le consommateur (
        <a href="https://mediationconsommateur.be" rel="noopener noreferrer">
          mediationconsommateur.be
        </a>
        ).
      </p>
    </article>
  )
}

export default ConditionsGenerales
