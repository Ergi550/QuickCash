import { Request, Response, NextFunction } from 'express';
import orderService from '../services/order.service';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Order Controller
 */
class OrderController {
  /**
   * Get all orders
   * GET /api/v1/orders
   */
  async getAllOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.query;
      const orders = await orderService.getAllOrders(status as string);

      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order by ID
   * GET /api/v1/orders/:id
   */
  async getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(parseInt(id));

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get customer's orders
   * GET /api/v1/orders/customer/:customerId
   */
  async getCustomerOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { customerId } = req.params;
      const orders = await orderService.getOrdersByCustomer(parseInt(customerId));

      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new order
   * POST /api/v1/orders
   */
  async createOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderData = req.body;
      const staffId = req.user?.userId;

      const order = await orderService.createOrder(orderData, staffId);

      res.status(201).json({
        success: true,
        message: 'Porosia u krijua me sukses',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update order status
   * PATCH /api/v1/orders/:id/status
   */
  async updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const order = await orderService.updateOrderStatus(parseInt(id), status);

      res.status(200).json({
        success: true,
        message: 'Statusi i porosisë u përditësua',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel order
   * DELETE /api/v1/orders/:id
   */
  async cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const order = await orderService.cancelOrder(parseInt(id), reason);

      res.status(200).json({
        success: true,
        message: 'Porosia u anulua',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get today's orders
   * GET /api/v1/orders/reports/today
   */
  async getTodayOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orders = await orderService.getTodayOrders();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const revenue = await orderService.calculateRevenue(today, new Date());

      res.status(200).json({
        success: true,
        count: orders.length,
        revenue,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get orders by date range
   * GET /api/v1/orders/reports/range
   */
  async getOrdersByRange(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'Data e fillimit dhe mbarimit janë të detyrueshme',
        });
        return;
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      const orders = await orderService.getOrdersByDateRange(start, end);
      const revenue = await orderService.calculateRevenue(start, end);

      res.status(200).json({
        success: true,
        count: orders.length,
        revenue,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order statistics
   * GET /api/v1/orders/stats
   */
  async getOrderStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const stats = await orderService.getOrderStats(
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
}

export default new OrderController();