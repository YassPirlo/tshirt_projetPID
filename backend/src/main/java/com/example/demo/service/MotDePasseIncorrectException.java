package com.example.demo.service;

// Levée par UtilisateurService.changerMotDePasse() quand le mot de passe
// actuel saisi est faux. GestionnaireErreurs la traduit en 400.
public class MotDePasseIncorrectException extends RuntimeException {

    public MotDePasseIncorrectException() {
        super("Mot de passe actuel incorrect");
    }
}
