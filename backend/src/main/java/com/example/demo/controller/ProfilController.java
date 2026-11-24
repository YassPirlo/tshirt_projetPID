package com.example.demo.controller;

import com.example.demo.dto.ErreurReponse;
import com.example.demo.dto.UtilisateurReponse;
import com.example.demo.service.UtilisateurService;
import com.example.demo.session.SessionUtilisateur;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;

// Le compte connecté (profil, base de l'US6) et la déconnexion (US7).
//
// Les deux endpoints sont ensemble parce qu'ils lisent et détruisent la même
// session, et qu'ils sont portés par la même page du front (Profil.tsx).
@RestController
public class ProfilController {

    private final UtilisateurService utilisateurService;

    public ProfilController(UtilisateurService utilisateurService) {
        this.utilisateurService = utilisateurService;
    }

    // GET /api/profil : qui est connecté ?
    //
    // C'est cet endpoint que le front appelle AU DÉMARRAGE (FournisseurAuth)
    // pour savoir s'il reste une session. Sans lui, un F5 fait oublier au
    // front qui est connecté, et « Bienvenue, <prénom> » (US4, US5)
    // disparaît alors que la session existe toujours côté serveur.
    //
    // 401 pour un visiteur anonyme : c'est le cas NORMAL (chaque visiteur
    // passe par là au chargement du site), pas une anomalie. Rien à logger.
    @GetMapping("/api/profil")
    public ResponseEntity<?> profil(HttpServletRequest requete) {
        return SessionUtilisateur.idConnecte(requete)
                // On relit la base à chaque appel plutôt que de garder le
                // compte en session : le profil reflète toujours l'état réel.
                .flatMap(utilisateurService::trouverParId)
                .<ResponseEntity<?>>map(utilisateur ->
                        ResponseEntity.ok(UtilisateurReponse.depuis(utilisateur)))
                // Deux cas donnent 401 : pas de session, ou une session dont
                // le compte a été supprimé entre-temps. Dans les deux cas,
                // personne n'est connecté.
                .orElseGet(() -> ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(new ErreurReponse("Vous n'êtes pas connecté")));
    }

        // US7 : déconnexion.
    //
    // POST et non GET : une déconnexion modifie l'état du serveur. En GET, une
    // simple balise <img src="/api/deconnexion"> sur n'importe quel site
    // déconnecterait nos visiteurs.
    //
    // C'est bien le SERVEUR qui invalide la session. Se contenter d'oublier
    // l'utilisateur côté front laisserait la session active ici, donc le
    // compte resterait accessible après un F5.
    //
    // 204 même si personne n'est connecté : la déconnexion est idempotente,
    // ce n'est pas une erreur.
    @PostMapping("/api/deconnexion")
    public ResponseEntity<Void> deconnexion(HttpServletRequest requete) {
        SessionUtilisateur.fermer(requete);
        return ResponseEntity.noContent().build();
    }
}
