import { Router } from 'express';
import orderController from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

/**
 * @route   GET /api/v1/orders/reports/today
 * @desc    Get today's orders and revenue
 * @access  Private (Staff, Manager)
 */
router.get(
  '/reports/today',
  authenticate,
  authorize(UserRole.STAFF, UserRole.MANAGER),
  orderController.getTodayOrders
);

/**
 * @route   GET /api/v1/orders/reports/range
 * @desc    Get orders by date range
 * @access  Private (Manager)
 */
router.get(
  '/reports/range',
  authenticate,
  authorize(UserRole.MANAGER),
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

/**
 * @route   GET /api/v1/orders
 * @desc    Get all orders
 * @access  Private (Staff, Manager)
 */
router.get(
  '/',
  authenticate,
  authorize(UserRole.STAFF, UserRole.MANAGER),
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
 * @access  Private (Staff, Manager, Customer)
 */
router.post('/', authenticate, orderController.createOrder);

/**
 * @route   PATCH /api/v1/orders/:id/status
 * @desc    Update order status
 * @access  Private (Staff, Manager)
 */
router.patch(
  '/:id/status',
  authenticate,
  authorize(UserRole.STAFF, UserRole.MANAGER),
  orderController.updateOrderStatus
);

/**
 * @route   DELETE /api/v1/orders/:id
 * @desc    Cancel order
 * @access  Private
 */
router.delete('/:id', authenticate, orderController.cancelOrder);

export default router;