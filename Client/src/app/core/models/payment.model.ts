import { PaymentMethod, PaymentStatus } from './order.model';

/**
 * Payment interface
 */
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  receiptNumber: string;
  processedBy?: string;
  processedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Process payment request
 */
export interface ProcessPaymentRequest {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  notes?: string;
}

/**
 * Payment response
 */
export interface PaymentResponse {
  success: boolean;
  payment: Payment;
  receiptUrl?: string;
  message?: string;
}
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}