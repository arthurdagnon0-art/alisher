/*
  # Create deposit submissions table

  1. New Tables
    - `deposit_submissions`
      - `id` (uuid, primary key)
      - `transaction_id` (uuid, référence vers transactions)
      - `user_id` (uuid, référence vers users)
      - `payment_method_id` (uuid, référence vers payment_methods)
      - `user_deposit_number` (text, numéro de l'utilisateur)
      - `amount` (numeric, montant)
      - `status` (text, statut de la soumission)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `deposit_submissions` table
    - Add policies for user and admin access

  3. Indexes
    - Index on user_id for performance
    - Index on status for filtering
*/

CREATE TABLE IF NOT EXISTS deposit_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_method_id uuid NOT NULL REFERENCES payment_methods(id),
  user_deposit_number varchar(50) NOT NULL,
  amount numeric(15,2) NOT NULL,
  status varchar(20) DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_deposit_submissions_user_id ON deposit_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_submissions_status ON deposit_submissions(status);
CREATE INDEX IF NOT EXISTS idx_deposit_submissions_created_at ON deposit_submissions(created_at);

-- Enable RLS
ALTER TABLE deposit_submissions ENABLE ROW LEVEL SECURITY;

-- Policy pour que les utilisateurs voient leurs propres soumissions
CREATE POLICY "Users can view own deposit submissions"
  ON deposit_submissions
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Policy pour que les utilisateurs créent leurs propres soumissions
CREATE POLICY "Users can create own deposit submissions"
  ON deposit_submissions
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Policy pour les admins (temporaire - à adapter selon votre système d'auth admin)
CREATE POLICY "Admins can manage all deposit submissions"
  ON deposit_submissions
  FOR ALL
  USING (true);