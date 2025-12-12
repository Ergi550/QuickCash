export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  customer_id?: number;
  table_number?: string;
  order_type: 'dine_in' | 'takeaway' | 'delivery';
}