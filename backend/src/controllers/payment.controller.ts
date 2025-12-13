import { Request, Response, NextFunction } from 'express';
import paymentService from '../services/payment.service';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Payment Controller
 * Handles HTTP requests for payment endpoints
 */
class PaymentController {
  /**
   * Process payment
   * POST /api/v1/payments/process
   */
  async processPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const paymentData = req.body;
      const staffId = req.user?.userId;

      const result = await paymentService.processPayment(paymentData, staffId);

      const statusCode = result.success ? 200 : 400;

      res.status(statusCode).json({
        success: result.success,
        message: result.message,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payment by ID
   * GET /api/v1/payments/:id
   */
  async getPaymentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const payment = await paymentService.getPaymentById(id);

      res.status(200).json({
        success: true,
        data: payment
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payments by order
   * GET /api/v1/payments/order/:orderId
   */
  async getPaymentsByOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.params;
      const payments = await paymentService.getPaymentsByOrder(orderId);

      res.status(200).json({
        success: true,
        count: payments.length,
        data: payments
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all payments
   * GET /api/v1/payments
   */
  async getAllPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payments = await paymentService.getAllPayments();

      res.status(200).json({
        success: true,
        count: payments.length,
        data: payments
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refund payment
   * POST /api/v1/payments/:id/refund
   */
  async refundPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const payment = await paymentService.refundPayment(id, reason);

      res.status(200).json({
        success: true,
        message: 'Payment refunded successfully',
        data: payment
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get total revenue
   * GET /api/v1/payments/reports/revenue
   */
  async getTotalRevenue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const revenue = await paymentService.getTotalRevenue(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.status(200).json({
        success: true,
        data: {
          revenue,
          currency: 'ALL',
          period: {
            startDate: startDate || 'Beginning',
            endDate: endDate || 'Now'
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PaymentController();