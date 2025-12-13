import { Payment, ProcessPaymentDTO, PaymentResponse } from '../models/payment.model';
import { PaymentMethod, PaymentStatus } from '../models/order.model';
import { AppError } from '../middleware/error.middleware';
import orderService from './order.service';

/**
 * Payment Service
 * Handles payment processing
 */
class PaymentService {
  private payments: Payment[] = [];
  private receiptCounter: number = 1;

  /**
   * Process payment
   * @param paymentData - Payment data
   * @param staffId - Staff processing payment
   * @returns Payment response
   */
  async processPayment(
    paymentData: ProcessPaymentDTO,
    staffId?: string
  ): Promise<PaymentResponse> {
    // Get order
    const order = await orderService.getOrderById(paymentData.orderId);

    // Validate payment amount
    if (paymentData.amount < order.total) {
      throw new AppError('Payment amount is less than order total', 400);
    }

    // Check if order already paid
    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new AppError('Order has already been paid', 400);
    }

    // Generate receipt number
    const receiptNumber = `RCP-${new Date().getFullYear()}-${String(this.receiptCounter).padStart(6, '0')}`;
    this.receiptCounter++;

    // Simulate payment processing based on method
    const paymentResult = await this.simulatePaymentGateway(
      paymentData.method,
      paymentData.amount
    );

    if (!paymentResult.success) {
      // Payment failed
      const failedPayment: Payment = {
        id: `payment-${Date.now()}`,
        orderId: paymentData.orderId,
        amount: paymentData.amount,
        method: paymentData.method,
        status: PaymentStatus.FAILED,
        receiptNumber,
        processedBy: staffId,
        processedAt: new Date(),
        notes: paymentData.notes || 'Payment failed',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.payments.push(failedPayment);

      return {
        success: false,
        payment: failedPayment,
        message: paymentResult.message
      };
    }

    // Payment successful
    const payment: Payment = {
      id: `payment-${Date.now()}`,
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      method: paymentData.method,
      status: PaymentStatus.PAID,
      transactionId: paymentResult.transactionId,
      receiptNumber,
      processedBy: staffId,
      processedAt: new Date(),
      notes: paymentData.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.payments.push(payment);

    // Update order payment status
    await orderService.updatePaymentStatus(
      paymentData.orderId,
      PaymentStatus.PAID,
      paymentData.method
    );

    // Update order status to completed
    await orderService.updateOrderStatus(paymentData.orderId, 'completed' as any);

    return {
      success: true,
      payment,
      receiptUrl: `/receipts/${receiptNumber}.pdf`,
      message: 'Payment processed successfully'
    };
  }

  /**
   * Simulate payment gateway
   * (In production, this would call Stripe/PayPal API)
   */
  private async simulatePaymentGateway(
    method: PaymentMethod,
    amount: number
  ): Promise<{ success: boolean; transactionId?: string; message?: string }> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock success rate: 95%
    const isSuccessful = Math.random() > 0.05;

    if (!isSuccessful) {
      return {
        success: false,
        message: 'Payment declined. Please try again.'
      };
    }

    // Generate mock transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    return {
      success: true,
      transactionId
    };
  }

  /**
   * Get payment by ID
   * @param paymentId - Payment ID
   * @returns Payment
   */
  async getPaymentById(paymentId: string): Promise<Payment> {
    const payment = this.payments.find(p => p.id === paymentId);
    
    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    return payment;
  }

  /**
   * Get payments by order ID
   * @param orderId - Order ID
   * @returns List of payments
   */
  async getPaymentsByOrder(orderId: string): Promise<Payment[]> {
    return this.payments.filter(p => p.orderId === orderId);
  }

  /**
   * Get all payments
   * @returns List of all payments
   */
  async getAllPayments(): Promise<Payment[]> {
    return this.payments;
  }

  /**
   * Refund payment
   * @param paymentId - Payment ID
   * @param reason - Refund reason
   * @returns Updated payment
   */
  async refundPayment(paymentId: string, reason?: string): Promise<Payment> {
    const payment = await this.getPaymentById(paymentId);

    if (payment.status !== PaymentStatus.PAID) {
      throw new AppError('Cannot refund unpaid payment', 400);
    }

    payment.status = PaymentStatus.REFUNDED;
    payment.notes = reason || 'Refunded';
    payment.updatedAt = new Date();

    // Update order payment status
    await orderService.updatePaymentStatus(
      payment.orderId,
      PaymentStatus.REFUNDED
    );

    return payment;
  }

  /**
   * Get total revenue
   * @param startDate - Optional start date
   * @param endDate - Optional end date
   * @returns Total revenue
   */
  async getTotalRevenue(startDate?: Date, endDate?: Date): Promise<number> {
    let payments = this.payments.filter(p => p.status === PaymentStatus.PAID);

    if (startDate || endDate) {
      payments = payments.filter(p => {
        const paymentDate = new Date(p.createdAt);
        if (startDate && paymentDate < startDate) return false;
        if (endDate && paymentDate > endDate) return false;
        return true;
      });
    }

    return payments.reduce((sum, p) => sum + p.amount, 0);
  }
}

export default new PaymentService();