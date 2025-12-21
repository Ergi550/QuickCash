import { query, transaction } from '../database/Connection';
import { Payment, ProcessPaymentDTO, PaymentResponse } from '../models/payment.model';
import { OrderStatus, PaymentStatus } from '../models/order.model';
import { AppError } from '../middleware/error.middleware';

/**
 * Payment Service
 * Handles payment processing with PostgreSQL
 */
class PaymentService {
  /**
   * Process payment
   */
  async processPayment(
    paymentData: ProcessPaymentDTO,
    staffId?: number
  ): Promise<PaymentResponse> {
    return transaction(async (client) => {
      // Get order
      const orderResult = await client.query(
        'SELECT * FROM orders WHERE order_id = $1',
        [paymentData.order_id]
      );

      if (orderResult.rows.length === 0) {
        throw new AppError('Porosia nuk u gjet', 404);
      }

      const order = orderResult.rows[0];

      // Check if order already fully paid
      const existingPayments = await client.query(
        `SELECT COALESCE(SUM(amount_paid), 0) as total_paid 
         FROM payments 
         WHERE order_id = $1 AND payment_status = 'paid'`,
        [paymentData.order_id]
      );
      
      const totalPaid = parseFloat(existingPayments.rows[0].total_paid);
      const amountDue = Number(order.total_amount) - totalPaid;

      if (amountDue <= 0) {
        throw new AppError('Porosia është paguar tashmë', 400);
      }

      // Validate payment amount
      if (paymentData.amount_paid < amountDue && paymentData.payment_method !== 'cash') {
        throw new AppError('Shuma e pagesës është më e vogël se totali i porosisë', 400);
      }

      // Calculate change
      const changeAmount = paymentData.amount_paid > amountDue 
        ? paymentData.amount_paid - amountDue 
        : 0;

      // Generate receipt number
      const receiptResult = await client.query(
        `SELECT 'RCP-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
                LPAD((COALESCE(MAX(CAST(SUBSTRING(receipt_number FROM '[0-9]+$') AS INT)), 0) + 1)::text, 6, '0') as receipt_number
         FROM payments 
         WHERE receipt_number LIKE 'RCP-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-%'`
      );
      const receiptNumber = receiptResult.rows[0].receipt_number;

      // Simulate payment gateway for card payments
      let transactionId = null;
      if (paymentData.payment_method === 'card') {
        const gatewayResult = await this.simulatePaymentGateway(paymentData.amount_paid);
        if (!gatewayResult.success) {
          // Record failed payment
          await client.query(
            `INSERT INTO payments (
              order_id, payment_method, payment_status, amount_paid, amount_due,
              receipt_number, processed_by, processed_at
            )
            VALUES ($1, $2, 'failed', $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
            [
              paymentData.order_id,
              paymentData.payment_method,
              paymentData.amount_paid,
              amountDue,
              receiptNumber,
              staffId || null,
            ]
          );

          return {
            success: false,
            payment: {} as Payment,
            message: gatewayResult.message,
          };
        }
        transactionId = gatewayResult.transactionId;
      }

      // Create payment record
      const paymentResult = await client.query(
        `INSERT INTO payments (
          order_id, payment_method, payment_status, amount_paid, amount_due,
          change_amount, card_last_four, card_brand, transaction_id,
          receipt_number, processed_by, processed_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
        RETURNING *`,
        [
          paymentData.order_id,
          paymentData.payment_method,
          PaymentStatus.PAID,
          paymentData.amount_paid,
          amountDue,
          changeAmount,
          paymentData.card_last_four || null,
          paymentData.card_brand || null,
          transactionId,
          receiptNumber,
          staffId || null,
        ]
      );

      const payment = paymentResult.rows[0];

      // Update order status to completed
      await client.query(
        `UPDATE orders 
         SET status = $1, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE order_id = $2`,
        [OrderStatus.COMPLETED, paymentData.order_id]
      );

      return {
        success: true,
        payment,
        receipt_url: `/receipts/${receiptNumber}.pdf`,
        message: 'Pagesa u krye me sukses',
        change_amount: changeAmount,
      };
    });
  }

  /**
   * Simulate payment gateway
   */
  private async simulatePaymentGateway(
    amount: number
  ): Promise<{ success: boolean; transactionId?: string; message?: string }> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock success rate: 95%
    const isSuccessful = Math.random() > 0.05;

    if (!isSuccessful) {
      return {
        success: false,
        message: 'Pagesa u refuzua. Ju lutem provoni përsëri.',
      };
    }

    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    return {
      success: true,
      transactionId,
    };
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: number): Promise<Payment> {
    const result = await query(
      `SELECT p.*, o.order_number, u.full_name as staff_name
       FROM payments p
       JOIN orders o ON p.order_id = o.order_id
       LEFT JOIN users u ON p.processed_by = u.user_id
       WHERE p.payment_id = $1`,
      [paymentId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Pagesa nuk u gjet', 404);
    }

    return result.rows[0];
  }

  /**
   * Get payments by order ID
   */
  async getPaymentsByOrder(orderId: number): Promise<Payment[]> {
    const result = await query(
      `SELECT p.*, u.full_name as staff_name
       FROM payments p
       LEFT JOIN users u ON p.processed_by = u.user_id
       WHERE p.order_id = $1 
       ORDER BY p.created_at DESC`,
      [orderId]
    );
    return result.rows;
  }

  /**
   * Get all payments
   */
  async getAllPayments(status?: string): Promise<Payment[]> {
    let queryText = `
      SELECT p.*, o.order_number, u.full_name as staff_name
      FROM payments p
      JOIN orders o ON p.order_id = o.order_id
      LEFT JOIN users u ON p.processed_by = u.user_id
    `;
    const params: any[] = [];

    if (status) {
      queryText += ' WHERE p.payment_status = $1';
      params.push(status);
    }

    queryText += ' ORDER BY p.created_at DESC';

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentId: number, reason?: string): Promise<Payment> {
    return transaction(async (client) => {
      // Get payment
      const paymentResult = await client.query(
        'SELECT * FROM payments WHERE payment_id = $1',
        [paymentId]
      );

      if (paymentResult.rows.length === 0) {
        throw new AppError('Pagesa nuk u gjet', 404);
      }

      const payment = paymentResult.rows[0];

      if (payment.payment_status !== PaymentStatus.PAID) {
        throw new AppError('Nuk mund të rimbursohet pagesa e papaguar', 400);
      }

      // Update payment status
      const updateResult = await client.query(
        `UPDATE payments 
         SET payment_status = $1 
         WHERE payment_id = $2 
         RETURNING *`,
        [PaymentStatus.REFUNDED, paymentId]
      );

      // Create refund record
      await client.query(
        `INSERT INTO refunds (payment_id, order_id, amount, reason, status, processed_at)
         VALUES ($1, $2, $3, $4, 'completed', CURRENT_TIMESTAMP)`,
        [paymentId, payment.order_id, payment.amount_paid, reason || 'Rimbursim']
      );

      return updateResult.rows[0];
    });
  }

  /**
   * Get total revenue
   */
  async getTotalRevenue(startDate?: Date, endDate?: Date): Promise<number> {
    let queryText = `
      SELECT COALESCE(SUM(amount_paid), 0) as revenue 
      FROM payments 
      WHERE payment_status = 'paid'
    `;
    const params: any[] = [];

    if (startDate) {
      params.push(startDate);
      queryText += ` AND created_at >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      queryText += ` AND created_at <= $${params.length}`;
    }

    const result = await query(queryText, params);
    return parseFloat(result.rows[0].revenue);
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(startDate?: Date, endDate?: Date): Promise<{
    totalPayments: number;
    successfulPayments: number;
    failedPayments: number;
    refundedPayments: number;
    totalRevenue: number;
    byMethod: { payment_method: string; count: number; total: number }[];
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

    const totalResult = await query(`SELECT COUNT(*) as count FROM payments WHERE 1=1${dateFilter}`, params);
    const successResult = await query(`SELECT COUNT(*) as count FROM payments WHERE payment_status = 'paid'${dateFilter}`, params);
    const failedResult = await query(`SELECT COUNT(*) as count FROM payments WHERE payment_status = 'failed'${dateFilter}`, params);
    const refundedResult = await query(`SELECT COUNT(*) as count FROM payments WHERE payment_status = 'refunded'${dateFilter}`, params);
    const revenueResult = await query(`SELECT COALESCE(SUM(amount_paid), 0) as revenue FROM payments WHERE payment_status = 'paid'${dateFilter}`, params);
    const byMethodResult = await query(
      `SELECT payment_method, COUNT(*) as count, COALESCE(SUM(amount_paid), 0) as total 
       FROM payments 
       WHERE payment_status = 'paid'${dateFilter} 
       GROUP BY payment_method`,
      params
    );

    return {
      totalPayments: parseInt(totalResult.rows[0].count),
      successfulPayments: parseInt(successResult.rows[0].count),
      failedPayments: parseInt(failedResult.rows[0].count),
      refundedPayments: parseInt(refundedResult.rows[0].count),
      totalRevenue: parseFloat(revenueResult.rows[0].revenue),
      byMethod: byMethodResult.rows.map((row) => ({
        payment_method: row.payment_method,
        count: parseInt(row.count),
        total: parseFloat(row.total),
      })),
    };
  }

  /**
   * Get daily revenue report
   */
  async getDailyRevenue(days: number = 30): Promise<{ date: string; revenue: number; orders: number }[]> {
    const result = await query(
      `SELECT 
         DATE(created_at) as date,
         COALESCE(SUM(amount_paid), 0) as revenue,
         COUNT(*) as orders
       FROM payments 
       WHERE payment_status = 'paid' 
         AND created_at >= CURRENT_DATE - INTERVAL '${days} days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`
    );

    return result.rows.map((row) => ({
      date: row.date,
      revenue: parseFloat(row.revenue),
      orders: parseInt(row.orders),
    }));
  }
}

export default new PaymentService();