package com.example.demo.service;

import com.example.demo.model.Produit;
import com.example.demo.repository.ProduitRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProduitService {

    private final ProduitRepository produitRepository;

    public ProduitService(ProduitRepository produitRepository) {
        this.produitRepository = produitRepository;
    }

    public List<Produit> getProduitsParCategorie(Long categorieId) {
        return produitRepository.findByCategorie_Id(categorieId);
    }

    // US3 : un seul produit. Optional est vide si l'id n'existe pas,
    // c'est le controller qui décide quoi répondre dans ce cas.
    public Optional<Produit> getProduit(Long id) {
        return produitRepository.findById(id);
    }
}
