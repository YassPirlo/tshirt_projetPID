
package com.example.demo.controller;

import com.example.demo.model.Categorie;
import com.example.demo.model.Produit;
import com.example.demo.service.CategorieService;
import com.example.demo.service.ProduitService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategorieController {

    private final CategorieService categorieService;
    private final ProduitService produitService;

    public CategorieController(
            CategorieService categorieService,
            ProduitService produitService) {
        this.categorieService = categorieService;
        this.produitService = produitService;
    }

    @GetMapping
    public List<Categorie> getCategories() {
        return categorieService.getToutesLesCategories();
    }

    @GetMapping("/{categorieId}/produits")
    public List<Produit> getProduitsParCategorie(
            @PathVariable Long categorieId) {
        return produitService.getProduitsParCategorie(categorieId);
    }
}