package com.example.demo.dto;

import com.example.demo.model.Utilisateur;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UtilisateurReponseTest {

    // Test de non-régression sur la fuite de données : si quelqu'un ajoute
    // un champ motDePasse à UtilisateurReponse, ce test ne compilera plus
    // ou échouera.
    @Test
    void neContientAucuneTraceDuMotDePasse() {
        Utilisateur utilisateur = new Utilisateur(
                "yassine@mail.be", "$2a$10$hachageBCryptFactice", "Vitullo", "Yassine");

        UtilisateurReponse reponse = UtilisateurReponse.depuis(utilisateur);

        assertThat(reponse.email()).isEqualTo("yassine@mail.be");
        assertThat(reponse.nom()).isEqualTo("Vitullo");
        assertThat(reponse.prenom()).isEqualTo("Yassine");

        // Aucun champ du record ne doit s'appeler "motDePasse"
        assertThat(UtilisateurReponse.class.getRecordComponents())
                .extracting(composant -> composant.getName())
                .containsExactly("id", "email", "nom", "prenom");

        // Et le hachage ne doit apparaître nulle part dans sa représentation
        assertThat(reponse.toString()).doesNotContain("$2a$");
    }
}
