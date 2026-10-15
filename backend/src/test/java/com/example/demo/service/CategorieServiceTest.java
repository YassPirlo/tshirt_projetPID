package com.example.demo.service;

import com.example.demo.model.Categorie;
import com.example.demo.repository.CategorieRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

// Test du service seul : le repository est simulé avec Mockito,
// pas besoin de base de données.
@ExtendWith(MockitoExtension.class)
class CategorieServiceTest {

    @Mock
    private CategorieRepository categorieRepository;

    @InjectMocks
    private CategorieService categorieService;

    @Test
    void renvoieLesCategoriesTrieesParNom() {
        List<Categorie> categories = List.of(
                new Categorie("Nouveautes"),
                new Categorie("T-shirts classiques"));
        when(categorieRepository.findAll(Sort.by("nom"))).thenReturn(categories);

        List<Categorie> resultat = categorieService.getToutesLesCategories();

        assertThat(resultat).isEqualTo(categories);
        // US1 : on vérifie que le tri alphabétique est bien demandé
        verify(categorieRepository).findAll(Sort.by("nom"));
    }

    @Test
    void renvoieUneListeVideSiAucuneCategorie() {
        when(categorieRepository.findAll(Sort.by("nom"))).thenReturn(List.of());

        assertThat(categorieService.getToutesLesCategories()).isEmpty();
    }
}
