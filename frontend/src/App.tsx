import { useEffect, useRef, useState } from 'react'
import {
  getCategories,
  getProduitsDeCategorie,
  type Categorie,
  type Produit,
} from './api'
import EnTete from './components/EnTete'
import Accueil from './components/Accueil'
import ListeProduits from './components/ListeProduits'
import './App.css'

// App garde l'état de la page et choisit quoi afficher.
// L'affichage lui-même est dans les composants du dossier components.
function App() {
  const [categories, setCategories] = useState<Categorie[]>([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)

  const [categorieSelectionnee, setCategorieSelectionnee] =
    useState<Categorie | null>(null)

  const [produits, setProduits] = useState<Produit[]>([])
  const [chargementProduits, setChargementProduits] = useState(false)
  const [erreurProduits, setErreurProduits] = useState<string | null>(null)

  // Requête produits en cours : si on clique sur une autre catégorie avant
  // la réponse, on l'annule pour ne pas afficher les produits de la mauvaise.
  const requeteProduits = useRef<AbortController | null>(null)

  // US1 : au chargement de la page d'accueil, on récupère les catégories
  useEffect(() => {
    const controleur = new AbortController()

    getCategories(controleur.signal)
      .then((data) => setCategories(data))
      .catch((e) => {
        if (e.name !== 'AbortError')
          setErreur('Impossible de charger les catégories.')
      })
      .finally(() => {
        if (!controleur.signal.aborted) setChargement(false)
      })

    return () => controleur.abort()
  }, [])

  // US2 : un clic sur une catégorie charge ses produits, sans recharger
  const afficherProduits = (categorie: Categorie) => {
    requeteProduits.current?.abort()
    const controleur = new AbortController()
    requeteProduits.current = controleur

    setCategorieSelectionnee(categorie)
    setProduits([])
    setChargementProduits(true)
    setErreurProduits(null)
    window.scrollTo({ top: 0 })

    getProduitsDeCategorie(categorie.id, controleur.signal)
      .then((data) => setProduits(data))
      .catch((e) => {
        if (e.name !== 'AbortError')
          setErreurProduits('Impossible de charger les produits.')
      })
      .finally(() => {
        if (!controleur.signal.aborted) setChargementProduits(false)
      })
  }

  const revenirAccueil = () => {
    requeteProduits.current?.abort()
    setCategorieSelectionnee(null)
    window.scrollTo({ top: 0 })
  }

  return (
    <>
      <p className="annonce">
        T-shirts pour femme et homme, dans toutes les tailles
      </p>

      <EnTete
        categories={categories}
        chargement={chargement}
        categorieActive={categorieSelectionnee}
        onChoisir={afficherProduits}
        onAccueil={revenirAccueil}
      />

      <main>
        {categorieSelectionnee ? (
          <ListeProduits
            categorie={categorieSelectionnee}
            produits={produits}
            chargement={chargementProduits}
            erreur={erreurProduits}
            onAccueil={revenirAccueil}
          />
        ) : (
          <Accueil
            categories={categories}
            chargement={chargement}
            erreur={erreur}
            onChoisir={afficherProduits}
          />
        )}
      </main>

      <footer className="pied">
        <p>© 2026 TshirtShop · Projet d'école</p>
      </footer>
    </>
  )
}

export default App
