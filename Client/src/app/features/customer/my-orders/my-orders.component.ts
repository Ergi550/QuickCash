import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaymentService } from '../../../core/services/payment.service';
import { Order, OrderStatus, PaymentMethod } from '../../../core/models/order.model';

/**
 * My Orders Component
 * Displays customer's order history
 */
@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-orders.component.html',
  styleUrls: [`./my-orders.component.css`]
})
export class MyOrdersComponent implements OnInit {
  orders: Order[] = [];
  isLoading = false;
  errorMessage = '';
  selectedOrder: Order | null = null;
  isPaymentProcessing = false;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const currentUser = this.authService.currentUserValue;
    
    if (!currentUser) {
      this.errorMessage = 'Please login to view your orders';
      return;
    }
    const customerId = currentUser.customer_id || currentUser.user_id;
  
  if (!customerId) {
    this.errorMessage = 'Customer ID not found. Please login again.';
    return;
  }

    this.isLoading = true;
    this.errorMessage = '';

    this.orderService.getCustomerOrders(customerId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.orders = response.data.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          console.log('Orders loaded:', this.orders);
          console.log('First order payment_status:', this.orders[0]?.payment_status);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load orders. Please try again.';
        this.isLoading = false;
        console.error('Error loading orders:', error);
      }
    });
  }

  getStatusClass(status: OrderStatus | string): string {
    return String(status).toLowerCase();
  }

  getPaymentStatusClass(status: string): string {
    return status.toLowerCase();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  canPayOrder(order: Order): boolean {
    return order.payment_status === 'pending' &&
           order.status !== 'cancelled' &&
           order.status !== 'completed';
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
  }

  payOrder(order: Order): void {
    if (!this.canPayOrder(order)) {
      return;
    }

    if (!confirm(`Pay ${order.total} ALL for Order #${order.order_number}?`)) {
      return;
    }

    this.isPaymentProcessing = true;
    this.errorMessage = '';

    // Prepare payment data
    const paymentData = {
      order_id: order.order_id,
      payment_method: PaymentMethod.CARD, // Default to card, you can add UI to select this
      amount_paid: order.total
    };

    // Call the payment service
    this.paymentService.processPayment(paymentData).subscribe({
      next: (response) => {
        if (response.success) {
          // Update the order in the list
          const index = this.orders.findIndex(o => o.order_id === order.order_id);
          if (index !== -1) {
            this.orders[index] = {
              ...this.orders[index],
              payment_status: 'paid' as any,
              status: 'completed' as any
            };
          }
          alert('Payment successful!');
          this.closeOrderDetails();
        } else {
          this.errorMessage = response.message || 'Payment failed. Please try again.';
        }
        this.isPaymentProcessing = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Payment failed. Please try again.';
        this.isPaymentProcessing = false;
        console.error('Payment error:', error);
      }
    });
  }
}