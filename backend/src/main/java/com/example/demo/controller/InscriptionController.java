package com.example.demo.controller;

import com.example.demo.dto.InscriptionRequete;
import com.example.demo.dto.UtilisateurReponse;
import com.example.demo.model.Utilisateur;
import com.example.demo.service.UtilisateurService;
import com.example.demo.session.SessionUtilisateur;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

// Création de compte : US5 du backlog (« US4 » dans le plan de l'équipe).
//
// Ce fichier n'appartient qu'à cette US : personne d'autre n'y touche.
//
// Le controller ne fait que traduire en HTTP. Toute la logique (email
// unique, hachage BCrypt du mot de passe) est déjà dans
// UtilisateurService.inscrire().
//
// Les cas d'erreur sont gérés par GestionnaireErreurs, rien à attraper ici :
//  - email déjà pris -> EmailDejaUtiliseException -> 409 Conflict ;
//  - champ invalide (vide, email mal formé, mot de passe < 8 caractères)
//    -> @Valid échoue -> 400 Bad Request.
@RestController
public class InscriptionController {

    private final UtilisateurService utilisateurService;

    // Injection par constructeur, comme ProduitController avec ProduitService.
    public InscriptionController(UtilisateurService utilisateurService) {
        this.utilisateurService = utilisateurService;
    }

    // POST /api/inscription
    //
    // @Valid est indispensable : sans lui, les contraintes du record
    // InscriptionRequete (@NotBlank, @Email, @Size) ne sont pas vérifiées et
    // un mot de passe de 2 caractères passerait.
    @PostMapping("/api/inscription")
    public ResponseEntity<UtilisateurReponse> inscrire(
            @Valid @RequestBody InscriptionRequete requete,
            HttpServletRequest requeteHttp) {

        Utilisateur utilisateur = utilisateurService.inscrire(requete);

        // Le backlog demande qu'une fois inscrit, le visiteur soit connecté
        // (« Bienvenue, <prénom> » sur toutes les pages). On ouvre donc la
        // session, comme le fait la connexion : sans ça, un F5 juste après
        // l'inscription ferait redevenir le visiteur anonyme.
        SessionUtilisateur.ouvrir(requeteHttp, utilisateur.getId());

        // 201 Created : une ressource (le compte) vient d'être créée.
        // On renvoie UtilisateurReponse et JAMAIS l'entité Utilisateur,
        // qui contient le hachage du mot de passe.
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(UtilisateurReponse.depuis(utilisateur));
    }
}
