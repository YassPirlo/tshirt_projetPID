package com.example.demo.service;

import com.example.demo.dto.ChangementMotDePasseRequete;
import com.example.demo.dto.ConnexionRequete;
import com.example.demo.dto.InscriptionRequete;
import com.example.demo.dto.ModificationProfilRequete;
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
import org.springframework.test.util.ReflectionTestUtils;

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
        return new InscriptionRequete(email, "motdepasse123", "Vitullo", "Yassine",
                "12 rue des Tests", "1000", "Bruxelles");
    }

    // Renvoie l'utilisateur que le service a tenté d'enregistrer
    private Utilisateur capturerUtilisateurEnregistre() {
        ArgumentCaptor<Utilisateur> capteur = ArgumentCaptor.forClass(Utilisateur.class);
        verify(utilisateurRepository).save(capteur.capture());
        return capteur.getValue();
    }

    // US5
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

    // US5 : adresse, code postal et ville sont enregistrés, sans les
    // espaces tapés par erreur autour.
    @Test
    void enregistreLAdresseSansEspacesAutour() {
        when(utilisateurRepository.findByEmail("yassine@mail.be")).thenReturn(Optional.empty());
        when(utilisateurRepository.save(any(Utilisateur.class))).thenAnswer(i -> i.getArgument(0));

        utilisateurService.inscrire(new InscriptionRequete("yassine@mail.be", "motdepasse123",
                "Vitullo", "Yassine", "  12 rue des Tests ", " 1000 ", " Bruxelles  "));

        Utilisateur enregistre = capturerUtilisateurEnregistre();
        assertThat(enregistre.getAdresse()).isEqualTo("12 rue des Tests");
        assertThat(enregistre.getCodePostal()).isEqualTo("1000");
        assertThat(enregistre.getVille()).isEqualTo("Bruxelles");
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

    // US4 et US6 : la recherche normalise aussi, sinon un utilisateur inscrit
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

    // US6 : le profil part de l'id stocké en session.
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

    // US4 : un compte en base dont le mot de passe est réellement haché
    // par BCrypt, comme le ferait inscrire().
    private Utilisateur compteAvecMotDePasse(String motDePasse) {
        return new Utilisateur("yassine@mail.be", passwordEncoder.encode(motDePasse),
                "Vitullo", "Yassine", "12 rue des Tests", "1000", "Bruxelles");
    }

    @Test
    void accepteLeBonMotDePasse() {
        Utilisateur existant = compteAvecMotDePasse("motdepasse123");
        when(utilisateurRepository.findByEmail("yassine@mail.be"))
                .thenReturn(Optional.of(existant));

        assertThat(utilisateurService.verifier(
                new ConnexionRequete("yassine@mail.be", "motdepasse123"))).contains(existant);
    }

    @Test
    void refuseUnMauvaisMotDePasse() {
        when(utilisateurRepository.findByEmail("yassine@mail.be"))
                .thenReturn(Optional.of(compteAvecMotDePasse("motdepasse123")));

        assertThat(utilisateurService.verifier(
                new ConnexionRequete("yassine@mail.be", "mauvais123"))).isEmpty();
    }

    @Test
    void refuseUnEmailInconnu() {
        when(utilisateurRepository.findByEmail("inconnu@mail.be")).thenReturn(Optional.empty());

        assertThat(utilisateurService.verifier(
                new ConnexionRequete("inconnu@mail.be", "motdepasse123"))).isEmpty();
    }

    // Le hachage stocké ne doit jamais servir de mot de passe : quelqu'un
    // qui aurait lu la base ne peut pas se connecter en le recopiant.
    @Test
    void refuseLeHachageUtiliseCommeMotDePasse() {
        Utilisateur existant = compteAvecMotDePasse("motdepasse123");
        when(utilisateurRepository.findByEmail("yassine@mail.be"))
                .thenReturn(Optional.of(existant));

        assertThat(utilisateurService.verifier(
                new ConnexionRequete("yassine@mail.be", existant.getMotDePasse()))).isEmpty();
    }

    // US6 : un compte existant avec un id, comme s'il sortait de la base.
    // L'entité n'a pas de setId() (c'est la base qui le génère) :
    // ReflectionTestUtils le pose directement, pour les tests uniquement.
    private Utilisateur compteEnBase(Long id, String email) {
        Utilisateur compte = new Utilisateur(email, passwordEncoder.encode("motdepasse123"),
                "Vitullo", "Yassine", "12 rue des Tests", "1000", "Bruxelles");
        ReflectionTestUtils.setField(compte, "id", id);
        return compte;
    }

    private ModificationProfilRequete modification(String email) {
        return new ModificationProfilRequete(email, "Dupont", "Marie",
                "5 avenue Louise", "1050", "Ixelles");
    }

    @Test
    void modifieLesInformationsDuCompte() {
        Utilisateur compte = compteEnBase(42L, "yassine@mail.be");
        when(utilisateurRepository.findById(42L)).thenReturn(Optional.of(compte));
        when(utilisateurRepository.findByEmail("marie@mail.be")).thenReturn(Optional.empty());
        when(utilisateurRepository.save(any(Utilisateur.class))).thenAnswer(i -> i.getArgument(0));

        Optional<Utilisateur> resultat = utilisateurService.modifier(42L, modification("marie@mail.be"));

        Utilisateur enregistre = capturerUtilisateurEnregistre();
        assertThat(resultat).contains(enregistre);
        assertThat(enregistre.getEmail()).isEqualTo("marie@mail.be");
        assertThat(enregistre.getNom()).isEqualTo("Dupont");
        assertThat(enregistre.getPrenom()).isEqualTo("Marie");
        assertThat(enregistre.getAdresse()).isEqualTo("5 avenue Louise");
        assertThat(enregistre.getCodePostal()).isEqualTo("1050");
        assertThat(enregistre.getVille()).isEqualTo("Ixelles");
    }

    // Le mot de passe ne fait pas partie de l'US6 : il doit rester intact.
    @Test
    void neTouchePasAuMotDePasse() {
        Utilisateur compte = compteEnBase(42L, "yassine@mail.be");
        String hachageAvant = compte.getMotDePasse();
        when(utilisateurRepository.findById(42L)).thenReturn(Optional.of(compte));
        when(utilisateurRepository.findByEmail("marie@mail.be")).thenReturn(Optional.empty());
        when(utilisateurRepository.save(any(Utilisateur.class))).thenAnswer(i -> i.getArgument(0));

        utilisateurService.modifier(42L, modification("marie@mail.be"));

        assertThat(capturerUtilisateurEnregistre().getMotDePasse()).isEqualTo(hachageAvant);
    }

    @Test
    void normaliseLEmailEtRetireLesEspacesALaModification() {
        Utilisateur compte = compteEnBase(42L, "yassine@mail.be");
        when(utilisateurRepository.findById(42L)).thenReturn(Optional.of(compte));
        when(utilisateurRepository.findByEmail("marie@mail.be")).thenReturn(Optional.empty());
        when(utilisateurRepository.save(any(Utilisateur.class))).thenAnswer(i -> i.getArgument(0));

        utilisateurService.modifier(42L, new ModificationProfilRequete("  Marie@Mail.BE ",
                " Dupont ", " Marie ", " 5 avenue Louise ", " 1050 ", " Ixelles "));

        Utilisateur enregistre = capturerUtilisateurEnregistre();
        assertThat(enregistre.getEmail()).isEqualTo("marie@mail.be");
        assertThat(enregistre.getNom()).isEqualTo("Dupont");
        assertThat(enregistre.getVille()).isEqualTo("Ixelles");
    }

    // US6 : « l'email doit rester unique ».
    @Test
    void refuseUnEmailDejaPrisParUnAutreCompte() {
        when(utilisateurRepository.findById(42L))
                .thenReturn(Optional.of(compteEnBase(42L, "yassine@mail.be")));
        when(utilisateurRepository.findByEmail("loic@mail.be"))
                .thenReturn(Optional.of(compteEnBase(7L, "loic@mail.be")));

        assertThatThrownBy(() -> utilisateurService.modifier(42L, modification("loic@mail.be")))
                .isInstanceOf(EmailDejaUtiliseException.class);

        verify(utilisateurRepository, never()).save(any(Utilisateur.class));
    }

    // Garder son propre email n'est pas un doublon : sinon on ne pourrait
    // jamais modifier son adresse sans changer aussi d'email.
    @Test
    void accepteDeGarderSonPropreEmail() {
        Utilisateur compte = compteEnBase(42L, "yassine@mail.be");
        when(utilisateurRepository.findById(42L)).thenReturn(Optional.of(compte));
        when(utilisateurRepository.findByEmail("yassine@mail.be")).thenReturn(Optional.of(compte));
        when(utilisateurRepository.save(any(Utilisateur.class))).thenAnswer(i -> i.getArgument(0));

        assertThat(utilisateurService.modifier(42L, modification("Yassine@mail.be"))).isPresent();
        assertThat(capturerUtilisateurEnregistre().getVille()).isEqualTo("Ixelles");
    }

    // Même cas que trouverParId : la session porte l'id d'un compte supprimé.
    @Test
    void renvoieUnOptionalVideSiLeCompteAModifierNExistePlus() {
        when(utilisateurRepository.findById(42L)).thenReturn(Optional.empty());

        assertThat(utilisateurService.modifier(42L, modification("marie@mail.be"))).isEmpty();
        verify(utilisateurRepository, never()).save(any(Utilisateur.class));
    }

    @Test
    void accepteLEmailQuelleQueSoitSaCasse() {
        Utilisateur existant = compteAvecMotDePasse("motdepasse123");
        when(utilisateurRepository.findByEmail("yassine@mail.be"))
                .thenReturn(Optional.of(existant));

        assertThat(utilisateurService.verifier(
                new ConnexionRequete("  Yassine@Mail.BE ", "motdepasse123"))).contains(existant);
    }

    // Changement de mot de passe

    @Test
    void changeLeMotDePasseEtLeStockeHache() {
        Utilisateur compte = compteEnBase(42L, "yassine@mail.be");
        when(utilisateurRepository.findById(42L)).thenReturn(Optional.of(compte));
        when(utilisateurRepository.save(any(Utilisateur.class))).thenAnswer(i -> i.getArgument(0));

        assertThat(utilisateurService.changerMotDePasse(42L,
                new ChangementMotDePasseRequete("motdepasse123", "nouveauSecret9"))).isPresent();

        String hachage = capturerUtilisateurEnregistre().getMotDePasse();
        assertThat(hachage).isNotEqualTo("nouveauSecret9");
        assertThat(passwordEncoder.matches("nouveauSecret9", hachage)).isTrue();
        assertThat(passwordEncoder.matches("motdepasse123", hachage)).isFalse();
    }

    // Sans l'ancien mot de passe, quelqu'un qui trouve un ordinateur resté
    // connecté pourrait s'approprier le compte.
    @Test
    void refuseDeChangerLeMotDePasseSiLAncienEstFaux() {
        when(utilisateurRepository.findById(42L))
                .thenReturn(Optional.of(compteEnBase(42L, "yassine@mail.be")));

        assertThatThrownBy(() -> utilisateurService.changerMotDePasse(42L,
                new ChangementMotDePasseRequete("mauvais123", "nouveauSecret9")))
                .isInstanceOf(MotDePasseIncorrectException.class);

        verify(utilisateurRepository, never()).save(any(Utilisateur.class));
    }

    @Test
    void renvoieUnOptionalVideSiLeCompteNExistePlusAuChangementDeMotDePasse() {
        when(utilisateurRepository.findById(42L)).thenReturn(Optional.empty());

        assertThat(utilisateurService.changerMotDePasse(42L,
                new ChangementMotDePasseRequete("motdepasse123", "nouveauSecret9"))).isEmpty();
        verify(utilisateurRepository, never()).save(any(Utilisateur.class));
    }
}
