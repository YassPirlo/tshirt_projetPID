package com.example.demo.controller;

import com.example.demo.model.Categorie;
import com.example.demo.model.Marque;
import com.example.demo.model.Produit;
import com.example.demo.service.ProduitService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Test du controller seul : pas de base de données, le service est simulé.
@WebMvcTest(ProduitController.class)
class ProduitControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProduitService produitService;

    @Test
    void renvoieLeDetailDuProduit() throws Exception {
        Produit produit = new Produit();
        produit.setNom("T-shirt noir");
        produit.setPrix(new BigDecimal("19.99"));
        produit.setImageUrl("/images/tshirt-noir.svg");
        produit.setMarque(new Marque("Adidas"));
        produit.setCategorie(new Categorie("T-shirts classiques"));
        when(produitService.getProduit(2L)).thenReturn(Optional.of(produit));

        mockMvc.perform(get("/api/produits/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nom").value("T-shirt noir"))
                .andExpect(jsonPath("$.prix").value(19.99))
                .andExpect(jsonPath("$.imageUrl").value("/images/tshirt-noir.svg"))
                .andExpect(jsonPath("$.marque.nom").value("Adidas"));
    }

    @Test
    void renvoie404SiLeProduitNExistePas() throws Exception {
        when(produitService.getProduit(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/produits/999"))
                .andExpect(status().isNotFound());
    }
}
