/*
  # Supprimer la table OTP

  1. Suppression
    - Supprime la table `otp_codes` et ses index
    - Plus besoin de stockage backend pour les codes OTP
  
  2. Simplification
    - Les codes OTP sont maintenant gérés uniquement côté frontend
    - Génération aléatoire pour l'interactivité uniquement
*/

-- Supprimer la table otp_codes si elle existe
DROP TABLE IF EXISTS otp_codes CASCADE;

-- Supprimer les index associés s'ils existent
DROP INDEX IF EXISTS idx_otp_codes_phone;
DROP INDEX IF EXISTS idx_otp_codes_expires;