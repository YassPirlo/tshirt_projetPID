package com.example.demo.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

// Données envoyées par le formulaire d'inscription (US5).
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
        // Deux @Size séparés pour deux messages justes : un seul @Size
        // affichait « au moins 8 caractères » même pour un mot de passe
        // trop long.
        @NotBlank(message = "Le mot de passe est obligatoire")
        @Size(min = 8, message = "Le mot de passe doit faire au moins 8 caractères")
        @Size(max = 72, message = "Le mot de passe ne peut pas dépasser 72 caractères")
        String motDePasse,

        @NotBlank(message = "Le nom est obligatoire")
        @Size(max = 100, message = "Le nom ne peut pas dépasser 100 caractères")
        String nom,

        @NotBlank(message = "Le prénom est obligatoire")
        @Size(max = 100, message = "Le prénom ne peut pas dépasser 100 caractères")
        String prenom,

        // US5 : le backlog demande aussi adresse, code postal et ville,
        // tous obligatoires. Pas de format imposé au code postal : le site
        // ne se limite pas à la Belgique.
        @NotBlank(message = "L'adresse est obligatoire")
        @Size(max = 255, message = "L'adresse ne peut pas dépasser 255 caractères")
        String adresse,

        @NotBlank(message = "Le code postal est obligatoire")
        @Size(max = 10, message = "Le code postal ne peut pas dépasser 10 caractères")
        String codePostal,

        @NotBlank(message = "La ville est obligatoire")
        @Size(max = 100, message = "La ville ne peut pas dépasser 100 caractères")
        String ville,

        // Code pays à deux lettres (BE). Code postal et ville sont vérifiés
        // pour ce pays par AdresseService.
        @NotBlank(message = "Le pays est obligatoire")
        @Size(max = 2, message = "Le pays doit être un code à deux lettres")
        String pays,

        // Case « J'accepte les conditions générales de vente ».
        // Boolean et non boolean : un champ absent du JSON donne null, que
        // @NotNull refuse avec notre message. Avec boolean, Jackson échouait
        // avant la validation et le front recevait une erreur illisible.
        // @AssertTrue seul ne suffit pas : il considère null comme valide.
        @NotNull(message = "Vous devez accepter les conditions générales de vente")
        @AssertTrue(message = "Vous devez accepter les conditions générales de vente")
        Boolean cgvAcceptees) {
}
