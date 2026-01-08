# Authentication System Implementation

## Overview

This document describes the implementation of a dual authentication system that separates **customers** (public users) from **internal users** (staff, managers, admins).

## Problem Statement

The original system had several issues:
1. Registration endpoint was inserting into `customers` table but the table lacked authentication fields
2. Login only checked the `users` table, ignoring customers
3. No separate endpoint for managers to create internal staff/manager accounts
4. Customer login was not redirecting properly

## Solution Architecture

### Database Changes

#### Customers Table Updates
The `customers` table has been updated with new authentication fields:

```sql
ALTER TABLE customers
ADD COLUMN password_hash VARCHAR(255),
ADD COLUMN full_name VARCHAR(100),
ADD COLUMN role VARCHAR(20) DEFAULT 'customer',
ADD COLUMN is_active BOOLEAN DEFAULT true,
ADD COLUMN last_login TIMESTAMP;
```

**Key Points:**
- `password_hash`: Stores bcrypt hashed password for customer authentication
- `full_name`: Full name of customer (also splits into first_name/last_name)
- `role`: Always 'customer' for this table (enforced by constraint)
- `is_active`: Account activation status
- `last_login`: Timestamp of last successful login

**Migration File:** `backend/migrations/001_update_customers_for_auth.sql`

### Backend Changes

#### 1. New Customer Model
**File:** `backend/src/models/customer.model.ts`

Defines TypeScript interfaces for:
- `Customer`: Complete customer record with password
- `CustomerResponse`: Customer data without password
- `CustomerRegisterDTO`: Registration data transfer object

#### 2. Updated Auth Service
**File:** `backend/src/services/auth.service.ts`

**Key Changes:**

##### Login Method (checks both tables)
```typescript
async login(credentials: LoginCredentials): Promise<AuthResponse>
```
- First checks `customers` table by email
- If found, verifies password and returns customer auth response
- If not found in customers, checks `users` table (internal staff)
- Returns JWT token with appropriate role

##### Register Method (saves to customers table)
```typescript
async register(userData: CustomerRegisterDTO): Promise<AuthResponse>
```
- Validates required fields (email, password, full_name)
- Checks for email uniqueness in BOTH tables
- Hashes password with bcrypt
- Inserts into `customers` table with role='customer'
- Splits full_name into first_name and last_name
- Returns JWT token with customer role

##### New: Create Internal User Method
```typescript
async createInternalUser(userData: RegisterDTO): Promise<UserResponse>
```
- **Manager-only operation** for creating staff/manager accounts
- Validates role is one of: admin, manager, staff
- Checks email uniqueness in BOTH tables
- Inserts into `users` table (not customers)
- Does NOT auto-login (returns user object without token)

##### Helper Methods
- `sanitizeUser(user: User)`: Removes password_hash from User objects
- `sanitizeCustomer(customer: Customer)`: Removes password_hash and maps customer_id to user_id for frontend compatibility

#### 3. Updated Auth Controller
**File:** `backend/src/controllers/auth.controller.ts`

**New Endpoint:**
```typescript
async createInternalUser(req, res, next): Promise<void>
```
- Handles POST `/api/v1/auth/users/create`
- Validates role is provided
- Calls authService.createInternalUser()
- Returns 201 with created user data

#### 4. Updated Routes
**File:** `backend/src/routes/auth.routes.ts`

**New Route:**
```typescript
POST /api/v1/auth/users/create
- Access: Private (Manager, Admin only)
- Middleware: authenticate, authorize('manager', 'admin')
- Handler: authController.createInternalUser
```

### Frontend Changes

#### Updated Manager Users Component
**File:** `Client/src/app/features/manager/users/users.component.ts`

**Change:**
- Line 73: Changed endpoint from `/auth/register` to `/auth/users/create`
- Now correctly creates internal users in the `users` table
- Requires manager authentication (already protected by route guards)

**No other frontend changes needed** - the existing auth service, guards, and components work with the new backend implementation.

