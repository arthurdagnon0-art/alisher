/*
  # Création de la table users

  1. Nouvelle Table
    - `users`
      - `id` (uuid, primary key)
      - `phone` (text, unique)
      - `email` (text, nullable)
      - `name` (text)
      - `country` (text)
      - `password_hash` (text)
      - `transaction_password_hash` (text)
      - `balance_deposit` (decimal)
      - `balance_withdrawal` (decimal)
      - `total_invested` (decimal)
      - `total_earned` (decimal)
      - `referral_code` (text, unique)
      - `referred_by` (uuid, foreign key)
      - `vip_level` (integer)
      - `is_active` (boolean)
      - `is_blocked` (boolean)
      - `last_login` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Sécurité
    - Enable RLS sur `users` table
    - Add policy pour les utilisateurs authentifiés
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone varchar(20) UNIQUE NOT NULL,
  email varchar(255),
  name varchar(100) NOT NULL,
  country varchar(2) NOT NULL,
  password_hash varchar(255) NOT NULL,
  transaction_password_hash varchar(255),
  balance_deposit decimal(15,2) DEFAULT 0,
  balance_withdrawal decimal(15,2) DEFAULT 0,
  total_invested decimal(15,2) DEFAULT 0,
  total_earned decimal(15,2) DEFAULT 0,
  referral_code varchar(10) UNIQUE NOT NULL,
  referred_by uuid REFERENCES users(id),
  vip_level integer DEFAULT 0,
  is_active boolean DEFAULT true,
  is_blocked boolean DEFAULT false,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre aux utilisateurs de voir leurs propres données
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Policy pour permettre aux utilisateurs de mettre à jour leurs propres données
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);