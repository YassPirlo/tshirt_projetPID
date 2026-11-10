// US5 — Connexion.
//
// SQUELETTE À COMPLÉTER. Le socle est en place, il reste à écrire le
// formulaire et l'appel à l'API.
//
// Marche à suivre :
//  1. un formulaire contrôlé avec email et mot de passe ;
//  2. à la soumission, appeler
//       envoyerJson<Utilisateur>('/api/connexion', { email, motDePasse })
//  3. en cas de succès, prévenir le contexte :
//       definirUtilisateur(compte)
//     puis rediriger avec onConnecte() ;
//  4. en cas d'échec (statut 401), afficher le message.
//
// ATTENTION, POINT NOTÉ : le message d'erreur doit être le MÊME que
// l'email soit inconnu ou que le mot de passe soit faux. Quelque chose
// comme « Email ou mot de passe incorrect ». Si on distingue les deux
// cas, n'importe qui peut tester des adresses pour découvrir lesquelles
// ont un compte sur le site. C'est une faille classique, appelée
// énumération de comptes.

type Props = {
  onAccueil: () => void
  // Appelé après une connexion réussie
  onConnecte: () => void
  // Pour proposer « Créer un compte »
  onInscription: () => void
}

function Connexion({ onAccueil, onConnecte, onInscription }: Props) {
  return (
    <section className="formulaire" aria-labelledby="titre-connexion">
      <h1 id="titre-connexion">Se connecter</h1>

      <p>Formulaire à écrire (US5).</p>

      <button type="button" className="bouton" onClick={onInscription}>
        Créer un compte
      </button>
      <button type="button" className="bouton" onClick={onAccueil}>
        Retour à l’accueil
      </button>

      {/* onConnecte sera appelé après l'appel à l'API */}
      <span hidden>{String(!!onConnecte)}</span>
    </section>
  )
}

export default Connexion
