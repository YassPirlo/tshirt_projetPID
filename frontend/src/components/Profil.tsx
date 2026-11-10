// US7 — Mon profil, et US6 — Déconnexion.
//
// SQUELETTE À COMPLÉTER.
//
// US7 : afficher les informations du compte connecté. Pas besoin d'appeler
// l'API : le contexte les a déjà, il suffit de les lire.
//
//   const { utilisateur } = useAuth()
//
// Si utilisateur est null, c'est que personne n'est connecté : afficher un
// message et un bouton vers la connexion plutôt qu'une page vide.
//
// US6 : le bouton de déconnexion.
//  1. appeler envoyerJson('/api/deconnexion')
//  2. en cas de succès, prévenir le contexte avec oublierUtilisateur()
//  3. rediriger avec onDeconnecte()
//
// Important : c'est bien le serveur qui doit invalider la session.
// Se contenter d'un oublierUtilisateur() côté front laisserait la session
// active sur le back, donc le compte resterait accessible après un F5.

type Props = {
  onAccueil: () => void
  // Appelé après une déconnexion réussie
  onDeconnecte: () => void
  // Pour l'utilisateur qui arrive ici sans être connecté
  onConnexion: () => void
}

function Profil({ onAccueil, onDeconnecte, onConnexion }: Props) {
  return (
    <section className="formulaire" aria-labelledby="titre-profil">
      <h1 id="titre-profil">Mon profil</h1>

      <p>Informations du compte à afficher (US7).</p>
      <p>Bouton de déconnexion à écrire (US6).</p>

      <button type="button" className="bouton" onClick={onConnexion}>
        Se connecter
      </button>
      <button type="button" className="bouton" onClick={onAccueil}>
        Retour à l’accueil
      </button>

      {/* onDeconnecte sera appelé après l'appel à l'API */}
      <span hidden>{String(!!onDeconnecte)}</span>
    </section>
  )
}

export default Profil
