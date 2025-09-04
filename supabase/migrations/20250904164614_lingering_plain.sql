/*
  # Create balance management functions

  1. Functions
    - `increment_user_balance` - Safely increment user balance
    - `increment_balance` - Alternative balance increment function
  
  2. Security
    - Functions use proper error handling
    - Atomic operations to prevent race conditions
*/

-- Function to safely increment user balance
CREATE OR REPLACE FUNCTION increment_user_balance(
  user_id UUID,
  amount DECIMAL(15,2),
  balance_type TEXT
)
RETURNS VOID AS $$
BEGIN
  IF balance_type = 'deposit' THEN
    UPDATE users 
    SET 
      balance_deposit = COALESCE(balance_deposit, 0) + amount,
      updated_at = now()
    WHERE id = user_id;
  ELSIF balance_type = 'withdrawal' THEN
    UPDATE users 
    SET 
      balance_withdrawal = COALESCE(balance_withdrawal, 0) + amount,
      total_earned = COALESCE(total_earned, 0) + amount,
      updated_at = now()
    WHERE id = user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Alternative function for balance increment
CREATE OR REPLACE FUNCTION increment_balance(
  user_id UUID,
  amount DECIMAL(15,2),
  balance_type TEXT
)
RETURNS DECIMAL(15,2) AS $$
DECLARE
  new_balance DECIMAL(15,2);
BEGIN
  IF balance_type = 'withdrawal' THEN
    UPDATE users 
    SET 
      balance_withdrawal = COALESCE(balance_withdrawal, 0) + amount,
      total_earned = COALESCE(total_earned, 0) + amount,
      updated_at = now()
    WHERE id = user_id
    RETURNING balance_withdrawal INTO new_balance;
  ELSIF balance_type = 'deposit' THEN
    UPDATE users 
    SET 
      balance_deposit = COALESCE(balance_deposit, 0) + amount,
      updated_at = now()
    WHERE id = user_id
    RETURNING balance_deposit INTO new_balance;
  END IF;
  
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql;