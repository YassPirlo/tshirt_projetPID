package com.example.demo.session;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

// Tests du socle de session, partagé par US5, US6 et US7.
//
// MockHttpServletRequest est une vraie implémentation de requête HTTP
// fournie par spring-test : pas besoin de démarrer un serveur.
class SessionUtilisateurTest {

    @Test
    void ouvreUneSessionPuisRelitLId() {
        MockHttpServletRequest requete = new MockHttpServletRequest();

        SessionUtilisateur.ouvrir(requete, 42L);

        assertThat(SessionUtilisateur.idConnecte(requete)).contains(42L);
    }

    @Test
    void personneNEstConnecteSansSession() {
        MockHttpServletRequest requete = new MockHttpServletRequest();

        assertThat(SessionUtilisateur.idConnecte(requete)).isEmpty();
    }

    // Vérifie le « false » de getSession(false) : consulter l'état de
    // connexion ne doit pas créer de session, sinon chaque visiteur anonyme
    // reçoit un cookie JSESSIONID pour rien.
    @Test
    void consulterNeCreePasDeSession() {
        MockHttpServletRequest requete = new MockHttpServletRequest();

        SessionUtilisateur.idConnecte(requete);

        assertThat(requete.getSession(false)).isNull();
    }

    @Test
    void fermerInvalideLaSession() {
        MockHttpServletRequest requete = new MockHttpServletRequest();
        SessionUtilisateur.ouvrir(requete, 42L);

        SessionUtilisateur.fermer(requete);

        assertThat(SessionUtilisateur.idConnecte(requete)).isEmpty();
        assertThat(requete.getSession(false)).isNull();
    }

    // La déconnexion doit être idempotente : le front peut l'appeler alors
    // que la session a déjà expiré côté serveur.
    @Test
    void fermerSansSessionNeLevePasDErreur() {
        MockHttpServletRequest requete = new MockHttpServletRequest();

        assertThatCode(() -> SessionUtilisateur.fermer(requete))
                .doesNotThrowAnyException();
    }

    // Fixation de session : ce qui était dans la session AVANT la connexion
    // ne doit pas survivre à la connexion. Si cet attribut était encore là,
    // c'est que l'ancienne session avait été réutilisée.
    @Test
    void laConnexionRepartSurUneSessionNeuve() {
        MockHttpServletRequest requete = new MockHttpServletRequest();
        requete.getSession(true).setAttribute("tracePrecedente", "valeur");

        SessionUtilisateur.ouvrir(requete, 42L);

        assertThat(requete.getSession(false).getAttribute("tracePrecedente"))
                .isNull();
        assertThat(SessionUtilisateur.idConnecte(requete)).contains(42L);
    }

    @Test
    void refuseDOuvrirUneSessionSansId() {
        MockHttpServletRequest requete = new MockHttpServletRequest();

        assertThatThrownBy(() -> SessionUtilisateur.ouvrir(requete, null))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
