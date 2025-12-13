import { Request, Response, NextFunction } from 'express';
import productService from '../services/product.service';
import { ProductCategory } from '../models/product.model';

/**
 * Product Controller
 * Handles HTTP requests for product endpoints
 */
class ProductController {
  /**
   * Get all products
   * GET /api/v1/products
   */
  async getAllProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { available, category } = req.query;

      let products;

      if (category) {
        products = await productService.getProductsByCategory(category as ProductCategory);
      } else {
        const isAvailable = available === 'true' ? true : available === 'false' ? false : undefined;
        products = await productService.getAllProducts(isAvailable);
      }

      res.status(200).json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product by ID
   * GET /api/v1/products/:id
   */
  async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);

      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new product
   * POST /api/v1/products
   */
  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.createProduct(req.body);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update product
   * PUT /api/v1/products/:id
   */
  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const product = await productService.updateProduct(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete product
   * DELETE /api/v1/products/:id
   */
  async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await productService.deleteProduct(id);

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update inventory
   * PATCH /api/v1/products/:id/inventory
   */
  async updateInventory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { quantity, action } = req.body;

      const product = await productService.updateInventory({
        productId: id,
        quantity,
        action
      });

      res.status(200).json({
        success: true,
        message: 'Inventory updated successfully',
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get low stock products
   * GET /api/v1/products/inventory/low-stock
   */
  async getLowStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const threshold = parseInt(req.query.threshold as string) || 10;
      const products = await productService.getLowStockProducts(threshold);

      res.status(200).json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get out of stock products
   * GET /api/v1/products/inventory/out-of-stock
   */
  async getOutOfStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await productService.getOutOfStockProducts();

      res.status(200).json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductController();