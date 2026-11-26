package com.example.demo.service;

import com.example.demo.model.Localite;
import com.example.demo.repository.LocaliteRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdresseServiceTest {

    @Mock
    private LocaliteRepository localiteRepository;

    private AdresseService adresseService;

    @BeforeEach
    void preparer() {
        adresseService = new AdresseService(localiteRepository);
    }

    private void codeExistant(String codePostal, String... noms) {
        when(localiteRepository.findByCodePostalOrderByNomAsc(codePostal))
                .thenReturn(java.util.Arrays.stream(noms)
                        .map(nom -> new Localite(codePostal, nom, "LIEGE"))
                        .toList());
    }

    @Test
    void renvoieLesLocalitesDUnCode() {
        codeExistant("4000", "Glain", "Liège", "Rocourt");

        assertThat(adresseService.localites("4000")).containsExactly("Glain", "Liège", "Rocourt");
    }

    // Pas 4 chiffres : inutile d'interroger la base
    @Test
    void renvoieUneListeVideSansInterrogerLaBaseSiLeCodeNAPas4Chiffres() {
        assertThat(adresseService.localites("40")).isEmpty();
        assertThat(adresseService.localites("abcd")).isEmpty();
        assertThat(adresseService.localites(null)).isEmpty();

        verify(localiteRepository, never()).findByCodePostalOrderByNomAsc(anyString());
    }

    @Test
    void accepteUnCodeEtUneVilleQuiSeCorrespondent() {
        codeExistant("4000", "Glain", "Liège", "Rocourt");
        when(localiteRepository.existsByCodePostalAndNom("4000", "Liège")).thenReturn(true);

        assertThatCode(() -> adresseService.verifier("BE", " 4000 ", " Liège "))
                .doesNotThrowAnyException();
    }

    @Test
    void refuseUnCodePostalInexistant() {
        when(localiteRepository.findByCodePostalOrderByNomAsc("0000")).thenReturn(List.of());

        assertThatThrownBy(() -> adresseService.verifier("BE", "0000", "Nulle part"))
                .isInstanceOf(AdresseInvalideException.class)
                .hasMessage("Ce code postal n'existe pas en Belgique");
    }

    // Le code existe, mais la ville appartient à un autre code
    @Test
    void refuseUneVilleQuiNeCorrespondPasAuCode() {
        codeExistant("4000", "Glain", "Liège", "Rocourt");
        when(localiteRepository.existsByCodePostalAndNom("4000", "Namur")).thenReturn(false);

        assertThatThrownBy(() -> adresseService.verifier("BE", "4000", "Namur"))
                .isInstanceOf(AdresseInvalideException.class)
                .hasMessage("La ville ne correspond pas à ce code postal");
    }

    @Test
    void refuseUnAutrePaysQueLaBelgique() {
        assertThatThrownBy(() -> adresseService.verifier("FR", "75001", "Paris"))
                .isInstanceOf(AdresseInvalideException.class)
                .hasMessage("Seule la Belgique est disponible pour l'instant");
    }
}
