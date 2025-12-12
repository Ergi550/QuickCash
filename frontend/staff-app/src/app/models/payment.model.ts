export interface Payment {
  payment_id: number;
  order_id: number;
  payment_method: 'cash' | 'card' | 'digital_wallet';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  amount_paid: number;
  amount_due: number;
  change_amount: number;
  card_last_four?: string;
  card_brand?: string;
  transaction_id?: string;
  receipt_number: string;
  processed_at: Date;
}
export interface CreatePaymentRequest {
  order_id: number;
  payment_method: 'cash' | 'card' | 'digital_wallet';
  amount_paid: number;
  card_token?: string; // For Stripe
}
export interface PaymentResponse {
  success: boolean;
  message: string;
  payment: Payment;
  receipt_url?: string;
}