## Authentication Flow Diagrams

### Public Customer Registration Flow
```
1. User visits /register
2. Fills form: email, password, full_name, phone
3. Frontend POST /api/v1/auth/register
4. Backend validates and checks email uniqueness in BOTH tables
5. Backend hashes password with bcrypt
6. Backend INSERT into customers table with role='customer'
7. Backend generates JWT token
8. Frontend stores token and user data
9. Frontend redirects to /customer/menu
```

### Manager Creating Internal User Flow
```
1. Manager visits /manager/users
2. Clicks "Add User"
3. Fills form: email, password, full_name, phone, role
4. Frontend POST /api/v1/auth/users/create
5. Backend validates manager authorization
6. Backend validates role (admin/manager/staff)
7. Backend checks email uniqueness in BOTH tables
8. Backend INSERT into users table
9. Backend returns user data (no token)
10. Frontend refreshes user list
```

### Login Flow (Dual Table Check)
```
1. User visits /login
2. Enters email and password
3. Frontend POST /api/v1/auth/login
4. Backend queries customers table by email
   - If found: verify password → return customer auth
   - If not found: query users table by email
     - If found: verify password → return user auth
     - If not found: return 401 error
5. Frontend stores token and user data
6. Frontend redirects based on role:
   - customer → /customer
   - staff → /staff
   - manager → /manager
```

## API Endpoints

### Public Endpoints

#### Register Customer
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "+1234567890"
}

Response 201:
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "customer_id": 1,
      "user_id": 1,  // mapped from customer_id
      "email": "customer@example.com",
      "full_name": "John Doe",
      "role": "customer",
      "is_active": true,
      ...
    }
  }
}
```

#### Login (Customers or Internal Users)
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response 200:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "user_id": 1,
      "email": "user@example.com",
      "role": "customer|staff|manager|admin",
      ...
    }
  }
}
```

### Protected Endpoints (Manager Only)

#### Create Internal User
```http
POST /api/v1/auth/users/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "staff@example.com",
  "password": "password123",
  "full_name": "Jane Smith",
  "phone": "+1234567890",
  "role": "staff"
}

Response 201:
{
  "success": true,
  "message": "Përdoruesi u krijua me sukses",
  "data": {
    "user_id": 5,
    "email": "staff@example.com",
    "full_name": "Jane Smith",
    "role": "staff",
    "is_active": true,
    ...
  }
}
```

## Security Considerations

### Password Security
- All passwords hashed with bcrypt (10 rounds)
- Passwords never returned in API responses
- Password validation: minimum 6 characters

### Email Uniqueness
- Registration checks BOTH `customers` AND `users` tables
- Prevents email conflicts between customer and internal user accounts
- Returns 409 Conflict if email exists

### JWT Tokens
- Tokens include: userId, email, role
- 24-hour expiration (configurable in backend config)
- Stored in localStorage on frontend
- Automatically included in requests via HTTP interceptor

### Role-Based Access Control
- Customers: role='customer', table: customers
- Staff: role='staff', table: users
- Managers: role='manager', table: users
- Admins: role='admin', table: users

### Authorization Middleware
- `authenticate`: Verifies JWT token validity
- `authorize(roles)`: Checks user has required role
- Applied to all protected routes

## Database Schema

### Customers Table (Updated)
```sql
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),  -- Optional link
    customer_code VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,        -- NEW
    full_name VARCHAR(100) NOT NULL,            -- NEW
    role VARCHAR(20) DEFAULT 'customer',        -- NEW
    is_active BOOLEAN DEFAULT true,             -- NEW
    last_login TIMESTAMP,                       -- NEW
    date_of_birth DATE,
    total_spent NUMERIC(10,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    is_member BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT customers_role_check CHECK (role = 'customer')
);

CREATE INDEX idx_customers_email ON customers(email);
```

### Users Table (Unchanged)
```sql
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(100),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (role IN ('admin', 'manager', 'staff', 'customer'))
);
```

