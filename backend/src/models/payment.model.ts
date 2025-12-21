import { PaymentMethod, PaymentStatus } from './order.model';

/**
 * Payment interface (matches your database schema)
 */
export interface Payment {
  payment_id: number;
  order_id: number;
  payment_method: string;
  payment_status: string;
  amount_paid: number;
  amount_due: number;
  change_amount?: number;
  card_last_four?: string;
  card_brand?: string;
  transaction_id?: string;
  gateway_response?: any;
  receipt_number?: string;
  processed_by?: number;
  processed_at?: Date;
  created_at: Date;
  // Joined data
  order_number?: string;
  staff_name?: string;
}

/**
 * Process payment DTO
 */
export interface ProcessPaymentDTO {
  order_id: number;
  payment_method: string;
  amount_paid: number;
  card_last_four?: string;
  card_brand?: string;
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
  change_amount?: number;
}