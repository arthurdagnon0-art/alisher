/*
  # Fonctions utilitaires pour la plateforme

  1. Fonctions
    - `update_user_balance` - Mettre à jour les soldes utilisateur
    - `verify_otp_code` - Vérifier les codes OTP
    - `generate_referral_code` - Générer un code de parrainage unique

  2. Tables
    - `otp_codes` - Stockage temporaire des codes OTP

  3. Security
    - Enable RLS sur `otp_codes`
    - Policies pour l'accès aux OTP
*/

-- Table pour stocker les codes OTP temporaires
CREATE TABLE IF NOT EXISTS otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone varchar(20) NOT NULL,
  code varchar(6) NOT NULL,
  type varchar(20) NOT NULL, -- registration, login, withdrawal
  expires_at timestamptz NOT NULL,
  is_used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Index pour optimiser les requêtes OTP
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone ON otp_codes(phone);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires ON otp_codes(expires_at);

-- Politique pour les codes OTP
CREATE POLICY "Service role can manage OTP codes"
  ON otp_codes
  FOR ALL
  TO service_role
  USING (true);

-- Fonction pour mettre à jour les soldes utilisateur
CREATE OR REPLACE FUNCTION update_user_balance(
  user_id uuid,
  amount decimal(15,2),
  balance_type text -- 'deposit' ou 'withdrawal'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF balance_type = 'deposit' THEN
    UPDATE users 
    SET 
      balance_deposit = balance_deposit + amount,
      updated_at = now()
    WHERE id = user_id;
  ELSIF balance_type = 'withdrawal' THEN
    UPDATE users 
    SET 
      balance_withdrawal = balance_withdrawal + amount,
      total_earned = total_earned + amount,
      updated_at = now()
    WHERE id = user_id;
  END IF;
END;
$$;

-- Fonction pour vérifier les codes OTP
CREATE OR REPLACE FUNCTION verify_otp_code(
  phone_number varchar(20),
  otp_code varchar(6),
  otp_type varchar(20)
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_valid boolean := false;
BEGIN
  -- Vérifier si le code existe et n'est pas expiré
  UPDATE otp_codes 
  SET is_used = true
  WHERE phone = phone_number 
    AND code = otp_code 
    AND type = otp_type
    AND expires_at > now()
    AND is_used = false
  RETURNING true INTO is_valid;
  
  -- Nettoyer les anciens codes expirés
  DELETE FROM otp_codes 
  WHERE expires_at < now() OR is_used = true;
  
  RETURN COALESCE(is_valid, false);
END;
$$;

-- Fonction pour générer un code de parrainage unique
CREATE OR REPLACE FUNCTION generate_unique_referral_code()
RETURNS varchar(10)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_code varchar(10);
  code_exists boolean;
BEGIN
  LOOP
    -- Générer un code à 6 chiffres
    new_code := LPAD(floor(random() * 1000000)::text, 6, '0');
    
    -- Vérifier s'il existe déjà
    SELECT EXISTS(
      SELECT 1 FROM users WHERE referral_code = new_code
    ) INTO code_exists;
    
    -- Sortir de la boucle si le code est unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Fonction pour calculer les statistiques utilisateur
CREATE OR REPLACE FUNCTION get_user_stats(user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_investments', (
      SELECT COALESCE(SUM(amount), 0) 
      FROM (
        SELECT amount FROM vip_investments WHERE user_id = $1 AND status = 'active'
        UNION ALL
        SELECT amount FROM staking_investments WHERE user_id = $1 AND status = 'active'
      ) AS all_investments
    ),
    'total_earnings', (
      SELECT COALESCE(SUM(amount), 0) 
      FROM daily_earnings 
      WHERE user_id = $1
    ),
    'referral_bonuses', (
      SELECT COALESCE(SUM(amount), 0) 
      FROM referral_bonuses 
      WHERE referrer_id = $1
    ),
    'team_size', (
      SELECT COUNT(*) 
      FROM users 
      WHERE referred_by = $1
    )
  ) INTO result;
  
  RETURN result;
END;
$$;