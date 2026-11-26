// US6 — Modifier ses informations personnelles.
//
// Formulaire contrôlé, comme l'inscription, mais pré-rempli avec le compte
// connecté. Pays, code postal et ville passent par ChampsAdresse, comme à
// l'inscription. Pas de mot de passe : il se change à part, avec l'ancien
// (ChangementMotDePasse).
//
// À l'envoi :
//  1. PUT /api/profil avec modifierProfil() ;
//  2. si ça marche, on donne le compte à jour au contexte
//     (definirUtilisateur) : « Bienvenue, <prénom> » change tout de suite
//     dans l'en-tête, sans recharger la page ;
//  3. puis on prévient la page Profil avec onEnregistre().
//
// Erreurs :
//  - 409 : l'email appartient à un autre compte -> message sous l'email ;
//  - 400 : un champ est refusé par le back -> on affiche son message ;
//  - 401 : la session a expiré -> on invite à se reconnecter ;
//  - autre : message générique (serveur arrêté, réseau…).

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ErreurHttp, modifierProfil, type Utilisateur } from '../api'
import { useAuth } from '../ContexteAuth'
import { PAYS_PAR_DEFAUT } from '../pays'
import ChampsAdresse from './ChampsAdresse'

type Props = {
  // Le compte tel qu'il est avant modification
  utilisateur: Utilisateur
  // Appelé après un enregistrement réussi
  onEnregistre: () => void
  onAnnuler: () => void
}

const MESSAGE_EMAIL_PRIS = 'Un compte existe déjà avec cet email'

function ModificationProfil({ utilisateur, onEnregistre, onAnnuler }: Props) {
  const { definirUtilisateur } = useAuth()

  const [prenom, setPrenom] = useState(utilisateur.prenom)
  const [nom, setNom] = useState(utilisateur.nom)
  const [adresse, setAdresse] = useState(utilisateur.adresse)
  const [codePostal, setCodePostal] = useState(utilisateur.codePostal)
  const [ville, setVille] = useState(utilisateur.ville)
  const [email, setEmail] = useState(utilisateur.email)
  // Comptes créés avant l'ajout du pays : la Belgique par défaut
  const [pays, setPays] = useState(utilisateur.pays || PAYS_PAR_DEFAUT)

  const [erreurEmail, setErreurEmail] = useState<string | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [envoi, setEnvoi] = useState(false)

  // Le bouton « Modifier mes informations » disparaît à l'ouverture du
  // formulaire : sans ça, le focus clavier serait perdu en haut de page.
  const premierChamp = useRef<HTMLInputElement>(null)
  useEffect(() => {
    premierChamp.current?.focus()
  }, [])

  const envoyer = async (evenement: FormEvent<HTMLFormElement>) => {
    evenement.preventDefault()
    setErreur(null)
    setErreurEmail(null)
    setEnvoi(true)

    try {
      const compte = await modifierProfil({
        email,
        nom,
        prenom,
        adresse,
        codePostal,
        ville,
        pays,
      })
      definirUtilisateur(compte)
      onEnregistre()
    } catch (e) {
      if (e instanceof ErreurHttp && e.statut === 409) {
        setErreurEmail(MESSAGE_EMAIL_PRIS)
      } else if (e instanceof ErreurHttp && e.statut === 400) {
        setErreur(e.message)
      } else if (e instanceof ErreurHttp && e.statut === 401) {
        setErreur('Votre session a expiré. Reconnectez-vous pour modifier vos informations.')
      } else {
        setErreur('Impossible d’enregistrer vos informations. Réessayez plus tard.')
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

      <form onSubmit={envoyer} aria-label="Modifier mes informations">
        <label>
          Prénom
          <input
            type="text"
            name="prenom"
            ref={premierChamp}
            autoComplete="given-name"
            required
            maxLength={100}
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
          />
        </label>

        <label>
          Nom
          <input
            type="text"
            name="nom"
            autoComplete="family-name"
            required
            maxLength={100}
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />
        </label>

        <label>
          Adresse
          <input
            type="text"
            name="adresse"
            autoComplete="street-address"
            required
            maxLength={255}
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
          />
        </label>

        <ChampsAdresse
          pays={pays}
          codePostal={codePostal}
          ville={ville}
          onPays={setPays}
          onCodePostal={setCodePostal}
          onVille={setVille}
        />

        <label>
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setErreurEmail(null)
            }}
            aria-invalid={erreurEmail ? true : undefined}
            aria-describedby={erreurEmail ? 'erreur-email' : undefined}
          />
        </label>
        {erreurEmail && (
          <p id="erreur-email" className="message message--erreur" role="alert">
            {erreurEmail}
          </p>
        )}

        <button type="submit" className="bouton" disabled={envoi}>
          {envoi ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        <button
          type="button"
          className="bouton"
          onClick={onAnnuler}
          disabled={envoi}
        >
          Annuler
        </button>
      </form>
    </>
  )
}

export default ModificationProfil
