-- Base de donnees du projet TshirtShop (US1 a US3)
-- A executer dans phpMyAdmin (onglet SQL) en etant connecte en root.
-- Attention : le script supprime et recree les tables.

CREATE DATABASE IF NOT EXISTS tshirt_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'tshirt_user'@'localhost' IDENTIFIED BY 'tshirt123';
GRANT ALL PRIVILEGES ON tshirt_shop.* TO 'tshirt_user'@'localhost';
FLUSH PRIVILEGES;

USE tshirt_shop;

DROP TABLE IF EXISTS produit;
DROP TABLE IF EXISTS marque;
DROP TABLE IF EXISTS categorie;

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
INSERT INTO categorie (nom) VALUES ('T-shirts classiques'), ('T-shirts slim'), ('Nouveautes');

INSERT INTO marque (nom) VALUES ('Nike'), ('Adidas'), ('Puma');

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
