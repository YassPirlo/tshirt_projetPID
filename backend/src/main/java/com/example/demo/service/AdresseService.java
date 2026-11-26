package com.example.demo.service;

import com.example.demo.model.Localite;
import com.example.demo.repository.LocaliteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

// Vérifie qu'une adresse existe réellement : le code postal doit être un
// vrai code belge, et la ville doit être une localité de ce code.
// Utilisé à l'inscription (US5) et à la modification du profil (US6).
//
// Tout se fait avec la table localite (liste officielle bpost), sans appel
// à un service extérieur.
@Service
public class AdresseService {

    // Seule la Belgique est disponible pour l'instant. Pour ajouter un pays,
    // il faudra sa liste de codes postaux et l'ajouter ici.
    public static final String BELGIQUE = "BE";

    static final String PAYS_NON_PRIS_EN_CHARGE =
            "Seule la Belgique est disponible pour l'instant";
    static final String CODE_POSTAL_INCONNU =
            "Ce code postal n'existe pas en Belgique";
    static final String VILLE_INCORRECTE =
            "La ville ne correspond pas à ce code postal";

    private final LocaliteRepository localiteRepository;

    public AdresseService(LocaliteRepository localiteRepository) {
        this.localiteRepository = localiteRepository;
    }

    // Noms des localités d'un code postal, par ordre alphabétique.
    // Liste vide si le code n'existe pas ou n'a pas 4 chiffres : on ne
    // fait même pas la requête dans ce cas.
    public List<String> localites(String codePostal) {
        if (codePostal == null || !codePostal.trim().matches("\\d{4}")) {
            return List.of();
        }
        return localiteRepository.findByCodePostalOrderByNomAsc(codePostal.trim()).stream()
                .map(Localite::getNom)
                .toList();
    }

    // Lève AdresseInvalideException si le pays, le code postal ou la ville
    // ne vont pas. Le message dit lequel, pour que le client corrige.
    public void verifier(String pays, String codePostal, String ville) {
        if (!BELGIQUE.equals(pays)) {
            throw new AdresseInvalideException(PAYS_NON_PRIS_EN_CHARGE);
        }
        if (localites(codePostal).isEmpty()) {
            throw new AdresseInvalideException(CODE_POSTAL_INCONNU);
        }
        if (!localiteRepository.existsByCodePostalAndNom(codePostal.trim(), ville.trim())) {
            throw new AdresseInvalideException(VILLE_INCORRECTE);
        }
    }
}
