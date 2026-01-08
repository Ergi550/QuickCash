-- Verification Script for Authentication Setup
-- Run this to verify the customers table has all required fields

-- Check if all required columns exist in customers table
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'customers'
  AND column_name IN ('password_hash', 'full_name', 'role', 'is_active', 'last_login')
ORDER BY column_name;

-- Expected output:
-- column_name   | data_type        | is_nullable | column_default
-- full_name     | character varying | YES         | NULL
-- is_active     | boolean          | YES         | true
-- last_login    | timestamp...     | YES         | NULL
-- password_hash | character varying | YES         | NULL
-- role          | character varying | YES         | 'customer'::character varying

-- Check constraints
SELECT
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'customers'
  AND con.conname LIKE '%role%';

-- Expected: customers_role_check with CHECK ((role)::text = 'customer'::text)

-- Check indexes
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'customers'
  AND indexname LIKE '%email%';

-- Expected: idx_customers_email and customers_email_unique

-- Count records by table
SELECT 'customers' as table_name, COUNT(*) as record_count FROM customers
UNION ALL
SELECT 'users' as table_name, COUNT(*) as record_count FROM users;

-- Show sample data structure (without passwords)
SELECT
    customer_id,
    email,
    full_name,
    role,
    is_active,
    CASE WHEN password_hash IS NOT NULL THEN 'SET' ELSE 'NULL' END as password_status
FROM customers
LIMIT 3;
