/*
  # Create balance update functions

  1. Functions
    - `increment_balance` - Safely increment user balances
    - `decrement_balance` - Safely decrement user balances
  
  2. Security
    - Functions handle null values safely
    - Atomic operations to prevent race conditions
*/

-- Function to safely increment user balances
CREATE OR REPLACE FUNCTION increment_balance(
  user_id UUID,
  amount DECIMAL(15,2),
  balance_type TEXT
) RETURNS VOID AS $$
BEGIN
  IF balance_type = 'deposit' THEN
    UPDATE users 
    SET balance_deposit = COALESCE(balance_deposit, 0) + amount,
        updated_at = now()
    WHERE id = user_id;
  ELSIF balance_type = 'withdrawal' THEN
    UPDATE users 
    SET balance_withdrawal = COALESCE(balance_withdrawal, 0) + amount,
        updated_at = now()
    WHERE id = user_id;
  ELSIF balance_type = 'earned' THEN
    UPDATE users 
    SET total_earned = COALESCE(total_earned, 0) + amount,
        updated_at = now()
    WHERE id = user_id;
  ELSIF balance_type = 'invested' THEN
    UPDATE users 
    SET total_invested = COALESCE(total_invested, 0) + amount,
        updated_at = now()
    WHERE id = user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to safely decrement user balances
CREATE OR REPLACE FUNCTION decrement_balance(
  user_id UUID,
  amount DECIMAL(15,2),
  balance_type TEXT
) RETURNS VOID AS $$
BEGIN
  IF balance_type = 'deposit' THEN
    UPDATE users 
    SET balance_deposit = GREATEST(COALESCE(balance_deposit, 0) - amount, 0),
        updated_at = now()
    WHERE id = user_id;
  ELSIF balance_type = 'withdrawal' THEN
    UPDATE users 
    SET balance_withdrawal = GREATEST(COALESCE(balance_withdrawal, 0) - amount, 0),
        updated_at = now()
    WHERE id = user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;