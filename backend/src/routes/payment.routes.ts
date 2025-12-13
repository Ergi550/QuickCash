import { Router } from 'express';
import paymentController from '../controllers/payment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

/**
 * @route   GET /api/v1/payments/reports/revenue
 * @desc    Get total revenue
 * @access  Private (Manager)
 */
router.get(
  '/reports/revenue',
  authenticate,
  authorize(UserRole.MANAGER),
  paymentController.getTotalRevenue
);

/**
 * @route   GET /api/v1/payments/order/:orderId
 * @desc    Get payments by order
 * @access  Private
 */
router.get(
  '/order/:orderId',
  authenticate,
  paymentController.getPaymentsByOrder
);

/**
 * @route   GET /api/v1/payments
 * @desc    Get all payments
 * @access  Private (Staff, Manager)
 */
router.get(
  '/',
  authenticate,
  authorize(UserRole.STAFF, UserRole.MANAGER),
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
 * @access  Private (Staff, Manager)
 */
router.post(
  '/process',
  authenticate,
  authorize(UserRole.STAFF, UserRole.MANAGER),
  paymentController.processPayment
);

/**
 * @route   POST /api/v1/payments/:id/refund
 * @desc    Refund payment
 * @access  Private (Manager)
 */
router.post(
  '/:id/refund',
  authenticate,
  authorize(UserRole.MANAGER),
  paymentController.refundPayment
);

export default router;