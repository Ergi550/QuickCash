// Mock the database connection
jest.mock('../../../database/Connection', () => ({
  query: jest.fn(),
}));

// Mock password utils
jest.mock('../../../utils/password.utils', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

// Mock jwt utils
jest.mock('../../../utils/jwt.utils', () => ({
  generateToken: jest.fn(),
}));

// Import mocked modules
import { query } from '../../../database/Connection';
import { hashPassword, comparePassword } from '../../../utils/password.utils';
import { generateToken } from '../../../utils/jwt.utils';
import authService from '../../../services/auth.service';

const mockQuery = query as jest.MockedFunction<typeof query>;
const mockHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>;
const mockComparePassword = comparePassword as jest.MockedFunction<typeof comparePassword>;
const mockGenerateToken = generateToken as jest.MockedFunction<typeof generateToken>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // LOGIN TESTS
  // ============================================
  describe('login', () => {
    const mockCustomer = {
      customer_id: 1,
      email: 'customer@test.com',
      password_hash: 'hashed_password',
      full_name: 'Test Customer',
      first_name: 'Test',
      last_name: 'Customer',
      is_active: true,
      role: 'customer',
      customer_code: 'CUST-123',
    };

    const mockUser = {
      user_id: 1,
      email: 'staff@test.com',
      password_hash: 'hashed_password',
      full_name: 'Test Staff',
      role: 'staff',
      is_active: true,
    };

    test('should login customer successfully', async () => {
      // ARRANGE
      mockQuery
        .mockResolvedValueOnce({ rows: [mockCustomer], rowCount: 1 } as any) // Find customer
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any); // Update last_login
      mockComparePassword.mockResolvedValue(true);
      mockGenerateToken.mockReturnValue('mock-jwt-token');

      // ACT
      const result = await authService.login({
        email: 'customer@test.com',
        password: 'password123',
      });

      // ASSERT
      expect(result.token).toBe('mock-jwt-token');
      expect(result.user.email).toBe('customer@test.com');
      expect(result.user).not.toHaveProperty('password_hash');
      expect(mockGenerateToken).toHaveBeenCalledWith({
        userId: 1,
        email: 'customer@test.com',
        role: 'customer',
      });
    });

    test('should login internal user (staff/manager) successfully', async () => {
      // ARRANGE
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any) // No customer found
        .mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 } as any) // Find user
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any); // Update last_login
      mockComparePassword.mockResolvedValue(true);
      mockGenerateToken.mockReturnValue('mock-jwt-token');

      // ACT
      const result = await authService.login({
        email: 'staff@test.com',
        password: 'password123',
      });

      // ASSERT
      expect(result.token).toBe('mock-jwt-token');
      expect(result.user.email).toBe('staff@test.com');
      expect(result.user.role).toBe('staff');
      expect(mockGenerateToken).toHaveBeenCalledWith({
        userId: 1,
        email: 'staff@test.com',
        role: 'staff',
      });
    });

    test('should throw error for invalid email', async () => {
      // ARRANGE
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any) // No customer
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any); // No user

      // ACT & ASSERT
      await expect(
        authService.login({
          email: 'nonexistent@test.com',
          password: 'password123',
        })
      ).rejects.toThrow('Email ose fjalëkalimi i gabuar');
    });

    test('should throw error for invalid password', async () => {
      // ARRANGE
      mockQuery.mockResolvedValueOnce({ rows: [mockCustomer], rowCount: 1 } as any);
      mockComparePassword.mockResolvedValue(false);

      // ACT & ASSERT
      await expect(
        authService.login({
          email: 'customer@test.com',
          password: 'wrong_password',
        })
      ).rejects.toThrow('Email ose fjalëkalimi i gabuar');
    });

    test('should throw error for inactive customer', async () => {
      // ARRANGE
      const inactiveCustomer = { ...mockCustomer, is_active: false };
      mockQuery.mockResolvedValueOnce({ rows: [inactiveCustomer], rowCount: 1 } as any);

      // ACT & ASSERT
      await expect(
        authService.login({
          email: 'customer@test.com',
          password: 'password123',
        })
      ).rejects.toThrow('Llogaria është çaktivizuar');
    });

    test('should throw error for inactive user', async () => {
      // ARRANGE
      const inactiveUser = { ...mockUser, is_active: false };
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any) // No customer
        .mockResolvedValueOnce({ rows: [inactiveUser], rowCount: 1 } as any); // Inactive user

      // ACT & ASSERT
      await expect(
        authService.login({
          email: 'staff@test.com',
          password: 'password123',
        })
      ).rejects.toThrow('Llogaria është çaktivizuar');
    });

    test('should update last_login timestamp after successful login', async () => {
      // ARRANGE
      mockQuery
        .mockResolvedValueOnce({ rows: [mockCustomer], rowCount: 1 } as any)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any);
      mockComparePassword.mockResolvedValue(true);
      mockGenerateToken.mockReturnValue('mock-jwt-token');

      // ACT
      await authService.login({
        email: 'customer@test.com',
        password: 'password123',
      });

      // ASSERT
      expect(mockQuery).toHaveBeenCalledWith(
        'UPDATE customers SET last_login = CURRENT_TIMESTAMP WHERE customer_id = $1',
        [1]
      );
    });
  });

  // ============================================
  // REGISTER TESTS
  // ============================================
  describe('register', () => {
    const registerData = {
      email: 'newcustomer@test.com',
      password: 'SecurePass123',
      full_name: 'New Customer',
      phone: '+355691234567',
    };

    const mockNewCustomer = {
      customer_id: 10,
      customer_code: 'CUST-123456789',
      email: 'newcustomer@test.com',
      password_hash: 'hashed_password',
      full_name: 'New Customer',
      first_name: 'New',
      last_name: 'Customer',
      phone: '+355691234567',
      is_active: true,
      role: 'customer',
    };

    test('should register new customer successfully', async () => {
      // ARRANGE
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any) // Check existing customer
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any) // Check existing user
        .mockResolvedValueOnce({ rows: [mockNewCustomer], rowCount: 1 } as any); // Insert
      mockHashPassword.mockResolvedValue('hashed_password');
      mockGenerateToken.mockReturnValue('mock-jwt-token');

      // ACT
      const result = await authService.register(registerData);

      // ASSERT
      expect(result.token).toBe('mock-jwt-token');
      expect(result.user.email).toBe('newcustomer@test.com');
      expect(result.user).not.toHaveProperty('password_hash');
      expect(mockHashPassword).toHaveBeenCalledWith('SecurePass123');
    });

    test('should throw error for missing required fields', async () => {
      // ACT & ASSERT
      await expect(
        authService.register({
          email: '',
          password: 'pass123',
          full_name: 'Test',
        })
      ).rejects.toThrow('Fushat e detyrueshme mungojnë');

      await expect(
        authService.register({
          email: 'test@test.com',
          password: '',
          full_name: 'Test',
        })
      ).rejects.toThrow('Fushat e detyrueshme mungojnë');

      await expect(
        authService.register({
          email: 'test@test.com',
          password: 'pass123',
          full_name: '',
        })
      ).rejects.toThrow('Fushat e detyrueshme mungojnë');
    });

    test('should throw error if email exists in customers table', async () => {
      // ARRANGE
      mockQuery.mockResolvedValueOnce({
        rows: [{ customer_id: 1 }],
        rowCount: 1,
      } as any);

      // ACT & ASSERT
      await expect(authService.register(registerData)).rejects.toThrow(
        'Email-i është i regjistruar tashmë'
      );
    });

    test('should throw error if email exists in users table', async () => {
      // ARRANGE
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any) // No customer
        .mockResolvedValueOnce({ rows: [{ user_id: 1 }], rowCount: 1 } as any); // User exists

      // ACT & ASSERT
      await expect(authService.register(registerData)).rejects.toThrow(
        'Email-i është i regjistruar tashmë'
      );
    });

    test('should split full_name into first_name and last_name', async () => {
      // ARRANGE
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)
        .mockResolvedValueOnce({ rows: [mockNewCustomer], rowCount: 1 } as any);
      mockHashPassword.mockResolvedValue('hashed_password');
      mockGenerateToken.mockReturnValue('mock-jwt-token');

      // ACT
      await authService.register({
        email: 'test@test.com',
        password: 'pass123',
        full_name: 'John William Doe',
      });

      // ASSERT - Check that INSERT was called with split names
      const insertCall = mockQuery.mock.calls[2];
      expect(insertCall[1]).toContain('John'); // first_name
      expect(insertCall[1]).toContain('William Doe'); // last_name
    });

    test('should handle single name (no last_name)', async () => {
      // ARRANGE
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)
        .mockResolvedValueOnce({ rows: [{ ...mockNewCustomer, last_name: '' }], rowCount: 1 } as any);
      mockHashPassword.mockResolvedValue('hashed_password');
      mockGenerateToken.mockReturnValue('mock-jwt-token');

      // ACT
      await authService.register({
        email: 'test@test.com',
        password: 'pass123',
        full_name: 'Madonna',
      });

      // ASSERT
      const insertCall = mockQuery.mock.calls[2];
      expect(insertCall[1]).toContain('Madonna'); // first_name
    });
  });

  // ============================================
  // GET USER BY ID TESTS
  // ============================================
  describe('getUserById', () => {
    const mockUser = {
      user_id: 1,
      email: 'user@test.com',
      password_hash: 'hashed',
      full_name: 'Test User',
      role: 'staff',
      is_active: true,
    };

    test('should return user without password_hash', async () => {
      // ARRANGE
      mockQuery.mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 } as any);

      // ACT
      const result = await authService.getUserById(1);

      // ASSERT
      expect(result.email).toBe('user@test.com');
      expect(result).not.toHaveProperty('password_hash');
    });

    test('should throw error if user not found', async () => {
      // ARRANGE
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any);

      // ACT & ASSERT
      await expect(authService.getUserById(999)).rejects.toThrow('Përdoruesi nuk u gjet');
    });
  });

  // ============================================
  // GET ALL USERS TESTS
  // ============================================
  describe('getAllUsers', () => {
    test('should return all users without passwords', async () => {
      // ARRANGE
      const mockUsers = [
        { user_id: 1, email: 'user1@test.com', password_hash: 'hash1', role: 'staff' },
        { user_id: 2, email: 'user2@test.com', password_hash: 'hash2', role: 'manager' },
      ];
      mockQuery.mockResolvedValueOnce({ rows: mockUsers, rowCount: 2 } as any);

      // ACT
      const result = await authService.getAllUsers();

      // ASSERT
      expect(result).toHaveLength(2);
      result.forEach((user) => {
        expect(user).not.toHaveProperty('password_hash');
      });
    });

    test('should return empty array if no users', async () => {
      // ARRANGE
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any);

      // ACT
      const result = await authService.getAllUsers();

      // ASSERT
      expect(result).toEqual([]);
    });
  });

  // ============================================
  // UPDATE USER TESTS
  // ============================================
  describe('updateUser', () => {
    const mockUpdatedUser = {
      user_id: 1,
      email: 'user@test.com',
      password_hash: 'hash',
      full_name: 'Updated Name',
      role: 'manager',
      is_active: true,
    };

    test('should update user successfully', async () => {
      // ARRANGE
      mockQuery.mockResolvedValueOnce({ rows: [mockUpdatedUser], rowCount: 1 } as any);

      // ACT
      const result = await authService.updateUser(1, {
        full_name: 'Updated Name',
        role: 'manager',
      });

      // ASSERT
      expect(result.full_name).toBe('Updated Name');
      expect(result).not.toHaveProperty('password_hash');
    });

    test('should throw error if user not found', async () => {
      // ARRANGE
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any);

      // ACT & ASSERT
      await expect(
        authService.updateUser(999, { full_name: 'Test' })
      ).rejects.toThrow('Përdoruesi nuk u gjet');
    });
  });

  // ============================================
  // CHANGE PASSWORD TESTS
  // ============================================
  describe('changePassword', () => {
    test('should change password successfully', async () => {
      // ARRANGE
      mockQuery
        .mockResolvedValueOnce({
          rows: [{ password_hash: 'old_hash' }],
          rowCount: 1,
        } as any)
        .mockResolvedValueOnce({ rows: [], rowCount: 1 } as any);
      mockComparePassword.mockResolvedValue(true);
      mockHashPassword.mockResolvedValue('new_hash');

      // ACT
      await authService.changePassword(1, 'oldPassword', 'newPassword');

      // ASSERT
      expect(mockComparePassword).toHaveBeenCalledWith('oldPassword', 'old_hash');
      expect(mockHashPassword).toHaveBeenCalledWith('newPassword');
    });

    test('should throw error if user not found', async () => {
      // ARRANGE
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any);

      // ACT & ASSERT
      await expect(
        authService.changePassword(999, 'old', 'new')
      ).rejects.toThrow('Përdoruesi nuk u gjet');
    });

    test('should throw error if current password is wrong', async () => {
      // ARRANGE
      mockQuery.mockResolvedValueOnce({
        rows: [{ password_hash: 'old_hash' }],
        rowCount: 1,
      } as any);
      mockComparePassword.mockResolvedValue(false);

      // ACT & ASSERT
      await expect(
        authService.changePassword(1, 'wrongPassword', 'newPassword')
      ).rejects.toThrow('Fjalëkalimi aktual është i gabuar');
    });
  });

  // ============================================
  // DELETE USER TESTS
  // ============================================
  describe('deleteUser', () => {
    test('should delete user successfully', async () => {
      // ARRANGE
      mockQuery.mockResolvedValueOnce({ rows: [{ user_id: 1 }], rowCount: 1 } as any);

      // ACT & ASSERT
      await expect(authService.deleteUser(1)).resolves.not.toThrow();
    });

    test('should throw error if user not found', async () => {
      // ARRANGE
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any);

      // ACT & ASSERT
      await expect(authService.deleteUser(999)).rejects.toThrow('Përdoruesi nuk u gjet');
    });
  });

  // ============================================
  // CREATE INTERNAL USER TESTS
  // ============================================
  describe('createInternalUser', () => {
    const createUserData = {
      email: 'newstaff@test.com',
      password: 'SecurePass123',
      full_name: 'New Staff Member',
      phone: '+355691234567',
      role: 'staff',
    };

    const mockCreatedUser = {
      user_id: 5,
      email: 'newstaff@test.com',
      password_hash: 'hashed',
      full_name: 'New Staff Member',
      phone: '+355691234567',
      role: 'staff',
      is_active: true,
    };

    test('should create internal user successfully', async () => {
      // ARRANGE
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any) // Check users
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any) // Check customers
        .mockResolvedValueOnce({ rows: [mockCreatedUser], rowCount: 1 } as any); // Insert
      mockHashPassword.mockResolvedValue('hashed');

      // ACT
      const result = await authService.createInternalUser(createUserData);

      // ASSERT
      expect(result.email).toBe('newstaff@test.com');
      expect(result.role).toBe('staff');
      expect(result).not.toHaveProperty('password_hash');
    });

    test('should throw error for missing required fields', async () => {
      // ACT & ASSERT
      await expect(
        authService.createInternalUser({
          email: '',
          password: 'pass',
          full_name: 'Test',
          role: 'staff',
        })
      ).rejects.toThrow('Fushat e detyrueshme mungojnë');
    });

    test('should throw error for invalid role', async () => {
      // ACT & ASSERT
      await expect(
        authService.createInternalUser({
          email: 'test@test.com',
          password: 'pass',
          full_name: 'Test',
          role: 'invalid_role',
        })
      ).rejects.toThrow('Roli i pavlefshëm');
    });

    test('should accept valid roles: admin, manager, staff', async () => {
      // ARRANGE
      const setupMocks = () => {
        mockQuery
          .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)
          .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)
          .mockResolvedValueOnce({ rows: [mockCreatedUser], rowCount: 1 } as any);
        mockHashPassword.mockResolvedValue('hashed');
      };

      // ACT & ASSERT - Test each valid role
      for (const role of ['admin', 'manager', 'staff']) {
        setupMocks();
        await expect(
          authService.createInternalUser({ ...createUserData, role })
        ).resolves.not.toThrow();
      }
    });

    test('should throw error if email exists in users table', async () => {
      // ARRANGE
      mockQuery.mockResolvedValueOnce({
        rows: [{ user_id: 1 }],
        rowCount: 1,
      } as any);

      // ACT & ASSERT
      await expect(
        authService.createInternalUser(createUserData)
      ).rejects.toThrow('Email-i është i regjistruar tashmë');
    });

    test('should throw error if email exists in customers table', async () => {
      // ARRANGE
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any) // No user
        .mockResolvedValueOnce({ rows: [{ customer_id: 1 }], rowCount: 1 } as any); // Customer exists

      // ACT & ASSERT
      await expect(
        authService.createInternalUser(createUserData)
      ).rejects.toThrow('Email-i është i regjistruar tashmë');
    });
  });

  // ============================================
  // SANITIZE TESTS (Edge Cases)
  // ============================================
  describe('Data Sanitization', () => {
    test('should remove sensitive fields from user response', async () => {
      // ARRANGE
      const userWithSecrets = {
        user_id: 1,
        email: 'user@test.com',
        password_hash: 'super_secret_hash',
        two_factor_secret: 'secret_2fa_key',
        full_name: 'Test User',
        role: 'staff',
        is_active: true,
      };
      mockQuery.mockResolvedValueOnce({ rows: [userWithSecrets], rowCount: 1 } as any);

      // ACT
      const result = await authService.getUserById(1);

      // ASSERT
      expect(result).not.toHaveProperty('password_hash');
      expect(result).not.toHaveProperty('two_factor_secret');
      expect(result.email).toBe('user@test.com');
    });

    test('should map customer_id to user_id for frontend compatibility on login', async () => {
      // ARRANGE
      const mockCustomer = {
        customer_id: 42,
        email: 'customer@test.com',
        password_hash: 'hash',
        full_name: 'Customer',
        is_active: true,
        role: 'customer',
      };
      mockQuery
        .mockResolvedValueOnce({ rows: [mockCustomer], rowCount: 1 } as any)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any);
      mockComparePassword.mockResolvedValue(true);
      mockGenerateToken.mockReturnValue('token');

      // ACT
      const result = await authService.login({
        email: 'customer@test.com',
        password: 'pass',
      });

      // ASSERT
      expect(result.user.user_id).toBe(42);
    });
  });
});
