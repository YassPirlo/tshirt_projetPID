package com.example.demo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import java.math.BigDecimal;

// Correspond à la table "produit" de database/schema.sql
@Entity
public class Produit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;

    private BigDecimal prix;

    // Spring traduit "imageUrl" en colonne "image_url" automatiquement
    private String imageUrl;

    // Texte de présentation du produit (colonne "description").
    // length = 1000 : un paragraphe, plus long que le VARCHAR(255) par défaut.
    @Column(length = 1000)
    private String description;

    // Composition du tissu, ex. "100 % coton peigné, 180 g/m²"
    private String matiere;

    // Conseils d'entretien, ex. "Lavage à 30 °C, pas de sèche-linge"
    private String entretien;

    // Plusieurs produits appartiennent à une même catégorie (colonne categorie_id)
    @ManyToOne(optional = false)
    @JoinColumn(name = "categorie_id")
    private Categorie categorie;

    // Plusieurs produits ont une même marque (colonne marque_id)
    @ManyToOne(optional = false)
    @JoinColumn(name = "marque_id")
    private Marque marque;

    public Produit() {
    }

    public Long getId() {
        return id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public BigDecimal getPrix() {
        return prix;
    }

    public void setPrix(BigDecimal prix) {
        this.prix = prix;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getMatiere() {
        return matiere;
    }

    public void setMatiere(String matiere) {
        this.matiere = matiere;
    }

    public String getEntretien() {
        return entretien;
    }

    public void setEntretien(String entretien) {
        this.entretien = entretien;
    }

    public Categorie getCategorie() {
        return categorie;
    }

    public void setCategorie(Categorie categorie) {
        this.categorie = categorie;
    }

    public Marque getMarque() {
        return marque;
    }

    public void setMarque(Marque marque) {
        this.marque = marque;
    }
}
