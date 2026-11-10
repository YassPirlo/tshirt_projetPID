-- Base de donnees du projet TshirtShop (US1 a US3)
-- A executer dans phpMyAdmin (onglet SQL) en etant connecte en root.
-- Attention : le script supprime et recree les tables.

CREATE DATABASE IF NOT EXISTS tshirt_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'tshirt_user'@'localhost' IDENTIFIED BY 'tshirt123';
GRANT ALL PRIVILEGES ON tshirt_shop.* TO 'tshirt_user'@'localhost';
FLUSH PRIVILEGES;

USE tshirt_shop;

DROP TABLE IF EXISTS utilisateur;
DROP TABLE IF EXISTS produit;
DROP TABLE IF EXISTS marque;
DROP TABLE IF EXISTS categorie;

-- Comptes clients (US4 a US7 : inscription, connexion, deconnexion, profil)
CREATE TABLE utilisateur (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  -- UNIQUE : la base refuse deux comptes avec la meme adresse
  email VARCHAR(255) NOT NULL UNIQUE,
  -- Jamais le mot de passe en clair : on stocke un hachage BCrypt,
  -- qui fait toujours exactement 60 caracteres.
  mot_de_passe VARCHAR(60) NOT NULL,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  date_inscription DATETIME NOT NULL
);

CREATE TABLE categorie (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL
);

CREATE TABLE marque (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL
);

CREATE TABLE produit (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prix DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(500),
  description VARCHAR(1000),
  matiere VARCHAR(255),
  entretien VARCHAR(255),
  categorie_id BIGINT NOT NULL,
  marque_id BIGINT NOT NULL,
  FOREIGN KEY (categorie_id) REFERENCES categorie(id),
  FOREIGN KEY (marque_id) REFERENCES marque(id)
);

-- Donnees de test (la categorie 3 reste vide pour tester US2)
-- Les nouvelles categories sont ajoutees a la fin : les identifiants 1 a 3
-- ne changent pas.
INSERT INTO categorie (nom) VALUES ('T-shirts classiques'), ('T-shirts slim'), ('Nouveautes'),
  ('Homme'), ('Femme'), ('Enfant');

INSERT INTO marque (nom) VALUES ('Nike'), ('Adidas'), ('Puma'), ('FACE');

INSERT INTO produit (nom, prix, image_url, description, matiere, entretien, categorie_id, marque_id) VALUES
  ('T-shirt blanc', 19.99, '/images/tshirt-blanc.svg',
    'Un blanc franc et intemporel, ce t-shirt a col rond se porte seul ou sous une veste. Sa coupe droite tombe naturellement sans serrer, pour un confort du matin au soir.',
    '100 % coton peigne, 180 g/m2',
    'Lavage en machine a 30 C, repassage doux, sechage a l''air libre',
    1, 1),
  ('T-shirt noir', 19.99, '/images/tshirt-noir.svg',
    'Le noir essentiel de la garde-robe. Sa maille dense garde sa couleur lavage apres lavage et ne transparait pas. Col cotele renforce qui ne se detend pas.',
    '100 % coton peigne, 185 g/m2',
    'Lavage a 30 C sur l''envers, pas de seche-linge, repassage doux',
    1, 2),
  ('T-shirt bleu', 21.99, '/images/tshirt-bleu.svg',
    'Un bleu profond legerement chine pour casser la monotonie des basiques. Coupe droite et epaules structurees, ideal au quotidien comme en sortie.',
    '85 % coton, 15 % polyester recycle, 190 g/m2',
    'Lavage a 30 C, sechage a basse temperature, repassage doux',
    1, 3),
  ('T-shirt gris slim', 24.99, '/images/tshirt-gris.svg',
    'Une coupe ajustee pres du corps qui souligne la silhouette sans comprimer. Le gris chine se marie avec toutes les couleurs. Finitions surpiquees aux manches et a l''ourlet.',
    '95 % coton, 5 % elasthanne, 170 g/m2',
    'Lavage a 30 C, pas de seche-linge, repassage a l''envers',
    2, 3);

