/**
 * Order status enum
 */
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Order type enum
 */
export enum OrderType {
  DINE_IN = 'dine_in',
  TAKEAWAY = 'takeaway',
  DELIVERY = 'delivery',
}

/**
 * Payment status enum
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIAL = 'partial',
}

/**
 * Payment method enum
 */
export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  MOBILE = 'mobile',
}

/**
 * Order item interface (matches your database)
 */
export interface OrderItem {
  order_item_id?: number;
  order_id?: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  discount_amount?: number;
  tax_amount?: number;
  total_price: number;
  notes?: string;
  created_at?: Date;
}

/**
 * Order interface (matches your database schema)
 */
export interface Order {
  order_id: number;
  order_number: string;
  customer_id?: number;
  staff_id?: number;
  order_type?: string;
  table_number?: string;
  status: string;
  subtotal: number;
  discount_amount?: number;
  discount_reason?: string;
  tax_amount?: number;
  total_amount: number;
  notes?: string;
  estimated_prep_time?: number;
  started_at?: Date;
  completed_at?: Date;
  cancelled_at?: Date;
  cancellation_reason?: string;
  created_at: Date;
  updated_at: Date;
  // Joined data
  items?: OrderItem[];
  customer_name?: string;
  staff_name?: string;
}

/**
 * Create order DTO
 */
export interface CreateOrderDTO {
  customer_id?: number;
  order_type?: string;
  table_number?: string;
  items: {
    product_id: number;
    quantity: number;
    notes?: string;
  }[];
  notes?: string;
  discount_amount?: number;
  discount_reason?: string;
}

/**
 * Order with items response
 */
export interface OrderWithItems extends Order {
  items: OrderItem[];
}