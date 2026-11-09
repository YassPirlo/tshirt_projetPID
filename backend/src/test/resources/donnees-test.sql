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

INSERT INTO produit (id, nom, prix, image_url, description, matiere, entretien, categorie_id, marque_id) VALUES
  (1, 'T-shirt blanc', 19.99, '/images/tshirt-blanc.svg',
    'Un blanc franc et intemporel, ce t-shirt a col rond se porte seul ou sous une veste.',
    '100 % coton peigne, 180 g/m2', 'Lavage a 30 C, repassage doux', 1, 1),
  (2, 'T-shirt noir', 19.99, '/images/tshirt-noir.svg',
    'Le noir essentiel de la garde-robe. Sa maille dense garde sa couleur lavage apres lavage.',
    '100 % coton peigne, 185 g/m2', 'Lavage a 30 C sur l''envers, pas de seche-linge', 1, 2),
  (3, 'T-shirt bleu', 21.99, '/images/tshirt-bleu.svg',
    'Un bleu profond legerement chine pour casser la monotonie des basiques.',
    '85 % coton, 15 % polyester recycle, 190 g/m2', 'Lavage a 30 C, sechage a basse temperature', 1, 3),
  (4, 'T-shirt gris slim', 24.99, '/images/tshirt-gris.svg',
    'Une coupe ajustee pres du corps qui souligne la silhouette sans comprimer.',
    '95 % coton, 5 % elasthanne, 170 g/m2', 'Lavage a 30 C, pas de seche-linge', 2, 3);
