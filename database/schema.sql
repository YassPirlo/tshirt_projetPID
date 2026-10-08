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
  categorie_id BIGINT NOT NULL,
  marque_id BIGINT NOT NULL,
  FOREIGN KEY (categorie_id) REFERENCES categorie(id),
  FOREIGN KEY (marque_id) REFERENCES marque(id)
);

-- Donnees de test (la categorie 3 reste vide pour tester US2)
INSERT INTO categorie (nom) VALUES ('T-shirts classiques'), ('T-shirts slim'), ('Nouveautes');

INSERT INTO marque (nom) VALUES ('Nike'), ('Adidas'), ('Puma');

INSERT INTO produit (nom, prix, image_url, categorie_id, marque_id) VALUES
  ('T-shirt blanc', 19.99, 'https://placehold.co/300x300?text=T-shirt+blanc', 1, 1),
  ('T-shirt noir', 19.99, 'https://placehold.co/300x300?text=T-shirt+noir', 1, 2),
  ('T-shirt bleu', 21.99, 'https://placehold.co/300x300?text=T-shirt+bleu', 1, 3),
  ('T-shirt gris slim', 24.99, 'https://placehold.co/300x300?text=T-shirt+gris', 2, 3);
