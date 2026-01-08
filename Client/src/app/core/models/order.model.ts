/**
 * Order status enum
 */
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

/**
 * Payment status enum
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

/**
 * Payment method enum
 */
export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  MOBILE = 'mobile'
}

/**
 * Order item interface
 */
export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes?: string;
  tax_amount?: number;
  total_amount?: number;
}

/**
 * Order interface
 */
export interface Order {
  order_id: string;
  order_number: string;
  customer_id?: string;
  customer_name?: string;
  items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount?: number;
  discount?: number; // Alias for discount_amount
  total_amount?: number;
  total: number; // Alias for total_amount
  status: OrderStatus | string;
  payment_status: PaymentStatus | string;
  payment_method?: PaymentMethod;
  table_number?: number;
  notes?: string;
  staff_id?: string;
  created_at: Date;
  updated_at: Date;
  staff_name?: string;
}

/**
 * Create order request
 */
export interface CreateOrderRequest {
  customer_id?: string;
  customer_name?: string;
  items: {
    product_id: string;
    quantity: number;
    notes?: string;
  }[];
  table_number?: number;
  notes?: string;
}

/**
 * Cart item (used in shopping cart)
 */
export interface CartItem {
  product: {
    product_id: any;
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
  };
  quantity: number;
  notes?: string;
}
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}