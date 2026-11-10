package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Données envoyées par le formulaire d'inscription (US4).
//
// Un "record" : classe immuable dont Java génère le constructeur et les
// accesseurs. Jackson remplit ses champs à partir du JSON reçu.
//
// On ne reçoit PAS directement une entité Utilisateur : le client n'a aucune
// raison de pouvoir imposer un id ou une date d'inscription.
public record InscriptionRequete(

        // @Email vérifie le format, @NotBlank refuse null, "" et "   ".
        // Le controller les déclenchera avec @Valid (étape 3).
        @NotBlank(message = "L'email est obligatoire")
        @Email(message = "Format d'email invalide")
        String email,

        // 8 caractères minimum. Le maximum compte aussi : BCrypt ignore
        // au-delà de 72 octets, autant refuser clairement.
        @NotBlank(message = "Le mot de passe est obligatoire")
        @Size(min = 8, max = 72, message = "Le mot de passe doit faire au moins 8 caractères")
        String motDePasse,

        @NotBlank(message = "Le nom est obligatoire")
        @Size(max = 100, message = "Le nom ne peut pas dépasser 100 caractères")
        String nom,

        @NotBlank(message = "Le prénom est obligatoire")
        @Size(max = 100, message = "Le prénom ne peut pas dépasser 100 caractères")
        String prenom) {
}
