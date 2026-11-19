// US5 — Connexion.
//
// Le formulaire appelle POST /api/connexion. Si le back accepte, il a déjà
// ouvert la session (cookie JSESSIONID) : il ne reste ici qu'à prévenir le
// contexte, pour que l'en-tête et le profil sachent qui est connecté.
//
// Rien n'est stocké dans le navigateur (ni localStorage, ni sessionStorage) :
// le serveur reste seul juge de qui est connecté.

import { useState, type FormEvent } from 'react'
import { envoyerJson, ErreurHttp, type Utilisateur } from '../api'
import { useAuth } from '../ContexteAuth'

// POINT NOTÉ — énumération de comptes : UN seul message, que l'email soit
// inconnu ou le mot de passe faux. Le back renvoie déjà le même dans les
// deux cas, mais on ne l'affiche pas tel quel : on écrit le nôtre. Ainsi,
// même si le back changeait un jour de texte, la page ne pourrait pas
// trahir lequel des deux champs est faux.
const IDENTIFIANTS_INCORRECTS = 'Email ou mot de passe incorrect'

const SERVEUR_INJOIGNABLE =
  'Connexion impossible pour le moment. Vérifiez votre connexion internet et réessayez.'

type Props = {
  onAccueil: () => void
  // Appelé après une connexion réussie
  onConnecte: () => void
  // Pour proposer « Créer un compte »
  onInscription: () => void
}

function Connexion({ onAccueil, onConnecte, onInscription }: Props) {
  const { definirUtilisateur } = useAuth()

  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  // Empêche un double clic d'envoyer deux connexions de suite
  const [envoi, setEnvoi] = useState(false)

  async function seConnecter(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault()
    if (envoi) return

    setEnvoi(true)
    setErreur(null)

    try {
      const compte = await envoyerJson<Utilisateur>('/api/connexion', {
        email,
        motDePasse,
      })
      if (compte) {
        definirUtilisateur(compte)
        // La page va changer : inutile de remettre envoi à false.
        onConnecte()
        return
      }
      // 200 sans corps : ne devrait pas arriver, on le traite comme un échec.
      setErreur(SERVEUR_INJOIGNABLE)
    } catch (e) {
      if (e instanceof ErreurHttp && e.statut === 401) {
        setErreur(IDENTIFIANTS_INCORRECTS)
      } else if (e instanceof ErreurHttp && e.statut === 400) {
        // Champ vide : le back renvoie le message du champ concerné.
        setErreur(e.message)
      } else {
        setErreur(SERVEUR_INJOIGNABLE)
      }
    }

    // Après un échec, on vide le mot de passe mais on garde l'email :
    // c'est presque toujours le mot de passe qui est mal tapé.
    setMotDePasse('')
    setEnvoi(false)
  }

  return (
    <section className="formulaire" aria-labelledby="titre-connexion">
      <h1 id="titre-connexion">Se connecter</h1>

      <form onSubmit={seConnecter} noValidate>
        <label>
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={erreur !== null}
            aria-describedby={erreur ? 'erreur-connexion' : undefined}
            required
          />
        </label>

        <label>
          Mot de passe
          <input
            type="password"
            name="motDePasse"
            autoComplete="current-password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            aria-invalid={erreur !== null}
            aria-describedby={erreur ? 'erreur-connexion' : undefined}
            required
          />
        </label>

        {/* role="alert" : le lecteur d'écran annonce le message dès qu'il
            apparaît, sans que l'utilisateur ait à le chercher. */}
        {erreur && (
          <p id="erreur-connexion" className="message message--erreur" role="alert">
            {erreur}
          </p>
        )}

        <button type="submit" className="bouton" disabled={envoi}>
          {envoi ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <p>Pas encore de compte ?</p>
      <button type="button" className="bouton bouton--contour" onClick={onInscription}>
        Créer un compte
      </button>
      <button type="button" className="bouton bouton--contour" onClick={onAccueil}>
        Retour à l’accueil
      </button>
    </section>
  )
}

export default Connexion
