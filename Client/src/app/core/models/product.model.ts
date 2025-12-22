/**
 * Product category enum
 */
export enum ProductCategory {
  FOOD = 'food',
  BEVERAGE = 'beverage',
  DESSERT = 'dessert',
  OTHER = 'other'
}

/**
 * Product interface
 */
export interface Product {
  product_id: string;
  product_name: string;
  description: string;
  category: ProductCategory;
  selling_price: number;
  cost_price: number;
  current_quantity: number;
  image_url?: string;
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Product form data (for create/update)
 */
export interface ProductFormData {
  product_name: string;
  description: string;
  category: ProductCategory;
  selling_price: number;
  cost_price: number;
  current_quantity: number;
  image_url?: string;
  is_available?: boolean;
}

/**
 * Inventory update request
 */
export interface InventoryUpdate {
  product_id: string;
  current_quantity: number;
  action: 'add' | 'subtract' | 'set';
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}