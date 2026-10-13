import { useEffect, useState } from 'react'
import './App.css'

type Categorie = {
  id: number
  nom: string
}


type Produit = {
  id: number
  nom: string
  prix: number
  imageUrl: string
}

function App() {
  const [categories, setCategories] = useState<Categorie[]>([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)


  const [categorieSelectionnee, setCategorieSelectionnee] =
    useState<Categorie | null>(null)

  const [produits, setProduits] = useState<Produit[]>([])
  const [chargementProduits, setChargementProduits] = useState(false)
  const [erreurProduits, setErreurProduits] = useState<string | null>(null)

  // US1 : au chargement de la page d'accueil, on récupère les catégories
  useEffect(() => {
    fetch('http://localhost:8080/api/categories')
      .then((reponse) => {
        if (!reponse.ok) throw new Error('Erreur ' + reponse.status)
        return reponse.json()
      })
      .then((data: Categorie[]) => setCategories(data))
      .catch(() => setErreur('Impossible de charger les catégories.'))
      .finally(() => setChargement(false))
  }, [])


  const afficherProduits = (categorie: Categorie) => {
    setCategorieSelectionnee(categorie)
    setProduits([])
    setChargementProduits(true)
    setErreurProduits(null)

    fetch(`http://localhost:8080/api/categories/${categorie.id}/produits`)
      .then((reponse) => {
        if (!reponse.ok) {
          throw new Error('Erreur ' + reponse.status)
        }
        return reponse.json()
      })
      .then((data: Produit[]) => setProduits(data))
      .catch(() =>
        setErreurProduits('Impossible de charger les produits.')
      )
      .finally(() => setChargementProduits(false))
  }

  return (
    <>
      <p className="annonce">
        T-shirts pour femme et homme, dans toutes les tailles
      </p>

      {/* Le bandeau est grand sur l'accueil, puis se réduit à l'en-tête
          dès qu'une catégorie est choisie */}
      <div className={categorieSelectionnee ? 'hero hero--reduit' : 'hero'}>
        <header className="entete">
          <h1 className="marque">TshirtShop</h1>

          <nav aria-label="Catégories">
            {chargement && <p>Chargement…</p>}

            {!chargement && !erreur && (
              <ul>
                {categories.map((categorie) => (
                  <li key={categorie.id}>
                    <button
                      type="button"
                      onClick={() => afficherProduits(categorie)}
                      aria-pressed={categorieSelectionnee?.id === categorie.id}
                    >
                      {categorie.nom}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </nav>
        </header>

        {!categorieSelectionnee && (
          <div className="hero-contenu">
            <h2>
              Trouvez le <span className="insecable">t-shirt</span> qui vous va
            </h2>
            {!erreur && (
              <p>Choisissez une catégorie pour voir tous les modèles.</p>
            )}

            {erreur && <p role="alert">{erreur}</p>}

            {!chargement && !erreur && (
              <ul className="hero-actions">
                {categories.slice(0, 3).map((categorie) => (
                  <li key={categorie.id}>
                    <button
                      type="button"
                      onClick={() => afficherProduits(categorie)}
                    >
                      Voir : {categorie.nom}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <main>
        <section aria-live="polite">
          {categorieSelectionnee && <h2>{categorieSelectionnee.nom}</h2>}

          {chargementProduits && <p>Chargement des produits…</p>}

          {erreurProduits && <p role="alert">{erreurProduits}</p>}

          {categorieSelectionnee &&
            !chargementProduits &&
            !erreurProduits &&
            produits.length === 0 && (
              <p>Aucun produit disponible dans cette catégorie.</p>
            )}

          {!chargementProduits && !erreurProduits && produits.length > 0 && (
            <div className="grille">
              {produits.map((produit) => (
                <article key={produit.id}>
                  <img
                    src={produit.imageUrl}
                    alt={produit.nom}
                    title={produit.nom}
                  />
                  <h3>{produit.nom}</h3>
                  <p>{produit.prix.toFixed(2)} €</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="pied">
        <p>TshirtShop, projet d'école</p>
      </footer>
    </>
  )
}

export default App