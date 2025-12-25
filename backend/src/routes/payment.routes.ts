import { Router } from 'express';
import paymentController from '../controllers/payment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// ==================== REPORT ROUTES (must be before :id) ====================

/**
 * @route   GET /api/v1/payments/stats
 * @desc    Get payment statistics
 * @access  Private (Manager+)
 */
router.get(
  '/stats',
  authenticate,
  authorize('admin', 'manager'),
  paymentController.getPaymentStats
);

/**
 * @route   GET /api/v1/payments/reports/revenue
 * @desc    Get total revenue
 * @access  Private (Manager+)
 */
router.get(
  '/reports/revenue',
  authenticate,
  authorize('admin', 'manager'),
  paymentController.getTotalRevenue
);

/**
 * @route   GET /api/v1/payments/reports/daily
 * @desc    Get daily revenue report
 * @access  Private (Manager+)
 */
router.get(
  '/reports/daily',
  authenticate,
  authorize('admin', 'manager'),
  paymentController.getDailyRevenue
);

/**
 * @route   GET /api/v1/payments/order/:orderId
 * @desc    Get payments by order
 * @access  Private
 */
router.get('/order/:orderId', authenticate, paymentController.getPaymentsByOrder);

// ==================== PAYMENT ROUTES ====================

/**
 * @route   GET /api/v1/payments
 * @desc    Get all payments
 * @access  Private (Staff+)
 */
router.get(
  '/',
  authenticate,
  authorize('admin', 'manager', 'staff'),
  paymentController.getAllPayments
);

/**
 * @route   GET /api/v1/payments/:id
 * @desc    Get payment by ID
 * @access  Private
 */
router.get('/:id', authenticate, paymentController.getPaymentById);

/**
 * @route   POST /api/v1/payments/process
 * @desc    Process payment
 * @access  Private (Staff+)
 */
router.post(
  '/process',
  authenticate,
  authorize('admin', 'manager', 'staff','customer'),
  paymentController.processPayment
);

/**
 * @route   POST /api/v1/payments/:id/refund
 * @desc    Refund payment
 * @access  Private (Manager+)
 */
router.post(
  '/:id/refund',
  authenticate,
  authorize('admin', 'manager'),
  paymentController.refundPayment
);

export default router;