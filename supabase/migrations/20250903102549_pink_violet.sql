/*
  # Mise à jour table deposit_submissions

  1. Modifications
    - Ajouter colonne `transaction_reference` pour stocker l'ID de transaction fourni par l'utilisateur
    - Cette colonne stocke l'ID de transaction du paiement mobile money fourni par l'utilisateur

  2. Sécurité
    - Pas de changement RLS nécessaire
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deposit_submissions' AND column_name = 'transaction_reference'
  ) THEN
    ALTER TABLE deposit_submissions ADD COLUMN transaction_reference VARCHAR(100);
  END IF;
END $$;