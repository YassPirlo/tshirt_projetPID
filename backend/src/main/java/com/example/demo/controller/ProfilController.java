package com.example.demo.controller;

import org.springframework.web.bind.annotation.RestController;

// US7 — Mon profil, et US6 — Déconnexion. SQUELETTE À COMPLÉTER.
//
// Ce fichier n'appartient qu'à US6 + US7 : personne d'autre n'y touche.
//
// Les deux endpoints sont ensemble parce qu'ils lisent et détruisent la même
// session, et qu'ils sont portés par la même page du front (Profil.tsx).
//
// Tout ce qu'il faut côté service existe déjà : utilisez
// UtilisateurService.trouverParId(). Vous n'avez donc AUCUNE raison de
// modifier UtilisateurService.java — ce fichier est à US5, qui y ajoute la
// vérification du mot de passe. Y toucher vous garantit un conflit.
//
// US7 — @GetMapping("/api/profil"), avec HttpServletRequest en paramètre :
//  1. SessionUtilisateur.idConnecte(requete) ;
//  2. Optional vide -> 401 ; sinon utilisateurService.trouverParId(id) et
//     répondre 200 avec UtilisateurReponse.depuis(...).
//
// Pourquoi relire la base au lieu de garder l'objet en session : voir le
// commentaire de SessionUtilisateur. Et pensez au cas du compte supprimé
// entre-temps — l'id est en session mais findById renvoie vide.
//
// C'est cet endpoint que le front appelle au démarrage pour savoir s'il
// reste une session (voir FournisseurAuth.tsx). Il doit donc répondre 401
// proprement pour un visiteur anonyme, sans erreur serveur : c'est le cas
// NORMAL, pas une anomalie. À ne pas logger en warning.
//
// US6 — @PostMapping("/api/deconnexion") :
//  1. SessionUtilisateur.fermer(requete) ;
//  2. 204 No Content (rien à renvoyer ; le front gère déjà un corps vide).
//
// POST et non GET : une déconnexion modifie l'état du serveur. En GET, une
// simple balise <img src="/api/deconnexion"> sur n'importe quel site
// déconnecterait nos visiteurs.
//
// POINT NOTÉ : c'est bien le SERVEUR qui invalide la session. Se contenter
// d'oublier l'utilisateur côté front laisserait la session active ici, donc
// le compte resterait accessible après un F5.
//
// À tester :
//  - profil : 200 avec session valide, 401 sans session
//  - déconnexion : 204, puis le profil répond 401 juste après
//  - déconnexion sans être connecté : 204 aussi, pas d'erreur
@RestController
public class ProfilController {
}
