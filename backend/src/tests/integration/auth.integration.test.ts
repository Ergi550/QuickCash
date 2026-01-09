import request from 'supertest';
import express, { Application } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Mock the database connection
jest.mock('../../database/Connection', () => ({
  query: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true),
}));

// Mock jwt.utils to use test secret
jest.mock('../../utils/jwt.utils', () => ({
  generateToken: jest.fn((payload) => {
    return jwt.sign(payload, 'test-secret-key', { expiresIn: '1h' });
  }),
  verifyToken: jest.fn((token) => {
    try {
      return jwt.verify(token, 'test-secret-key') as any;
    } catch {
      return null;
    }
  }),
  decodeToken: jest.fn((token) => {
    try {
      return jwt.decode(token) as any;
    } catch {
      return null;
    }
  }),
}));

import { query } from '../../database/Connection';
import authRoutes from '../../routes/auth.routes';
import { errorHandler } from '../../middleware/error.middleware';
import { generateToken } from '../../utils/jwt.utils';

const mockQuery = query as jest.MockedFunction<typeof query>;

// Helper to hash passwords for tests
async function testHashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Create test app
function createTestApp(): Application {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', authRoutes);
  app.use(errorHandler);
  return app;
}

describe('Auth Integration Tests', () => {
  let app: Application;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // LOGIN ENDPOINT TESTS
  // ============================================
  describe('POST /api/v1/auth/login', () => {
    const mockCustomer = {
      customer_id: 1,
      email: 'customer@test.com',
      password_hash: '',
      full_name: 'Test Customer',
      first_name: 'Test',
      last_name: 'Customer',
      is_active: true,
      role: 'customer',
      customer_code: 'CUST-123',
    };

    const mockUser = {
      user_id: 1,
      email: 'manager@test.com',
      password_hash: '',
      full_name: 'Test Manager',
      role: 'manager',
      is_active: true,
    };

    test('should login customer with valid credentials', async () => {
      const password = 'TestPassword123';
      const hashedPassword = await testHashPassword(password);
      const customerWithHash = { ...mockCustomer, password_hash: hashedPassword };

      mockQuery
        .mockResolvedValueOnce({ rows: [customerWithHash], rowCount: 1 } as any)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'customer@test.com', password });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('customer@test.com');
      expect(response.body.data.user).not.toHaveProperty('password_hash');
    });

    test('should login internal user with valid credentials', async () => {
      const password = 'ManagerPass123';
      const hashedPassword = await testHashPassword(password);
      const userWithHash = { ...mockUser, password_hash: hashedPassword };

      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)
        .mockResolvedValueOnce({ rows: [userWithHash], rowCount: 1 } as any)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'manager@test.com', password });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.role).toBe('manager');
    });

    test('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ password: 'somepassword' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@test.com' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should return 401 for invalid credentials', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'wrongpass' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should return 403 for inactive account', async () => {
      const hashedPassword = await testHashPassword('password123');
      const inactiveCustomer = {
        ...mockCustomer,
        password_hash: hashedPassword,
        is_active: false,
      };
      mockQuery.mockResolvedValueOnce({ rows: [inactiveCustomer], rowCount: 1 } as any);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'customer@test.com', password: 'password123' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // REGISTER ENDPOINT TESTS
  // ============================================
  describe('POST /api/v1/auth/register', () => {
    const registerData = {
      email: 'newuser@test.com',
      password: 'SecurePass123',
      full_name: 'New User Test',
      phone: '+355691234567',
    };

    test('should register new customer successfully', async () => {
      const mockNewCustomer = {
        customer_id: 10,
        customer_code: 'CUST-123456',
        email: registerData.email,
        full_name: registerData.full_name,
        first_name: 'New',
        last_name: 'User Test',
        phone: registerData.phone,
        is_active: true,
        role: 'customer',
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)
        .mockResolvedValueOnce({ rows: [mockNewCustomer], rowCount: 1 } as any);

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(registerData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Registration successful');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(registerData.email);
    });

    test('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@test.com' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should return 409 for duplicate email in customers', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ customer_id: 1 }],
        rowCount: 1,
      } as any);

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(registerData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    test('should return 409 for duplicate email in users', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)
        .mockResolvedValueOnce({ rows: [{ user_id: 1 }], rowCount: 1 } as any);

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(registerData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // PROTECTED ROUTES TESTS
  // ============================================
  describe('Protected Routes', () => {
    describe('GET /api/v1/auth/me', () => {
      test('should return 401 without token', async () => {
        const response = await request(app).get('/api/v1/auth/me');
        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      });

      test('should return 401 with invalid token', async () => {
        const response = await request(app)
          .get('/api/v1/auth/me')
          .set('Authorization', 'Bearer invalid-token');

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      });

      test('should return user profile with valid token', async () => {
        const token = generateToken({
          userId: 1,
          email: 'user@test.com',
          role: 'staff',
        });

        const mockUser = {
          user_id: 1,
          email: 'user@test.com',
          full_name: 'Test User',
          role: 'staff',
          is_active: true,
          password_hash: 'hash',
        };
        mockQuery.mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 } as any);

        const response = await request(app)
          .get('/api/v1/auth/me')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.email).toBe('user@test.com');
        expect(response.body.data).not.toHaveProperty('password_hash');
      });
    });

    describe('PUT /api/v1/auth/me', () => {
      test('should update profile with valid token', async () => {
        const token = generateToken({
          userId: 1,
          email: 'user@test.com',
          role: 'staff',
        });

        const updatedUser = {
          user_id: 1,
          email: 'user@test.com',
          full_name: 'Updated Name',
          role: 'staff',
          is_active: true,
          password_hash: 'hash',
        };
        mockQuery.mockResolvedValueOnce({ rows: [updatedUser], rowCount: 1 } as any);

        const response = await request(app)
          .put('/api/v1/auth/me')
          .set('Authorization', `Bearer ${token}`)
          .send({ full_name: 'Updated Name' });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.full_name).toBe('Updated Name');
      });
    });

    describe('POST /api/v1/auth/change-password', () => {
      test('should return 400 for missing passwords', async () => {
        const token = generateToken({
          userId: 1,
          email: 'user@test.com',
          role: 'staff',
        });

        const response = await request(app)
          .post('/api/v1/auth/change-password')
          .set('Authorization', `Bearer ${token}`)
          .send({ currentPassword: 'old' });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      test('should change password with valid credentials', async () => {
        const token = generateToken({
          userId: 1,
          email: 'user@test.com',
          role: 'staff',
        });

        const currentPassword = 'OldPassword123';
        const hashedPassword = await testHashPassword(currentPassword);

        mockQuery
          .mockResolvedValueOnce({
            rows: [{ password_hash: hashedPassword }],
            rowCount: 1,
          } as any)
          .mockResolvedValueOnce({ rows: [], rowCount: 1 } as any);

        const response = await request(app)
          .post('/api/v1/auth/change-password')
          .set('Authorization', `Bearer ${token}`)
          .send({
            currentPassword,
            newPassword: 'NewSecurePass456',
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Password changed successfully');
      });
    });
  });

  // ============================================
  // ADMIN/MANAGER ROUTES TESTS
  // ============================================
  describe('Admin/Manager Routes', () => {
    describe('GET /api/v1/auth/users', () => {
      test('should return all users for authorized role', async () => {
        const token = generateToken({
          userId: 1,
          email: 'manager@test.com',
          role: 'manager',
        });

        const mockUsers = [
          { user_id: 1, email: 'user1@test.com', role: 'staff', password_hash: 'h1' },
          { user_id: 2, email: 'user2@test.com', role: 'manager', password_hash: 'h2' },
        ];
        mockQuery.mockResolvedValueOnce({ rows: mockUsers, rowCount: 2 } as any);

        const response = await request(app)
          .get('/api/v1/auth/users')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.count).toBe(2);
        expect(response.body.data).toHaveLength(2);
      });

      test('should return 403 for unauthorized role', async () => {
        const token = generateToken({
          userId: 1,
          email: 'customer@test.com',
          role: 'customer',
        });

        const response = await request(app)
          .get('/api/v1/auth/users')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/v1/auth/users/create', () => {
      test('should create internal user for manager', async () => {
        const token = generateToken({
          userId: 1,
          email: 'manager@test.com',
          role: 'manager',
        });

        const newUser = {
          user_id: 5,
          email: 'newstaff@test.com',
          full_name: 'New Staff',
          role: 'staff',
          is_active: true,
          password_hash: 'hash',
        };

        mockQuery
          .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)
          .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)
          .mockResolvedValueOnce({ rows: [newUser], rowCount: 1 } as any);

        const response = await request(app)
          .post('/api/v1/auth/users/create')
          .set('Authorization', `Bearer ${token}`)
          .send({
            email: 'newstaff@test.com',
            password: 'StaffPass123',
            full_name: 'New Staff',
            role: 'staff',
          });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.email).toBe('newstaff@test.com');
        expect(response.body.data).not.toHaveProperty('password_hash');
      });

      test('should return 400 for missing role', async () => {
        const token = generateToken({
          userId: 1,
          email: 'manager@test.com',
          role: 'manager',
        });

        const response = await request(app)
          .post('/api/v1/auth/users/create')
          .set('Authorization', `Bearer ${token}`)
          .send({
            email: 'newstaff@test.com',
            password: 'StaffPass123',
            full_name: 'New Staff',
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });

    describe('DELETE /api/v1/auth/users/:id', () => {
      test('should delete user for authorized role', async () => {
        const token = generateToken({
          userId: 1,
          email: 'manager@test.com',
          role: 'manager',
        });

        mockQuery.mockResolvedValueOnce({ rows: [{ user_id: 5 }], rowCount: 1 } as any);

        const response = await request(app)
          .delete('/api/v1/auth/users/5')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      test('should return 404 for non-existent user', async () => {
        const token = generateToken({
          userId: 1,
          email: 'manager@test.com',
          role: 'manager',
        });

        mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any);

        const response = await request(app)
          .delete('/api/v1/auth/users/999')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
      });
    });
  });

  // ============================================
  // TOKEN VALIDATION TESTS
  // ============================================
  describe('Token Validation', () => {
    test('should reject malformed Authorization header', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'NotBearer token');

      expect(response.status).toBe(401);
    });

    test('should reject token with wrong signature', async () => {
      const wrongSecretToken = jwt.sign(
        { userId: 1, email: 'test@test.com', role: 'staff' },
        'wrong-secret-key',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${wrongSecretToken}`);

      expect(response.status).toBe(401);
    });
  });

  // ============================================
  // SECURITY TESTS
  // ============================================
  describe('Security', () => {
    test('should not expose password in login response', async () => {
      const password = 'TestPass123';
      const hashedPassword = await testHashPassword(password);
      const customer = {
        customer_id: 1,
        email: 'test@test.com',
        password_hash: hashedPassword,
        full_name: 'Test',
        is_active: true,
        role: 'customer',
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [customer], rowCount: 1 } as any)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@test.com', password });

      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data.user).not.toHaveProperty('password_hash');
      expect(JSON.stringify(response.body)).not.toContain(hashedPassword);
    });

    test('should not expose password in register response', async () => {
      const mockCustomer = {
        customer_id: 1,
        email: 'new@test.com',
        full_name: 'New User',
        is_active: true,
        role: 'customer',
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)
        .mockResolvedValueOnce({ rows: [mockCustomer], rowCount: 1 } as any);

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'new@test.com',
          password: 'SecretPass123',
          full_name: 'New User',
        });

      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data.user).not.toHaveProperty('password_hash');
    });
  });
});
