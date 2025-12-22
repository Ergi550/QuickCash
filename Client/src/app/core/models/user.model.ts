/**
 * User roles in the system
 */
export enum UserRole {
  CUSTOMER = 'customer',
  STAFF = 'staff',
  MANAGER = 'manager'
}

/**
 * User interface
 */
export interface User {
  user_id: string;
  //username: string;
  email: string;
  role: UserRole;
  full_name: string;
  phone?: string;
  is_active: boolean;
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
 * Register data
 */
export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role : UserRole;
}

/**
 * Auth response from API
 */
export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}