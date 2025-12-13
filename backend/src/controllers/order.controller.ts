import { Request, Response, NextFunction } from 'express';
import orderService from '../services/order.service';
import { OrderStatus } from '../models/order.model';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Order Controller
 * Handles HTTP requests for order endpoints
 */
class OrderController {
  /**
   * Get all orders
   * GET /api/v1/orders
   */
  async getAllOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.query;
      
      const orders = await orderService.getAllOrders(status as OrderStatus);

      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
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
      const order = await orderService.getOrderById(id);

      res.status(200).json({
        success: true,
        data: order
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
      const orders = await orderService.getOrdersByCustomer(customerId);

      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
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
        message: 'Order created successfully',
        data: order
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

      const order = await orderService.updateOrderStatus(id, status);

      res.status(200).json({
        success: true,
        message: 'Order status updated',
        data: order
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
      const order = await orderService.cancelOrder(id);

      res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        data: order
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
      const revenue = orderService.calculateRevenue(orders);

      res.status(200).json({
        success: true,
        count: orders.length,
        revenue,
        data: orders
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
          message: 'Start date and end date are required'
        });
        return;
      }

      const orders = await orderService.getOrdersByDateRange(
        new Date(startDate as string),
        new Date(endDate as string)
      );

      const revenue = orderService.calculateRevenue(orders);

      res.status(200).json({
        success: true,
        count: orders.length,
        revenue,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderController();