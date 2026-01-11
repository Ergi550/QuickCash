import { Request, Response, NextFunction } from 'express';
import productService from '../services/product.service';
import { uploadProductImage } from '../middleware/upload.middleware';
import path from 'path';
import fs from 'fs';

/**
 * Product Controller
 */
class ProductController {
  // ==================== PRODUCTS ====================

  /**
   * Get all products
   * GET /api/v1/products
   */
  async getAllProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { available, category, search } = req.query;

      let products;

      if (search) {
        products = await productService.searchProducts(search as string);
      } else if (category) {
        products = await productService.getProductsByCategory(parseInt(category as string));
      } else {
        const isAvailable = available === 'true' ? true : available === 'false' ? false : undefined;
        products = await productService.getAllProducts(isAvailable);
      }

      res.status(200).json({
        success: true,
        count: products.length,
        data: products,
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
      const product = await productService.getProductById(parseInt(id));

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create product
   * POST /api/v1/products
   */
  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.createProduct(req.body);

      res.status(201).json({
        success: true,
        message: 'Produkti u krijua me sukses',
        data: product,
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
      const product = await productService.updateProduct(parseInt(id), req.body);

      res.status(200).json({
        success: true,
        message: 'Produkti u përditësua',
        data: product,
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
      await productService.deleteProduct(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Produkti u fshi',
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

      const inventory = await productService.updateInventory({
        product_id: parseInt(id),
        quantity,
        action,
      });

      res.status(200).json({
        success: true,
        message: 'Inventari u përditësua',
        data: inventory,
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
        data: products,
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
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product stats
   * GET /api/v1/products/stats
   */
  async getProductStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await productService.getProductStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== CATEGORIES ====================

  /**
   * Get all categories
   * GET /api/v1/categories
   */
  async getAllCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activeOnly = req.query.active === 'true';
      const categories = await productService.getAllCategories(activeOnly);

      res.status(200).json({
        success: true,
        count: categories.length,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get category by ID
   * GET /api/v1/categories/:id
   */
  async getCategoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const category = await productService.getCategoryById(parseInt(id));

      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create category
   * POST /api/v1/categories
   */
  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await productService.createCategory(req.body);

      res.status(201).json({
        success: true,
        message: 'Kategoria u krijua me sukses',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update category
   * PUT /api/v1/categories/:id
   */
  async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const category = await productService.updateCategory(parseInt(id), req.body);

      res.status(200).json({
        success: true,
        message: 'Kategoria u përditësua',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete category
   * DELETE /api/v1/categories/:id
   */
  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await productService.deleteCategory(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Kategoria u fshi',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload product image
   * POST /api/v1/products/:id/image
   */
  async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    uploadProductImage(req, res, async (err: any) => {
      if (err) {
        return next(err);
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No image file provided',
        });
        return;
      }

      try {
        const { id } = req.params;
        const productId = parseInt(id);

        // Get current product to check for existing image
        const currentProduct = await productService.getProductById(productId);

        // Delete old image if exists
        if (currentProduct.image_url) {
          const oldImagePath = path.join(__dirname, '../../uploads/products', path.basename(currentProduct.image_url));
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }

        // Build the image URL
        const imageUrl = `/uploads/products/${req.file.filename}`;

        // Update product with new image URL
        const product = await productService.updateProduct(productId, { image_url: imageUrl });

        res.status(200).json({
          success: true,
          message: 'Image uploaded successfully',
          data: {
            image_url: imageUrl,
            product,
          },
        });
      } catch (error) {
        // Delete uploaded file if update fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        next(error);
      }
    });
  }
}

export default new ProductController();