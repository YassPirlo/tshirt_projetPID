package com.example.demo.controller;

import com.example.demo.model.Categorie;
import com.example.demo.model.Marque;
import com.example.demo.model.Produit;
import com.example.demo.service.CategorieService;
import com.example.demo.service.ProduitService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Test du controller seul : pas de base de données, les services sont simulés.
@WebMvcTest(CategorieController.class)
class CategorieControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CategorieService categorieService;

    @MockitoBean
    private ProduitService produitService;

    // US1
    @Test
    void renvoieLaListeDesCategoriesEnJson() throws Exception {
        when(categorieService.getToutesLesCategories()).thenReturn(List.of(
                new Categorie("Nouveautes"),
                new Categorie("T-shirts classiques")));

        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].nom").value("Nouveautes"))
                .andExpect(jsonPath("$[1].nom").value("T-shirts classiques"));
    }

    // US2
    @Test
    void renvoieLesProduitsDUneCategorie() throws Exception {
        Produit blanc = new Produit();
        blanc.setNom("T-shirt blanc");
        blanc.setPrix(new BigDecimal("19.99"));
        blanc.setImageUrl("/images/tshirt-blanc.svg");
        blanc.setMarque(new Marque("Nike"));
        when(produitService.getProduitsParCategorie(1L)).thenReturn(List.of(blanc));

        mockMvc.perform(get("/api/categories/1/produits"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].nom").value("T-shirt blanc"))
                .andExpect(jsonPath("$[0].prix").value(19.99))
                .andExpect(jsonPath("$[0].imageUrl").value("/images/tshirt-blanc.svg"));
    }

    @Test
    void renvoieUneListeVidePourUneCategorieSansProduit() throws Exception {
        when(produitService.getProduitsParCategorie(3L)).thenReturn(List.of());

        mockMvc.perform(get("/api/categories/3/produits"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
