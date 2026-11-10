package com.example.demo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.time.LocalDateTime;

// Correspond à la table "utilisateur" de database/schema.sql
// Compte client utilisé par les US4 à US7 (inscription, connexion, profil).
@Entity
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // unique = true : deux comptes ne peuvent pas avoir la même adresse.
    // L'email sert d'identifiant de connexion.
    @Column(nullable = false, unique = true)
    private String email;

    // Contient le hachage BCrypt, jamais le mot de passe en clair.
    // Spring traduit "motDePasse" en colonne "mot_de_passe" automatiquement.
    // length = 60 : taille fixe d'un hachage BCrypt.
    @Column(nullable = false, length = 60)
    private String motDePasse;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String prenom;

    // Renseignée au moment de l'inscription (colonne "date_inscription")
    @Column(nullable = false)
    private LocalDateTime dateInscription;

    // Constructeur vide obligatoire : Hibernate l'utilise pour recréer
    // l'objet à partir d'une ligne de la base.
    public Utilisateur() {
    }

    public Utilisateur(String email, String motDePasse, String nom, String prenom) {
        this.email = email;
        this.motDePasse = motDePasse;
        this.nom = nom;
        this.prenom = prenom;
        this.dateInscription = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMotDePasse() {
        return motDePasse;
    }

    public void setMotDePasse(String motDePasse) {
        this.motDePasse = motDePasse;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public LocalDateTime getDateInscription() {
        return dateInscription;
    }

    public void setDateInscription(LocalDateTime dateInscription) {
        this.dateInscription = dateInscription;
    }
}
