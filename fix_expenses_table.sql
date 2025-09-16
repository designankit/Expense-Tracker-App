-- Fix expenses table for Supabase
-- Run this in your Supabase SQL editor to ensure the table structure is correct

-- First, let's check if the expenses table exists and what columns it has
-- (This is just for reference - you can run this to see current structure)
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'expenses' 
-- ORDER BY ordinal_position;

-- Add transaction_type column if it doesn't exist
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS transaction_type text DEFAULT 'expense';

-- Add check constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'check_transaction_type'
    ) THEN
        ALTER TABLE expenses 
        ADD CONSTRAINT check_transaction_type 
        CHECK (transaction_type IN ('income', 'expense'));
    END IF;
END $$;

-- Update existing records to have 'expense' as default (if they don't have it)
UPDATE expenses 
SET transaction_type = 'expense' 
WHERE transaction_type IS NULL;

-- Make the column not null after setting defaults
ALTER TABLE expenses 
ALTER COLUMN transaction_type SET NOT NULL;

-- Ensure RLS is enabled
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create or replace policies (this will handle existing policies)
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own expenses" ON expenses;
    DROP POLICY IF EXISTS "Users can insert their own expenses" ON expenses;
    DROP POLICY IF EXISTS "Users can update their own expenses" ON expenses;
    DROP POLICY IF EXISTS "Users can delete their own expenses" ON expenses;

    -- Create new policies
    CREATE POLICY "Users can view their own expenses" ON expenses
    FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own expenses" ON expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own expenses" ON expenses
    FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own expenses" ON expenses
    FOR DELETE USING (auth.uid() = user_id);
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON expenses(user_id);
CREATE INDEX IF NOT EXISTS expenses_transaction_date_idx ON expenses(transaction_date);
CREATE INDEX IF NOT EXISTS expenses_category_idx ON expenses(category);
CREATE INDEX IF NOT EXISTS expenses_transaction_type_idx ON expenses(transaction_type);

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'expenses' 
ORDER BY ordinal_position;
