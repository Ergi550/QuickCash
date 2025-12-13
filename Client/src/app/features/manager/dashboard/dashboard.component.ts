import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { PaymentService } from '../../../core/services/payment.service';
import { ProductService } from '../../../core/services/product.service';
import { Order } from '../../../core/models/order.model';
import { Product } from '../../../core/models/product.model';

/**
 * Dashboard Component
 * Manager overview with key metrics
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-page">
      <div class="page-header">
        <h1>📊 Dashboard</h1>
        <button class="btn btn-primary" (click)="refreshData()">
          🔄 Refresh
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card revenue">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <h3>Today's Revenue</h3>
            <p class="stat-value">{{ todayRevenue }} ALL</p>
            <small>{{ todayOrdersCount }} orders completed</small>
          </div>
        </div>

        <div class="stat-card orders">
          <div class="stat-icon">📋</div>
          <div class="stat-content">
            <h3>Active Orders</h3>
            <p class="stat-value">{{ activeOrders }}</p>
            <small>{{ pendingOrders }} pending</small>
          </div>
        </div>

        <div class="stat-card products">
          <div class="stat-icon">📦</div>
          <div class="stat-content">
            <h3>Low Stock Items</h3>
            <p class="stat-value">{{ lowStockCount }}</p>
            <small>Need restocking</small>
          </div>
        </div>

        <div class="stat-card payments">
          <div class="stat-icon">💳</div>
          <div class="stat-content">
            <h3>Pending Payments</h3>
            <p class="stat-value">{{ pendingPayments }}</p>
            <small>{{ pendingPaymentsAmount }} ALL</small>
          </div>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="section-card">
        <div class="section-header">
          <h2>Recent Orders</h2>
          <a routerLink="/staff/orders" class="link">View All →</a>
        </div>
        <div class="orders-list">
          <div *ngFor="let order of recentOrders" class="order-item">
            <div class="order-info">
              <strong>{{ order.orderNumber }}</strong>
              <span class="badge" [class]="'badge-' + order.status">
                {{ order.status }}
              </span>
            </div>
            <div class="order-details">
              <span>{{ order.customerName || 'Walk-in' }}</span>
              <span class="amount">{{ order.total }} ALL</span>
            </div>
          </div>
          <div *ngIf="recentOrders.length === 0" class="empty-message">
            No recent orders
          </div>
        </div>
      </div>

      <!-- Low Stock Alerts -->
      <div class="section-card alert-card">
        <div class="section-header">
          <h2>⚠️ Low Stock Alerts</h2>
          <a routerLink="/manager/inventory" class="link">Manage →</a>
        </div>
        <div class="alerts-list">
          <div *ngFor="let product of lowStockProducts" class="alert-item">
            <div class="alert-info">
              <strong>{{ product.name }}</strong>
              <span class="stock-level" [class.critical]="product.stock < 5">
                {{ product.stock }} left
              </span>
            </div>
            <button class="btn-small" (click)="quickRestock(product)">
              + Restock
            </button>
          </div>
          <div *ngIf="lowStockProducts.length === 0" class="empty-message">
            ✓ All products adequately stocked
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <a routerLink="/manager/products" class="action-btn">
            <span class="action-icon">🛍️</span>
            <span>Manage Products</span>
          </a>
          <a routerLink="/manager/inventory" class="action-btn">
            <span class="action-icon">📦</span>
            <span>Update Inventory</span>
          </a>
          <a routerLink="/manager/reports" class="action-btn">
            <span class="action-icon">📈</span>
            <span>View Reports</span>
          </a>
          <a routerLink="/manager/users" class="action-btn">
            <span class="action-icon">👥</span>
            <span>Manage Users</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .page-header h1 {
      margin: 0;
      color: #2c3e50;
    }

    .btn-primary {
      background: #667eea;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      gap: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
      border-left: 4px solid;
    }

    .stat-card.revenue { border-left-color: #27ae60; }
    .stat-card.orders { border-left-color: #3498db; }
    .stat-card.products { border-left-color: #f39c12; }
    .stat-card.payments { border-left-color: #e74c3c; }

    .stat-icon {
      font-size: 2.5rem;
    }

    .stat-content h3 {
      margin: 0 0 0.5rem 0;
      color: #7f8c8d;
      font-size: 0.875rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .stat-value {
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
      color: #2c3e50;
    }

    .stat-content small {
      color: #95a5a6;
      font-size: 0.875rem;
    }

    .section-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }

    .alert-card {
      border: 2px solid #f39c12;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .section-header h2 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.25rem;
    }

    .link {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .link:hover {
      text-decoration: underline;
    }

    .orders-list, .alerts-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .order-item, .alert-item {
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .order-info, .alert-info {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex: 1;
    }

    .order-details {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge-pending { background: #f39c12; color: white; }
    .badge-confirmed { background: #3498db; color: white; }
    .badge-preparing { background: #e67e22; color: white; }
    .badge-ready { background: #27ae60; color: white; }

    .amount {
      font-weight: 700;
      color: #667eea;
    }

    .stock-level {
      padding: 4px 12px;
      background: #f39c12;
      color: white;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .stock-level.critical {
      background: #e74c3c;
    }

    .btn-small {
      padding: 6px 12px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .empty-message {
      text-align: center;
      padding: 2rem;
      color: #95a5a6;
    }

    .quick-actions {
      margin-top: 2rem;
    }

    .quick-actions h2 {
      margin: 0 0 1.5rem 0;
      color: #2c3e50;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .action-btn {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      text-decoration: none;
      color: #2c3e50;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
      transition: all 0.3s;
    }

    .action-btn:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
    }

    .action-icon {
      font-size: 2rem;
    }

    @media (max-width: 768px) {
      .dashboard-page {
        padding: 1rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  todayRevenue = 0;
  todayOrdersCount = 0;
  activeOrders = 0;
  pendingOrders = 0;
  lowStockCount = 0;
  pendingPayments = 0;
  pendingPaymentsAmount = 0;
  recentOrders: Order[] = [];
  lowStockProducts: Product[] = [];

  constructor(
    private orderService: OrderService,
    private paymentService: PaymentService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loadTodayStats();
    this.loadRecentOrders();
    this.loadLowStockProducts();
  }

  loadTodayStats(): void {
    // Today's orders
    this.orderService.getTodayOrders().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const orders = response.data;
          this.todayOrdersCount = orders.filter(o => o.status === 'completed').length;
          this.activeOrders = orders.filter(o => 
            o.status !== 'completed' && o.status !== 'cancelled'
          ).length;
          this.pendingOrders = orders.filter(o => o.status === 'pending').length;
          this.pendingPayments = orders.filter(o => o.paymentStatus === 'pending').length;
          this.pendingPaymentsAmount = orders
            .filter(o => o.paymentStatus === 'pending')
            .reduce((sum, o) => sum + o.total, 0);
        }
      }
    });

    // Today's revenue
    this.paymentService.getTotalRevenue(
      new Date().toISOString().split('T')[0],
      new Date().toISOString().split('T')[0]
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.todayRevenue = response.data.revenue;
        }
      }
    });
  }

  loadRecentOrders(): void {
    this.orderService.getAllOrders().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.recentOrders = response.data
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);
        }
      }
    });
  }

  loadLowStockProducts(): void {
    this.productService.getLowStockProducts(10).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.lowStockProducts = response.data;
          this.lowStockCount = response.data.length;
        }
      }
    });
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  quickRestock(product: Product): void {
    const quantity = prompt(`How many units of ${product.name} to add?`, '10');
    if (quantity && !isNaN(Number(quantity))) {
      this.productService.updateInventory({
        productId: product.id,
        quantity: Number(quantity),
        action: 'add'
      }).subscribe({
        next: () => {
          alert('Stock updated successfully!');
          this.loadLowStockProducts();
        },
        error: () => {
          alert('Failed to update stock');
        }
      });
    }
  }
}