package com.example.demo;

import com.example.demo.dto.InscriptionRequete;
import com.example.demo.service.UtilisateurService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// US5 de bout en bout : vrai service, vrai BCrypt, vraie base H2.
//
// Fichier séparé d'ApiIntegrationTest pour que l'US5 ne touche à aucun
// fichier partagé avec les autres US.
//
// @Transactional : le compte créé avant chaque test est annulé à la fin du
// test, donc chaque test repart d'une table utilisateur vide.
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ConnexionIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UtilisateurService utilisateurService;

    @BeforeEach
    void creerUnCompte() {
        utilisateurService.inscrire(new InscriptionRequete(
                "yassine@mail.be", "motdepasse123", "Vitullo", "Yassine"));
    }

    private MvcResult seConnecter(String email, String motDePasse, int statutAttendu)
            throws Exception {
        String corps = "{\"email\":\"" + email + "\",\"motDePasse\":\"" + motDePasse + "\"}";
        return mockMvc.perform(post("/api/connexion")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corps))
                .andExpect(status().is(statutAttendu))
                .andReturn();
    }

    @Test
    void connexionAvecLeMotDePasseChoisiALInscription() throws Exception {
        mockMvc.perform(post("/api/connexion")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"Yassine@Mail.be\",\"motDePasse\":\"motdepasse123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("yassine@mail.be"))
                .andExpect(jsonPath("$.motDePasse").doesNotExist());
    }

    // POINT NOTÉ — énumération de comptes : email inconnu et mot de passe
    // faux doivent être indiscernables, statut ET corps.
    @Test
    void emailInconnuEtMauvaisMotDePasseDonnentLaMemeReponse() throws Exception {
        MvcResult emailInconnu = seConnecter("inconnu@mail.be", "motdepasse123", 401);
        MvcResult mauvaisMotDePasse = seConnecter("yassine@mail.be", "mauvais12345", 401);

        assertThat(emailInconnu.getResponse().getContentAsString())
                .isEqualTo(mauvaisMotDePasse.getResponse().getContentAsString());
    }
}
