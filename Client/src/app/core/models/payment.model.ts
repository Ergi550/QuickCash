import { PaymentMethod, PaymentStatus } from './order.model';

/**
 * Payment interface
 */
export interface Payment {
  payment_id: string;
  order_id: string;
  amount_paid: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  transaction_id?: string;
  receipt_number: string;
  processed_by?: string;
  processed_at?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Process payment request
 */
export interface ProcessPaymentRequest {
  order_id: string;
  amount_paid: number;
  payment_method: PaymentMethod;
  notes?: string;
}

/**
 * Payment response
 */
export interface PaymentResponse {
  success: boolean;
  payment: Payment;
  receipt_url?: string;
  message?: string;
}
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}