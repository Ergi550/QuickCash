import { query } from '../database/Connection';
import {
  User,
  UserResponse,
  LoginCredentials,
  RegisterDTO,
  AuthResponse,
  JWTPayload,
} from '../models/user.model';
import { hashPassword, comparePassword } from '../utils/password.utils';
import { generateToken } from '../utils/jwt.utils';
import { AppError } from '../middleware/error.middleware';

/**
 * Authentication Service
 * Handles login, register, and user management with PostgreSQL
 */
class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    // Find user by email
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0] as User | undefined;

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
   * Register new user
   */
  async register(userData: RegisterDTO): Promise<AuthResponse> {
    const { email, password, full_name, phone, role } = userData;

    // Validate required fields
    if (!email || !password || !full_name) {
      throw new AppError('Fushat e detyrueshme mungojnë', 400);
    }

    // Check if email already exists
    const existingResult = await query(
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    );

    if (existingResult.rows.length > 0) {
      throw new AppError('Email-i është i regjistruar tashmë', 409);
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create new user
    const result = await query(
      `INSERT INTO users (email, password_hash, role, full_name, phone, is_active, is_verified, two_factor_enabled)
       VALUES ($1, $2, $3, $4, $5, true, false, false)
       RETURNING *`,
      [email, password_hash, role || 'cashier', full_name, phone || null]
    );

    const newUser = result.rows[0] as User;

    // Generate JWT
    const payload: JWTPayload = {
      userId: newUser.user_id,
      email: newUser.email,
      role: newUser.role,
    };

    const token = generateToken(payload);

    return {
      token,
      user: this.sanitizeUser(newUser),
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
   * Remove password from user object
   */
  private sanitizeUser(user: User): UserResponse {
    const { password_hash, two_factor_secret, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export default new AuthService();