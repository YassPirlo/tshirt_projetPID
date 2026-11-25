# FACE — boutique de t-shirts (projet TshirtShop, groupe 3)

Boutique en ligne fictive de t-shirts, réalisée en équipe en méthode Scrum.
Front React + TypeScript (Vite), back Spring Boot 4 (Java 21), base MySQL 8.

Fonctionnalités à la fin du sprint 2 (US1 à US7) : catégories, produits et
fiche produit ; création de compte, connexion, profil modifiable,
déconnexion ; bandeau cookies et pages légales.

## Documentation

- [Documentation utilisateur](docs/Documentation_utilisateur_FACE.docx) : utiliser le site, écran par écran.
- [Documentation technique](docs/Documentation_technique_FACE.docx) : architecture, API, base de données, sécurité, tests.

## Lancer le projet

Prérequis : Java 21, Node.js 20+, MySQL 8 (MAMP ou XAMPP, port 3306).

1. Exécuter `database/schema.sql` dans phpMyAdmin (attention : il efface et recrée les tables).
2. Installer les dépendances : `npm install` à la racine, puis dans `frontend`.
3. Lancer back et front ensemble :

```bash
npm run dev
```

Sous Windows : `npm run dev:windows`. Le site s'ouvre sur http://localhost:5173.
Avec le port MySQL par défaut de MAMP (8889) : `DB_PORT=8889 npm run dev`.

## Tests

```bash
npm run test
```

Lance les tests du back (JUnit, base H2 en mémoire, sans MySQL) et du front
(Vitest) en parallèle. Séparément : `npm run test:back` et `npm run test:front`.
