/*
  # Insertion des données initiales

  1. Packages VIP
    - VIP0, VIP1, VIP2, VIP3, VIP4 avec leurs taux respectifs

  2. Plans de Staking
    - Plans de 3, 7, 15, 30, 45, 60 jours avec taux croissants

  3. Utilisateur Admin par défaut
    - Email: admin@alisher-investment.com
    - Mot de passe: Admin123! (à changer en production)
*/

-- Insertion des packages VIP
INSERT INTO vip_packages (name, min_amount, max_amount, daily_rate, is_active) VALUES
('VIP0', 3000, 70000, 5.0, true),
('VIP1', 75000, 200000, 7.0, true),
('VIP2', 205000, 500000, 9.0, true),
('VIP3', 505000, 1000000, 11.0, true),
('VIP4', 1005000, 5000000, 13.0, true)
ON CONFLICT DO NOTHING;

-- Insertion des plans de staking
INSERT INTO staking_plans (name, duration_days, daily_rate, min_amount, is_active) VALUES
('Plan 3 jours', 3, 5.0, 3000, true),
('Plan 7 jours', 7, 8.0, 3000, true),
('Plan 15 jours', 15, 11.0, 3000, true),
('Plan 30 jours', 30, 13.0, 3000, true),
('Plan 45 jours', 45, 17.0, 3000, true),
('Plan 60 jours', 60, 20.0, 3000, true)
ON CONFLICT DO NOTHING;

-- Insertion de l'utilisateur admin par défaut
-- Mot de passe: Admin123! (hash bcrypt)
INSERT INTO admin_users (email, password_hash, name, role, is_active) VALUES
('admin@alisher-investment.com', '$2b$10$rQZ8kHWKQVz8kHWKQVz8kOQVz8kHWKQVz8kHWKQVz8kHWKQVz8kH', 'Administrateur Principal', 'super_admin', true)
ON CONFLICT (email) DO NOTHING;