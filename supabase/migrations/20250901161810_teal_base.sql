/*
  # Création de la table transactions

  1. Nouvelle Table
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `type` (text) - deposit, withdrawal, investment, earning, referral
      - `method` (text) - moov, mtn, orange, wave, celtis, usdt
      - `amount` (decimal)
      - `fees` (decimal)
      - `status` (text) - pending, approved, rejected, completed
      - `reference` (text)
      - `admin_notes` (text)
      - `created_at` (timestamp)
      - `processed_at` (timestamp)

  2. Sécurité
    - Enable RLS sur `transactions` table
    - Add policies pour les utilisateurs
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type varchar(20) NOT NULL,
  method varchar(20),
  amount decimal(15,2) NOT NULL,
  fees decimal(15,2) DEFAULT 0,
  status varchar(20) DEFAULT 'pending',
  reference varchar(100),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre aux utilisateurs de voir leurs propres transactions
CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Policy pour permettre aux utilisateurs de créer leurs propres transactions
CREATE POLICY "Users can create own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);