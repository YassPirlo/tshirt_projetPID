// US4 — Création de compte.
//
// SQUELETTE À COMPLÉTER. Le socle est en place, il reste à écrire le
// formulaire et l'appel à l'API.
//
// Marche à suivre :
//  1. un formulaire contrôlé avec email, mot de passe, nom, prénom ;
//  2. à la soumission, appeler
//       envoyerJson<Utilisateur>('/api/inscription', { email, motDePasse, nom, prenom })
//  3. en cas de succès, prévenir le contexte :
//       definirUtilisateur(compte)
//     puis rediriger avec onInscrit() ;
//  4. en cas d'ErreurHttp de statut 409, afficher « Un compte existe déjà
//     avec cet email » à côté du champ email. Les autres statuts donnent
//     un message générique.
//
// Pensez au role="alert" sur le message d'erreur : le reste du site le
// fait déjà (voir FicheProduit), et c'est vérifié par les tests
// d'accessibilité.

type Props = {
  onAccueil: () => void
  // Appelé après une inscription réussie
  onInscrit: () => void
  // Pour proposer « J'ai déjà un compte »
  onConnexion: () => void
}

function Inscription({ onAccueil, onInscrit, onConnexion }: Props) {
  return (
    <section className="formulaire" aria-labelledby="titre-inscription">
      <h1 id="titre-inscription">Créer un compte</h1>

      <p>Formulaire à écrire (US4).</p>

      <button type="button" className="bouton" onClick={onConnexion}>
        J’ai déjà un compte
      </button>
      <button type="button" className="bouton" onClick={onAccueil}>
        Retour à l’accueil
      </button>

      {/* onInscrit sera appelé après l'appel à l'API */}
      <span hidden>{String(!!onInscrit)}</span>
    </section>
  )
}

export default Inscription
