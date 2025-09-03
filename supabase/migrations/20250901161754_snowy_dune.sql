/*
  # Création des tables d'investissement

  1. Nouvelles Tables
    - `vip_packages` - Packages VIP disponibles
    - `staking_plans` - Plans de staking disponibles
    - `vip_investments` - Investissements VIP des utilisateurs
    - `staking_investments` - Investissements staking des utilisateurs

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Add policies appropriées
*/

-- Table des packages VIP
CREATE TABLE IF NOT EXISTS vip_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(50) NOT NULL,
  min_amount decimal(15,2) NOT NULL,
  max_amount decimal(15,2) NOT NULL,
  daily_rate decimal(5,2) NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des plans de staking
CREATE TABLE IF NOT EXISTS staking_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  duration_days integer NOT NULL,
  daily_rate decimal(5,2) NOT NULL,
  min_amount decimal(15,2) NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des investissements VIP
CREATE TABLE IF NOT EXISTS vip_investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES vip_packages(id),
  package_name varchar(50) NOT NULL,
  amount decimal(15,2) NOT NULL,
  daily_earnings decimal(15,2) NOT NULL,
  total_earned decimal(15,2) DEFAULT 0,
  status varchar(20) DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des investissements staking
CREATE TABLE IF NOT EXISTS staking_investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES staking_plans(id),
  plan_name varchar(100) NOT NULL,
  amount decimal(15,2) NOT NULL,
  daily_earnings decimal(15,2) NOT NULL,
  total_earned decimal(15,2) DEFAULT 0,
  unlock_date timestamptz NOT NULL,
  status varchar(20) DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_vip_investments_user_id ON vip_investments(user_id);
CREATE INDEX IF NOT EXISTS idx_vip_investments_status ON vip_investments(status);
CREATE INDEX IF NOT EXISTS idx_staking_investments_user_id ON staking_investments(user_id);
CREATE INDEX IF NOT EXISTS idx_staking_investments_unlock_date ON staking_investments(unlock_date);
CREATE INDEX IF NOT EXISTS idx_staking_investments_status ON staking_investments(status);

-- Enable RLS
ALTER TABLE vip_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE staking_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE staking_investments ENABLE ROW LEVEL SECURITY;

-- Policies pour vip_packages (lecture publique)
CREATE POLICY "Anyone can read active vip packages"
  ON vip_packages
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policies pour staking_plans (lecture publique)
CREATE POLICY "Anyone can read active staking plans"
  ON staking_plans
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policies pour vip_investments
CREATE POLICY "Users can read own vip investments"
  ON vip_investments
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own vip investments"
  ON vip_investments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

-- Policies pour staking_investments
CREATE POLICY "Users can read own staking investments"
  ON staking_investments
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own staking investments"
  ON staking_investments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);