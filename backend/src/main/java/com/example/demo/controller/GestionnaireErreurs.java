package com.example.demo.controller;

import com.example.demo.dto.ErreurReponse;
import com.example.demo.service.EmailDejaUtiliseException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

// Traduit les exceptions en réponses HTTP, pour TOUS les controllers.
//
// Sans cette classe, EmailDejaUtiliseException remonterait jusqu'au serveur
// et sortirait en 500 Internal Server Error : le front afficherait « erreur
// serveur » là où le vrai problème est que l'email est déjà pris.
//
// Centralisé ici plutôt que répété dans chaque controller : les trois
// personnes qui écrivent US4 à US7 n'ont pas à s'occuper de ces deux cas.
@RestControllerAdvice
public class GestionnaireErreurs {

    // On n'utilise PAS exception.getMessage() ici. Ce message contient
    // l'email reçu, et renvoyer au client une chaîne construite à partir de
    // ce qu'il a envoyé est une mauvaise habitude. Un message fixe suffit,
    // et il correspond à ce que le front attend (voir Inscription.tsx).
    @ExceptionHandler(EmailDejaUtiliseException.class)
    public ResponseEntity<ErreurReponse> emailDejaUtilise(
            EmailDejaUtiliseException exception) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(new ErreurReponse("Un compte existe déjà avec cet email"));
    }

    // Déclenché quand un @Valid échoue : champ vide, email mal formé, mot de
    // passe trop court. Spring répondrait déjà 400, mais avec un corps au
    // format ProblemDetail que le front ne sait pas lire. On le remet au
    // format {"message": "..."} attendu par envoyerJson().
    //
    // On ne renvoie que la PREMIÈRE erreur : les formulaires du front
    // affichent un seul message à la fois.
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErreurReponse> donneesInvalides(
            MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getFieldErrors().stream()
                .map(erreur -> erreur.getDefaultMessage())
                .findFirst()
                .orElse("Données invalides");
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErreurReponse(message));
    }
}
