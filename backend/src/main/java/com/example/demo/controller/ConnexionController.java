package com.example.demo.controller;

import org.springframework.web.bind.annotation.RestController;

// US5 — Connexion. SQUELETTE À COMPLÉTER.
//
// Ce fichier n'appartient qu'à US5 : personne d'autre n'y touche.
//
// Il manque une brique dans UtilisateurService : la vérification du mot de
// passe. Elle fait partie d'US5, c'est à vous de l'écrire. Quelque chose
// comme :
//
//   public Optional<Utilisateur> verifier(ConnexionRequete requete) {
//       return trouverParEmail(requete.email())
//               .filter(u -> passwordEncoder.matches(
//                       requete.motDePasse(), u.getMotDePasse()));
//   }
//
// matches() et JAMAIS encode() suivi d'un equals() : BCrypt tire un sel
// aléatoire à chaque appel, donc encoder deux fois le même mot de passe
// donne deux hachages différents. Seul matches() sait relire le sel inscrit
// dans le hachage stocké.
//
// Ensuite, dans ce controller :
//  1. @PostMapping("/api/connexion") avec
//       @Valid @RequestBody ConnexionRequete requete
//     et HttpServletRequest en paramètre (nécessaire pour la session) ;
//  2. si verifier() renvoie un utilisateur :
//       SessionUtilisateur.ouvrir(requete HTTP, utilisateur.getId())
//     puis 200 avec UtilisateurReponse.depuis(...) ;
//  3. sinon, 401.
//
// POINT NOTÉ — énumération de comptes : la réponse doit être IDENTIQUE que
// l'email soit inconnu ou que le mot de passe soit faux. Même statut 401,
// même message (« Email ou mot de passe incorrect »). Si les deux cas se
// distinguent, n'importe qui peut tester des adresses pour découvrir
// lesquelles ont un compte chez nous.
//
// À tester :
//  - 200 + session ouverte quand les identifiants sont bons
//  - 401 avec email inconnu
//  - 401 avec bon email mais mauvais mot de passe
//  - et que ces deux 401 renvoient exactement le même corps
@RestController
public class ConnexionController {
}
