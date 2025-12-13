import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { Order, OrderStatus } from '../../../core/models/order.model';

/**
 * My Orders Component
 * Displays customer's order history
 */
@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="orders-container">
      <div class="container">
        <div class="orders-header">
          <h1>My Orders</h1>
          <p>Track your order history</p>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading">
          <div class="spinner"></div>
          <p>Loading your orders...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="errorMessage" class="alert alert-error">
          {{ errorMessage }}
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && orders.length === 0 && !errorMessage" class="empty-state">
          <h2>No orders yet</h2>
          <p>You haven't placed any orders yet.</p>
          <a href="/customer/menu" class="btn btn-primary">Start Shopping</a>
        </div>

        <!-- Orders List -->
        <div *ngIf="!isLoading && orders.length > 0" class="orders-list">
          <div *ngFor="let order of orders" class="order-card">
            <div class="order-header">
              <div class="order-number">
                <strong>Order #{{ order.orderNumber }}</strong>
                <span class="badge" [class]="getStatusClass(order.status)">
                  {{ order.status }}
                </span>
              </div>
              <div class="order-date">
                {{ formatDate(order.createdAt) }}
              </div>
            </div>

            <div class="order-body">
              <div class="order-items">
                <h3>Items:</h3>
                <div *ngFor="let item of order.items" class="order-item">
                  <span>{{ item.productName }} (x{{ item.quantity }})</span>
                  <span>{{ item.subtotal }} ALL</span>
                </div>
              </div>

              <div class="order-info">
                <div class="info-row" *ngIf="order.tableNumber">
                  <span>Table:</span>
                  <span>#{{ order.tableNumber }}</span>
                </div>
                <div class="info-row" *ngIf="order.notes">
                  <span>Notes:</span>
                  <span>{{ order.notes }}</span>
                </div>
              </div>
            </div>

            <div class="order-footer">
              <div class="order-totals">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span>{{ order.subtotal }} ALL</span>
                </div>
                <div class="total-row">
                  <span>Tax:</span>
                  <span>{{ order.tax }} ALL</span>
                </div>
                <div class="total-row grand-total">
                  <span>Total:</span>
                  <span>{{ order.total }} ALL</span>
                </div>
              </div>

              <div class="order-status-info">
                <div class="payment-status">
                  Payment: 
                  <span [class]="getPaymentStatusClass(order.paymentStatus)">
                    {{ order.paymentStatus }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .orders-container {
      padding: 2rem 0;
      min-height: calc(100vh - 200px);
      background: #f5f5f5;
    }

    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .orders-header {
      margin-bottom: 2rem;
    }

    .orders-header h1 {
      color: #333;
      margin-bottom: 0.5rem;
    }

    .orders-header p {
      color: #666;
    }

    .loading {
      text-align: center;
      padding: 3rem;
    }

    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .alert {
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 1rem;
    }

    .alert-error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .empty-state h2 {
      color: #333;
      margin-bottom: 1rem;
    }

    .empty-state p {
      color: #666;
      margin-bottom: 2rem;
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .order-card {
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .order-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .order-number {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge.pending { background: #ffc107; color: #333; }
    .badge.confirmed { background: #17a2b8; color: white; }
    .badge.preparing { background: #fd7e14; color: white; }
    .badge.ready { background: #20c997; color: white; }
    .badge.completed { background: #28a745; color: white; }
    .badge.cancelled { background: #dc3545; color: white; }

    .order-date {
      font-size: 0.875rem;
      opacity: 0.9;
    }

    .order-body {
      padding: 1.5rem;
    }

    .order-items h3 {
      font-size: 1rem;
      color: #333;
      margin-bottom: 1rem;
    }

    .order-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #eee;
    }

    .order-item:last-child {
      border-bottom: none;
    }

    .order-info {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }

    .info-row {
      display: flex;
      gap: 1rem;
      padding: 0.25rem 0;
      font-size: 0.875rem;
    }

    .info-row span:first-child {
      font-weight: 600;
      color: #555;
    }

    .order-footer {
      background: #f8f9fa;
      padding: 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .order-totals {
      flex: 1;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 0.25rem 0;
      max-width: 300px;
    }

    .total-row.grand-total {
      border-top: 2px solid #667eea;
      margin-top: 0.5rem;
      padding-top: 0.5rem;
      font-weight: 700;
      font-size: 1.125rem;
      color: #667eea;
    }

    .order-status-info {
      text-align: right;
    }

    .payment-status {
      font-size: 0.875rem;
      color: #666;
    }

    .payment-status span {
      font-weight: 600;
      text-transform: uppercase;
    }

    .payment-status span.paid {
      color: #28a745;
    }

    .payment-status span.pending {
      color: #ffc107;
    }

    .payment-status span.failed {
      color: #dc3545;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 5px;
      text-decoration: none;
      display: inline-block;
      font-weight: 600;
      transition: transform 0.3s;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
    }

    @media (max-width: 768px) {
      .order-header {
        flex-direction: column;
        gap: 0.5rem;
        align-items: flex-start;
      }

      .order-footer {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .order-status-info {
        text-align: left;
      }
    }
  `]
})
export class MyOrdersComponent implements OnInit {
  orders: Order[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private orderService: OrderService,
    private authService: AuthService
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

    this.isLoading = true;
    this.errorMessage = '';

    this.orderService.getCustomerOrders(currentUser.id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.orders = response.data.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
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

  getStatusClass(status: OrderStatus): string {
    return status.toLowerCase();
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
}