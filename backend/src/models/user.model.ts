/**
 * User roles in the system
 */
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  CASHIER = 'cashier',
  WAITER = 'waiter',
  KITCHEN = 'kitchen',
}

/**
 * User interface (matches your database schema)
 */
export interface User {
  user_id: number;
  email: string;
  password_hash: string;
  role: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
  is_verified: boolean;
  two_factor_enabled: boolean;
  two_factor_secret?: string;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * User response (without password)
 */
export interface UserResponse {
  user_id: number;
  email: string;
  role: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
  is_verified: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Register DTO
 */
export interface RegisterDTO {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role?: string;
}

/**
 * JWT Payload
 */
export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

/**
 * Auth response
 */
export interface AuthResponse {
  token: string;
  user: UserResponse;
}