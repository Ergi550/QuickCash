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
  processedBy?: string; // staffId
  processedAt?: Date;
  notes?: string;
  createdAt: Date |string;
  updatedAt: Date |string;
}

/**
 * Process payment DTO
 */
export interface ProcessPaymentDTO {
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