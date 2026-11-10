package com.example.demo.session;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import java.util.Optional;

// Point de rendez-vous des US5, US6 et US7.
//
// POURQUOI CETTE CLASSE EXISTE
// Trois US différentes manipulent la même session : US5 l'ouvre, US6 la
// ferme, US7 la lit. Si chacune écrivait « session.setAttribute("userId") »
// de son côté, la moindre différence de nom d'attribut passerait inaperçue :
// chaque US réussirait ses propres tests, et le parcours complet
// (connexion -> profil) serait cassé. Le nom est donc écrit UNE fois, ici,
// et personne n'y touche.
//
// ON STOCKE L'ID, PAS L'OBJET Utilisateur
// Un Utilisateur en session serait une photo prise au moment de la
// connexion : si le compte change en base, la session servirait indéfiniment
// des informations périmées. Avec l'id, US7 relit la base à chaque appel et
// renvoie toujours l'état réel du compte.
public final class SessionUtilisateur {

    // Le nom de l'attribut. Jamais écrit en dur ailleurs dans le projet.
    private static final String CLE = "idUtilisateurConnecte";

    // Classe utilitaire : pas d'instance possible.
    private SessionUtilisateur() {
    }

    // US5 : à appeler APRÈS avoir vérifié le mot de passe, jamais avant.
    //
    // On détruit la session existante avant d'en créer une neuve. Sans cela,
    // un visiteur arrivé avec un JSESSIONID choisi par un attaquant
    // garderait ce même identifiant une fois connecté, et l'attaquant se
    // retrouverait dans la session du compte. C'est la « fixation de
    // session » ; changer d'identifiant à la connexion la neutralise.
    // On reçoit l'id et non l'Utilisateur : la signature dit alors exactement
    // ce qui finit en session, et il devient impossible d'y glisser l'entité
    // entière — donc le hachage du mot de passe — par distraction.
    public static void ouvrir(HttpServletRequest requete, Long idUtilisateur) {
        // Un id null signifie un Utilisateur jamais enregistré en base : la
        // session s'ouvrirait « connectée à personne ». Mieux vaut échouer
        // bruyamment ici que déboguer un profil vide plus tard.
        if (idUtilisateur == null) {
            throw new IllegalArgumentException(
                    "Impossible d'ouvrir une session sans id d'utilisateur");
        }
        HttpSession ancienne = requete.getSession(false);
        if (ancienne != null) {
            ancienne.invalidate();
        }
        requete.getSession(true).setAttribute(CLE, idUtilisateur);
    }

    // US7 : l'id du compte connecté, ou Optional.empty() si personne.
    //
    // getSession(false) est important : « false » signifie « ne crée pas de
    // session s'il n'y en a pas ». Avec getSession() tout court, le simple
    // fait de vérifier si quelqu'un est connecté créerait une session vide
    // et enverrait un cookie JSESSIONID à chaque visiteur anonyme.
    public static Optional<Long> idConnecte(HttpServletRequest requete) {
        HttpSession session = requete.getSession(false);
        if (session == null) {
            return Optional.empty();
        }
        Object valeur = session.getAttribute(CLE);
        return valeur instanceof Long id ? Optional.of(id) : Optional.empty();
    }

    // US6 : invalide la session côté serveur.
    //
    // invalidate() et pas removeAttribute() : on jette la session entière,
    // pas seulement l'attribut. C'est ce qui garantit qu'un F5 après
    // déconnexion ne redonne pas accès au compte.
    //
    // Appelable même si personne n'est connecté : la déconnexion est
    // idempotente, deux appels de suite ne doivent pas lever d'erreur.
    public static void fermer(HttpServletRequest requete) {
        HttpSession session = requete.getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }
}
