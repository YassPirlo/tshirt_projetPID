type Props = {
  onAccueil: () => void
}

// Affichée quand l'adresse ne correspond à aucune page du site : lien
// mal recopié, catégorie supprimée, etc.
function PageIntrouvable({ onAccueil }: Props) {
  return (
    <section className="page-texte" aria-labelledby="titre-introuvable">
      <h1 id="titre-introuvable">Page introuvable</h1>
      <p className="page-texte-date">
        Cette adresse ne mène à aucune page de la boutique. Elle a peut-être
        été mal recopiée, ou la page n’existe plus.
      </p>
      <button type="button" className="bouton" onClick={onAccueil}>
        Retour à l’accueil
      </button>
    </section>
  )
}

export default PageIntrouvable
