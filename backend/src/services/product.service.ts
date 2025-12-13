import { Product, ProductDTO, InventoryUpdateDTO, ProductCategory } from '../models/product.model';
import { AppError } from '../middleware/error.middleware';
import productsData from '../data/products.json';

/**
 * Product Service
 * Handles product and inventory management
 */
class ProductService {
  private products: Product[];

  constructor() {
    // Load mock products
    this.products = productsData as Product[];
  }

  /**
   * Get all products
   * @param isAvailable - Filter by availability
   * @returns List of products
   */
  async getAllProducts(isAvailable?: boolean): Promise<Product[]> {
    if (isAvailable !== undefined) {
      return this.products.filter(p => p.isAvailable === isAvailable);
    }
    return this.products;
  }

  /**
   * Get product by ID
   * @param productId - Product ID
   * @returns Product
   */
  async getProductById(productId: string): Promise<Product> {
    const product = this.products.find(p => p.id === productId);
    
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  /**
   * Get products by category
   * @param category - Product category
   * @returns List of products
   */
  async getProductsByCategory(category: ProductCategory): Promise<Product[]> {
    return this.products.filter(p => p.category === category);
  }

  /**
   * Create new product
   * @param productData - Product data
   * @returns Created product
   */
  async createProduct(productData: ProductDTO): Promise<Product> {
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      ...productData,
      isAvailable: productData.isAvailable ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.products.push(newProduct);
    return newProduct;
  }

  /**
   * Update product
   * @param productId - Product ID
   * @param productData - Updated data
   * @returns Updated product
   */
  async updateProduct(productId: string, productData: Partial<ProductDTO>): Promise<Product> {
    const productIndex = this.products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      throw new AppError('Product not found', 404);
    }

    this.products[productIndex] = {
      ...this.products[productIndex],
      ...productData,
      updatedAt: new Date()
    };

    return this.products[productIndex];
  }

  /**
   * Delete product
   * @param productId - Product ID
   */
  async deleteProduct(productId: string): Promise<void> {
    const productIndex = this.products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      throw new AppError('Product not found', 404);
    }

    this.products.splice(productIndex, 1);
  }

  /**
   * Update inventory
   * @param updates - Inventory update data
   * @returns Updated product
   */
  async updateInventory(updates: InventoryUpdateDTO): Promise<Product> {
    const product = await this.getProductById(updates.productId);

    switch (updates.action) {
      case 'add':
        product.stock += updates.quantity;
        break;
      case 'subtract':
        if (product.stock < updates.quantity) {
          throw new AppError('Insufficient stock', 400);
        }
        product.stock -= updates.quantity;
        break;
      case 'set':
        product.stock = updates.quantity;
        break;
    }

    // Auto-disable if out of stock
    if (product.stock === 0) {
      product.isAvailable = false;
    }

    product.updatedAt = new Date();
    return product;
  }

  /**
   * Check stock availability
   * @param productId - Product ID
   * @param quantity - Required quantity
   * @returns True if available
   */
  async checkStock(productId: string, quantity: number): Promise<boolean> {
    const product = await this.getProductById(productId);
    return product.stock >= quantity && product.isAvailable;
  }

  /**
   * Get low stock products
   * @param threshold - Stock threshold
   * @returns Products with low stock
   */
  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    return this.products.filter(p => p.stock <= threshold && p.stock > 0);
  }

  /**
   * Get out of stock products
   * @returns Products with zero stock
   */
  async getOutOfStockProducts(): Promise<Product[]> {
    return this.products.filter(p => p.stock === 0);
  }
}

export default new ProductService();