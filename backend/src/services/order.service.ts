import { query, transaction } from '../database/Connection';
import {
  Order,
  OrderItem,
  CreateOrderDTO,
  OrderStatus,
  OrderWithItems,
} from '../models/order.model';
import { AppError } from '../middleware/error.middleware';
import productService from './product.service';

/**
 * Order Service
 * Handles order creation and management with PostgreSQL
 */
class OrderService {
  /**
   * Get all orders
   */
  async getAllOrders(status?: string): Promise<Order[]> {
    let queryText = `
      SELECT o.*, 
             c.first_name || ' ' || COALESCE(c.last_name, '') as customer_name,
             u.full_name as staff_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      LEFT JOIN users u ON o.staff_id = u.user_id
    `;
    const params: any[] = [];

    if (status) {
      queryText += ' WHERE o.status = $1';
      params.push(status);
    }

    queryText += ' ORDER BY o.created_at DESC';

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Get order by ID with items
   */
  async getOrderById(orderId: number): Promise<OrderWithItems> {
    // Get order
    const orderResult = await query(
      `SELECT o.*, 
              c.first_name || ' ' || COALESCE(c.last_name, '') as customer_name,
              u.full_name as staff_name
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.customer_id
       LEFT JOIN users u ON o.staff_id = u.user_id
       WHERE o.order_id = $1`,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      throw new AppError('Porosia nuk u gjet', 404);
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [orderId]
    );

    return {
      ...order,
      items: itemsResult.rows,
    };
  }

  /**
   * Get orders by customer ID
   */
  async getOrdersByCustomer(customerId: number): Promise<Order[]> {
    const result = await query(
      `SELECT o.*, u.full_name as staff_name
       FROM orders o
       LEFT JOIN users u ON o.staff_id = u.user_id
       WHERE o.customer_id = $1 
       ORDER BY o.created_at DESC`,
      [customerId]
    );
    return result.rows;
  }

  /**
   * Create new order
   */
  async createOrder(orderData: CreateOrderDTO, staffId?: number): Promise<OrderWithItems> {
    return transaction(async (client) => {
      // Validate and calculate order items
      const items: OrderItem[] = [];
      let subtotal = 0;
      let totalTax = 0;

      for (const item of orderData.items) {
        // Get product details
        const product = await productService.getProductById(item.product_id);

        // Check stock
        const hasStock = await productService.checkStock(item.product_id, item.quantity);
        if (!hasStock) {
          throw new AppError(`Produkti ${product.product_name} nuk ka stok të mjaftueshëm`, 400);
        }

        // Calculate item values
        const itemSubtotal = Number(product.selling_price) * item.quantity;
        const itemTax = itemSubtotal * (Number(product.tax_rate || 0) / 100);
        const itemTotal = itemSubtotal + itemTax;
        
        subtotal += itemSubtotal;
        totalTax += itemTax;

        items.push({
          product_id: product.product_id,
          product_name: product.product_name,
          quantity: item.quantity,
          unit_price: Number(product.selling_price),
          subtotal: itemSubtotal,
          discount_amount: 0,
          tax_amount: itemTax,
          total_price: itemTotal,
          notes: item.notes,
        });
      }

      // Calculate totals
      const discountAmount = orderData.discount_amount || 0;
      const totalAmount = subtotal + totalTax - discountAmount;

      // Generate order number
     // Generate order number
const orderNumberResult = await client.query(
  `SELECT 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
          LPAD((COALESCE(MAX(CAST(SUBSTRING(order_number FROM '[0-9]+$') AS INT)), 0) + 1)::text, 4, '0') as order_number
   FROM orders 
   WHERE order_number LIKE 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-%'`
);
      const orderNumber = orderNumberResult.rows[0].order_number;

      // Create order
      const orderResult = await client.query(
        `INSERT INTO orders (
          order_number, customer_id, staff_id, order_type, table_number,
          status, subtotal, discount_amount, discount_reason, tax_amount, total_amount, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [
          orderNumber,
          orderData.customer_id || null,
          staffId || null,
          orderData.order_type || 'dine_in',
          orderData.table_number || null,
          OrderStatus.PENDING,
          subtotal,
          discountAmount,
          orderData.discount_reason || null,
          totalTax,
          totalAmount,
          orderData.notes || null,
        ]
      );

      const newOrder = orderResult.rows[0];

      // Create order items and update inventory
      const createdItems: OrderItem[] = [];
      for (const item of items) {
        const itemResult = await client.query(
          `INSERT INTO order_items (
            order_id, product_id, product_name, quantity, unit_price,
            subtotal, discount_amount, tax_amount, total_price, notes
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING *`,
          [
            newOrder.order_id,
            item.product_id,
            item.product_name,
            item.quantity,
            item.unit_price,
            item.subtotal,
            item.discount_amount || 0,
            item.tax_amount || 0,
            item.total_price,
            item.notes || null,
          ]
        );
        createdItems.push(itemResult.rows[0]);

        // Update inventory
        await client.query(
          `UPDATE inventory 
           SET current_quantity = current_quantity - $1,
               total_sold = COALESCE(total_sold, 0) + $1,
               updated_at = CURRENT_TIMESTAMP
           WHERE product_id = $2`,
          [item.quantity, item.product_id]
        );
      }

      return {
        ...newOrder,
        items: createdItems,
      };
    });
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    let additionalUpdate = '';
    
    if (status === OrderStatus.PREPARING) {
      additionalUpdate = ', started_at = CURRENT_TIMESTAMP';
    } else if (status === OrderStatus.COMPLETED) {
      additionalUpdate = ', completed_at = CURRENT_TIMESTAMP';
    }

    const result = await query(
      `UPDATE orders 
       SET status = $1, updated_at = CURRENT_TIMESTAMP ${additionalUpdate}
       WHERE order_id = $2 
       RETURNING *`,
      [status, orderId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Porosia nuk u gjet', 404);
    }

    return result.rows[0];
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: number, reason?: string): Promise<Order> {
    return transaction(async (client) => {
      // Get order
      const orderResult = await client.query(
        'SELECT * FROM orders WHERE order_id = $1',
        [orderId]
      );

      if (orderResult.rows.length === 0) {
        throw new AppError('Porosia nuk u gjet', 404);
      }

      const order = orderResult.rows[0];

      // Can only cancel pending/confirmed orders
      if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
        throw new AppError('Nuk mund të anulohet porosia në këtë fazë', 400);
      }

      // Get order items
      const itemsResult = await client.query(
        'SELECT * FROM order_items WHERE order_id = $1',
        [orderId]
      );

      // Restore inventory
      for (const item of itemsResult.rows) {
        await client.query(
          `UPDATE inventory 
           SET current_quantity = current_quantity + $1,
               total_sold = COALESCE(total_sold, 0) - $1,
               updated_at = CURRENT_TIMESTAMP
           WHERE product_id = $2`,
          [item.quantity, item.product_id]
        );
      }

      // Update order status
      const updateResult = await client.query(
        `UPDATE orders 
         SET status = $1, 
             cancelled_at = CURRENT_TIMESTAMP,
             cancellation_reason = $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE order_id = $3 
         RETURNING *`,
        [OrderStatus.CANCELLED, reason || null, orderId]
      );

      return updateResult.rows[0];
    });
  }

  /**
   * Get today's orders
   */
  async getTodayOrders(): Promise<Order[]> {
    const result = await query(
      `SELECT o.*, 
              c.first_name || ' ' || COALESCE(c.last_name, '') as customer_name,
              u.full_name as staff_name
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.customer_id
       LEFT JOIN users u ON o.staff_id = u.user_id
       WHERE DATE(o.created_at) = CURRENT_DATE
       ORDER BY o.created_at DESC`
    );
    return result.rows;
  }

  /**
   * Get orders by date range
   */
  async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    const result = await query(
      `SELECT o.*, 
              c.first_name || ' ' || COALESCE(c.last_name, '') as customer_name,
              u.full_name as staff_name
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.customer_id
       LEFT JOIN users u ON o.staff_id = u.user_id
       WHERE o.created_at >= $1 AND o.created_at <= $2
       ORDER BY o.created_at DESC`,
      [startDate, endDate]
    );
    return result.rows;
  }

  /**
   * Calculate revenue
   */
  async calculateRevenue(startDate?: Date, endDate?: Date): Promise<number> {
    let queryText = `
      SELECT COALESCE(SUM(o.total_amount), 0) as revenue 
      FROM orders o
      JOIN payments p ON o.order_id = p.order_id
      WHERE p.payment_status = 'paid'
    `;
    const params: any[] = [];

    if (startDate) {
      params.push(startDate);
      queryText += ` AND o.created_at >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      queryText += ` AND o.created_at <= $${params.length}`;
    }

    const result = await query(queryText, params);
    return parseFloat(result.rows[0].revenue);
  }

  /**
   * Get order statistics
   */
  async getOrderStats(startDate?: Date, endDate?: Date): Promise<{
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    revenue: number;
    averageOrderValue: number;
  }> {
    let dateFilter = '';
    const params: any[] = [];

    if (startDate) {
      params.push(startDate);
      dateFilter += ` AND created_at >= $${params.length}`;
    }
    if (endDate) {
      params.push(endDate);
      dateFilter += ` AND created_at <= $${params.length}`;
    }

    const totalResult = await query(`SELECT COUNT(*) as count FROM orders WHERE 1=1${dateFilter}`, params);
    const pendingResult = await query(`SELECT COUNT(*) as count FROM orders WHERE status = 'pending'${dateFilter}`, params);
    const completedResult = await query(`SELECT COUNT(*) as count FROM orders WHERE status = 'completed'${dateFilter}`, params);
    const cancelledResult = await query(`SELECT COUNT(*) as count FROM orders WHERE status = 'cancelled'${dateFilter}`, params);
    
    const revenue = await this.calculateRevenue(startDate, endDate);
    
    const avgResult = await query(
      `SELECT COALESCE(AVG(total_amount), 0) as avg FROM orders WHERE status = 'completed'${dateFilter}`,
      params
    );

    return {
      totalOrders: parseInt(totalResult.rows[0].count),
      pendingOrders: parseInt(pendingResult.rows[0].count),
      completedOrders: parseInt(completedResult.rows[0].count),
      cancelledOrders: parseInt(cancelledResult.rows[0].count),
      revenue,
      averageOrderValue: parseFloat(avgResult.rows[0].avg),
    };
  }
}

export default new OrderService();