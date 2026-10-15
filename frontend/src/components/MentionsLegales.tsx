import { infosLegales } from '../infosLegales'

type Props = {
  onAccueil: () => void
  onConfidentialite: () => void
  onCookies: () => void
}

// Mentions légales : qui édite le site, qui l'héberge, à qui appartiennent
// les contenus. Les coordonnées sont dans infosLegales.ts.
function MentionsLegales({ onAccueil, onConfidentialite, onCookies }: Props) {
  const { responsable, membres, ecole, adresse, emailContact, miseAJour } =
    infosLegales

  return (
    <article className="page-texte" aria-labelledby="titre-mentions">
      <nav aria-label="Fil d'Ariane" className="ariane">
        <ol>
          <li>
            <button type="button" onClick={onAccueil}>
              Accueil
            </button>
          </li>
          <li aria-current="page">Mentions légales</li>
        </ol>
      </nav>

      <h1 id="titre-mentions">Mentions légales</h1>
      <p className="page-texte-date">Dernière mise à jour : {miseAJour}</p>

      <h2>Un projet d'école</h2>
      <p>
        TshirtShop est un <strong>projet pédagogique</strong> réalisé dans le
        cadre d'un cours. Ce n'est pas une vraie boutique :{' '}
        <strong>aucun produit n'est vendu</strong>, les prix et les articles
        sont fictifs, et aucune commande ne peut être passée.
      </p>

      <h2>Éditeur du site</h2>
      <p>
        {responsable} : {membres}.
        <br />
        Établissement : {ecole}, {adresse}.
        <br />
        Contact : <a href={`mailto:${emailContact}`}>{emailContact}</a>
      </p>
      <p>
        Le projet n'est pas exploité par une entreprise : il n'a donc ni numéro
        d'entreprise ni numéro de TVA.
      </p>

      <h2>Hébergement</h2>
      <p>
        Le site n'est pas encore publié sur Internet. Pendant le développement,
        il fonctionne uniquement sur les ordinateurs des membres de l'équipe.
        Cette rubrique indiquera le nom et l'adresse de l'hébergeur si le site
        est mis en ligne.
      </p>

      <h2>Propriété des contenus</h2>
      <p>
        Le code du site, les textes et les illustrations des t-shirts ont été
        créés par l'équipe pour ce projet. Les images sont provisoires.
      </p>
      <p>
        La police de caractères Barlow est utilisée sous licence libre SIL Open
        Font License. Les noms de marques cités dans les fiches produits (par
        exemple Nike, Adidas ou Puma) appartiennent à leurs propriétaires
        respectifs ; ils servent uniquement d'exemples et ne signifient aucun
        partenariat.
      </p>

      <h2>Responsabilité</h2>
      <p>
        S'agissant d'un projet en cours de développement, le site peut contenir
        des erreurs ou être momentanément indisponible. Les informations
        affichées n'ont pas de valeur commerciale.
      </p>

      <h2>Données personnelles et cookies</h2>
      <p>
        Pour savoir ce que le site fait de vos données, consultez la page{' '}
        <button type="button" className="lien" onClick={onConfidentialite}>
          Confidentialité
        </button>{' '}
        et la page{' '}
        <button type="button" className="lien" onClick={onCookies}>
          Cookies
        </button>
        .
      </p>

      <h2>Droit applicable</h2>
      <p>Ces mentions légales sont régies par le droit belge.</p>
    </article>
  )
}

export default MentionsLegales
