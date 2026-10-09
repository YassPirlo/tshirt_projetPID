package com.example.demo.service;

import com.example.demo.model.Categorie;
import com.example.demo.repository.CategorieRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

// Couche service : la logique métier, entre le controller et le repository
@Service
public class CategorieService {

    private final CategorieRepository categorieRepository;

    public CategorieService(CategorieRepository categorieRepository) {
        this.categorieRepository = categorieRepository;
    }

    // US1 : toutes les catégories, triées par ordre alphabétique
    public List<Categorie> getToutesLesCategories() {
        return categorieRepository.findAll(Sort.by("nom"));
    }
}
