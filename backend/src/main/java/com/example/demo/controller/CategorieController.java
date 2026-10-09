package com.example.demo.controller;

import com.example.demo.model.Categorie;
import com.example.demo.service.CategorieService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// US1 : GET http://localhost:8080/api/categories renvoie la liste des catégories en JSON
@RestController
@RequestMapping("/api/categories")
public class CategorieController {

    private final CategorieService categorieService;

    public CategorieController(CategorieService categorieService) {
        this.categorieService = categorieService;
    }

    @GetMapping
    public List<Categorie> getCategories() {
        return categorieService.getToutesLesCategories();
    }
}
