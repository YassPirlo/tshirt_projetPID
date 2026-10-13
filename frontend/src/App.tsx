import { useEffect, useState } from 'react'

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
    <main>
      <h1>TshirtShop</h1>

      <nav aria-label="Catégories">
        <h2>Catégories</h2>

        {chargement && <p>Chargement…</p>}
        {erreur && <p role="alert">{erreur}</p>}

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
      
<section aria-live="polite">
  {categorieSelectionnee && (
    <h2>Produits : {categorieSelectionnee.nom}</h2>
  )}

  {chargementProduits && <p>Chargement des produits…</p>}

  {erreurProduits && <p role="alert">{erreurProduits}</p>}

  {categorieSelectionnee &&
    !chargementProduits &&
    !erreurProduits &&
    produits.length === 0 && (
      <p>Aucun produit disponible dans cette catégorie.</p>
    )}

  {!chargementProduits && !erreurProduits && produits.length > 0 && (
    
<div
  style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '20px',
    maxWidth: '900px',
  }}
>
  {produits.map((produit) => (
    <article key={produit.id}>
      <img
        src={produit.imageUrl}
        alt={produit.nom}
        title={produit.nom}
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          objectFit: 'cover',
          borderRadius: '8px',
        }}
      />
      <h3>{produit.nom}</h3>
      <p>{produit.prix.toFixed(2)} €</p>
    </article>
  ))}
</div>
  )}
</section>
    </main>
  )
}

export default App