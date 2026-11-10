package com.example.demo.repository;

import com.example.demo.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// Donne automatiquement findAll(), findById(), save()... pour la table utilisateur
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    // Spring Data lit le nom de la méthode et écrit la requête tout seul :
    // "findByEmail" devient SELECT * FROM utilisateur WHERE email = ?
    // Optional : vide si aucun compte ne correspond (US4 : email déjà pris ?
    // US5 : retrouver le compte à connecter).
    Optional<Utilisateur> findByEmail(String email);
}
