-- Create recurring_transactions table
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE,
  next_due_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_user_id ON recurring_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_next_due_date ON recurring_transactions(next_due_date);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_is_active ON recurring_transactions(is_active);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_frequency ON recurring_transactions(frequency);

-- Enable RLS
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own recurring transactions" ON recurring_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recurring transactions" ON recurring_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring transactions" ON recurring_transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring transactions" ON recurring_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_recurring_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_recurring_transactions_updated_at
  BEFORE UPDATE ON recurring_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_recurring_transactions_updated_at();

-- Create function to calculate next due date
CREATE OR REPLACE FUNCTION calculate_next_due_date(
  frequency TEXT,
  current_due_date DATE,
  start_date DATE
) RETURNS DATE AS $$
BEGIN
  CASE frequency
    WHEN 'daily' THEN
      RETURN current_due_date + INTERVAL '1 day';
    WHEN 'weekly' THEN
      RETURN current_due_date + INTERVAL '1 week';
    WHEN 'monthly' THEN
      RETURN current_due_date + INTERVAL '1 month';
    WHEN 'yearly' THEN
      RETURN current_due_date + INTERVAL '1 year';
    ELSE
      RETURN current_due_date;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate transactions from recurring rules
CREATE OR REPLACE FUNCTION generate_recurring_transactions()
RETURNS void AS $$
DECLARE
  recurring_record RECORD;
  next_due_date DATE;
BEGIN
  -- Get all active recurring transactions that are due
  FOR recurring_record IN
    SELECT * FROM recurring_transactions
    WHERE is_active = TRUE
    AND next_due_date <= CURRENT_DATE
    AND (end_date IS NULL OR next_due_date <= end_date)
  LOOP
    -- Insert the transaction
    INSERT INTO expenses (
      user_id,
      title,
      amount,
      category,
      transaction_type,
      transaction_date,
      created_at
    ) VALUES (
      recurring_record.user_id,
      recurring_record.title,
      recurring_record.amount,
      recurring_record.category,
      recurring_record.transaction_type,
      recurring_record.next_due_date,
      NOW()
    );

    -- Calculate next due date
    next_due_date := calculate_next_due_date(
      recurring_record.frequency,
      recurring_record.next_due_date,
      recurring_record.start_date
    );

    -- Update the recurring transaction with new due date
    UPDATE recurring_transactions
    SET next_due_date = next_due_date,
        updated_at = NOW()
    WHERE id = recurring_record.id;

    -- Check if we've reached the end date
    IF recurring_record.end_date IS NOT NULL AND next_due_date > recurring_record.end_date THEN
      UPDATE recurring_transactions
      SET is_active = FALSE,
          updated_at = NOW()
      WHERE id = recurring_record.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
