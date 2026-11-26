package com.example.demo.service;

// Levée par AdresseService quand le pays, le code postal ou la ville ne
// sont pas valides. GestionnaireErreurs la traduit en 400.
//
// Le message est toujours une phrase fixe écrite ici, jamais une valeur
// reçue du client : on peut donc le renvoyer tel quel au front.
public class AdresseInvalideException extends RuntimeException {

    public AdresseInvalideException(String message) {
        super(message);
    }
}
