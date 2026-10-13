import type { Categorie } from '../api'

type Props = {
  categories: Categorie[]
  chargement: boolean
  erreur: string | null
  onChoisir: (categorie: Categorie) => void
}

// Page d'accueil (US1) : la liste des catégories est le contenu principal,
// écrite en très grand, comme le panneau des rayons d'un magasin.
function Accueil({ categories, chargement, erreur, onChoisir }: Props) {
  return (
    <section className="accueil" aria-labelledby="titre-accueil">
      <h1 id="titre-accueil">
        T-shirts pour femme et homme, dans toutes les tailles
      </h1>

      {erreur && (
        <p className="message message--sombre" role="alert">
          {erreur} Vérifiez que le serveur est démarré, puis rechargez la page.
        </p>
      )}

      {chargement && <p className="accueil-attente">Chargement…</p>}

      {!chargement && !erreur && (
        <nav aria-label="Catégories">
          <ul className="rayons">
            {categories.map((categorie) => (
              <li key={categorie.id}>
                <button type="button" onClick={() => onChoisir(categorie)}>
                  {categorie.nom}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </section>
  )
}

export default Accueil
