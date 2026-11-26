// US6 — Affichage et modification du profil, et US7 — Déconnexion.
//
// Les informations viennent du contexte (useAuth) : pas besoin d'appeler
// l'API, FournisseurAuth les a déjà récupérées au démarrage.
//
// La déconnexion elle-même (appel au serveur, oubli du compte, retour à
// l'accueil) est écrite une seule fois dans App et reçue en prop. Cette
// page n'ajoute que ce qui lui est propre : le bouton et le message si
// l'appel échoue.
//
// La modification (US6) et le changement de mot de passe sont deux
// formulaires à part (ModificationProfil, ChangementMotDePasse), affichés
// à la place des informations quand on clique sur le bouton correspondant.

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../ContexteAuth'
import ChangementMotDePasse from './ChangementMotDePasse'
import ModificationProfil from './ModificationProfil'

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

  // Formulaire ouvert (aucun, informations ou mot de passe) et message de
  // confirmation après un enregistrement
  const [formulaire, setFormulaire] = useState<'infos' | 'motDePasse' | null>(null)
  const [confirmation, setConfirmation] = useState<string | null>(null)

  // En refermant un formulaire, le focus revient sur le bouton qui l'a
  // ouvert au lieu de se perdre en haut de la page.
  const boutonModifier = useRef<HTMLButtonElement>(null)
  const boutonMotDePasse = useRef<HTMLButtonElement>(null)
  const dernierFormulaire = useRef<'infos' | 'motDePasse' | null>(null)
  useEffect(() => {
    if (formulaire === null) {
      if (dernierFormulaire.current === 'infos') boutonModifier.current?.focus()
      if (dernierFormulaire.current === 'motDePasse') boutonMotDePasse.current?.focus()
    }
    dernierFormulaire.current = formulaire
  }, [formulaire])

  const ouvrir = (choix: 'infos' | 'motDePasse') => {
    setConfirmation(null)
    setFormulaire(choix)
  }

  const fermer = (message: string | null) => {
    setFormulaire(null)
    setConfirmation(message)
  }

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

      {utilisateur && formulaire === 'infos' ? (
        <ModificationProfil
          utilisateur={utilisateur}
          onEnregistre={() => fermer('Vos informations ont été enregistrées.')}
          onAnnuler={() => fermer(null)}
        />
      ) : utilisateur && formulaire === 'motDePasse' ? (
        <ChangementMotDePasse
          onEnregistre={() => fermer('Votre mot de passe a été changé.')}
          onAnnuler={() => fermer(null)}
        />
      ) : utilisateur ? (
        <>
          {/* role="status" : annoncé par les lecteurs d'écran sans
              interrompre, contrairement à une erreur (role="alert"). */}
          {confirmation && (
            <p className="message" role="status">
              {confirmation}
            </p>
          )}

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
            ref={boutonModifier}
            onClick={() => ouvrir('infos')}
          >
            Modifier mes informations
          </button>

          <button
            type="button"
            className="bouton"
            ref={boutonMotDePasse}
            onClick={() => ouvrir('motDePasse')}
          >
            Changer mon mot de passe
          </button>

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
