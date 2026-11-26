package com.example.demo.controller;

import com.example.demo.service.AdresseService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// GET /api/localites?codePostal=4000 -> ["Glain", "Liège", "Rocourt"]
//
// Le front l'appelle dès que 4 chiffres sont tapés, pour proposer la liste
// des villes de ce code. Public : la liste bpost n'a rien de personnel.
// Un code inconnu donne une liste vide (200), pas une erreur : c'est au
// formulaire d'afficher « code postal inconnu ».
@RestController
public class LocaliteController {

    private final AdresseService adresseService;

    public LocaliteController(AdresseService adresseService) {
        this.adresseService = adresseService;
    }

    @GetMapping("/api/localites")
    public List<String> localites(@RequestParam(defaultValue = "") String codePostal) {
        return adresseService.localites(codePostal);
    }
}
