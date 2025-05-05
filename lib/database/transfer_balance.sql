-- Function to transfer balance between users
CREATE OR REPLACE FUNCTION transfer_balance(
  sender_id UUID,
  recipient_id UUID,
  transfer_amount NUMERIC
) RETURNS VOID AS $$
DECLARE
  sender_balance NUMERIC;
BEGIN
  -- Get sender's current balance
  SELECT balance INTO sender_balance FROM users WHERE id = sender_id;
  
  -- Check if sender has enough balance
  IF sender_balance < transfer_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  -- Begin transaction
  BEGIN
    -- Deduct from sender
    UPDATE users SET balance = balance - transfer_amount WHERE id = sender_id;
    
    -- Add to recipient
    UPDATE users SET balance = balance + transfer_amount WHERE id = recipient_id;
  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback transaction on error
      RAISE;
  END;
END;
$$ LANGUAGE plpgsql;
