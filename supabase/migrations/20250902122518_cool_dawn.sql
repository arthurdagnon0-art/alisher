/*
  # Désactiver toutes les politiques RLS

  1. Désactivation RLS
    - Désactive RLS sur toutes les tables
    - Supprime toutes les politiques existantes
  
  2. Sécurité
    - Facilite les authentifications
    - Accès libre aux données pour le développement
*/

-- Désactiver RLS sur toutes les tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE vip_packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE staking_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE vip_investments DISABLE ROW LEVEL SECURITY;
ALTER TABLE staking_investments DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_earnings DISABLE ROW LEVEL SECURITY;
ALTER TABLE referral_bonuses DISABLE ROW LEVEL SECURITY;
ALTER TABLE bank_cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes sur users
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Supprimer toutes les politiques existantes sur vip_packages
DROP POLICY IF EXISTS "Anyone can read active vip packages" ON vip_packages;

-- Supprimer toutes les politiques existantes sur staking_plans
DROP POLICY IF EXISTS "Anyone can read active staking plans" ON staking_plans;

-- Supprimer toutes les politiques existantes sur vip_investments
DROP POLICY IF EXISTS "Users can create own vip investments" ON vip_investments;
DROP POLICY IF EXISTS "Users can read own vip investments" ON vip_investments;

-- Supprimer toutes les politiques existantes sur staking_investments
DROP POLICY IF EXISTS "Users can create own staking investments" ON staking_investments;
DROP POLICY IF EXISTS "Users can read own staking investments" ON staking_investments;

-- Supprimer toutes les politiques existantes sur transactions
DROP POLICY IF EXISTS "Users can create own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can read own transactions" ON transactions;

-- Supprimer toutes les politiques existantes sur daily_earnings
DROP POLICY IF EXISTS "Users can read own daily earnings" ON daily_earnings;

-- Supprimer toutes les politiques existantes sur referral_bonuses
DROP POLICY IF EXISTS "Users can read own referral bonuses" ON referral_bonuses;

-- Supprimer toutes les politiques existantes sur bank_cards
DROP POLICY IF EXISTS "Users can create own bank cards" ON bank_cards;
DROP POLICY IF EXISTS "Users can read own bank cards" ON bank_cards;
DROP POLICY IF EXISTS "Users can update own bank cards" ON bank_cards;

-- Supprimer toutes les politiques existantes sur platform_settings
DROP POLICY IF EXISTS "Authenticated users can read platform settings" ON platform_settings;

-- Supprimer toutes les politiques existantes sur blog_posts
DROP POLICY IF EXISTS "Users can create own blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can read approved blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can read own blog posts" ON blog_posts;

-- Supprimer toutes les politiques existantes sur otp_codes
DROP POLICY IF EXISTS "Service role can manage OTP codes" ON otp_codes;