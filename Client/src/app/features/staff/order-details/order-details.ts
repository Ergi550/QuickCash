import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { PaymentService } from '../../../core/services/payment.service';
import { Order, OrderStatus, PaymentMethod } from '../../../core/models/order.model';

/**
 * Order Details Component
 * Full order management for staff
 */
@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-details.html',
  styleUrls: ['./order-details.css']
})
export class OrderDetailsComponent implements OnInit {
  PaymentMethod=PaymentMethod;
  OrderStatus=OrderStatus;
  order: Order | null = null;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(orderId);
    }
  }

  loadOrder(orderId: string): void {
    this.isLoading = true;

    this.orderService.getOrderById(orderId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.order = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading order:', error);
        alert('Failed to load order');
        this.goBack();
      }
    });
  }

  updateStatus(newStatus: OrderStatus): void {
    if (!this.order) return;

    this.orderService.updateOrderStatus(this.order.id, newStatus).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.order = response.data;
          alert(`Order status updated to ${newStatus}`);
        }
      },
      error: (error) => {
        console.error('Error updating status:', error);
        alert('Failed to update order status');
      }
    });
  }

  processPayment(method: PaymentMethod): void {
    if (!this.order) return;

    if (!confirm(`Process payment of ${this.order.total} ALL via ${method}?`)) {
      return;
    }

    this.paymentService.processPayment({
      orderId: this.order.id,
      amount: this.order.total,
      method
    }).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Payment processed successfully!');
          this.loadOrder(this.order!.id);
        } else {
          alert(response.data?.message || 'Payment failed');
        }
      },
      error: (error) => {
        console.error('Error processing payment:', error);
        alert('Failed to process payment');
      }
    });
  }

  cancelOrder(): void {
    if (!this.order) return;

    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    this.orderService.cancelOrder(this.order.id).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Order cancelled successfully');
          this.goBack();
        }
      },
      error: (error) => {
        console.error('Error cancelling order:', error);
        alert('Failed to cancel order');
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goBack(): void {
    this.router.navigate(['/staff/orders']);
  }
}