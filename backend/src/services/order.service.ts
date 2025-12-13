import { Order, OrderItem, CreateOrderDTO, OrderStatus, PaymentStatus } from '../models/order.model';
import { AppError } from '../middleware/error.middleware';
import productService from './product.service';
import ordersData from '../data/orders.json';

/**
 * Order Service
 * Handles order creation and management
 */
class OrderService {
  private orders: Order[];
  private orderCounter: number;

  constructor() {
    // Load mock orders
    this.orders = ordersData as Order[];
    this.orderCounter = this.orders.length + 1;
  }

  /**
   * Get all orders
   * @param status - Filter by status
   * @returns List of orders
   */
  async getAllOrders(status?: OrderStatus): Promise<Order[]> {
    if (status) {
      return this.orders.filter(o => o.status === status);
    }
    return this.orders;
  }

  /**
   * Get order by ID
   * @param orderId - Order ID
   * @returns Order
   */
  async getOrderById(orderId: string): Promise<Order> {
    const order = this.orders.find(o => o.id === orderId);
    
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    return order;
  }

  /**
   * Get orders by customer ID
   * @param customerId - Customer ID
   * @returns List of customer orders
   */
  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return this.orders.filter(o => o.customerId === customerId);
  }

  /**
   * Create new order
   * @param orderData - Order creation data
   * @param staffId - Optional staff ID
   * @returns Created order
   */
  async createOrder(orderData: CreateOrderDTO, staffId?: string): Promise<Order> {
    // Validate and calculate order items
    const items: OrderItem[] = [];
    let subtotal = 0;

    for (const item of orderData.items) {
      // Get product details
      const product = await productService.getProductById(item.productId);

      // Check stock
      const hasStock = await productService.checkStock(item.productId, item.quantity);
      if (!hasStock) {
        throw new AppError(`Product ${product.name} is out of stock`, 400);
      }

      // Calculate item subtotal
      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      // Add to items
      items.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        subtotal: itemSubtotal,
        notes: item.notes
      });

      // Update inventory
      await productService.updateInventory({
        productId: product.id,
        quantity: item.quantity,
        action: 'subtract'
      });
    }

    // Calculate totals (20% tax)
    const tax = subtotal * 0.20;
    const total = subtotal + tax;

    // Generate order number
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(this.orderCounter).padStart(4, '0')}`;
    this.orderCounter++;

    // Create order
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      orderNumber,
      customerId: orderData.customerId,
      customerName: orderData.customerName,
      items,
      subtotal,
      tax,
      discount: 0,
      total,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      tableNumber: orderData.tableNumber,
      notes: orderData.notes,
      staffId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.orders.push(newOrder);
    return newOrder;
  }

  /**
   * Update order status
   * @param orderId - Order ID
   * @param status - New status
   * @returns Updated order
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const order = await this.getOrderById(orderId);
    
    order.status = status;
    order.updatedAt = new Date();

    return order;
  }

  /**
   * Update payment status
   * @param orderId - Order ID
   * @param paymentStatus - New payment status
   * @param paymentMethod - Payment method used
   * @returns Updated order
   */
  async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
    paymentMethod?: string
  ): Promise<Order> {
    const order = await this.getOrderById(orderId);
    
    order.paymentStatus = paymentStatus;
    if (paymentMethod) {
      order.paymentMethod = paymentMethod as any;
    }
    order.updatedAt = new Date();

    return order;
  }

  /**
   * Cancel order
   * @param orderId - Order ID
   * @returns Cancelled order
   */
  async cancelOrder(orderId: string): Promise<Order> {
    const order = await this.getOrderById(orderId);

    // Can only cancel pending/confirmed orders
    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
      throw new AppError('Cannot cancel order at this stage', 400);
    }

    // Restore inventory
    for (const item of order.items) {
      await productService.updateInventory({
        productId: item.productId,
        quantity: item.quantity,
        action: 'add'
      });
    }

    order.status = OrderStatus.CANCELLED;
    order.updatedAt = new Date();

    return order;
  }

  /**
   * Get today's orders
   * @returns Today's orders
   */
  async getTodayOrders(): Promise<Order[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= today;
    });
  }

  /**
   * Get orders by date range
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Orders in range
   */
  async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    return this.orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
  }

  /**
   * Calculate total revenue
   * @param orders - List of orders
   * @returns Total revenue
   */
  calculateRevenue(orders: Order[]): number {
    return orders
      .filter(o => o.paymentStatus === PaymentStatus.PAID)
      .reduce((sum, o) => sum + o.total, 0);
  }
}

export default new OrderService();