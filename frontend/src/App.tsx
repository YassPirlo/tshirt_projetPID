import { useEffect, useState } from 'react'

type Categorie = {
  id: number
  nom: string
}

function App() {
  const [categories, setCategories] = useState<Categorie[]>([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)

  // US1 : au chargement de la page d'accueil, on récupère les catégories
  useEffect(() => {
    fetch('/api/categories')
      .then((reponse) => {
        if (!reponse.ok) throw new Error('Erreur ' + reponse.status)
        return reponse.json()
      })
      .then((data: Categorie[]) => setCategories(data))
      .catch(() => setErreur('Impossible de charger les catégories.'))
      .finally(() => setChargement(false))
  }, [])

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
              <li key={categorie.id}>{categorie.nom}</li>
            ))}
          </ul>
        )}
      </nav>
    </main>
  )
}

export default App