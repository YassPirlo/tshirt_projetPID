-- Données des tests d'intégration, reprises de database/schema.sql.
-- On vide d'abord les tables pour que chaque test parte du même état.
DELETE FROM produit;
DELETE FROM marque;
DELETE FROM categorie;

INSERT INTO categorie (id, nom) VALUES
  (1, 'T-shirts classiques'),
  (2, 'T-shirts slim'),
  (3, 'Nouveautes');

INSERT INTO marque (id, nom) VALUES
  (1, 'Nike'),
  (2, 'Adidas'),
  (3, 'Puma');

INSERT INTO produit (id, nom, prix, image_url, categorie_id, marque_id) VALUES
  (1, 'T-shirt blanc', 19.99, '/images/tshirt-blanc.svg', 1, 1),
  (2, 'T-shirt noir', 19.99, '/images/tshirt-noir.svg', 1, 2),
  (3, 'T-shirt bleu', 21.99, '/images/tshirt-bleu.svg', 1, 3),
  (4, 'T-shirt gris slim', 24.99, '/images/tshirt-gris.svg', 2, 3);
