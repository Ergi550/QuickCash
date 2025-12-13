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
  id: string;
  username: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  firstName: string;
  lastName: string;
  phone?: string;
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