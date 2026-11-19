package com.example.demo.controller;

import com.example.demo.dto.InscriptionRequete;
import com.example.demo.model.Utilisateur;
import com.example.demo.service.EmailDejaUtiliseException;
import com.example.demo.service.UtilisateurService;
import com.example.demo.session.SessionUtilisateur;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Test du controller seul : pas de base de données, le service est simulé.
// Modèle : ProduitControllerTest.
@WebMvcTest(InscriptionController.class)
class InscriptionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UtilisateurService utilisateurService;

    private static final String CORPS_VALIDE = """
            {
              "email": "loic@mail.be",
              "motDePasse": "motdepasse123",
              "nom": "Rossel",
              "prenom": "Loïc",
              "adresse": "12 rue des Tests",
              "codePostal": "1000",
              "ville": "Bruxelles"
            }
            """;

    // Un compte tel que le service le renverrait après l'avoir enregistré.
    // L'id est normalement donné par la base : on le pose à la main.
    private Utilisateur compteEnregistre() {
        Utilisateur utilisateur = new Utilisateur(
                "loic@mail.be", "$2a$10$hachageBcryptFictif", "Rossel", "Loïc",
                "12 rue des Tests", "1000", "Bruxelles");
        ReflectionTestUtils.setField(utilisateur, "id", 7L);
        return utilisateur;
    }

    @Test
    void creeLeCompteEtRepond201() throws Exception {
        when(utilisateurService.inscrire(any(InscriptionRequete.class)))
                .thenReturn(compteEnregistre());

        mockMvc.perform(post("/api/inscription")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CORPS_VALIDE))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.email").value("loic@mail.be"))
                .andExpect(jsonPath("$.nom").value("Rossel"))
                .andExpect(jsonPath("$.prenom").value("Loïc"));
    }

    // Le hachage du mot de passe ne doit jamais partir dans la réponse.
    @Test
    void neRenvoieJamaisLeMotDePasse() throws Exception {
        when(utilisateurService.inscrire(any(InscriptionRequete.class)))
                .thenReturn(compteEnregistre());

        mockMvc.perform(post("/api/inscription")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CORPS_VALIDE))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.motDePasse").doesNotExist());
    }

    // Après l'inscription, le visiteur est connecté : la session porte
    // l'id du nouveau compte.
    @Test
    void ouvreLaSessionDuNouveauCompte() throws Exception {
        when(utilisateurService.inscrire(any(InscriptionRequete.class)))
                .thenReturn(compteEnregistre());

        MvcResult resultat = mockMvc.perform(post("/api/inscription")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CORPS_VALIDE))
                .andExpect(status().isCreated())
                .andReturn();

        assertThat(SessionUtilisateur.idConnecte(resultat.getRequest()))
                .contains(7L);
    }

    @Test
    void repond409SiLEmailEstDejaPris() throws Exception {
        when(utilisateurService.inscrire(any(InscriptionRequete.class)))
                .thenThrow(new EmailDejaUtiliseException("loic@mail.be"));

        mockMvc.perform(post("/api/inscription")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CORPS_VALIDE))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message")
                        .value("Un compte existe déjà avec cet email"));
    }

    // Email vide : @Valid refuse la requête avant même d'appeler le service.
    @Test
    void repond400SiLEmailEstVide() throws Exception {
        mockMvc.perform(post("/api/inscription")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "",
                                  "motDePasse": "motdepasse123",
                                  "nom": "Rossel",
                                  "prenom": "Loïc",
                                  "adresse": "12 rue des Tests",
                                  "codePostal": "1000",
                                  "ville": "Bruxelles"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());

        verify(utilisateurService, never()).inscrire(any());
    }

    // US5 : l'adresse est obligatoire, comme le demande le backlog.
    @Test
    void repond400SiLAdresseManque() throws Exception {
        mockMvc.perform(post("/api/inscription")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CORPS_VALIDE.replace("12 rue des Tests", "")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("L'adresse est obligatoire"));

        verify(utilisateurService, never()).inscrire(any());
    }

    // Un mot de passe trop LONG doit dire qu'il est trop long, pas
    // « au moins 8 caractères ».
    @Test
    void repond400AvecLeBonMessageSiLeMotDePasseEstTropLong() throws Exception {
        mockMvc.perform(post("/api/inscription")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CORPS_VALIDE.replace("motdepasse123", "a".repeat(73))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Le mot de passe ne peut pas dépasser 72 caractères"));
    }

    // Mot de passe trop court : preuve que @Valid est bien présent.
    @Test
    void repond400SiLeMotDePasseEstTropCourt() throws Exception {
        mockMvc.perform(post("/api/inscription")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "loic@mail.be",
                                  "motDePasse": "ab",
                                  "nom": "Rossel",
                                  "prenom": "Loïc",
                                  "adresse": "12 rue des Tests",
                                  "codePostal": "1000",
                                  "ville": "Bruxelles"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Le mot de passe doit faire au moins 8 caractères"));

        verify(utilisateurService, never()).inscrire(any());
    }
}
