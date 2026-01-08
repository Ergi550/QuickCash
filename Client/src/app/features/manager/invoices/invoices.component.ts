import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus } from '../../../core/models/order.model';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.css']
})
export class InvoicesComponent implements OnInit {
  OrderStatus = OrderStatus;
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  isLoading = false;

  // Filters
  searchTerm: string = '';
  selectedStatus: string | null = null;
  selectedPaymentStatus: string | null = null;
  startDate: string = '';
  endDate: string = '';

  // Selected order for detail view
  selectedOrder: Order | null = null;
  showDetailModal = false;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadAllOrders();
  }

  loadAllOrders(): void {
    this.isLoading = true;
    this.orderService.getAllOrders().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.orders = response.data.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          this.applyFilters();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let result = [...this.orders];

    // Filter by search term (order number, customer name, table)
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(order =>
        order.order_number.toLowerCase().includes(term) ||
        (order.customer_name && order.customer_name.toLowerCase().includes(term)) ||
        (order.table_number && order.table_number.toString().includes(term))
      );
    }

    // Filter by order status
    if (this.selectedStatus) {
      result = result.filter(order => order.status === this.selectedStatus);
    }

    // Filter by payment status
    if (this.selectedPaymentStatus) {
      result = result.filter(order => order.payment_status === this.selectedPaymentStatus);
    }

    // Filter by date range
    if (this.startDate) {
      const start = new Date(this.startDate);
      result = result.filter(order => new Date(order.created_at) >= start);
    }
    if (this.endDate) {
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter(order => new Date(order.created_at) <= end);
    }

    this.filteredOrders = result;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = null;
    this.selectedPaymentStatus = null;
    this.startDate = '';
    this.endDate = '';
    this.applyFilters();
  }

  viewOrderDetails(order: Order): void {
    // Load full order details with items
    this.orderService.getOrderById(order.order_id.toString()).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.selectedOrder = response.data;
          this.showDetailModal = true;
        }
      },
      error: (error) => {
        console.error('Error loading order details:', error);
        alert('Failed to load order details');
      }
    });
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedOrder = null;
  }

  exportToCSV(): void {
    const csvData = this.convertToCSV(this.filteredOrders);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoices_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private convertToCSV(orders: Order[]): string {
    const headers = ['Order Number', 'Date', 'Customer', 'Table', 'Items', 'Subtotal', 'Tax', 'Total', 'Status', 'Payment Status', 'Staff'];
    const rows = orders.map(order => [
      order.order_number,
      new Date(order.created_at).toLocaleString(),
      order.customer_name || 'Walk-in',
      order.table_number || '-',
      order.items?.length || 0,
      order.subtotal || 0,
      order.tax_amount || 0,
      order.total || 0,
      order.status,
      order.payment_status || 'pending',
      order.staff_name || '-'
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  getTotalAmount(): number {
    return this.filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  }

  getTotalPaidAmount(): number {
    return this.filteredOrders
      .filter(order => order.payment_status === 'paid')
      .reduce((sum, order) => sum + (order.total || 0), 0);
  }

  getTotalPendingAmount(): number {
    return this.filteredOrders
      .filter(order => order.payment_status === 'pending')
      .reduce((sum, order) => sum + (order.total || 0), 0);
  }
}
