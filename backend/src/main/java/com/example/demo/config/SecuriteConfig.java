package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

// Configuration du hachage des mots de passe (US4 à US7).
@Configuration
public class SecuriteConfig {

    // Un seul encodeur pour toute l'application : Spring le crée une fois
    // et l'injecte dans UtilisateurService.
    //
    // BCrypt plutôt qu'un simple MD5/SHA :
    //  - il ajoute un "sel" aléatoire à chaque hachage, donc deux comptes
    //    avec le même mot de passe donnent deux hachages différents ;
    //  - il est volontairement lent, ce qui rend les attaques par force
    //    brute coûteuses.
    //
    // On expose le type PasswordEncoder (l'interface) et non
    // BCryptPasswordEncoder : le reste du code ne dépend pas de
    // l'algorithme choisi.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
