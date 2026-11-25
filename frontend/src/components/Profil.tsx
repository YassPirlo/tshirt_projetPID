// US6 — Affichage du profil, et US7 — Déconnexion.
//
// Les informations viennent du contexte (useAuth) : pas besoin d'appeler
// l'API, FournisseurAuth les a déjà récupérées au démarrage.
//
// La déconnexion elle-même (appel au serveur, oubli du compte, retour à
// l'accueil) est écrite une seule fois dans App et reçue en prop. Cette
// page n'ajoute que ce qui lui est propre : le bouton et le message si
// l'appel échoue.

import { useState } from 'react'
import { useAuth } from '../ContexteAuth'

type Props = {
  onAccueil: () => void
  // US7 : déconnexion complète. Lève une erreur si le serveur refuse ;
  // l'utilisateur reste alors connecté.
  onDeconnexion: () => Promise<void>
  // Pour l'utilisateur qui arrive ici sans être connecté
  onConnexion: () => void
}

function Profil({ onAccueil, onDeconnexion, onConnexion }: Props) {
  const { utilisateur, chargement } = useAuth()
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  const seDeconnecter = async () => {
    setErreur(null)
    setEnCours(true)
    try {
      await onDeconnexion()
    } catch {
      setErreur(
        'La déconnexion a échoué. Vous êtes toujours connecté·e, veuillez réessayer.',
      )
      setEnCours(false)
    }
  }

  // Tant qu'on vérifie la session (F5 sur cette page), on ne sait pas
  // encore si quelqu'un est connecté : afficher « Se connecter » une
  // fraction de seconde serait faux.
  if (chargement) {
    return (
      <p className="rayon compteur" aria-busy="true">
        Chargement…
      </p>
    )
  }

  return (
    <section className="formulaire" aria-labelledby="titre-profil">
      <h1 id="titre-profil">Mon profil</h1>

      {utilisateur ? (
        <>
          {/* React échappe ces valeurs : elles viennent de la saisie des
              utilisateurs et ne peuvent pas y glisser de HTML. */}
          <dl className="profil-infos">
            <dt>Prénom</dt>
            <dd>{utilisateur.prenom}</dd>
            <dt>Nom</dt>
            <dd>{utilisateur.nom}</dd>
            <dt>Email</dt>
            <dd>{utilisateur.email}</dd>
            <dt>Adresse</dt>
            <dd>{utilisateur.adresse}</dd>
            <dt>Code postal</dt>
            <dd>{utilisateur.codePostal}</dd>
            <dt>Ville</dt>
            <dd>{utilisateur.ville}</dd>
          </dl>

          {erreur && (
            <p className="message message--erreur" role="alert">
              {erreur}
            </p>
          )}

          <button
            type="button"
            className="bouton"
            onClick={seDeconnecter}
            disabled={enCours}
          >
            {enCours ? 'Déconnexion…' : 'Se déconnecter'}
          </button>
        </>
      ) : (
        <>
          <p>Vous n’êtes pas connecté.</p>
          <button type="button" className="bouton" onClick={onConnexion}>
            Se connecter
          </button>
        </>
      )}

      <button type="button" className="bouton" onClick={onAccueil}>
        Retour à l’accueil
      </button>
    </section>
  )
}

export default Profil
