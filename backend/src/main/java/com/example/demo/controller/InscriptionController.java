package com.example.demo.controller;

import org.springframework.web.bind.annotation.RestController;

// US4 — Création de compte. SQUELETTE À COMPLÉTER.
//
// Ce fichier n'appartient qu'à US4 : personne d'autre n'y touche.
//
// Marche à suivre :
//  1. injecter UtilisateurService par le constructeur (comme
//     ProduitController le fait avec ProduitService) ;
//  2. @PostMapping("/api/inscription") qui reçoit
//       @Valid @RequestBody InscriptionRequete requete
//     Sans @Valid, les contraintes du record ne sont PAS vérifiées : un
//     mot de passe de 2 caractères passerait.
//  3. appeler utilisateurService.inscrire(requete) ;
//  4. répondre 201 Created avec UtilisateurReponse.depuis(utilisateur),
//     et surtout pas l'entité Utilisateur : elle contient le hachage du
//     mot de passe, qui n'a rien à faire dans une réponse HTTP.
//
// Le cas « email déjà pris » est déjà géré : EmailDejaUtiliseException est
// traduite en 409 par GestionnaireErreurs. Rien à attraper ici.
//
// À tester (voir ProduitControllerTest pour le modèle @WebMvcTest) :
//  - 201 et le JSON renvoyé contient email, nom, prenom, mais PAS motDePasse
//  - 409 quand le service lève EmailDejaUtiliseException
//  - 400 quand le corps est invalide (email vide par exemple)
@RestController
public class InscriptionController {
}
