-- Add price_per_1000 column to services table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'services' AND column_name = 'price_per_1000'
    ) THEN
        ALTER TABLE services ADD COLUMN price_per_1000 DECIMAL(10, 2) DEFAULT 0;
    END IF;
END $$;

-- Update existing services to set price_per_1000 equal to price if it's null
UPDATE services
SET price_per_1000 = price
WHERE price_per_1000 IS NULL;

-- Create a function to check if a column exists in a table
CREATE OR REPLACE FUNCTION column_exists(
    table_name text,
    column_name text
) RETURNS boolean AS $$
DECLARE
    exists boolean;
BEGIN
    SELECT COUNT(*) > 0 INTO exists
    FROM information_schema.columns
    WHERE table_name = $1 AND column_name = $2;
    
    RETURN exists;
END;
$$ LANGUAGE plpgsql;
