package com.example.demo.repository;

import com.example.demo.model.Marque;
import org.springframework.data.jpa.repository.JpaRepository;

// Donne automatiquement findAll(), findById(), save()... pour la table marque
public interface MarqueRepository extends JpaRepository<Marque, Long> {
}
