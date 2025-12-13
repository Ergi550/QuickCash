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
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  notes?: string;
}

/**
 * Order interface
 */
export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  tableNumber?: number;
  notes?: string;
  staffId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create order request
 */
export interface CreateOrderRequest {
  customerId?: string;
  customerName?: string;
  items: {
    productId: string;
    quantity: number;
    notes?: string;
  }[];
  tableNumber?: number;
  notes?: string;
}

/**
 * Cart item (used in shopping cart)
 */
export interface CartItem {
  product: {
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