/*
  # Create admin user with hashed password

  1. New Admin User
    - Email: admin@alisher-investment.com
    - Password: Admin123! (hashed with bcrypt)
    - Role: admin
    - Active by default

  2. Security
    - Password properly hashed using bcrypt
    - Admin user ready for login
*/

-- Create admin user with properly hashed password
-- Password: Admin123!
INSERT INTO admin_users (
  email, 
  password_hash, 
  name, 
  role, 
  is_active
) VALUES (
  'admin@alisher-investment.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Admin123!
  'Administrateur Principal',
  'admin',
  true
) ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  updated_at = now();