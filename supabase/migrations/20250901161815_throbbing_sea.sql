/*
  # Création des tables pour les revenus et parrainages

  1. Nouvelles Tables
    - `daily_earnings` - Revenus quotidiens calculés
    - `referral_bonuses` - Commissions de parrainage
    - `bank_cards` - Informations bancaires des utilisateurs

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Add policies appropriées
*/

-- Table des revenus quotidiens
CREATE TABLE IF NOT EXISTS daily_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  investment_id uuid NOT NULL,
  investment_type varchar(20) NOT NULL,
  amount decimal(15,2) NOT NULL,
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Table des commissions de parrainage
CREATE TABLE IF NOT EXISTS referral_bonuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_name varchar(100) NOT NULL,
  level integer NOT NULL,
  amount decimal(15,2) NOT NULL,
  percentage decimal(5,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Table des cartes bancaires
CREATE TABLE IF NOT EXISTS bank_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_type varchar(20) NOT NULL,
  card_holder_name varchar(100) NOT NULL,
  card_number varchar(50) NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_daily_earnings_user_id ON daily_earnings(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_earnings_date ON daily_earnings(date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_earnings_unique ON daily_earnings(investment_id, date);

CREATE INDEX IF NOT EXISTS idx_referral_bonuses_referrer_id ON referral_bonuses(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_bonuses_referred_id ON referral_bonuses(referred_id);

CREATE INDEX IF NOT EXISTS idx_bank_cards_user_id ON bank_cards(user_id);

-- Enable RLS
ALTER TABLE daily_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_cards ENABLE ROW LEVEL SECURITY;

-- Policies pour daily_earnings
CREATE POLICY "Users can read own daily earnings"
  ON daily_earnings
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Policies pour referral_bonuses
CREATE POLICY "Users can read own referral bonuses"
  ON referral_bonuses
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = referrer_id::text);

-- Policies pour bank_cards
CREATE POLICY "Users can read own bank cards"
  ON bank_cards
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own bank cards"
  ON bank_cards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own bank cards"
  ON bank_cards
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text);