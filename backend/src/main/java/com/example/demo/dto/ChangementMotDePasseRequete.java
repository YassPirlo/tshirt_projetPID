package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Données envoyées pour changer son mot de passe (page Mon profil).
//
// On demande l'ANCIEN mot de passe : si quelqu'un trouve un ordinateur
// resté connecté, il ne peut pas changer le mot de passe et s'approprier
// le compte sans le connaître.
//
// La confirmation du nouveau mot de passe est vérifiée par le front : elle
// sert à éviter une faute de frappe, le back n'a rien à en faire.
public record ChangementMotDePasseRequete(

        @NotBlank(message = "Le mot de passe actuel est obligatoire")
        String ancienMotDePasse,

        // Mêmes règles qu'à l'inscription (InscriptionRequete).
        @NotBlank(message = "Le nouveau mot de passe est obligatoire")
        @Size(min = 8, message = "Le nouveau mot de passe doit faire au moins 8 caractères")
        @Size(max = 72, message = "Le nouveau mot de passe ne peut pas dépasser 72 caractères")
        String nouveauMotDePasse) {
}
