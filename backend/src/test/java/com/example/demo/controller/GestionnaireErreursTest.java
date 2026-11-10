package com.example.demo.controller;

import com.example.demo.dto.ErreurReponse;
import com.example.demo.dto.InscriptionRequete;
import com.example.demo.service.EmailDejaUtiliseException;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GestionnaireErreursTest {

    private final GestionnaireErreurs gestionnaire = new GestionnaireErreurs();

    @Test
    void traduitEmailDejaUtiliseEn409() {
        ResponseEntity<ErreurReponse> reponse = gestionnaire.emailDejaUtilise(
                new EmailDejaUtiliseException("yassine@mail.be"));

        assertThat(reponse.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(reponse.getBody().message())
                .isEqualTo("Un compte existe déjà avec cet email");
    }

    // Le message renvoyé ne doit pas recopier l'adresse envoyée par le
    // client : on ne renvoie pas au navigateur une chaîne construite à
    // partir de ce qu'il nous a donné.
    @Test
    void neRenvoiePasLEmailRecu() {
        ResponseEntity<ErreurReponse> reponse = gestionnaire.emailDejaUtilise(
                new EmailDejaUtiliseException("yassine@mail.be"));

        assertThat(reponse.getBody().message()).doesNotContain("yassine@mail.be");
    }

    @Test
    void traduitUnChampInvalideEn400AvecSonMessage() {
        BeanPropertyBindingResult erreurs = new BeanPropertyBindingResult(
                new InscriptionRequete("", "", "", ""), "inscriptionRequete");
        erreurs.rejectValue("email", "NotBlank", "L'email est obligatoire");

        MethodArgumentNotValidException exception =
                mock(MethodArgumentNotValidException.class);
        when(exception.getBindingResult()).thenReturn(erreurs);

        ResponseEntity<ErreurReponse> reponse =
                gestionnaire.donneesInvalides(exception);

        assertThat(reponse.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(reponse.getBody().message())
                .isEqualTo("L'email est obligatoire");
    }

    // Garde-fou : getFieldErrors() peut être vide (erreur portant sur
    // l'objet entier et non sur un champ). Le gestionnaire ne doit pas
    // lever NoSuchElementException dans ce cas.
    @Test
    void messageParDefautSiAucuneErreurDeChamp() {
        BeanPropertyBindingResult erreurs = new BeanPropertyBindingResult(
                new InscriptionRequete("", "", "", ""), "inscriptionRequete");

        MethodArgumentNotValidException exception =
                mock(MethodArgumentNotValidException.class);
        when(exception.getBindingResult()).thenReturn(erreurs);

        ResponseEntity<ErreurReponse> reponse =
                gestionnaire.donneesInvalides(exception);

        assertThat(reponse.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(reponse.getBody().message()).isEqualTo("Données invalides");
    }
}
