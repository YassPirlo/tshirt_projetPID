package com.example.demo.repository;

import com.example.demo.model.Categorie;
import org.springframework.data.jpa.repository.JpaRepository;

// Donne automatiquement findAll(), findById(), save()... pour la table categorie
public interface CategorieRepository extends JpaRepository<Categorie, Long> {
}
