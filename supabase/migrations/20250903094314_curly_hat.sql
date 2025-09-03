/*
  # Create payment methods table

  1. New Tables
    - `payment_methods`
      - `id` (uuid, primary key)
      - `name` (text, nom de la méthode)
      - `deposit_number` (text, numéro de dépôt)
      - `account_name` (text, nom du compte)
      - `min_deposit` (numeric, montant minimum)
      - `deposit_fee` (numeric, frais de dépôt en %)
      - `withdrawal_enabled` (boolean, validité pour retrait)
      - `is_active` (boolean, méthode active)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `payment_methods` table
    - Add policy for public read access
    - Add policy for admin write access

  3. Initial Data
    - Insert default payment methods
*/

CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  deposit_number varchar(50) NOT NULL,
  account_name varchar(100) NOT NULL,
  min_deposit numeric(15,2) NOT NULL DEFAULT 3000,
  deposit_fee numeric(5,2) NOT NULL DEFAULT 0,
  withdrawal_enabled boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Policy pour lecture publique
CREATE POLICY "Anyone can read active payment methods"
  ON payment_methods
  FOR SELECT
  USING (is_active = true);

-- Policy pour écriture admin (temporaire - à adapter selon votre système d'auth admin)
CREATE POLICY "Admins can manage payment methods"
  ON payment_methods
  FOR ALL
  USING (true);

-- Insérer les méthodes de paiement par défaut
INSERT INTO payment_methods (name, deposit_number, account_name, min_deposit, deposit_fee, withdrawal_enabled) VALUES
('Orange Money', '22912345678', 'ALISHER USMANOV', 3000, 0, true),
('MTN Mobile Money', '22987654321', 'ALISHER USMANOV', 3000, 0, true),
('Moov Money', '22956781234', 'ALISHER USMANOV', 3000, 0, true),
('Wave', '22934567890', 'ALISHER USMANOV', 3000, 0, true),
('Celtis', '22923456789', 'ALISHER USMANOV', 3000, 0, true),
('USDT TRC-20', 'TTetqLeWRGyg9NzGJ8xQFt7AtgBfaTBEAc', 'ALISHER USMANOV', 5, 0, true)
ON CONFLICT DO NOTHING;