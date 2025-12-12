export interface User {
    user_id : number;
    email :string;
    role : 'admin' | 'manager' | 'staff' | 'customer';
    full_name : string;
    phone?:string;
    is_active:boolean;
    is_verified:boolean;
    two_factor_enabled:boolean;
    last_login?:Date;
    created_at:Date;
}
export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}
export interface LoginRequest {
  email: string;
  password: string;
}
