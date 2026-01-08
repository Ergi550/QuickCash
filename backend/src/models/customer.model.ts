/**
 * Customer interface (for public registration and authentication)
 */
export interface Customer {
  customer_id: number;
  user_id?: number; // Optional link to users table
  customer_code: string;
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  password_hash: string;
  full_name: string;
  role: 'customer';
  is_active: boolean;
  date_of_birth?: Date;
  total_spent: number;
  total_orders: number;
  referral_code?: string;
  referred_by?: number;
  referral_count: number;
  is_member: boolean;
  registration_date: Date;
  last_visit?: Date;
  last_login?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Customer response (without password)
 */
export interface CustomerResponse {
  customer_id: number;
  customer_code: string;
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  full_name: string;
  role: 'customer';
  is_active: boolean;
  date_of_birth?: Date;
  total_spent: number;
  total_orders: number;
  is_member: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * Customer registration DTO
 */
export interface CustomerRegisterDTO {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
}
