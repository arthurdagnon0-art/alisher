/*
  # Ajouter le champ pays aux méthodes de paiement

  1. Modifications
    - Ajouter la colonne `country` à la table `payment_methods`
    - Ajouter un index pour optimiser les requêtes par pays
    - Mettre à jour les données existantes avec des pays par défaut

  2. Sécurité
    - Maintenir les politiques RLS existantes
*/

-- Ajouter la colonne country
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payment_methods' AND column_name = 'country'
  ) THEN
    ALTER TABLE payment_methods ADD COLUMN country VARCHAR(2) DEFAULT 'BJ';
  END IF;
END $$;

-- Ajouter un index pour les requêtes par pays
CREATE INDEX IF NOT EXISTS idx_payment_methods_country ON payment_methods(country);

-- Ajouter un index composé pour pays + statut actif
CREATE INDEX IF NOT EXISTS idx_payment_methods_country_active ON payment_methods(country, is_active);