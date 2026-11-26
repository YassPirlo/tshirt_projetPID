// Changer son mot de passe, depuis la page Mon profil.
//
// On demande le mot de passe ACTUEL : quelqu'un qui trouve un ordinateur
// resté connecté ne peut pas s'approprier le compte sans le connaître.
// Le nouveau mot de passe est tapé deux fois ; la comparaison se fait ici,
// avant l'envoi, le back ne reçoit que l'ancien et le nouveau.
//
// À l'envoi : PUT /api/profil/mot-de-passe avec changerMotDePasse(), puis
// onEnregistre() pour que la page Profil affiche la confirmation.
//
// Erreurs :
//  - confirmation différente -> message sous le champ, rien n'est envoyé ;
//  - 400 : mot de passe actuel faux, ou nouveau refusé -> message du back ;
//  - 401 : la session a expiré -> on invite à se reconnecter ;
//  - autre : message générique (serveur arrêté, réseau…).

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { changerMotDePasse, ErreurHttp } from '../api'
import JaugeMotDePasse from './JaugeMotDePasse'

type Props = {
  // Appelé après un changement réussi
  onEnregistre: () => void
  onAnnuler: () => void
}

const MESSAGE_CONFIRMATION = 'Les deux mots de passe ne sont pas identiques'

function ChangementMotDePasse({ onEnregistre, onAnnuler }: Props) {
  const [ancien, setAncien] = useState('')
  const [nouveau, setNouveau] = useState('')
  const [confirmation, setConfirmation] = useState('')

  const [erreur, setErreur] = useState<string | null>(null)
  const [erreurConfirmation, setErreurConfirmation] = useState<string | null>(null)
  const [envoi, setEnvoi] = useState(false)

  // Le bouton qui a ouvert le formulaire disparaît : on place le focus
  // sur le premier champ pour ne pas le perdre en haut de page.
  const premierChamp = useRef<HTMLInputElement>(null)
  const champConfirmation = useRef<HTMLInputElement>(null)
  useEffect(() => {
    premierChamp.current?.focus()
  }, [])

  const envoyer = async (evenement: FormEvent<HTMLFormElement>) => {
    evenement.preventDefault()
    setErreur(null)

    if (nouveau !== confirmation) {
      setErreurConfirmation(MESSAGE_CONFIRMATION)
      champConfirmation.current?.focus()
      return
    }

    setEnvoi(true)
    try {
      await changerMotDePasse(ancien, nouveau)
      onEnregistre()
    } catch (e) {
      if (e instanceof ErreurHttp && e.statut === 400) {
        setErreur(e.message)
      } else if (e instanceof ErreurHttp && e.statut === 401) {
        setErreur('Votre session a expiré. Reconnectez-vous pour changer votre mot de passe.')
      } else {
        setErreur('Impossible de changer votre mot de passe. Réessayez plus tard.')
      }
      setEnvoi(false)
    }
  }

  return (
    <>
      {erreur && (
        <p className="message message--erreur" role="alert">
          {erreur}
        </p>
      )}

      <form onSubmit={envoyer} aria-label="Changer mon mot de passe">
        <label>
          Mot de passe actuel
          <input
            type="password"
            name="ancienMotDePasse"
            ref={premierChamp}
            autoComplete="current-password"
            required
            value={ancien}
            onChange={(e) => setAncien(e.target.value)}
          />
        </label>

        <label>
          Nouveau mot de passe (8 caractères minimum)
          <input
            type="password"
            name="nouveauMotDePasse"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={72}
            value={nouveau}
            onChange={(e) => {
              setNouveau(e.target.value)
              setErreurConfirmation(null)
            }}
            aria-describedby={nouveau ? 'conseils-nouveau-mot-de-passe' : undefined}
          />
        </label>
        <JaugeMotDePasse motDePasse={nouveau} id="conseils-nouveau-mot-de-passe" />

        <label>
          Confirmer le nouveau mot de passe
          <input
            type="password"
            name="confirmationMotDePasse"
            ref={champConfirmation}
            autoComplete="new-password"
            required
            maxLength={72}
            value={confirmation}
            onChange={(e) => {
              setConfirmation(e.target.value)
              setErreurConfirmation(null)
            }}
            aria-invalid={erreurConfirmation ? true : undefined}
            aria-describedby={erreurConfirmation ? 'erreur-confirmation' : undefined}
          />
        </label>
        {erreurConfirmation && (
          <p id="erreur-confirmation" className="message message--erreur" role="alert">
            {erreurConfirmation}
          </p>
        )}

        <button type="submit" className="bouton" disabled={envoi}>
          {envoi ? 'Enregistrement…' : 'Changer le mot de passe'}
        </button>
        <button type="button" className="bouton" onClick={onAnnuler} disabled={envoi}>
          Annuler
        </button>
      </form>
    </>
  )
}

export default ChangementMotDePasse
