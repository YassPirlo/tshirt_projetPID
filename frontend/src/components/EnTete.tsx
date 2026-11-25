import type { Categorie, Utilisateur } from '../api'
import { useState } from 'react'
import {
  IconeCompte,
  IconeFavoris,
  IconePanier,
  IconeRecherche,
} from './Icones'

type Props = {
  categories: Categorie[]
  chargement: boolean
  categorieActive: Categorie | null
  onChoisir: (categorie: Categorie) => void
  onAccueil: () => void
  // US4 à US7 : ouvre le profil si connecté, la connexion sinon
  onCompte: () => void
  // Le compte connecté, ou null pour un visiteur
  utilisateur: Utilisateur | null
  // true tant que le site vérifie s'il reste une session (au démarrage)
  verificationSession: boolean
  // US5 : mène au formulaire d'inscription
  onInscription: () => void
  // US7 : déconnexion complète (serveur, contexte, redirection), fournie
  // par App. Lève une erreur si le serveur refuse.
  onDeconnexion: () => Promise<void>
}

// Actions encore sans US : favoris et panier (US8, US9).
// La recherche et le compte sont écrits à la main plus bas, le premier
// parce qu'il garde sa place dans l'ordre, le second parce qu'il est
// désormais cliquable.
const actionsInactives = [
  { nom: 'Favoris', Icone: IconeFavoris },
  { nom: 'Panier', Icone: IconePanier },
]

// En-tête classique de boutique : logo à gauche, catégories au centre
// (US1), actions à droite.
function EnTete({
  categories,
  chargement,
  categorieActive,
  onChoisir,
  onAccueil,
  onCompte,
  utilisateur,
  verificationSession,
  onInscription,
  onDeconnexion,
}: Props) {
  const connecte = utilisateur !== null
  // Le bouton se bloque pendant l'appel (pas de double clic) et un message
  // s'affiche si le serveur refuse : on reste alors connecté.
  const [deconnexionEnCours, setDeconnexionEnCours] = useState(false)
  const [deconnexionEchouee, setDeconnexionEchouee] = useState(false)

  const seDeconnecter = async () => {
    setDeconnexionEchouee(false)
    setDeconnexionEnCours(true)
    try {
      await onDeconnexion()
    } catch {
      setDeconnexionEchouee(true)
    } finally {
      setDeconnexionEnCours(false)
    }
  }

  return (
    <header className="entete">
      <button
        type="button"
        className="logo entete-logo"
        onClick={onAccueil}
      >
        <img
          src="/images/logo-face-header.png"
          alt="FACE, retour à l'accueil"
          width={162}
          height={96}
        />
      </button>

      <nav aria-label="Catégories" className="entete-menu">
        {chargement ? (
          <p className="entete-attente">Chargement…</p>
        ) : (
          <ul>
            {categories.map((categorie) => (
              <li key={categorie.id}>
                <button
                  type="button"
                  onClick={() => onChoisir(categorie)}
                  aria-pressed={categorieActive?.id === categorie.id}
                >
                  {categorie.nom}
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>

      <div className="entete-droite">
        {/* US4 et US5 : « Une fois connecté, l'application affiche sur
            toutes les pages le message "Bienvenue, <prénom>" ». L'en-tête
            est présent sur toutes les pages, d'où sa place ici.
            Le prénom vient de la saisie de l'utilisateur : React l'échappe,
            il ne peut donc pas y glisser de HTML. */}
        {utilisateur ? (
          // US7 : « déconnexion possible depuis n'importe quelle page ».
          // Fragment et non <div> : le message, le bouton et l'alerte
          // restent des enfants directs de .entete-droite, comme le lien
          // « Créer un compte », pour garder la même mise en page.
          <>
            <p className="entete-bienvenue">
              Bienvenue, {utilisateur.prenom}
            </p>
            <button
              type="button"
              className="lien entete-deconnexion"
              onClick={seDeconnecter}
              disabled={deconnexionEnCours}
            >
              Se déconnecter
            </button>
            {deconnexionEchouee && (
              <p className="message message--erreur entete-alerte" role="alert">
                Déconnexion impossible, réessayez.
              </p>
            )}
          </>
        ) : (
          // US5 : « l'inscription est possible depuis n'importe quelle
          // page ». Masqué pendant la vérification de la session, sinon
          // un membre déjà connecté verrait le lien clignoter au
          // chargement avant que « Bienvenue » ne le remplace.
          !verificationSession && (
            <button
              type="button"
              className="lien entete-inscription"
              onClick={onInscription}
            >
              Créer un compte
            </button>
          )
        )}

        <ul className="entete-actions">
          <li>
            <button
              type="button"
              aria-label="Rechercher"
              aria-disabled="true"
              title="Rechercher (bientôt disponible)"
            >
              <IconeRecherche />
            </button>
          </li>
          <li>
            {/* Le libellé change selon l'état : un lecteur d'écran annonce
                « Mon profil » ou « Se connecter », pas une icône muette. */}
            <button
              type="button"
              aria-label={connecte ? 'Mon profil' : 'Se connecter'}
              title={connecte ? 'Mon profil' : 'Se connecter'}
              onClick={onCompte}
            >
              <IconeCompte />
            </button>
          </li>
          {actionsInactives.map(({ nom, Icone }) => (
            <li key={nom}>
              <button
                type="button"
                aria-label={nom}
                aria-disabled="true"
                title={nom + ' (bientôt disponible)'}
              >
                <Icone />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}

export default EnTete
