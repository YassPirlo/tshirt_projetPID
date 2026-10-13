package com.example.demo.repository;

import com.example.demo.model.Produit;
import org.springframework.data.jpa.repository.JpaRepository;

// Donne automatiquement findAll(), findById(), save()... pour la table produit
public interface ProduitRepository extends JpaRepository<Produit, Long> {
}