-- Collection FACE : categories Homme (4), Femme (5) et Enfant (6), marque FACE (4)
INSERT INTO produit (nom, prix, image_url, description, matiere, entretien, categorie_id, marque_id) VALUES
  ('T-shirt FACE noir', 29.99, '/images/tshirt-homme-face-noir.svg',
    'Le t-shirt de la marque : coupe droite, col rond cotele et grand logo FACE serigraphie sur la poitrine. Un noir dense qui tient au lavage.',
    '100 % coton peigne, 200 g/m2',
    'Lavage a 30 C sur l''envers, pas de seche-linge, ne pas repasser sur le logo',
    4, 4),
  ('T-shirt FACE ecru', 29.99, '/images/tshirt-homme-face-ecru.svg',
    'La version claire du t-shirt FACE. Un ecru naturel, non blanchi, avec le logo noir serigraphie sur la poitrine. Coupe droite.',
    '100 % coton peigne, 200 g/m2',
    'Lavage a 30 C sur l''envers, pas de seche-linge, ne pas repasser sur le logo',
    4, 4),
  ('T-shirt oversize kaki', 34.99, '/images/tshirt-homme-oversize-kaki.svg',
    'Une coupe large aux epaules tombantes, dans un kaki profond. Petit logo FACE discret sur la poitrine. A porter ample, par-dessus un pantalon cargo ou un jean.',
    '100 % coton epais, 240 g/m2',
    'Lavage a 30 C, sechage a l''air libre, repassage doux',
    4, 4),
  ('T-shirt oversize prune', 34.99, '/images/tshirt-homme-oversize-prune.svg',
    'Coupe large et bande claire en travers de la poitrine, avec le logo FACE en reserve. Un prune sombre, la couleur de la collection.',
    '100 % coton epais, 240 g/m2',
    'Lavage a 30 C sur l''envers, sechage a l''air libre, repassage doux',
    4, 4),
  ('T-shirt femme FACE blanc', 27.99, '/images/tshirt-femme-face-blanc.svg',
    'Coupe legerement cintree, encolure degagee et manches courtes. Le logo FACE noir sur un blanc franc. Une maille souple qui ne transparait pas.',
    '100 % coton peigne, 180 g/m2',
    'Lavage a 30 C sur l''envers, pas de seche-linge, ne pas repasser sur le logo',
    5, 4),
  ('T-shirt femme ajuste noir', 27.99, '/images/tshirt-femme-ajuste-noir.svg',
    'Un noir sobre, pres du corps sans serrer, avec un petit logo FACE sur la poitrine. L''encolure degagee met le cou en valeur.',
    '95 % coton, 5 % elasthanne, 180 g/m2',
    'Lavage a 30 C sur l''envers, pas de seche-linge, repassage doux',
    5, 4),
  ('T-shirt femme FACE lilas', 29.99, '/images/tshirt-femme-face-lilas.svg',
    'Un lilas doux et le logo FACE en prune fonce. Coupe legerement cintree, encolure degagee, manches courtes.',
    '100 % coton peigne, 180 g/m2',
    'Lavage a 30 C sur l''envers, pas de seche-linge, ne pas repasser sur le logo',
    5, 4),
  ('T-shirt femme terracotta', 24.99, '/images/tshirt-femme-terracotta.svg',
    'Un uni sans logo, dans un terracotta chaud. Coupe legerement cintree et encolure degagee : le basique colore de la collection.',
    '100 % coton peigne, 170 g/m2',
    'Lavage a 30 C, sechage a l''air libre, repassage doux',
    5, 4),
  ('T-shirt enfant FACE jaune', 17.99, '/images/tshirt-enfant-face-jaune.svg',
    'Un jaune soleil et le logo FACE en grand. Coupe droite et confortable, col renforce qui resiste aux habillages rapides.',
    '100 % coton, 160 g/m2',
    'Lavage a 40 C, seche-linge a basse temperature',
    6, 4),
  ('T-shirt enfant FACE ciel', 17.99, '/images/tshirt-enfant-face-ciel.svg',
    'Un bleu ciel doux avec le logo FACE bleu marine. Coupe droite, maille souple qui suit les mouvements.',
    '100 % coton, 160 g/m2',
    'Lavage a 40 C, seche-linge a basse temperature',
    6, 4),
  ('T-shirt enfant bande noir', 19.99, '/images/tshirt-enfant-noir.svg',
    'Le modele a bande des grands, en taille enfant : noir, bande claire sur la poitrine et logo FACE en reserve.',
    '100 % coton, 170 g/m2',
    'Lavage a 30 C sur l''envers, seche-linge a basse temperature',
    6, 4),
  ('T-shirt enfant vert', 16.99, '/images/tshirt-enfant-vert.svg',
    'Un vert franc avec un petit logo FACE sur la poitrine. Le t-shirt de tous les jours, pour l''ecole comme pour le parc.',
    '100 % coton, 160 g/m2',
    'Lavage a 40 C, seche-linge a basse temperature',
    6, 4);
