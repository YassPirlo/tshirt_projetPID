package com.example.demo;

import com.example.demo.repository.UtilisateurRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Vérification de l'adresse de bout en bout : controller, services,
// repository et base H2 remplie par localites-test.sql.
// @Transactional : les comptes créés sont annulés à la fin de chaque test.
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@Sql("/localites-test.sql")
class AdresseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    private static String inscription(String codePostal, String ville) {
        return """
                {"email":"lea@face.be","motDePasse":"motdepasse123","nom":"Martin",
                 "prenom":"Léa","adresse":"1 rue Haute","codePostal":"%s","ville":"%s",
                 "pays":"BE","cgvAcceptees":true}
                """.formatted(codePostal, ville);
    }

    @Test
    void listeLesVillesDUnCodePostalParOrdreAlphabetique() throws Exception {
        mockMvc.perform(get("/api/localites").param("codePostal", "4000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0]").value("Glain"))
                .andExpect(jsonPath("$[1]").value("Liège"))
                .andExpect(jsonPath("$[2]").value("Rocourt"));
    }

    @Test
    void inscritAvecUneAdresseQuiExiste() throws Exception {
        mockMvc.perform(post("/api/inscription")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(inscription("4000", "Liège")))
                .andExpect(status().isCreated());

        assertThat(utilisateurRepository.findByEmail("lea@face.be")).isPresent();
    }

    @Test
    void refuseUneVilleQuiNeCorrespondPasAuCodePostal() throws Exception {
        mockMvc.perform(post("/api/inscription")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(inscription("4000", "Namur")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("La ville ne correspond pas à ce code postal"));

        assertThat(utilisateurRepository.findByEmail("lea@face.be")).isEmpty();
    }

    @Test
    void refuseUnCodePostalQuiNExistePas() throws Exception {
        mockMvc.perform(post("/api/inscription")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(inscription("0001", "Bruxelles")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Ce code postal n'existe pas en Belgique"));
    }
}
