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
  template: `
    <div class="order-details-page">
      <div class="page-header">
        <button class="btn-back" (click)="goBack()">
          ← Back to Orders
        </button>
        <h1 *ngIf="order">Order #{{ order.orderNumber }}</h1>
      </div>

      <div *ngIf="isLoading" class="loading">
        <div class="spinner"></div>
      </div>

      <div *ngIf="order && !isLoading" class="order-content">
        <!-- Order Info Card -->
        <div class="info-card">
          <h2>Order Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>Status</label>
              <span class="badge" [class]="'badge-' + order.status">
                {{ order.status }}
              </span>
            </div>
            <div class="info-item">
              <label>Created</label>
              <span>{{ formatDate(order.createdAt) }}</span>
            </div>
            <div class="info-item">
              <label>Customer</label>
              <span>{{ order.customerName || 'Walk-in' }}</span>
            </div>
            <div class="info-item" *ngIf="order.tableNumber">
              <label>Table</label>
              <span>#{{ order.tableNumber }}</span>
            </div>
            <div class="info-item" *ngIf="order.notes">
              <label>Notes</label>
              <span>{{ order.notes }}</span>
            </div>
            <div class="info-item">
              <label>Payment</label>
              <span [class]="'payment-' + order.paymentStatus">
                {{ order.paymentStatus }}
              </span>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="items-card">
          <h2>Order Items</h2>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of order.items">
                <td>
                  <strong>{{ item.productName }}</strong>
                  <small *ngIf="item.notes">{{ item.notes }}</small>
                </td>
                <td>x{{ item.quantity }}</td>
                <td>{{ item.price }} ALL</td>
                <td>{{ item.subtotal }} ALL</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3">Subtotal</td>
                <td>{{ order.subtotal }} ALL</td>
              </tr>
              <tr>
                <td colspan="3">Tax (20%)</td>
                <td>{{ order.tax }} ALL</td>
              </tr>
              <tr class="total-row">
                <td colspan="3"><strong>Total</strong></td>
                <td><strong>{{ order.total }} ALL</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Actions -->
        <div class="actions-card">
          <h2>Actions</h2>
          
          <!-- Status Update Buttons -->
          <div class="status-actions">
            <button 
              *ngIf="order.status === 'pending'"
              class="btn btn-primary"
              (click)="updateStatus(OrderStatus.CONFIRMED)"
            >
              ✓ Confirm Order
            </button>
            <button 
              *ngIf="order.status === 'confirmed'"
              class="btn btn-primary"
              (click)="updateStatus(OrderStatus.PREPARING)"
            >
              🍳 Start Preparing
            </button>
            <button 
              *ngIf="order.status === 'preparing'"
              class="btn btn-primary"
              (click)="updateStatus(OrderStatus.READY)"
            >
              ✓ Mark as Ready
            </button>
            <button 
              *ngIf="order.status === 'ready' && order.paymentStatus === 'paid'"
              class="btn btn-success"
              (click)="updateStatus(OrderStatus.COMPLETED)"
            >
              ✓ Complete Order
            </button>
          </div>

          <!-- Payment Actions -->
          <div class="payment-actions" *ngIf="order.paymentStatus === 'pending'">
            <h3>Process Payment</h3>
            <div class="payment-methods">
              <button 
                class="btn btn-payment"
                (click)="processPayment(PaymentMethod.CASH)"
              >
                💵 Cash
              </button>
              <button 
                class="btn btn-payment"
                (click)="processPayment(PaymentMethod.CARD)"
              >
                💳 Card
              </button>
              <button 
                class="btn btn-payment"
                (click)="processPayment(PaymentMethod.MOBILE)"
              >
                📱 Mobile
              </button>
            </div>
          </div>

          <!-- Cancel Button -->
          <button 
            *ngIf="order.status === 'pending' || order.status === 'confirmed'"
            class="btn btn-danger"
            (click)="cancelOrder()"
          >
            ✗ Cancel Order
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .order-details-page {
      padding: 2rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .btn-back {
      background: transparent;
      border: none;
      color: #3498db;
      font-size: 1rem;
      cursor: pointer;
      margin-bottom: 1rem;
      padding: 0.5rem 0;
    }

    .btn-back:hover {
      text-decoration: underline;
    }

    .page-header h1 {
      margin: 0;
      color: #2c3e50;
    }

    .loading {
      text-align: center;
      padding: 3rem;
    }

    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #3498db;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .order-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .info-card, .items-card, .actions-card {
      background: white;
      border-radius: 10px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    h2 {
      margin: 0 0 1.5rem 0;
      color: #2c3e50;
      font-size: 1.25rem;
    }

    h3 {
      margin: 0 0 1rem 0;
      color: #2c3e50;
      font-size: 1rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .info-item label {
      display: block;
      font-size: 0.875rem;
      color: #7f8c8d;
      margin-bottom: 0.25rem;
    }

    .info-item span {
      display: block;
      font-weight: 500;
      color: #2c3e50;
    }

    .badge {
      padding: 6px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      display: inline-block;
    }

    .badge-pending { background: #f39c12; color: white; }
    .badge-confirmed { background: #3498db; color: white; }
    .badge-preparing { background: #e67e22; color: white; }
    .badge-ready { background: #27ae60; color: white; }
    .badge-completed { background: #95a5a6; color: white; }

    .payment-pending { color: #f39c12; font-weight: 600; }
    .payment-paid { color: #27ae60; font-weight: 600; }

    .items-table {
      width: 100%;
      border-collapse: collapse;
    }

    .items-table th {
      text-align: left;
      padding: 0.75rem;
      background: #f8f9fa;
      border-bottom: 2px solid #dee2e6;
      font-weight: 600;
      color: #495057;
    }

    .items-table td {
      padding: 0.75rem;
      border-bottom: 1px solid #dee2e6;
    }

    .items-table small {
      display: block;
      color: #6c757d;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .items-table tfoot td {
      font-weight: 500;
    }

    .total-row {
      background: #f8f9fa;
    }

    .total-row td {
      padding: 1rem 0.75rem;
      font-size: 1.125rem;
      color: #3498db;
    }

    .status-actions {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary {
      background: #3498db;
      color: white;
    }

    .btn-primary:hover {
      background: #2980b9;
    }

    .btn-success {
      background: #27ae60;
      color: white;
    }

    .btn-success:hover {
      background: #229954;
    }

    .btn-danger {
      background: #e74c3c;
      color: white;
    }

    .btn-danger:hover {
      background: #c0392b;
    }

    .payment-actions {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #dee2e6;
    }

    .payment-methods {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .btn-payment {
      background: white;
      border: 2px solid #3498db;
      color: #3498db;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-payment:hover {
      background: #3498db;
      color: white;
    }
  `]
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