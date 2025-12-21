import { Router } from 'express';
import productController from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// ==================== INVENTORY ROUTES (must be before :id) ====================

/**
 * @route   GET /api/v1/products/inventory/low-stock
 * @desc    Get low stock products
 * @access  Private (Staff+)
 */
router.get(
  '/inventory/low-stock',
  authenticate,
  authorize('admin', 'manager', 'staff'),
  productController.getLowStock
);

/**
 * @route   GET /api/v1/products/inventory/out-of-stock
 * @desc    Get out of stock products
 * @access  Private (Staff+)
 */
router.get(
  '/inventory/out-of-stock',
  authenticate,
  authorize('admin', 'manager', 'staff'),
  productController.getOutOfStock
);

/**
 * @route   GET /api/v1/products/stats
 * @desc    Get product statistics
 * @access  Private (Manager+)
 */
router.get(
  '/stats',
  authenticate,
  authorize('admin', 'manager'),
  productController.getProductStats
);

// ==================== PRODUCT ROUTES ====================

/**
 * @route   GET /api/v1/products
 * @desc    Get all products
 * @access  Public
 */
router.get('/', productController.getAllProducts);

/**
 * @route   GET /api/v1/products/:id
 * @desc    Get product by ID
 * @access  Public
 */
router.get('/:id', productController.getProductById);

/**
 * @route   POST /api/v1/products
 * @desc    Create product
 * @access  Private (Manager+)
 */
router.post(
  '/',
  authenticate,
  authorize('admin', 'manager'),
  productController.createProduct
);

/**
 * @route   PUT /api/v1/products/:id
 * @desc    Update product
 * @access  Private (Manager+)
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'manager'),
  productController.updateProduct
);

/**
 * @route   DELETE /api/v1/products/:id
 * @desc    Delete product
 * @access  Private (Manager+)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'manager'),
  productController.deleteProduct
);

/**
 * @route   PATCH /api/v1/products/:id/inventory
 * @desc    Update product inventory
 * @access  Private (Staff+)
 */
router.patch(
  '/:id/inventory',
  authenticate,
  authorize('admin', 'manager', 'staff'),
  productController.updateInventory
);

export default router;