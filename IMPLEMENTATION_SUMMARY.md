# Authentication System Implementation - Quick Start

## What Was Fixed

✅ **Customer Registration** - Now correctly saves to `customers` table
✅ **Customer Login** - Now properly checks customers table and redirects to customer page
✅ **Internal User Creation** - Managers can now create staff/manager accounts in `users` table
✅ **Dual Authentication** - Login checks both tables and routes users correctly

## Quick Start - Apply Changes

### Step 1: Apply Database Migration

Run this SQL migration to add authentication fields to the customers table:

```bash
psql -U postgres -d quickcash -f backend/migrations/001_update_customers_for_auth.sql
```

Or manually in your database client:

```sql
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS full_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'customer',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

ALTER TABLE customers
ADD CONSTRAINT customers_role_check CHECK (role = 'customer');

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

ALTER TABLE customers
ADD CONSTRAINT customers_email_unique UNIQUE (email);

UPDATE customers
SET
  role = 'customer',
  is_active = true,
  full_name = CONCAT(first_name, ' ', COALESCE(last_name, ''))
WHERE full_name IS NULL;
```

### Step 2: Restart Backend

```bash
cd backend
npm run dev
```

### Step 3: Test the System

#### Test 1: Customer Registration
1. Open browser to `http://localhost:4200/register`
2. Register with: email, password, full name, phone
3. Should create customer in `customers` table
4. Should auto-login and redirect to `/customer/menu`

#### Test 2: Customer Login
1. Open browser to `http://localhost:4200/login`
2. Login with customer email and password
3. Should redirect to `/customer` page

#### Test 3: Manager Creates Staff User
1. Login as manager
2. Navigate to `/manager/users`
3. Click "Add User"
4. Fill form with role: staff, manager, or admin
5. Should create user in `users` table (not customers)

## File Changes Summary

### Backend Files Modified
- `backend/src/services/auth.service.ts` - Login checks both tables, register saves to customers
- `backend/src/controllers/auth.controller.ts` - Added createInternalUser method
- `backend/src/routes/auth.routes.ts` - Added POST /auth/users/create route
- `backend/src/models/customer.model.ts` - NEW FILE with customer interfaces

### Frontend Files Modified
- `Client/src/app/features/manager/users/users.component.ts` - Changed endpoint to /auth/users/create

### Migration Files
- `backend/migrations/001_update_customers_for_auth.sql` - Database schema updates

## API Endpoints

### Public Endpoints

**Register Customer**
```
POST /api/v1/auth/register
Body: { email, password, full_name, phone }
→ Saves to customers table
```

**Login (Any User)**
```
POST /api/v1/auth/login
Body: { email, password }
→ Checks customers first, then users table
→ Returns role: 'customer', 'staff', 'manager', or 'admin'
```

### Protected Endpoints (Manager Only)

**Create Internal User**
```
POST /api/v1/auth/users/create
Headers: { Authorization: Bearer <token> }
Body: { email, password, full_name, phone, role }
→ Saves to users table
→ role must be: 'staff', 'manager', or 'admin'
```

## Database Tables

### Customers Table
- Used for: Public customer registrations
- Role: Always 'customer'
- Login redirect: `/customer`

### Users Table
- Used for: Internal staff, managers, admins
- Role: 'staff', 'manager', 'admin'
- Login redirect: `/staff` or `/manager` based on role

## Troubleshooting

### Issue: "column password_hash does not exist"
**Solution:** Run the database migration from Step 1

### Issue: Customer login redirects to wrong page
**Solution:** Check that backend login is returning correct role='customer'

### Issue: Manager can't create users
**Solution:**
1. Check manager has valid JWT token
2. Check role is one of: staff, manager, admin
3. Check endpoint is /auth/users/create (not /auth/register)

### Issue: Email already exists error
**Solution:** The system now checks BOTH tables for email uniqueness. Use a different email.

## Testing Credentials

Create test accounts:

```sql
-- Test Manager (for creating users)
INSERT INTO users (email, password_hash, role, full_name, is_active)
VALUES (
  'manager@test.com',
  '$2b$10$xQZfOqsVqGmvPzQPXJBcT.6L8K0HYUVkJ8HfqaQNdO8mRE3bGVDqu', -- password: test123
  'manager',
  'Test Manager',
  true
);

-- Test Customer
INSERT INTO customers (
  customer_code, email, password_hash, full_name,
  first_name, last_name, role, is_active
)
VALUES (
  'CUST-TEST-001',
  'customer@test.com',
  '$2b$10$xQZfOqsVqGmvPzQPXJBcT.6L8K0HYUVkJ8HfqaQNdO8mRE3bGVDqu', -- password: test123
  'Test Customer',
  'Test',
  'Customer',
  'customer',
  true
);
```

## Verification Checklist

After applying changes, verify:

- [ ] Database migration applied successfully
- [ ] Backend restarts without errors
- [ ] Customer registration creates record in `customers` table
- [ ] Customer login works and redirects to `/customer`
- [ ] Manager can access `/manager/users`
- [ ] Manager can create new staff user
- [ ] New staff user appears in `users` table (not customers)
- [ ] Staff login works and redirects to `/staff`

## Full Documentation

For complete details, see: [AUTHENTICATION_IMPLEMENTATION.md](./AUTHENTICATION_IMPLEMENTATION.md)

This includes:
- Detailed architecture explanation
- Security considerations
- Complete API documentation
- Flow diagrams
- Rollback procedures
- Future enhancements
