

package com.example.demo.service;

import com.example.demo.model.Produit;
import com.example.demo.repository.ProduitRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProduitService {

    private final ProduitRepository produitRepository;

    public ProduitService(ProduitRepository produitRepository) {
        this.produitRepository = produitRepository;
    }

    public List<Produit> getProduitsParCategorie(Long categorieId) {
        return produitRepository.findByCategorie_Id(categorieId);
    }
}