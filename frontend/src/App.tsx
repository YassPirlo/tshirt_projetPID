import { useEffect, useRef, useState } from 'react'
import {
  getCategories,
  getProduit,
  getProduitsDeCategorie,
  type Categorie,
  type Produit,
} from './api'
import EnTete from './components/EnTete'
import Accueil from './components/Accueil'
import ListeProduits from './components/ListeProduits'
import FicheProduit from './components/FicheProduit'
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

  // US3 : produit dont on affiche le détail (null = on affiche la liste)
  const [produitOuvertId, setProduitOuvertId] = useState<number | null>(null)
  const [produit, setProduit] = useState<Produit | null>(null)
  const [chargementProduit, setChargementProduit] = useState(false)
  const [erreurProduit, setErreurProduit] = useState<string | null>(null)

  // Requêtes en cours : si on clique ailleurs avant la réponse, on les
  // annule pour ne pas afficher les données de la mauvaise page.
  const requeteProduits = useRef<AbortController | null>(null)
  const requeteProduit = useRef<AbortController | null>(null)

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
    fermerProduit()
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

  // US3 : un clic sur un produit charge son détail, sans recharger
  const afficherProduit = (choisi: Produit) => {
    requeteProduit.current?.abort()
    const controleur = new AbortController()
    requeteProduit.current = controleur

    setProduitOuvertId(choisi.id)
    setProduit(null)
    setChargementProduit(true)
    setErreurProduit(null)
    window.scrollTo({ top: 0 })

    getProduit(choisi.id, controleur.signal)
      .then((data) => setProduit(data))
      .catch((e) => {
        if (e.name !== 'AbortError')
          setErreurProduit('Impossible de charger ce produit.')
      })
      .finally(() => {
        if (!controleur.signal.aborted) setChargementProduit(false)
      })
  }

  // Retour à la liste de la catégorie (elle est encore en mémoire)
  const fermerProduit = () => {
    requeteProduit.current?.abort()
    setProduitOuvertId(null)
    window.scrollTo({ top: 0 })
  }

  const revenirAccueil = () => {
    fermerProduit()
    requeteProduits.current?.abort()
    setCategorieSelectionnee(null)
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
        {categorieSelectionnee && produitOuvertId !== null ? (
          <FicheProduit
            key={produitOuvertId}
            categorie={categorieSelectionnee}
            produit={produit}
            chargement={chargementProduit}
            erreur={erreurProduit}
            onAccueil={revenirAccueil}
            onRetour={fermerProduit}
          />
        ) : categorieSelectionnee ? (
          <ListeProduits
            categorie={categorieSelectionnee}
            produits={produits}
            chargement={chargementProduits}
            erreur={erreurProduits}
            onAccueil={revenirAccueil}
            onOuvrirProduit={afficherProduit}
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
        <p className="logo">TshirtShop</p>
        <p>Projet d'école, 2026. Les images sont provisoires.</p>
      </footer>
    </>
  )
}

export default App
