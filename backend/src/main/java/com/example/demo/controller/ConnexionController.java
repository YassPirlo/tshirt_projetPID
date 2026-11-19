package com.example.demo.controller;

import com.example.demo.dto.ConnexionRequete;
import com.example.demo.dto.ErreurReponse;
import com.example.demo.dto.UtilisateurReponse;
import com.example.demo.service.UtilisateurService;
import com.example.demo.session.SessionUtilisateur;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

// US5 — Connexion.
//
// Le controller ne fait que traduire en HTTP : la vérification du mot de
// passe vit dans UtilisateurService.verifier(), l'ouverture de la session
// dans SessionUtilisateur.
@RestController
public class ConnexionController {

    // POINT NOTÉ — énumération de comptes : UN seul message, pour l'email
    // inconnu comme pour le mot de passe faux. Si les deux cas se
    // distinguaient (par le code HTTP ou par le texte), n'importe qui
    // pourrait tester des adresses pour savoir lesquelles ont un compte
    // chez nous. Le message est une constante pour qu'il soit impossible
    // d'en écrire deux variantes par inadvertance.
    static final String IDENTIFIANTS_INCORRECTS = "Email ou mot de passe incorrect";

    private final UtilisateurService utilisateurService;

    public ConnexionController(UtilisateurService utilisateurService) {
        this.utilisateurService = utilisateurService;
    }

    // @Valid : sans lui, les @NotBlank de ConnexionRequete ne seraient pas
    // évalués et un champ absent arriverait null jusqu'au service.
    //
    // POST et non GET : en GET, l'email et le mot de passe finiraient dans
    // l'adresse, donc dans l'historique du navigateur et les logs serveur.
    @PostMapping("/api/connexion")
    public ResponseEntity<?> seConnecter(@Valid @RequestBody ConnexionRequete requete,
                                         HttpServletRequest requeteHttp) {
        return utilisateurService.verifier(requete)
                .<ResponseEntity<?>>map(utilisateur -> {
                    // Uniquement APRÈS la vérification du mot de passe.
                    // ouvrir() change aussi l'identifiant de session, ce qui
                    // neutralise la fixation de session.
                    SessionUtilisateur.ouvrir(requeteHttp, utilisateur.getId());
                    // Jamais l'entité : elle contient le hachage du mot de passe.
                    return ResponseEntity.ok(UtilisateurReponse.depuis(utilisateur));
                })
                .orElseGet(() -> ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(new ErreurReponse(IDENTIFIANTS_INCORRECTS)));
    }
}
