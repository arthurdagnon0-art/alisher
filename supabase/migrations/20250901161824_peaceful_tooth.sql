/*
  # Création des tables pour les paramètres et le blog

  1. Nouvelles Tables
    - `platform_settings` - Configuration de la plateforme
    - `blog_posts` - Publications du blog utilisateur
    - `admin_users` - Utilisateurs administrateurs

  2. Données Initiales
    - Configuration par défaut de la plateforme
    - Utilisateur admin par défaut

  3. Sécurité
    - Enable RLS sur toutes les tables
    - Add policies appropriées
*/

-- Table des paramètres de la plateforme
CREATE TABLE IF NOT EXISTS platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key varchar(100) UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now()
);

-- Table des publications blog
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  images jsonb,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des administrateurs
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) UNIQUE NOT NULL,
  password_hash varchar(255) NOT NULL,
  name varchar(100) NOT NULL,
  role varchar(50) DEFAULT 'admin',
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_blog_posts_user_id ON blog_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_approved ON blog_posts(is_approved);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policies pour platform_settings (lecture publique pour les utilisateurs authentifiés)
CREATE POLICY "Authenticated users can read platform settings"
  ON platform_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies pour blog_posts
CREATE POLICY "Users can read approved blog posts"
  ON blog_posts
  FOR SELECT
  TO authenticated
  USING (is_approved = true);

CREATE POLICY "Users can create own blog posts"
  ON blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can read own blog posts"
  ON blog_posts
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Insertion des paramètres par défaut
INSERT INTO platform_settings (key, value, description) VALUES
('min_deposit', '3000', 'Montant minimum de dépôt en FCFA'),
('min_withdrawal', '1000', 'Montant minimum de retrait en FCFA'),
('withdrawal_fee_rate', '10', 'Taux de frais de retrait en pourcentage'),
('usdt_exchange_rate', '600', 'Taux de change USDT vers FCFA'),
('min_usdt_deposit', '5', 'Montant minimum de dépôt en USDT'),
('min_usdt_withdrawal', '8', 'Montant minimum de retrait en USDT'),
('referral_rates', '{"level1": 11, "level2": 2, "level3": 1}', 'Taux de commission par niveau de parrainage'),
('withdrawal_hours', '{"start": 8, "end": 17, "timezone": "Africa/Porto-Novo"}', 'Heures de traitement des retraits'),
('platform_name', '"Alisher USMANOV Investment"', 'Nom de la plateforme'),
('support_email', '"support@alisher-investment.com"', 'Email de support'),
('maintenance_mode', 'false', 'Mode maintenance de la plateforme')
ON CONFLICT (key) DO NOTHING;