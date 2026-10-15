package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Tests d'intégration : toute l'application démarre (controllers, services,
// repositories, Hibernate) avec une vraie base H2 en mémoire remplie par
// donnees-test.sql. Chaque requête traverse toutes les couches jusqu'à la base.
@SpringBootTest
@AutoConfigureMockMvc
@Sql("/donnees-test.sql")
class ApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    // US1
    @Test
    void listeDesCategoriesTrieeParOrdreAlphabetique() throws Exception {
        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].nom").value("Nouveautes"))
                .andExpect(jsonPath("$[1].nom").value("T-shirts classiques"))
                .andExpect(jsonPath("$[2].nom").value("T-shirts slim"));
    }

    // US2
    @Test
    void produitsDUneCategorieAvecLeurPrixEtLeurImage() throws Exception {
        mockMvc.perform(get("/api/categories/1/produits"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[*].nom").value(
                        containsInAnyOrder("T-shirt blanc", "T-shirt noir", "T-shirt bleu")))
                .andExpect(jsonPath("$[?(@.nom == 'T-shirt bleu')].prix").value(21.99))
                .andExpect(jsonPath("$[?(@.nom == 'T-shirt bleu')].imageUrl")
                        .value("/images/tshirt-bleu.svg"));
    }

    @Test
    void categorieSansProduitRenvoieUneListeVide() throws Exception {
        mockMvc.perform(get("/api/categories/3/produits"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // US3
    @Test
    void detailDUnProduitAvecSaMarqueEtSaCategorie() throws Exception {
        mockMvc.perform(get("/api/produits/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nom").value("T-shirt noir"))
                .andExpect(jsonPath("$.prix").value(19.99))
                .andExpect(jsonPath("$.imageUrl").value("/images/tshirt-noir.svg"))
                .andExpect(jsonPath("$.marque.nom").value("Adidas"))
                .andExpect(jsonPath("$.categorie.nom").value("T-shirts classiques"));
    }

    @Test
    void produitInexistantRenvoie404() throws Exception {
        mockMvc.perform(get("/api/produits/999"))
                .andExpect(status().isNotFound());
    }

    // Configuration CORS : le front sur le port 5173 est autorisé
    @Test
    void leFrontSurLePort5173EstAutorise() throws Exception {
        mockMvc.perform(get("/api/categories").header("Origin", "http://localhost:5173"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }
}
