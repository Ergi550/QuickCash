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
  templateUrl: './my-orders.component.html',
  styleUrls: [`./my-orders.component.css`]
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

    this.orderService.getCustomerOrders(currentUser.user_id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.orders = response.data.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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