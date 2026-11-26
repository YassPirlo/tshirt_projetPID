package com.example.demo.repository;

import com.example.demo.model.Localite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// Lecture de la liste des localités belges (table localite)
public interface LocaliteRepository extends JpaRepository<Localite, Long> {

    // Les localités d'un code postal, par ordre alphabétique :
    // SELECT * FROM localite WHERE code_postal = ? ORDER BY nom
    List<Localite> findByCodePostalOrderByNomAsc(String codePostal);

    // Le couple code postal + ville existe-t-il ?
    boolean existsByCodePostalAndNom(String codePostal, String nom);
}
