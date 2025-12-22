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
  templateUrl: './dashboard.component.html',
  styleUrls: [`./dashboard.component.css`]
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
          this.pendingPayments = orders.filter(o => o.payment_status === 'pending').length;
          this.pendingPaymentsAmount = orders
            .filter(o => o.payment_status === 'pending')
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
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
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
    const quantity = prompt(`How many units of ${product.product_name} to add?`, '10');
    if (quantity && !isNaN(Number(quantity))) {
      this.productService.updateInventory({
        product_id: product.product_id,
        current_quantity: Number(quantity),
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