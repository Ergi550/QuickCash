-- Migration: Add authentication fields to customers table
-- Date: 2026-01-08
-- Purpose: Separate customer authentication from internal users table

-- Add authentication and user fields to customers table
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS full_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'customer',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Add constraint to ensure customers always have 'customer' role
ALTER TABLE customers
DROP CONSTRAINT IF EXISTS customers_role_check;

ALTER TABLE customers
ADD CONSTRAINT customers_role_check CHECK (role = 'customer');

-- Create index for faster email lookups during login
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Make email unique in customers table
ALTER TABLE customers
DROP CONSTRAINT IF EXISTS customers_email_unique;

ALTER TABLE customers
ADD CONSTRAINT customers_email_unique UNIQUE (email);

-- Update existing customers with default values if needed
UPDATE customers
SET
  role = 'customer',
  is_active = true,
  full_name = CONCAT(first_name, ' ', COALESCE(last_name, ''))
WHERE full_name IS NULL;

COMMENT ON COLUMN customers.password_hash IS 'Bcrypt hashed password for customer authentication';
COMMENT ON COLUMN customers.full_name IS 'Full name of the customer';
COMMENT ON COLUMN customers.role IS 'Always ''customer'' for this table';
COMMENT ON COLUMN customers.is_active IS 'Whether the customer account is active';
COMMENT ON COLUMN customers.last_login IS 'Last login timestamp';
