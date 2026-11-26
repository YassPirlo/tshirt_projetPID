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

    // US5 : adresse demandée à l'inscription (backlog). Elle servira aussi
    // d'adresse de livraison quand les commandes arriveront.
    @Column(nullable = false)
    private String adresse;

    // Texte et non nombre : un code postal n'est pas une quantité (pas de
    // calcul dessus) et certains pays y mettent des lettres ou un zéro en tête.
    @Column(nullable = false, length = 10)
    private String codePostal;

    @Column(nullable = false, length = 100)
    private String ville;

    // Code pays à deux lettres. Seule la Belgique (BE) pour l'instant.
    private static final String PAYS_PAR_DEFAUT = "BE";

    @Column(nullable = false, length = 2)
    private String pays;

    // Renseignée au moment de l'inscription (colonne "date_inscription")
    @Column(nullable = false)
    private LocalDateTime dateInscription;

    // Date d'acceptation des conditions générales de vente (colonne
    // "cgv_acceptees_le"), preuve de l'accord du client.
    @Column(nullable = false)
    private LocalDateTime cgvAccepteesLe;

    // Constructeur vide obligatoire : Hibernate l'utilise pour recréer
    // l'objet à partir d'une ligne de la base.
    public Utilisateur() {
    }

    public Utilisateur(String email, String motDePasse, String nom, String prenom,
                       String adresse, String codePostal, String ville) {
        this.email = email;
        this.motDePasse = motDePasse;
        this.nom = nom;
        this.prenom = prenom;
        this.adresse = adresse;
        this.codePostal = codePostal;
        this.ville = ville;
        this.pays = PAYS_PAR_DEFAUT;
        this.dateInscription = LocalDateTime.now();
        // Un compte n'est créé qu'à l'inscription, et l'inscription est
        // refusée sans la case des CGV cochée (InscriptionRequete) : la
        // création du compte est donc le moment de l'acceptation.
        this.cgvAccepteesLe = this.dateInscription;
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

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public String getCodePostal() {
        return codePostal;
    }

    public void setCodePostal(String codePostal) {
        this.codePostal = codePostal;
    }

    public String getVille() {
        return ville;
    }

    public void setVille(String ville) {
        this.ville = ville;
    }

    public LocalDateTime getDateInscription() {
        return dateInscription;
    }

    public void setDateInscription(LocalDateTime dateInscription) {
        this.dateInscription = dateInscription;
    }

    public String getPays() {
        return pays;
    }

    public void setPays(String pays) {
        this.pays = pays;
    }

    public LocalDateTime getCgvAccepteesLe() {
        return cgvAccepteesLe;
    }
}
