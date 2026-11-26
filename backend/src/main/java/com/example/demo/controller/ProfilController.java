package com.example.demo.controller;

import com.example.demo.dto.ChangementMotDePasseRequete;
import com.example.demo.dto.ErreurReponse;
import com.example.demo.dto.ModificationProfilRequete;
import com.example.demo.dto.UtilisateurReponse;
import com.example.demo.service.UtilisateurService;
import com.example.demo.session.SessionUtilisateur;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

// Le compte connecté : le lire et le modifier (US6), changer son mot de
// passe, se déconnecter (US7).
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
                .orElseGet(ProfilController::nonConnecte);
    }

    // US6 : PUT /api/profil, modifier ses informations personnelles.
    //
    // PUT et non POST : on remplace les informations du compte par celles
    // du formulaire, et refaire la même requête donne le même résultat.
    //
    // Le compte modifié est TOUJOURS celui de la session : la requête ne
    // contient pas d'id, personne ne peut donc modifier le compte d'un autre.
    //
    // Réponses :
    //  - 200 avec le compte à jour (le front met « Bienvenue » à jour avec) ;
    //  - 401 sans session, ou si le compte a été supprimé entre-temps ;
    //  - 409 si l'email appartient à un autre compte, et 400 si un champ
    //    est invalide : gérés par GestionnaireErreurs, comme l'inscription.
    @PutMapping("/api/profil")
    public ResponseEntity<?> modifier(HttpServletRequest requete,
                                      @Valid @RequestBody ModificationProfilRequete modification) {
        return SessionUtilisateur.idConnecte(requete)
                .flatMap(id -> utilisateurService.modifier(id, modification))
                .<ResponseEntity<?>>map(utilisateur ->
                        ResponseEntity.ok(UtilisateurReponse.depuis(utilisateur)))
                .orElseGet(ProfilController::nonConnecte);
    }

    // PUT /api/profil/mot-de-passe : changer son mot de passe.
    //
    // Comme pour le profil, le compte modifié est toujours celui de la
    // session. Réponses :
    //  - 204 si le mot de passe est changé (rien à renvoyer) ;
    //  - 401 sans session, ou si le compte a été supprimé entre-temps ;
    //  - 400 si le mot de passe actuel est faux ou si le nouveau est refusé
    //    (trop court, trop long) : gérés par GestionnaireErreurs.
    @PutMapping("/api/profil/mot-de-passe")
    public ResponseEntity<?> changerMotDePasse(HttpServletRequest requete,
                                               @Valid @RequestBody ChangementMotDePasseRequete changement) {
        return SessionUtilisateur.idConnecte(requete)
                .flatMap(id -> utilisateurService.changerMotDePasse(id, changement))
                .<ResponseEntity<?>>map(utilisateur -> ResponseEntity.noContent().build())
                .orElseGet(ProfilController::nonConnecte);
    }

    private static ResponseEntity<?> nonConnecte() {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ErreurReponse("Vous n'êtes pas connecté"));
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
