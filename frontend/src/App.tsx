import { useEffect, useRef, useState } from 'react'
import {
  getCategories,
  getProduit,
  getProduitsDeCategorie,
  type Categorie,
  type Produit,
} from './api'
import EnTete from './components/EnTete'
import SilkBackground from './components/SilkBackground'
import Accueil from './components/Accueil'
import ListeProduits from './components/ListeProduits'
import FicheProduit from './components/FicheProduit'
import BandeauCookies from './components/BandeauCookies'
import PolitiqueConfidentialite from './components/PolitiqueConfidentialite'
import PolitiqueCookies from './components/PolitiqueCookies'
import MentionsLegales from './components/MentionsLegales'
import Inscription from './components/Inscription'
import Connexion from './components/Connexion'
import Profil from './components/Profil'
import { useAuth } from './ContexteAuth'
import {
  enregistrerConsentement,
  lireConsentement,
  type Consentement,
} from './consentement'
import './App.css'

// Pages d'information (bas de page)
type PageInfo = 'mentions' | 'confidentialite' | 'cookies'

// Pages de compte (US4 à US7). Volontairement séparé de PageInfo : ce
// sont deux groupes de pages sans rapport, et les mélanger obligerait à
// tester « est-ce une page de compte ? » un peu partout.
type PageCompte = 'inscription' | 'connexion' | 'profil'

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

  // Page de compte affichée (null = la boutique). US4 à US7.
  const [pageCompte, setPageCompte] = useState<PageCompte | null>(null)

  // Qui est connecté : fourni par ContexteAuth, partagé avec l'en-tête
  // et les pages de compte.
  const { utilisateur } = useAuth()

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
    setPageCompte(null)
    setPageInfo(page)
    window.scrollTo({ top: 0 })
  }

  // US4 à US7 : ouvre une page de compte et ferme tout le reste
  const ouvrirPageCompte = (page: PageCompte) => {
    setPageInfo(null)
    setPageCompte(page)
    window.scrollTo({ top: 0 })
  }

  // Clic sur l'icône « Mon compte » de l'en-tête : le profil si on est
  // déjà connecté, le formulaire de connexion sinon.
  const ouvrirCompte = () =>
    ouvrirPageCompte(utilisateur ? 'profil' : 'connexion')

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
    setPageCompte(null)
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
    setPageCompte(null)
    fermerProduit()
    requeteProduits.current?.abort()
    setCategorieSelectionnee(null)
  }

  // Accessibilité : à chaque changement de page, le focus va au début du
  // contenu. Sinon, le bouton cliqué disparaît et un utilisateur au
  // clavier ou au lecteur d'écran ne sait plus où il se trouve.
  const contenu = useRef<HTMLElement>(null)
  const vue = `${pageInfo}|${pageCompte}|${categorieSelectionnee?.id}|${produitOuvertId}`
  const vuePrecedente = useRef(vue)
  useEffect(() => {
    if (vuePrecedente.current === vue) return // premier affichage
    vuePrecedente.current = vue
    // preventScroll : la page est déjà remontée en haut, le focus ne doit
    // pas la faire défiler sous l'en-tête collé en haut
    contenu.current?.focus({ preventScroll: true })
  }, [vue])

  const surAccueil = !pageInfo && !pageCompte && !categorieSelectionnee

  return (
    <>
      {/* Fond animé commun à tout le site, derrière tout le contenu */}
      <SilkBackground />
      {/* Le fond animé ne se montre vraiment que sur l'accueil : ailleurs
          le voile est plus dense, pour que rien ne gêne la lecture */}
      <div
        className={surAccueil ? 'fond-filtre' : 'fond-filtre fond-filtre--dense'}
        aria-hidden="true"
      />

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
        // Sur une page d'information ou de compte, aucune catégorie
        // n'est soulignée
        categorieActive={pageInfo || pageCompte ? null : categorieSelectionnee}
        onChoisir={afficherProduits}
        onAccueil={revenirAccueil}
        // US4 à US7 : l'icône « Mon compte » devient active
        onCompte={ouvrirCompte}
        connecte={utilisateur !== null}
      />

      <main id="contenu" ref={contenu} tabIndex={-1}>
        {/* US4 à US7 : pages de compte. Chacune est dans son fichier,
            pour que les quatre US se développent en parallèle sans se
            gêner dans App.tsx. */}
        {pageCompte === 'inscription' ? (
          <Inscription
            onAccueil={revenirAccueil}
            onInscrit={revenirAccueil}
            onConnexion={() => ouvrirPageCompte('connexion')}
          />
        ) : pageCompte === 'connexion' ? (
          <Connexion
            onAccueil={revenirAccueil}
            onConnecte={() => ouvrirPageCompte('profil')}
            onInscription={() => ouvrirPageCompte('inscription')}
          />
        ) : pageCompte === 'profil' ? (
          <Profil
            onAccueil={revenirAccueil}
            onDeconnecte={revenirAccueil}
            onConnexion={() => ouvrirPageCompte('connexion')}
          />
        ) : pageInfo === 'mentions' ? (
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
        <div className="pied-haut">
          <p className="pied-accroche">
            T-shirts pour femme et homme, dans toutes les tailles.
          </p>

          {categories.length > 0 && (
            <nav aria-label="Boutique" className="pied-colonne">
              <h2>Boutique</h2>
              <ul>
                {categories.map((categorie) => (
                  <li key={categorie.id}>
                    <button
                      type="button"
                      onClick={() => afficherProduits(categorie)}
                    >
                      {categorie.nom}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <nav aria-label="Informations légales" className="pied-colonne">
            <h2>Informations</h2>
            <ul>
              <li>
                <button
                  type="button"
                  onClick={() => ouvrirPageInfo('mentions')}
                >
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
        </div>

        {/* Grand logo en lettres : décoratif, le nom du site est déjà
            annoncé par l'en-tête */}
        <p className="logo pied-logo" aria-hidden="true">
          FACE
        </p>

        <p className="pied-bas">
          Projet d'école, 2026. Les images sont provisoires.
        </p>
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
