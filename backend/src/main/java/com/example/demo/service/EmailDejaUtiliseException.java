package com.example.demo.service;

// Levée par UtilisateurService.inscrire() quand l'email est déjà pris (US4).
//
// RuntimeException (et non Exception) : pas besoin de l'attraper partout,
// c'est le controller qui la traduira en réponse HTTP 409 Conflict.
public class EmailDejaUtiliseException extends RuntimeException {

    public EmailDejaUtiliseException(String email) {
        super("Un compte existe déjà avec l'email " + email);
    }
}
