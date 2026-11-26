-- Quelques localités belges, reprises de la liste bpost de database/schema.sql
DELETE FROM localite;

INSERT INTO localite (code_postal, nom, province) VALUES
  ('1000', 'Brussel', 'BRUXELLES'),
  ('1000', 'Bruxelles', 'BRUXELLES'),
  ('4000', 'Glain', 'LIEGE'),
  ('4000', 'Liège', 'LIEGE'),
  ('4000', 'Rocourt', 'LIEGE'),
  ('5000', 'Namur', 'NAMUR');
