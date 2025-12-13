import { User, UserResponse, LoginCredentials, AuthResponse, JWTPayload, UserRole } from '../models/user.model';
import { hashPassword, comparePassword } from '../utils/password.utils';
import { generateToken } from '../utils/jwt.utils';
import { AppError } from '../middleware/error.middleware';
import usersData from '../data/users.json';

/**
 * Authentication Service
 * Handles login, register, and user management
 */
class AuthService {
  private users: User[];

  constructor() {
    // Load mock users (in real app, this would be DB)
    this.users = usersData as User[];
  }

  /**
   * Login user
   * @param credentials - Email and password
   * @returns Auth response with token and user data
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    // Find user by email
    const user = this.users.find(u => u.email === email);
    
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate JWT
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const token = generateToken(payload);

    // Return response without password
    return {
      token,
      user: this.sanitizeUser(user)
    };
  }

  /**
   * Register new user (customer)
   * @param userData - User registration data
   * @returns Auth response with token and user data
   */
  async register(userData: Partial<User>): Promise<AuthResponse> {
    const { email, password, firstName, lastName, phone } = userData;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      throw new AppError('Missing required fields', 400);
    }

    // Check if email already exists
    const existingUser = this.users.find(u => u.email === email);
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}`,
      username: email.split('@')[0],
      email,
      password: hashedPassword,
      role: UserRole.CUSTOMER, // Default role
      firstName,
      lastName,
      phone,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add to users array (in real app, save to DB)
    this.users.push(newUser);

    // Generate JWT
    const payload: JWTPayload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role
    };

    const token = generateToken(payload);

    return {
      token,
      user: this.sanitizeUser(newUser)
    };
  }

  /**
   * Get user by ID
   * @param userId - User ID
   * @returns User data without password
   */
  async getUserById(userId: string): Promise<UserResponse> {
    const user = this.users.find(u => u.id === userId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return this.sanitizeUser(user);
  }

  /**
   * Remove password from user object
   * @param user - User object
   * @returns User without password
   */
  private sanitizeUser(user: User): UserResponse {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Get all users (for admin/manager)
   * @returns List of users without passwords
   */
  async getAllUsers(): Promise<UserResponse[]> {
    return this.users.map(user => this.sanitizeUser(user));
  }
}

export default new AuthService();