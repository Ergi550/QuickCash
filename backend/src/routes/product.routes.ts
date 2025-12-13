import { Router } from 'express';
import productController from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

/**
 * @route   GET /api/v1/products/inventory/low-stock
 * @desc    Get low stock products
 * @access  Private (Staff, Manager)
 */
router.get(
  '/inventory/low-stock',
  authenticate,
  authorize(UserRole.STAFF, UserRole.MANAGER),
  productController.getLowStock
);

/**
 * @route   GET /api/v1/products/inventory/out-of-stock
 * @desc    Get out of stock products
 * @access  Private (Staff, Manager)
 */
router.get(
  '/inventory/out-of-stock',
  authenticate,
  authorize(UserRole.STAFF, UserRole.MANAGER),
  productController.getOutOfStock
);

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
 * @desc    Create new product
 * @access  Private (Manager only)
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.MANAGER),
  productController.createProduct
);

/**
 * @route   PUT /api/v1/products/:id
 * @desc    Update product
 * @access  Private (Manager only)
 */
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.MANAGER),
  productController.updateProduct
);

/**
 * @route   DELETE /api/v1/products/:id
 * @desc    Delete product
 * @access  Private (Manager only)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.MANAGER),
  productController.deleteProduct
);

/**
 * @route   PATCH /api/v1/products/:id/inventory
 * @desc    Update product inventory
 * @access  Private (Staff, Manager)
 */
router.patch(
  '/:id/inventory',
  authenticate,
  authorize(UserRole.STAFF, UserRole.MANAGER),
  productController.updateInventory
);

export default router;