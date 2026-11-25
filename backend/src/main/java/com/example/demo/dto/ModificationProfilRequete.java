package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Données envoyées par le formulaire de modification du profil (US6).
//
// Mêmes champs et mêmes règles que InscriptionRequete, sans le mot de
// passe : changer de mot de passe demanderait de retaper l'ancien, ce
// n'est pas dans le périmètre de l'US6.
//
// Pas d'id non plus : le compte modifié est toujours celui de la session,
// jamais un compte choisi par le client.
public record ModificationProfilRequete(

        @NotBlank(message = "L'email est obligatoire")
        @Email(message = "Format d'email invalide")
        String email,

        @NotBlank(message = "Le nom est obligatoire")
        @Size(max = 100, message = "Le nom ne peut pas dépasser 100 caractères")
        String nom,

        @NotBlank(message = "Le prénom est obligatoire")
        @Size(max = 100, message = "Le prénom ne peut pas dépasser 100 caractères")
        String prenom,

        @NotBlank(message = "L'adresse est obligatoire")
        @Size(max = 255, message = "L'adresse ne peut pas dépasser 255 caractères")
        String adresse,

        @NotBlank(message = "Le code postal est obligatoire")
        @Size(max = 10, message = "Le code postal ne peut pas dépasser 10 caractères")
        String codePostal,

        @NotBlank(message = "La ville est obligatoire")
        @Size(max = 100, message = "La ville ne peut pas dépasser 100 caractères")
        String ville) {
}
