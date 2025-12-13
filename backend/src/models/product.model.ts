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
  cost: number; // për kalkulim profiti
  stock: number;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: Date | string;
  updatedAt: Date |string ;
}

/**
 * Create/Update product DTO
 */
export interface ProductDTO {
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
 * Inventory update DTO
 */
export interface InventoryUpdateDTO {
  productId: string;
  quantity: number;
  action: 'add' | 'subtract' | 'set';
}