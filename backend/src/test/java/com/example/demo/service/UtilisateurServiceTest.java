package com.example.demo.service;

import com.example.demo.dto.InscriptionRequete;
import com.example.demo.model.Utilisateur;
import com.example.demo.repository.UtilisateurRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UtilisateurServiceTest {

    @Mock
    private UtilisateurRepository utilisateurRepository;

    // Vrai encodeur et non un mock : on veut vérifier que le hachage
    // produit est réellement vérifiable par BCrypt.
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private UtilisateurService utilisateurService;

    @BeforeEach
    void preparer() {
        utilisateurService = new UtilisateurService(utilisateurRepository, passwordEncoder);
    }

    private InscriptionRequete requete(String email) {
        return new InscriptionRequete(email, "motdepasse123", "Vitullo", "Yassine");
    }

    // Renvoie l'utilisateur que le service a tenté d'enregistrer
    private Utilisateur capturerUtilisateurEnregistre() {
        ArgumentCaptor<Utilisateur> capteur = ArgumentCaptor.forClass(Utilisateur.class);
        verify(utilisateurRepository).save(capteur.capture());
        return capteur.getValue();
    }

    // US4
    @Test
    void enregistreLeMotDePasseHacheEtJamaisEnClair() {
        when(utilisateurRepository.findByEmail("yassine@mail.be")).thenReturn(Optional.empty());
        when(utilisateurRepository.save(any(Utilisateur.class))).thenAnswer(i -> i.getArgument(0));

        utilisateurService.inscrire(requete("yassine@mail.be"));

        Utilisateur enregistre = capturerUtilisateurEnregistre();
        assertThat(enregistre.getMotDePasse()).isNotEqualTo("motdepasse123");
        assertThat(enregistre.getMotDePasse()).hasSize(60);
        assertThat(passwordEncoder.matches("motdepasse123", enregistre.getMotDePasse())).isTrue();
    }

    @Test
    void enregistreLeNomLePrenomEtLaDateDInscription() {
        when(utilisateurRepository.findByEmail("yassine@mail.be")).thenReturn(Optional.empty());
        when(utilisateurRepository.save(any(Utilisateur.class))).thenAnswer(i -> i.getArgument(0));

        utilisateurService.inscrire(requete("yassine@mail.be"));

        Utilisateur enregistre = capturerUtilisateurEnregistre();
        assertThat(enregistre.getNom()).isEqualTo("Vitullo");
        assertThat(enregistre.getPrenom()).isEqualTo("Yassine");
        assertThat(enregistre.getDateInscription()).isNotNull();
    }

    @Test
    void refuseUnEmailDejaUtilise() {
        when(utilisateurRepository.findByEmail("yassine@mail.be"))
                .thenReturn(Optional.of(new Utilisateur()));

        assertThatThrownBy(() -> utilisateurService.inscrire(requete("yassine@mail.be")))
                .isInstanceOf(EmailDejaUtiliseException.class);

        // Aucun compte ne doit avoir été créé
        verify(utilisateurRepository, never()).save(any(Utilisateur.class));
    }

    @Test
    void normaliseLEmailEnMinusculesSansEspaces() {
        when(utilisateurRepository.findByEmail("yassine@mail.be")).thenReturn(Optional.empty());
        when(utilisateurRepository.save(any(Utilisateur.class))).thenAnswer(i -> i.getArgument(0));

        utilisateurService.inscrire(requete("  Yassine@Mail.BE  "));

        assertThat(capturerUtilisateurEnregistre().getEmail()).isEqualTo("yassine@mail.be");
    }

    // US5 et US7 : la recherche normalise aussi, sinon un utilisateur inscrit
    // en minuscules ne pourrait pas se connecter en tapant une majuscule.
    @Test
    void trouveUnCompteQuelleQueSoitLaCasseDeLEmail() {
        Utilisateur existant = new Utilisateur();
        when(utilisateurRepository.findByEmail("yassine@mail.be"))
                .thenReturn(Optional.of(existant));

        assertThat(utilisateurService.trouverParEmail("YASSINE@MAIL.BE")).contains(existant);
    }

    @Test
    void renvoieUnOptionalVideSiLEmailEstInconnu() {
        when(utilisateurRepository.findByEmail("inconnu@mail.be")).thenReturn(Optional.empty());

        assertThat(utilisateurService.trouverParEmail("inconnu@mail.be")).isEmpty();
    }

    // US7 : le profil part de l'id stocké en session.
    @Test
    void trouveUnCompteParSonId() {
        Utilisateur existant = new Utilisateur();
        when(utilisateurRepository.findById(42L)).thenReturn(Optional.of(existant));

        assertThat(utilisateurService.trouverParId(42L)).contains(existant);
    }

    // Le cas que le profil doit traiter : la session porte un id valide,
    // mais le compte a été supprimé entre-temps.
    @Test
    void renvoieUnOptionalVideSiLIdNExistePlus() {
        when(utilisateurRepository.findById(42L)).thenReturn(Optional.empty());

        assertThat(utilisateurService.trouverParId(42L)).isEmpty();
    }
}
