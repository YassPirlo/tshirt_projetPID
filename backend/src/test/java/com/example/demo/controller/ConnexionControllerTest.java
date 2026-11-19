package com.example.demo.controller;

import com.example.demo.dto.ConnexionRequete;
import com.example.demo.model.Utilisateur;
import com.example.demo.service.UtilisateurService;
import com.example.demo.session.SessionUtilisateur;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Test du controller seul : pas de base de données, le service est simulé.
// Le vrai BCrypt et la vraie base sont couverts par ConnexionIntegrationTest.
@WebMvcTest(ConnexionController.class)
class ConnexionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UtilisateurService utilisateurService;

    private static final String CORPS_VALIDE =
            "{\"email\":\"yassine@mail.be\",\"motDePasse\":\"motdepasse123\"}";

    // Utilisateur n'a pas de setId (c'est la base qui l'attribue) : on le
    // pose par réflexion, comme le ferait Hibernate.
    private Utilisateur compteEnregistre() {
        Utilisateur utilisateur = new Utilisateur("yassine@mail.be",
                "$2a$10$hachageFictifPourLeTestDuController", "Vitullo", "Yassine",
                "12 rue des Tests", "1000", "Bruxelles");
        ReflectionTestUtils.setField(utilisateur, "id", 7L);
        return utilisateur;
    }

    @Test
    void connecteEtOuvreLaSessionAvecDeBonsIdentifiants() throws Exception {
        when(utilisateurService.verifier(any(ConnexionRequete.class)))
                .thenReturn(Optional.of(compteEnregistre()));

        MvcResult resultat = mockMvc.perform(post("/api/connexion")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CORPS_VALIDE))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.email").value("yassine@mail.be"))
                .andExpect(jsonPath("$.prenom").value("Yassine"))
                .andReturn();

        assertThat(SessionUtilisateur.idConnecte(resultat.getRequest())).contains(7L);
    }

    // Le hachage ne doit jamais partir dans la réponse HTTP.
    @Test
    void neRenvoiePasLeMotDePasse() throws Exception {
        when(utilisateurService.verifier(any(ConnexionRequete.class)))
                .thenReturn(Optional.of(compteEnregistre()));

        mockMvc.perform(post("/api/connexion")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CORPS_VALIDE))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.motDePasse").doesNotExist());
    }

    @Test
    void repond401SansOuvrirDeSessionSiLesIdentifiantsSontFaux() throws Exception {
        when(utilisateurService.verifier(any(ConnexionRequete.class)))
                .thenReturn(Optional.empty());

        MvcResult resultat = mockMvc.perform(post("/api/connexion")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CORPS_VALIDE))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Email ou mot de passe incorrect"))
                .andReturn();

        assertThat(resultat.getRequest().getSession(false)).isNull();
    }

    // Fixation de session : la session d'avant la connexion doit être jetée.
    @Test
    void invalideLaSessionPrecedenteALaConnexion() throws Exception {
        when(utilisateurService.verifier(any(ConnexionRequete.class)))
                .thenReturn(Optional.of(compteEnregistre()));
        MockHttpSession sessionAvant = new MockHttpSession();

        MvcResult resultat = mockMvc.perform(post("/api/connexion")
                        .session(sessionAvant)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CORPS_VALIDE))
                .andExpect(status().isOk())
                .andReturn();

        assertThat(sessionAvant.isInvalid()).isTrue();
        assertThat(resultat.getRequest().getSession(false)).isNotSameAs(sessionAvant);
    }

    // @Valid : un champ vide est refusé avant même d'appeler le service.
    @Test
    void repond400SiUnChampEstVide() throws Exception {
        mockMvc.perform(post("/api/connexion")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"\",\"motDePasse\":\"motdepasse123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("L'email est obligatoire"));

        verify(utilisateurService, never()).verifier(any(ConnexionRequete.class));
    }
}
