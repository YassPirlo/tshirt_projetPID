package com.example.demo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

// Correspond à la table "localite" de database/schema.sql : la liste
// officielle bpost des codes postaux belges. Lue seulement, jamais modifiée
// par l'application.
@Entity
public class Localite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Texte : 4 chiffres, sans calcul dessus
    @Column(nullable = false, length = 4)
    private String codePostal;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 50)
    private String province;

    // Constructeur vide obligatoire pour Hibernate
    public Localite() {
    }

    public Localite(String codePostal, String nom, String province) {
        this.codePostal = codePostal;
        this.nom = nom;
        this.province = province;
    }

    public Long getId() {
        return id;
    }

    public String getCodePostal() {
        return codePostal;
    }

    public String getNom() {
        return nom;
    }

    public String getProvince() {
        return province;
    }
}
