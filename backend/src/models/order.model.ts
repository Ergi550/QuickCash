//Order status enum

export enum OrderStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    PREPARING = 'preparing',
    READY = 'ready',
    COMPLETED = 'completed',
    CANCELLED = 'canceled'
}

//Payment status

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

//Payment Method

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  MOBILE = 'mobile'
}

//Order item Interface 
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  notes?: string;
}

//order interface 

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
  createdAt: Date|string;
  updatedAt: Date|string;
}

/**
 * Create order DTO
 */
export interface CreateOrderDTO {
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