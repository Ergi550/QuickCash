import { Router } from 'express';
import orderController from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// ==================== REPORT ROUTES (must be before :id) ====================

/**
 * @route   GET /api/v1/orders/stats
 * @desc    Get order statistics
 * @access  Private (Manager+)
 */
router.get(
  '/stats',
  authenticate,
  authorize('admin', 'manager'),
  orderController.getOrderStats
);

/**
 * @route   GET /api/v1/orders/reports/today
 * @desc    Get today's orders
 * @access  Private (Staff+)
 */
router.get(
  '/reports/today',
  authenticate,
  authorize('admin', 'manager', 'staff'),
  orderController.getTodayOrders
);

/**
 * @route   GET /api/v1/orders/reports/range
 * @desc    Get orders by date range
 * @access  Private (Manager+)
 */
router.get(
  '/reports/range',
  authenticate,
  authorize('admin', 'manager'),
  orderController.getOrdersByRange
);

/**
 * @route   GET /api/v1/orders/customer/:customerId
 * @desc    Get customer's orders
 * @access  Private
 */
router.get(
  '/customer/:customerId',
  authenticate,
  orderController.getCustomerOrders
);

// ==================== ORDER ROUTES ====================

/**
 * @route   GET /api/v1/orders
 * @desc    Get all orders
 * @access  Private (Staff+)
 */
router.get(
  '/',
  authenticate,
  authorize('admin', 'manager', 'staff'),
  orderController.getAllOrders
);

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
router.get('/:id', authenticate, orderController.getOrderById);

/**
 * @route   POST /api/v1/orders
 * @desc    Create new order
 * @access  Private
 */
router.post('/', authenticate, orderController.createOrder);

/**
 * @route   PATCH /api/v1/orders/:id/status
 * @desc    Update order status
 * @access  Private (Staff+)
 */
router.patch(
  '/:id/status',
  authenticate,
  authorize('admin', 'manager', 'staff'),
  orderController.updateOrderStatus
);

/**
 * @route   DELETE /api/v1/orders/:id
 * @desc    Cancel order
 * @access  Private
 */
router.delete('/:id', authenticate, orderController.cancelOrder);

export default router;