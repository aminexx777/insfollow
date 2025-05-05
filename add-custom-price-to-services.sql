-- Add custom_price column to services table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'services' AND column_name = 'custom_price'
    ) THEN
        ALTER TABLE services ADD COLUMN custom_price DECIMAL(10, 2) DEFAULT 0;
    END IF;
END $$;

-- Update existing services to set custom_price equal to price if it's null
UPDATE services
SET custom_price = price
WHERE custom_price IS NULL;
