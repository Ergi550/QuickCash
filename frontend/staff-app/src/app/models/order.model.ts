export interface Order {
  order_id: number;
  order_number: string;
  customer_id?: number;
  staff_id?: number;
  order_type: 'dine_in' | 'takeaway' | 'delivery';
  table_number?: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  subtotal: number;
  discount_amount: number;
  discount_reason?: string;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  estimated_prep_time?: number;
  started_at?: Date;
  completed_at?: Date;
  cancelled_at?: Date;
  cancellation_reason?: string;
  created_at: Date;
  updated_at: Date;
  items?: OrderItem[];
  customer ?: Customer;
  staff ?: User;
}

export interface OrderItem {
  order_item_id?: number;
  order_id?: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_price: number;
  notes?: string;
  product?: Product;
}
export interface CreateOrderRequest {
  customer_id?: number;
  order_type: 'dine_in' | 'takeaway' | 'delivery';
  table_number?: string;
  items: CreateOrderItem[];
  notes?: string;
}
export interface CreateOrderItem {
  product_id: number;
  quantity: number;
  notes?: string;
}
export interface OrderStats {
  total_orders: number;
  pending_orders: number;
  preparing_orders: number;
  ready_orders: number;
  completed_today: number;
  total_revenue_today: number;
  average_order_value: number;
}