/**
 * Category interface
 */
export interface Category {
  category_id: number;
  category_name: string;
  parent_category_id?: number;
  description?: string;
  icon?: string;
  sort_order?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Product interface (matches your database schema)
 */
export interface Product {
  product_id: number;
  category_id?: number;
  product_code: string;
  product_name: string;
  description?: string;
  image_url?: string;
  unit_type?: string;
  cost_price: number;
  selling_price: number;
  profit_margin?: number;
  tax_rate?: number;
  is_available: boolean;
  is_featured: boolean;
  preparation_time?: number;
  sort_order?: number;
  created_at: Date;
  updated_at: Date;
  // Joined from inventory
  current_quantity?: number;
  category_name?: string;
}

/**
 * Inventory interface
 */
export interface Inventory {
  inventory_id: number;
  product_id: number;
  location?: string;
  current_quantity: number;
  minimum_quantity?: number;
  maximum_quantity?: number;
  reorder_quantity?: number;
  last_restock_date?: Date;
  last_restock_quantity?: number;
  total_sold?: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Create/Update product DTO
 */
export interface ProductDTO {
  category_id?: number;
  product_code?: string;
  product_name: string;
  description?: string;
  image_url?: string;
  unit_type?: string;
  cost_price: number;
  selling_price: number;
  tax_rate?: number;
  is_available?: boolean;
  is_featured?: boolean;
  preparation_time?: number;
  initial_quantity?: number;
}

/**
 * Category DTO
 */
export interface CategoryDTO {
  category_name: string;
  parent_category_id?: number;
  description?: string;
  icon?: string;
  sort_order?: number;
  is_active?: boolean;
}

/**
 * Inventory update DTO
 */
export interface InventoryUpdateDTO {
  product_id: number;
  quantity: number;
  action: 'add' | 'subtract' | 'set';
  location?: string;
}