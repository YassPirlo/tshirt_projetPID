package com.example.demo.service;

import com.example.demo.dto.InscriptionRequete;
import com.example.demo.model.Utilisateur;
import com.example.demo.repository.UtilisateurRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

// Couche service des comptes clients (US4 à US7).
// Toute la logique de création de compte vit ici : le controller ne fait
// que traduire en HTTP.
@Service
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    // Injection par constructeur, comme CategorieService et ProduitService.
    // Spring fournit le PasswordEncoder déclaré dans SecuriteConfig.
    public UtilisateurService(UtilisateurRepository utilisateurRepository,
                              PasswordEncoder passwordEncoder) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // US4 : créer un compte.
    // Lève EmailDejaUtiliseException si l'adresse est déjà prise.
    public Utilisateur inscrire(InscriptionRequete requete) {
        String email = normaliserEmail(requete.email());

        // Vérification applicative, pour pouvoir répondre un message clair.
        // La contrainte UNIQUE en base reste le garde-fou final si deux
        // inscriptions arrivent exactement en même temps.
        if (utilisateurRepository.findByEmail(email).isPresent()) {
            throw new EmailDejaUtiliseException(email);
        }

        // Le mot de passe en clair ne quitte jamais cette méthode :
        // on ne stocke que son hachage BCrypt.
        String hachage = passwordEncoder.encode(requete.motDePasse());

        Utilisateur utilisateur = new Utilisateur(
                email,
                hachage,
                requete.nom().trim(),
                requete.prenom().trim());

        return utilisateurRepository.save(utilisateur);
    }

    // Utilisé par la connexion (US5) et le profil (US7) pour retrouver un
    // compte. Optional vide si l'email est inconnu.
    public Optional<Utilisateur> trouverParEmail(String email) {
        return utilisateurRepository.findByEmail(normaliserEmail(email));
    }

    // US7 : retrouver le compte dont l'id est en session.
    //
    // Optional vide dans un cas bien réel, qu'il faut traiter : la session
    // porte un id valide, mais le compte a été supprimé depuis. Le profil
    // doit alors répondre 401 comme si personne n'était connecté, et non
    // planter sur un Utilisateur absent.
    public Optional<Utilisateur> trouverParId(Long id) {
        return utilisateurRepository.findById(id);
    }

    // Les emails sont comparés en minuscules et sans espaces autour :
    // sans ça, "Yassine@Mail.be" et "yassine@mail.be" créeraient deux comptes.
    private String normaliserEmail(String email) {
        return email.trim().toLowerCase();
    }
}
