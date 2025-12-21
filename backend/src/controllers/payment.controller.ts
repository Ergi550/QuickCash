import { Request, Response, NextFunction } from 'express';
import paymentService from '../services/payment.service';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Payment Controller
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
        data: result,
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
      const payment = await paymentService.getPaymentById(parseInt(id));

      res.status(200).json({
        success: true,
        data: payment,
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
      const payments = await paymentService.getPaymentsByOrder(parseInt(orderId));

      res.status(200).json({
        success: true,
        count: payments.length,
        data: payments,
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
      const { status } = req.query;
      const payments = await paymentService.getAllPayments(status as string);

      res.status(200).json({
        success: true,
        count: payments.length,
        data: payments,
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

      const payment = await paymentService.refundPayment(parseInt(id), reason);

      res.status(200).json({
        success: true,
        message: 'Pagesa u rimbursua me sukses',
        data: payment,
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
            startDate: startDate || 'Fillimi',
            endDate: endDate || 'Tani',
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payment statistics
   * GET /api/v1/payments/stats
   */
  async getPaymentStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const stats = await paymentService.getPaymentStats(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get daily revenue report
   * GET /api/v1/payments/reports/daily
   */
  async getDailyRevenue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const data = await paymentService.getDailyRevenue(days);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PaymentController();