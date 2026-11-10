import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useMatch,
  useNavigate,
  useNavigationType,
} from 'react-router'
import {
  getCategories,
  getProduit,
  getProduitsDeCategorie,
  type Categorie,
  type Produit,
} from './api'
import { chemins, lireId, modeles } from './chemins'
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
import PageIntrouvable from './components/PageIntrouvable'
import { useAuth } from './ContexteAuth'
import {
  enregistrerConsentement,
  lireConsentement,
  type Consentement,
} from './consentement'
import './App.css'

// Titre de l'onglet pour les pages fixes. Les pages d'une catégorie ou
// d'un produit utilisent leur nom (voir plus bas).
const TITRES: Record<string, string> = {
  [chemins.inscription]: 'Créer un compte',
  [chemins.connexion]: 'Se connecter',
  [chemins.profil]: 'Mon profil',
  [chemins.mentions]: 'Mentions légales',
  [chemins.confidentialite]: 'Confidentialité',
  [chemins.cookies]: 'Cookies',
}

// App charge les données et choisit quoi afficher d'après l'adresse.
//
// C'est l'ADRESSE qui dit quelle page est affichée (React Router), et
// plus des variables d'état : le bouton Retour du navigateur fonctionne,
// un F5 reste sur la même page, et on peut envoyer le lien d'un produit.
// L'affichage lui-même est dans les composants du dossier components,
// qui ne connaissent pas le routeur : ils reçoivent des fonctions
// (onAccueil, onChoisir…) et c'est App qui les traduit en adresses.
function App() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const typeNavigation = useNavigationType()

  // Identifiants lus dans l'adresse (null si on est sur une autre page).
  // « /* » : la page d'un produit fait aussi partie de sa catégorie.
  const routeCategorie = useMatch(modeles.categorie + '/*')
  const routeProduit = useMatch(modeles.produit)
  const categorieId = lireId(routeCategorie?.params.categorieId)
  const produitId = lireId(routeProduit?.params.produitId)

  const [categories, setCategories] = useState<Categorie[]>([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)

  // US2 : produits de la dernière catégorie chargée. On retient à quelle
  // catégorie ils appartiennent : tant que l'adresse en désigne une
  // autre, la liste est « en cours de chargement ».
  const [rayon, setRayon] = useState<{
    categorieId: number
    produits: Produit[]
  } | null>(null)
  const [erreurRayon, setErreurRayon] = useState<number | null>(null)

  // US3 : dernier produit chargé, sur le même principe
  const [fiche, setFiche] = useState<Produit | null>(null)
  const [erreurFiche, setErreurFiche] = useState<number | null>(null)

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

  // Changer de page = changer d'adresse. Le reste (chargement des
  // données, affichage) en découle.
  const revenirAccueil = () => navigate(chemins.accueil)
  const afficherProduits = (categorie: Categorie) =>
    navigate(chemins.categorie(categorie.id))

  // Clic sur l'icône « Mon compte » de l'en-tête : le profil si on est
  // déjà connecté, le formulaire de connexion sinon.
  const ouvrirCompte = () =>
    navigate(utilisateur ? chemins.profil : chemins.connexion)

  // US1 : au chargement du site, on récupère les catégories
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

  // US2 : quand l'adresse désigne une catégorie, on charge ses produits.
  // Si ce sont déjà ceux en mémoire (retour depuis un produit), rien à
  // faire. Si on change de page avant la réponse, la requête est annulée
  // pour ne pas afficher les données de la mauvaise page.
  const rayonCharge = rayon?.categorieId
  useEffect(() => {
    if (categorieId === null || categorieId === rayonCharge) return
    const controleur = new AbortController()

    getProduitsDeCategorie(categorieId, controleur.signal)
      .then((produits) => {
        setRayon({ categorieId, produits })
        setErreurRayon(null)
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setErreurRayon(categorieId)
      })

    return () => controleur.abort()
  }, [categorieId, rayonCharge])

  // US3 : quand l'adresse désigne un produit, on charge son détail
  useEffect(() => {
    if (produitId === null) return
    const controleur = new AbortController()

    getProduit(produitId, controleur.signal)
      .then((produit) => {
        setFiche(produit)
        setErreurFiche(null)
      })
      .catch((e) => {
        if (e.name !== 'AbortError') {
          setFiche(null)
          setErreurFiche(produitId)
        }
      })

    return () => controleur.abort()
  }, [produitId])

  // Ce qui est affiché se déduit de l'adresse et de ce qui est en mémoire
  const categorieSelectionnee =
    categories.find((categorie) => categorie.id === categorieId) ?? null

  const rayonPret = rayon !== null && rayon.categorieId === categorieId
  const erreurProduits =
    categorieId !== null && erreurRayon === categorieId
      ? 'Impossible de charger les produits.'
      : null
  const chargementProduits = !rayonPret && !erreurProduits

  const produit = fiche !== null && fiche.id === produitId ? fiche : null
  const erreurProduit =
    produitId !== null && erreurFiche === produitId
      ? 'Impossible de charger ce produit.'
      : null
  const chargementProduit = !produit && !erreurProduit

  // Une adresse de catégorie ou de produit donne une « page introuvable »
  // si l'identifiant n'est pas un nombre, ou si la catégorie n'existe pas
  // (on ne peut le savoir qu'une fois les catégories chargées).
  const pageCategorie = (contenu: (categorie: Categorie) => ReactNode) => {
    if (categorieSelectionnee) return contenu(categorieSelectionnee)
    if (categorieId !== null && chargement)
      return (
        <p className="rayon compteur" aria-busy="true">
          Chargement…
        </p>
      )
    if (categorieId !== null && erreur)
      return (
        <div className="rayon">
          <p className="message message--erreur" role="alert">
            {erreur} Vérifiez que le serveur est démarré, puis rechargez la
            page.
          </p>
        </div>
      )
    return <PageIntrouvable onAccueil={revenirAccueil} />
  }

  // Le fond animé ne se montre vraiment que sur l'accueil
  const surAccueil = pathname === chemins.accueil

  // Titre de l'onglet : il suit la page, pour l'historique du navigateur,
  // les favoris et les lecteurs d'écran
  const titrePage =
    produit?.nom ?? categorieSelectionnee?.nom ?? TITRES[pathname] ?? null
  useEffect(() => {
    document.title = titrePage ? `${titrePage} | FACE` : 'FACE'
  }, [titrePage])

  // À chaque changement de page :
  // - on remonte en haut, sauf avec les boutons Précédent / Suivant du
  //   navigateur (« POP »), qui retrouvent seuls l'endroit où on était ;
  // - accessibilité : le focus va au début du contenu. Sinon, le bouton
  //   cliqué disparaît et un utilisateur au clavier ou au lecteur d'écran
  //   ne sait plus où il se trouve.
  const contenu = useRef<HTMLElement>(null)
  const pagePrecedente = useRef(pathname)
  useEffect(() => {
    if (pagePrecedente.current === pathname) return // premier affichage
    pagePrecedente.current = pathname
    if (typeNavigation !== 'POP') window.scrollTo({ top: 0 })
    // preventScroll : le focus ne doit pas faire défiler la page sous
    // l'en-tête collé en haut
    contenu.current?.focus({ preventScroll: true })
  }, [pathname, typeNavigation])

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
        // Hors d'une page de catégorie ou de produit, aucune catégorie
        // n'est soulignée
        categorieActive={categorieSelectionnee}
        onChoisir={afficherProduits}
        onAccueil={revenirAccueil}
        // US4 à US7 : l'icône « Mon compte » devient active
        onCompte={ouvrirCompte}
        connecte={utilisateur !== null}
      />

      <main id="contenu" ref={contenu} tabIndex={-1}>
        {/* Une <Route> par page : React Router affiche celle dont le
            chemin correspond à l'adresse. */}
        <Routes>
          <Route
            path={chemins.accueil}
            element={
              <Accueil
                categories={categories}
                chargement={chargement}
                erreur={erreur}
                onChoisir={afficherProduits}
              />
            }
          />

          {/* US2 */}
          <Route
            path={modeles.categorie}
            element={pageCategorie((categorie) => (
              <ListeProduits
                categorie={categorie}
                produits={rayonPret ? rayon.produits : []}
                chargement={chargementProduits}
                erreur={erreurProduits}
                onAccueil={revenirAccueil}
                onOuvrirProduit={(choisi) =>
                  navigate(chemins.produit(categorie.id, choisi.id))
                }
              />
            ))}
          />

          {/* US3 */}
          <Route
            path={modeles.produit}
            element={pageCategorie((categorie) =>
              produitId === null ? (
                <PageIntrouvable onAccueil={revenirAccueil} />
              ) : produit?.categorie && produit.categorie.id !== categorie.id ? (
                // Adresse bricolée (bon produit, mauvaise catégorie) : on
                // la corrige, sans ajouter d'étape à l'historique
                <Navigate
                  replace
                  to={chemins.produit(produit.categorie.id, produit.id)}
                />
              ) : (
                <FicheProduit
                  key={produitId}
                  categorie={categorie}
                  produit={produit}
                  chargement={chargementProduit}
                  erreur={erreurProduit}
                  onAccueil={revenirAccueil}
                  onRetour={() => navigate(chemins.categorie(categorie.id))}
                />
              ),
            )}
          />

          {/* US4 à US7 : pages de compte. Chacune est dans son fichier,
              pour que les quatre US se développent en parallèle sans se
              gêner dans App.tsx. */}
          <Route
            path={chemins.inscription}
            element={
              <Inscription
                onAccueil={revenirAccueil}
                onInscrit={revenirAccueil}
                onConnexion={() => navigate(chemins.connexion)}
              />
            }
          />
          <Route
            path={chemins.connexion}
            element={
              <Connexion
                onAccueil={revenirAccueil}
                onConnecte={() => navigate(chemins.profil)}
                onInscription={() => navigate(chemins.inscription)}
              />
            }
          />
          <Route
            path={chemins.profil}
            element={
              <Profil
                onAccueil={revenirAccueil}
                onDeconnecte={revenirAccueil}
                onConnexion={() => navigate(chemins.connexion)}
              />
            }
          />

          {/* Pages d'information (bas de page) */}
          <Route
            path={chemins.mentions}
            element={
              <MentionsLegales
                onAccueil={revenirAccueil}
                onConfidentialite={() => navigate(chemins.confidentialite)}
                onCookies={() => navigate(chemins.cookies)}
              />
            }
          />
          <Route
            path={chemins.confidentialite}
            element={
              <PolitiqueConfidentialite
                onAccueil={revenirAccueil}
                onCookies={() => navigate(chemins.cookies)}
              />
            }
          />
          <Route
            path={chemins.cookies}
            element={
              <PolitiqueCookies
                consentement={consentement}
                onAccueil={revenirAccueil}
                onModifierChoix={() => setBandeauRouvert(true)}
              />
            }
          />

          {/* Toute autre adresse */}
          <Route
            path="*"
            element={<PageIntrouvable onAccueil={revenirAccueil} />}
          />
        </Routes>
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
                  onClick={() => navigate(chemins.mentions)}
                >
                  Mentions légales
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate(chemins.confidentialite)}
                >
                  Confidentialité
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate(chemins.cookies)}>
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
          onEnSavoirPlus={() => navigate(chemins.cookies)}
        />
      )}
    </>
  )
}

export default App
