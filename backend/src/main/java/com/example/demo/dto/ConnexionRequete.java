package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;

// Données envoyées par le formulaire de connexion (US5).
//
// Volontairement plus permissif que InscriptionRequete : ici on ne valide
// QUE la présence des deux champs.
//
// Pas de @Email et pas de @Size(min = 8) :
//  - un email mal formé ou un mot de passe trop court doit donner la MÊME
//    réponse qu'un identifiant simplement faux. Si le serveur répondait 400
//    sur « a@b » et 401 sur « inconnu@mail.be », la différence de code HTTP
//    renseignerait déjà l'attaquant sur ce que le serveur accepte ;
//  - les règles de robustesse appartiennent à l'inscription. Les appliquer à
//    la connexion empêcherait un ancien compte, créé sous d'anciennes règles,
//    de se connecter.
public record ConnexionRequete(

        @NotBlank(message = "L'email est obligatoire")
        String email,

        @NotBlank(message = "Le mot de passe est obligatoire")
        String motDePasse) {
}
