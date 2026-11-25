package com.example.demo.controller;

import com.example.demo.model.Utilisateur;
import com.example.demo.service.UtilisateurService;
import com.example.demo.session.SessionUtilisateur;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

// Test du controller seul : pas de base de données, le service est simulé.
@WebMvcTest(ProfilController.class)
class ProfilControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UtilisateurService utilisateurService;

    // Une session telle que la connexion (US4) la laisse. Le nom de
    // l'attribut n'est pas recopié ici : on passe par SessionUtilisateur,
    // comme le vrai code.
    private MockHttpSession sessionConnectee(Long id) {
        MockHttpServletRequest requete = new MockHttpServletRequest();
        SessionUtilisateur.ouvrir(requete, id);
        return (MockHttpSession) requete.getSession(false);
    }

    private Utilisateur compte() {
        Utilisateur utilisateur = new Utilisateur("yassine@mail.be",
                "$2a$10$hachageFictifPourLeTestDuProfil", "Vitullo", "Yassine",
                "12 rue des Tests", "1000", "Bruxelles");
        ReflectionTestUtils.setField(utilisateur, "id", 7L);
        return utilisateur;
    }

    @Test
    void renvoieLeCompteConnecte() throws Exception {
        when(utilisateurService.trouverParId(7L)).thenReturn(Optional.of(compte()));

        mockMvc.perform(get("/api/profil").session(sessionConnectee(7L)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.prenom").value("Yassine"))
                .andExpect(jsonPath("$.ville").value("Bruxelles"))
                .andExpect(jsonPath("$.motDePasse").doesNotExist());
    }

    // Le cas normal d'un visiteur : le front appelle /api/profil au
    // démarrage pour tout le monde.
    @Test
    void repond401SansSessionEtNEnCreePas() throws Exception {
        MvcResult resultat = mockMvc.perform(get("/api/profil"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").exists())
                .andReturn();

        // Aucune session créée, donc aucun cookie envoyé aux visiteurs
        assertThat(resultat.getRequest().getSession(false)).isNull();
    }

    // La session porte un id valide, mais le compte a été supprimé depuis.
    @Test
    void repond401SiLeCompteNExistePlus() throws Exception {
        when(utilisateurService.trouverParId(7L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/profil").session(sessionConnectee(7L)))
                .andExpect(status().isUnauthorized());
    }

    // La preuve que la session est vraiment détruite côté serveur : on
    // programme le service pour que le compte existe. Si la session
    // survivait, GET /api/profil répondrait 200, pas 401.
    @Test
    void deconnexionRepond204PuisLeProfilRepond401() throws Exception {
        when(utilisateurService.trouverParId(7L)).thenReturn(Optional.of(compte()));
        MockHttpSession session = sessionConnectee(7L);

        mockMvc.perform(post("/api/deconnexion").session(session))
                .andExpect(status().isNoContent());

        assertThat(session.isInvalid()).isTrue();

        mockMvc.perform(get("/api/profil").session(session))
                .andExpect(status().isUnauthorized());
    }

    // Idempotence : se déconnecter sans être connecté n'est pas une erreur,
    // et ne crée pas de session au passage.
    @Test
    void deconnexionSansEtreConnecteRepond204() throws Exception {
        MvcResult resultat = mockMvc.perform(post("/api/deconnexion"))
                .andExpect(status().isNoContent())
                .andReturn();

        assertThat(resultat.getRequest().getSession(false)).isNull();
    }
}
