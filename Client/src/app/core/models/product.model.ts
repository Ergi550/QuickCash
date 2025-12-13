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
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  cost: number;
  stock: number;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Product form data (for create/update)
 */
export interface ProductFormData {
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  cost: number;
  stock: number;
  imageUrl?: string;
  isAvailable?: boolean;
}

/**
 * Inventory update request
 */
export interface InventoryUpdate {
  productId: string;
  quantity: number;
  action: 'add' | 'subtract' | 'set';
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}