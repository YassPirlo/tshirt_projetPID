package com.example.demo.dto;

import com.example.demo.model.Utilisateur;

// Ce que l'API renvoie quand elle parle d'un utilisateur (US4 à US7).
//
// POINT IMPORTANT : on ne renvoie JAMAIS l'entité Utilisateur telle quelle.
// Jackson sérialiserait tous ses champs, donc le hachage du mot de passe
// partirait dans la réponse HTTP et serait visible dans l'onglet Réseau du
// navigateur. Ce record ne contient que ce que le client a le droit de voir.
public record UtilisateurReponse(
        Long id,
        String email,
        String nom,
        String prenom) {

    // Méthode de conversion : entité -> réponse.
    // Centralisée ici, pour qu'aucun controller n'ait à y penser.
    public static UtilisateurReponse depuis(Utilisateur utilisateur) {
        return new UtilisateurReponse(
                utilisateur.getId(),
                utilisateur.getEmail(),
                utilisateur.getNom(),
                utilisateur.getPrenom());
    }
}
