// US5 — Création de compte.
//
// Un formulaire contrôlé : chaque champ est relié à un état React, ce qui
// permet de lire les valeurs à l'envoi et de vider l'erreur dès qu'on
// corrige.
//
// À l'envoi :
//  1. POST /api/inscription avec envoyerJson() ;
//  2. si ça marche, on prévient le contexte (definirUtilisateur) : l'en-tête
//     affiche alors « Bienvenue, <prénom> » sans recharger la page ;
//  3. puis on redirige avec onInscrit().
//
// Erreurs :
//  - 409 : l'email est déjà pris -> message à côté du champ email ;
//  - 400 : un champ est refusé par le back -> on affiche son message ;
//  - autre : message générique (serveur arrêté, réseau…).
// Avant l'envoi, on vérifie que les deux mots de passe sont identiques :
// une faute de frappe dans un champ masqué rendrait le compte inutilisable.
// Rien n'est envoyé au back dans ce cas, la confirmation ne le concerne pas.
// Pays, code postal et ville sont vérifiés par ChampsAdresse (la ville se
// choisit dans la liste des localités du code), la jauge aide à choisir un
// mot de passe solide, et la case des CGV est obligatoire.
// Les messages ont role="alert" pour être lus par les lecteurs d'écran.

import { useRef, useState, type FormEvent } from 'react'
import { envoyerJson, ErreurHttp, type Utilisateur } from '../api'
import { useAuth } from '../ContexteAuth'
import { chemins } from '../chemins'
import { PAYS_PAR_DEFAUT } from '../pays'
import ChampsAdresse from './ChampsAdresse'
import JaugeMotDePasse from './JaugeMotDePasse'

type Props = {
  onAccueil: () => void
  // Appelé après une inscription réussie
  onInscrit: () => void
  // Pour proposer « J'ai déjà un compte »
  onConnexion: () => void
}

const MESSAGE_EMAIL_PRIS = 'Un compte existe déjà avec cet email'
const MESSAGE_CONFIRMATION = 'Les deux mots de passe ne sont pas identiques'

function Inscription({ onAccueil, onInscrit, onConnexion }: Props) {
  const { definirUtilisateur } = useAuth()

  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  // US5 : le backlog demande aussi l'adresse
  const [adresse, setAdresse] = useState('')
  const [codePostal, setCodePostal] = useState('')
  const [ville, setVille] = useState('')
  const [pays, setPays] = useState(PAYS_PAR_DEFAUT)
  const [cgvAcceptees, setCgvAcceptees] = useState(false)

  // Deux erreurs séparées : celle de l'email s'affiche sous le champ email,
  // l'autre en haut du formulaire.
  const [erreurEmail, setErreurEmail] = useState<string | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [erreurConfirmation, setErreurConfirmation] = useState<string | null>(null)
  const [envoi, setEnvoi] = useState(false)
  const champConfirmation = useRef<HTMLInputElement>(null)
  // En cas d'email déjà pris, on y ramène le focus : le message est juste
  // en dessous, il ne peut pas passer inaperçu en bas d'un long formulaire.
  const champEmail = useRef<HTMLInputElement>(null)

  const envoyer = async (evenement: FormEvent<HTMLFormElement>) => {
    // Sans ça, le navigateur rechargerait toute la page
    evenement.preventDefault()
    setErreur(null)
    setErreurEmail(null)

    if (motDePasse !== confirmation) {
      setErreurConfirmation(MESSAGE_CONFIRMATION)
      champConfirmation.current?.focus()
      return
    }

    setEnvoi(true)

    try {
      const compte = await envoyerJson<Utilisateur>('/api/inscription', {
        email,
        motDePasse,
        nom,
        prenom,
        adresse,
        codePostal,
        ville,
        pays,
        cgvAcceptees,
      })
      if (compte) definirUtilisateur(compte)
      onInscrit()
    } catch (e) {
      if (e instanceof ErreurHttp && e.statut === 409) {
        setErreurEmail(MESSAGE_EMAIL_PRIS)
        champEmail.current?.focus()
      } else if (e instanceof ErreurHttp && e.statut === 400) {
        setErreur(e.message)
      } else {
        setErreur('Impossible de créer le compte. Réessayez plus tard.')
      }
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <section className="formulaire" aria-labelledby="titre-inscription">
      <h1 id="titre-inscription">Créer un compte</h1>
      <p>Tous les champs sont obligatoires.</p>

      {erreur && (
        <p className="message message--erreur" role="alert">
          {erreur}
        </p>
      )}

      <form onSubmit={envoyer}>
        <label>
          Prénom
          <input
            type="text"
            name="prenom"
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

        {/* autoComplete : le navigateur peut remplir l'adresse enregistrée
            de l'utilisateur, en respectant les noms standard. */}
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
            ref={champEmail}
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

        <label>
          Mot de passe (8 caractères minimum)
          <input
            type="password"
            name="motDePasse"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={72}
            value={motDePasse}
            onChange={(e) => {
              setMotDePasse(e.target.value)
              setErreurConfirmation(null)
            }}
            aria-describedby={motDePasse ? 'conseils-mot-de-passe' : undefined}
          />
        </label>
        <JaugeMotDePasse motDePasse={motDePasse} id="conseils-mot-de-passe" />

        <label>
          Confirmer le mot de passe
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

        {/* Case obligatoire (required) : le navigateur bloque l'envoi tant
            qu'elle n'est pas cochée, et le back refuse aussi sans elle.
            Le lien s'ouvre dans un nouvel onglet pour ne pas perdre le
            formulaire déjà rempli. */}
        <label className="case-a-cocher">
          <input
            type="checkbox"
            name="cgvAcceptees"
            required
            checked={cgvAcceptees}
            onChange={(e) => setCgvAcceptees(e.target.checked)}
          />
          <span>
            J’ai lu et j’accepte les{' '}
            <a href={chemins.cgv} target="_blank" rel="noopener noreferrer">
              conditions générales de vente
              <span className="visuellement-cache"> (s’ouvre dans un nouvel onglet)</span>
            </a>
          </span>
        </label>

        <button type="submit" className="bouton" disabled={envoi}>
          {envoi ? 'Création…' : 'Créer mon compte'}
        </button>
      </form>

      <button type="button" className="bouton" onClick={onConnexion}>
        J’ai déjà un compte
      </button>
      <button type="button" className="bouton" onClick={onAccueil}>
        Retour à l’accueil
      </button>
    </section>
  )
}

export default Inscription
