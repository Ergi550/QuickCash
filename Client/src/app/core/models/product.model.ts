/**
 * Product category enum
 */
export interface Category {
  category_id: number;
  category_name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
}

/**
 * Product interface
 */
export interface Product {
  product_id: string;
  product_name: string;
  description: string;
  category_id: number|null;
  category_name: string;
  selling_price: number;
  tax_rate?: number;
  cost_price: number;
  current_quantity: number;
  image_url?: string;
  is_available: boolean;
  is_featured: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Product form data (for create/update)
 */
export interface ProductFormData {
  product_name: string;
  description: string;
  category_id?: number;
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