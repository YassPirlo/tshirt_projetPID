package com.example.demo.service;

import com.example.demo.model.Produit;
import com.example.demo.repository.ProduitRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProduitServiceTest {

    @Mock
    private ProduitRepository produitRepository;

    @InjectMocks
    private ProduitService produitService;

    private Produit produit(String nom) {
        Produit produit = new Produit();
        produit.setNom(nom);
        return produit;
    }

    // US2
    @Test
    void renvoieLesProduitsDeLaCategorie() {
        List<Produit> produits = List.of(produit("T-shirt blanc"), produit("T-shirt noir"));
        when(produitRepository.findByCategorie_Id(1L)).thenReturn(produits);

        assertThat(produitService.getProduitsParCategorie(1L)).isEqualTo(produits);
    }

    @Test
    void renvoieUneListeVidePourUneCategorieSansProduit() {
        when(produitRepository.findByCategorie_Id(3L)).thenReturn(List.of());

        assertThat(produitService.getProduitsParCategorie(3L)).isEmpty();
    }

    // US3
    @Test
    void renvoieLeProduitDemande() {
        Produit noir = produit("T-shirt noir");
        when(produitRepository.findById(2L)).thenReturn(Optional.of(noir));

        assertThat(produitService.getProduit(2L)).contains(noir);
    }

    @Test
    void renvoieUnOptionalVideSiLeProduitNExistePas() {
        when(produitRepository.findById(999L)).thenReturn(Optional.empty());

        assertThat(produitService.getProduit(999L)).isEmpty();
    }
}
