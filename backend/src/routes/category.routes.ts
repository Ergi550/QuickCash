import { Router } from 'express';
import productController from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/v1/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/', productController.getAllCategories);

/**
 * @route   GET /api/v1/categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
router.get('/:id', productController.getCategoryById);

/**
 * @route   POST /api/v1/categories
 * @desc    Create category
 * @access  Private (Manager+)
 */
router.post(
  '/',
  authenticate,
  authorize('admin', 'manager'),
  productController.createCategory
);

/**
 * @route   PUT /api/v1/categories/:id
 * @desc    Update category
 * @access  Private (Manager+)
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'manager'),
  productController.updateCategory
);

/**
 * @route   DELETE /api/v1/categories/:id
 * @desc    Delete category
 * @access  Private (Manager+)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'manager'),
  productController.deleteCategory
);

export default router;