## Testing the Implementation

### 1. Apply Database Migration
```bash
psql -U postgres -d quickcash -f backend/migrations/001_update_customers_for_auth.sql
```

### 2. Test Customer Registration
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "test123",
    "full_name": "Test Customer",
    "phone": "1234567890"
  }'
```

Expected: 201 Created with token and customer data

### 3. Test Customer Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "test123"
  }'
```

Expected: 200 OK with token and role='customer'

### 4. Test Manager Creating Staff
```bash
# First, login as manager to get token
TOKEN="your_manager_token_here"

curl -X POST http://localhost:3000/api/v1/auth/users/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "email": "staff@test.com",
    "password": "test123",
    "full_name": "Test Staff",
    "phone": "1234567890",
    "role": "staff"
  }'
```

Expected: 201 Created with user data (no token)

### 5. Test Staff Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff@test.com",
    "password": "test123"
  }'
```

Expected: 200 OK with token and role='staff'

## Files Modified

### Backend
- ✅ `backend/src/services/auth.service.ts` - Updated login, register methods; added createInternalUser
- ✅ `backend/src/controllers/auth.controller.ts` - Added createInternalUser controller
- ✅ `backend/src/routes/auth.routes.ts` - Added POST /users/create route
- ✅ `backend/src/models/customer.model.ts` - Created new customer interfaces
- ✅ `backend/migrations/001_update_customers_for_auth.sql` - Database migration

### Frontend
- ✅ `Client/src/app/features/manager/users/users.component.ts` - Updated create endpoint
- ✅ `Client/src/app/features/manager/manager-layout/manager-layout.component.html` - Fixed invoices link (unrelated bug)

### No Changes Needed
- ❌ Auth service (`Client/src/app/core/services/auth.service.ts`) - Works as-is
- ❌ Login component - Works as-is
- ❌ Register component - Works as-is
- ❌ Auth guards - Work as-is
- ❌ Route configuration - Works as-is

## Rollback Plan

If issues arise, you can rollback the database changes:

```sql
-- Remove new columns from customers table
ALTER TABLE customers
DROP COLUMN IF EXISTS password_hash,
DROP COLUMN IF EXISTS full_name,
DROP COLUMN IF EXISTS role,
DROP COLUMN IF EXISTS is_active,
DROP COLUMN IF EXISTS last_login;

DROP INDEX IF EXISTS idx_customers_email;
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_email_unique;
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_role_check;
```

Then revert the code changes using git:
```bash
git checkout HEAD -- backend/src/services/auth.service.ts
git checkout HEAD -- backend/src/controllers/auth.controller.ts
git checkout HEAD -- backend/src/routes/auth.routes.ts
git checkout HEAD -- Client/src/app/features/manager/users/users.component.ts
```

## Future Enhancements

1. **Email Verification**: Add email verification flow for customer registration
2. **Password Reset**: Implement forgot password functionality
3. **Rate Limiting**: Add rate limiting to auth endpoints
4. **Audit Logging**: Log authentication events to activity_logs table
5. **Session Management**: Track active sessions, allow logout from all devices
6. **Two-Factor Authentication**: Implement 2FA (fields already exist in users table)
7. **Social Login**: Add OAuth providers (Google, Facebook, etc.)

## Support

For issues or questions:
- Check backend logs: `backend/logs/`
- Check database: `psql -U postgres -d quickcash`
- Test endpoints with Postman/Insomnia
- Review JWT token at https://jwt.io/

## Summary

This implementation successfully:
✅ Separates customer authentication (customers table) from internal users (users table)
✅ Updates registration to save customers in the correct table
✅ Updates login to check both tables and redirect appropriately
✅ Adds manager endpoint to create internal staff/manager users
✅ Maintains backward compatibility with existing frontend code
✅ Follows security best practices (bcrypt, JWT, RBAC)
✅ Includes comprehensive error handling and validation
