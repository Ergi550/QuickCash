import { query } from '../database/Connection';
import {
  User,
  UserResponse,
  LoginCredentials,
  RegisterDTO,
  AuthResponse,
  JWTPayload,
} from '../models/user.model';
import {
  Customer,
  CustomerResponse,
  CustomerRegisterDTO,
} from '../models/customer.model';
import { hashPassword, comparePassword } from '../utils/password.utils';
import { generateToken } from '../utils/jwt.utils';
import { AppError } from '../middleware/error.middleware';

/**
 * Authentication Service
 * Handles login, register, and user management with PostgreSQL
 */
class AuthService {
  /**
   * Login user - checks both customers and users tables
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    // First, try to find in customers table
    const customerResult = await query(
      'SELECT * FROM customers WHERE email = $1',
      [email]
    );

    if (customerResult.rows.length > 0) {
      const customer = customerResult.rows[0] as Customer;

      // Check if customer is active
      if (!customer.is_active) {
        throw new AppError('Llogaria është çaktivizuar', 403);
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, customer.password_hash);

      if (!isPasswordValid) {
        throw new AppError('Email ose fjalëkalimi i gabuar', 401);
      }

      // Update last_login
      await query(
        'UPDATE customers SET last_login = CURRENT_TIMESTAMP WHERE customer_id = $1',
        [customer.customer_id]
      );

      // Generate JWT with customer_id as userId
      const payload: JWTPayload = {
        userId: customer.customer_id,
        email: customer.email,
        role: 'customer',
      };

      const token = generateToken(payload);

      return {
        token,
        user: this.sanitizeCustomer(customer),
      };
    }

    // If not found in customers, try users table (internal staff/managers)
    const userResult = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    const user = userResult.rows[0] as User | undefined;

    if (!user) {
      throw new AppError('Email ose fjalëkalimi i gabuar', 401);
    }

    // Check if user is active
    if (!user.is_active) {
      throw new AppError('Llogaria është çaktivizuar', 403);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      throw new AppError('Email ose fjalëkalimi i gabuar', 401);
    }

    // Update last_login
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
      [user.user_id]
    );

    // Generate JWT
    const payload: JWTPayload = {
      userId: user.user_id,
      email: user.email,
      role: user.role,
    };

    const token = generateToken(payload);

    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Register new customer (public registration)
   */
  async register(userData: CustomerRegisterDTO): Promise<AuthResponse> {
    const { email, password, full_name, phone } = userData;

    // Validate required fields
    if (!email || !password || !full_name) {
      throw new AppError('Fushat e detyrueshme mungojnë', 400);
    }

    // Check if email already exists in customers table
    const existingCustomer = await query(
      'SELECT customer_id FROM customers WHERE email = $1',
      [email]
    );

    if (existingCustomer.rows.length > 0) {
      throw new AppError('Email-i është i regjistruar tashmë', 409);
    }

    // Check if email exists in users table (internal staff)
    const existingUser = await query(
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new AppError('Email-i është i regjistruar tashmë', 409);
    }

    // Hash password
    const password_hash = await hashPassword(password);
    const customerCode = `CUST-${Date.now()}`;

    // Split full_name into first_name and last_name
    const nameParts = full_name.trim().split(' ');
    const first_name = nameParts[0];
    const last_name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // Create new customer
    const result = await query(
      `INSERT INTO customers (
        customer_code, email, password_hash, full_name,
        first_name, last_name, phone, role, is_active
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        customerCode,
        email,
        password_hash,
        full_name,
        first_name,
        last_name || null,
        phone || null,
        'customer',
        true
      ]
    );

    const newCustomer = result.rows[0] as Customer;

    // Generate JWT
    const payload: JWTPayload = {
      userId: newCustomer.customer_id,
      email: newCustomer.email,
      role: 'customer',
    };

    const token = generateToken(payload);

    return {
      token,
      user: this.sanitizeCustomer(newCustomer),
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: number): Promise<UserResponse> {
    const result = await query(
      'SELECT * FROM users WHERE user_id = $1',
      [userId]
    );

    const user = result.rows[0] as User | undefined;

    if (!user) {
      throw new AppError('Përdoruesi nuk u gjet', 404);
    }

    return this.sanitizeUser(user);
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<UserResponse[]> {
    const result = await query(
      'SELECT * FROM users ORDER BY created_at DESC'
    );

    return result.rows.map((user: User) => this.sanitizeUser(user));
  }

  /**
   * Update user
   */
  async updateUser(userId: number, updateData: Partial<User>): Promise<UserResponse> {
    const { full_name, phone, is_active, role } = updateData;

    const result = await query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           is_active = COALESCE($3, is_active),
           role = COALESCE($4, role),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $5
       RETURNING *`,
      [full_name, phone, is_active, role, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Përdoruesi nuk u gjet', 404);
    }

    return this.sanitizeUser(result.rows[0]);
  }

  /**
   * Change password
   */
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const result = await query(
      'SELECT password_hash FROM users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Përdoruesi nuk u gjet', 404);
    }

    const isValid = await comparePassword(currentPassword, result.rows[0].password_hash);
    if (!isValid) {
      throw new AppError('Fjalëkalimi aktual është i gabuar', 400);
    }

    const newHash = await hashPassword(newPassword);
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [newHash, userId]
    );
  }

  /**
   * Delete user
   */
  async deleteUser(userId: number): Promise<void> {
    const result = await query(
      'DELETE FROM users WHERE user_id = $1 RETURNING user_id',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Përdoruesi nuk u gjet', 404);
    }
  }

  /**
   * Create internal user (manager/staff) - only managers can do this
   */
  async createInternalUser(userData: RegisterDTO): Promise<UserResponse> {
    const { email, password, full_name, phone, role } = userData;

    // Validate required fields
    if (!email || !password || !full_name || !role) {
      throw new AppError('Fushat e detyrueshme mungojnë', 400);
    }

    // Validate role
    if (!['admin', 'manager', 'staff'].includes(role)) {
      throw new AppError('Roli i pavlefshëm. Duhet të jetë admin, manager ose staff', 400);
    }

    // Check if email already exists in users table
    const existingUser = await query(
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new AppError('Email-i është i regjistruar tashmë', 409);
    }

    // Check if email exists in customers table
    const existingCustomer = await query(
      'SELECT customer_id FROM customers WHERE email = $1',
      [email]
    );

    if (existingCustomer.rows.length > 0) {
      throw new AppError('Email-i është i regjistruar tashmë', 409);
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create new internal user
    const result = await query(
      `INSERT INTO users (email, password_hash, full_name, phone, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [email, password_hash, full_name, phone || null, role, true]
    );

    const newUser = result.rows[0] as User;

    return this.sanitizeUser(newUser);
  }

  /**
   * Remove password from user object
   */
  private sanitizeUser(user: User): UserResponse {
    const { password_hash, two_factor_secret, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Remove password from customer object
   */
  private sanitizeCustomer(customer: Customer): any {
    const { password_hash, ...customerWithoutPassword } = customer;
    return {
      ...customerWithoutPassword,
      user_id: customer.customer_id, // Map customer_id to user_id for frontend compatibility
    };
  }
}

export default new AuthService();