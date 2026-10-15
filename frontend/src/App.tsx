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
import BandeauCookies from './components/BandeauCookies'
import PolitiqueConfidentialite from './components/PolitiqueConfidentialite'
import PolitiqueCookies from './components/PolitiqueCookies'
import MentionsLegales from './components/MentionsLegales'
import {
  enregistrerConsentement,
  lireConsentement,
  type Consentement,
} from './consentement'
import './App.css'

type PageInfo = 'mentions' | 'confidentialite' | 'cookies'

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

  // Page d'information affichée (null = la boutique)
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null)

  // Cookies : choix du visiteur, lu une seule fois au démarrage.
  // Le bandeau s'affiche tant qu'aucun choix valide n'est enregistré.
  const [consentement, setConsentement] = useState<Consentement | null>(() =>
    lireConsentement(),
  )
  const [bandeauRouvert, setBandeauRouvert] = useState(false)
  const bandeauVisible = consentement === null || bandeauRouvert

  const choisirCookies = (mesureAudience: boolean) => {
    setConsentement(enregistrerConsentement(mesureAudience))
    setBandeauRouvert(false)
  }

  const ouvrirPageInfo = (page: PageInfo) => {
    setPageInfo(page)
    window.scrollTo({ top: 0 })
  }

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
    setPageInfo(null)
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
    setPageInfo(null)
    fermerProduit()
    requeteProduits.current?.abort()
    setCategorieSelectionnee(null)
  }

  // Accessibilité : à chaque changement de page, le focus va au début du
  // contenu. Sinon, le bouton cliqué disparaît et un utilisateur au
  // clavier ou au lecteur d'écran ne sait plus où il se trouve.
  const contenu = useRef<HTMLElement>(null)
  const vue = `${pageInfo}|${categorieSelectionnee?.id}|${produitOuvertId}`
  const vuePrecedente = useRef(vue)
  useEffect(() => {
    if (vuePrecedente.current === vue) return // premier affichage
    vuePrecedente.current = vue
    contenu.current?.focus()
  }, [vue])

  return (
    <>
      {/* Lien d'évitement : premier élément atteint avec Tab, il permet
          de sauter l'en-tête et le menu */}
      <a className="lien-evitement" href="#contenu">
        Aller au contenu
      </a>

      <section className="annonce" aria-label="Annonce">
        <p>T-shirts pour femme et homme, dans toutes les tailles</p>
      </section>

      <EnTete
        categories={categories}
        chargement={chargement}
        categorieActive={categorieSelectionnee}
        onChoisir={afficherProduits}
        onAccueil={revenirAccueil}
      />

      <main id="contenu" ref={contenu} tabIndex={-1}>
        {pageInfo === 'mentions' ? (
          <MentionsLegales
            onAccueil={revenirAccueil}
            onConfidentialite={() => ouvrirPageInfo('confidentialite')}
            onCookies={() => ouvrirPageInfo('cookies')}
          />
        ) : pageInfo === 'confidentialite' ? (
          <PolitiqueConfidentialite
            onAccueil={revenirAccueil}
            onCookies={() => ouvrirPageInfo('cookies')}
          />
        ) : pageInfo === 'cookies' ? (
          <PolitiqueCookies
            consentement={consentement}
            onAccueil={revenirAccueil}
            onModifierChoix={() => setBandeauRouvert(true)}
          />
        ) : categorieSelectionnee && produitOuvertId !== null ? (
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
        <nav aria-label="Informations légales">
          <ul className="pied-liens">
            <li>
              <button type="button" onClick={() => ouvrirPageInfo('mentions')}>
                Mentions légales
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => ouvrirPageInfo('confidentialite')}
              >
                Confidentialité
              </button>
            </li>
            <li>
              <button type="button" onClick={() => ouvrirPageInfo('cookies')}>
                Cookies
              </button>
            </li>
            <li>
              <button type="button" onClick={() => setBandeauRouvert(true)}>
                Gérer les cookies
              </button>
            </li>
          </ul>
        </nav>
        <p>Projet d'école, 2026. Les images sont provisoires.</p>
      </footer>

      {bandeauVisible && (
        <BandeauCookies
          // key : le bandeau repart du choix enregistré à chaque ouverture
          key={consentement?.date ?? 'aucun'}
          mesureAudienceInitiale={consentement?.mesureAudience ?? false}
          onEnregistrer={choisirCookies}
          onEnSavoirPlus={() => ouvrirPageInfo('cookies')}
        />
      )}
    </>
  )
}

export default App
