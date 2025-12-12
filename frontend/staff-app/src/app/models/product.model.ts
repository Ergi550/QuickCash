export interface Category {
  category_id: number;
  category_name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
}
export interface Product {
  product_id: number;
  category_id: number;
  product_code: string;
  product_name: string;
  description?: string;
  image_url?: string;
  unit_type: string;
  cost_price: number;
  selling_price: number;
  profit_margin?: number;
  tax_rate: number;
  is_available: boolean;
  is_featured: boolean;
  preparation_time: number;
  category?: Category;
  inventory?: Inventory; 
}

export interface Inventory {
  inventory_id: number;
  product_id: number;
  location: string;
  current_quantity: number;
  minimum_quantity: number;
  maximum_quantity?: number;
  last_restock_date?: Date;
}
export interface ProductFilter {
  category_id?: number;
  search?: string;
  is_available?: boolean;
  is_featured?: boolean;
}
