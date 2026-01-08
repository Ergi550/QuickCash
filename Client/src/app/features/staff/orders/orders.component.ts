import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { PaymentService } from '../../../core/services/payment.service';
import { Order, OrderStatus } from '../../../core/models/order.model';

@Component({
    selector:'app-orders',
    standalone:true,
    imports:[CommonModule, FormsModule],
    templateUrl:`./orders.component.html`,
    styleUrls:[`./orders.component.css`]
})

export class OrdersComponent implements OnInit {
    Math = Math;
    OrderStatus=OrderStatus;
    orders: Order[] = [];
    filteredOrders:Order[] = [];
    selectedStatus:OrderStatus | null = null;
    isLoading=false;

    // Payment modal
    showPaymentModal = false;
    selectedOrder: Order | null = null;
    paymentMethod: 'cash' | 'card' | 'transfer' = 'cash';
    amountReceived: number = 0;
    isProcessingPayment = false;

    constructor(
        private orderService: OrderService,
        private paymentService: PaymentService,
        private router:Router
    ){}
    ngOnInit(): void {
        this.loadOrders();
        setInterval(() => this.loadOrders(),30000);

    }

    loadOrders(): void{
        this.isLoading=true;

        this.orderService.getAllOrders().subscribe({
            next:(response)=>{
                if(response.success&&response.data){
                    this.orders=response.data.sort((a,b)=>
                    new Date(b.created_at).getTime()-new Date(a.created_at).getTime()
                );
                    this.applyFilter();
                }
                this.isLoading=false;
            },
            error: (error)=>{
                console.error('Error loading orders:',error);
                this.isLoading=false;
            }
        });

    
    }
    refreshOrders(): void {
    this.loadOrders();
  }

  filterByStatus(status: OrderStatus | null): void {
    this.selectedStatus = status;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.selectedStatus === null) {
      this.filteredOrders = this.orders.filter(o => 
        o.status !== 'completed' && o.status !== 'cancelled'
      );
    } else {
      this.filteredOrders = this.orders.filter(o => o.status === this.selectedStatus);
    }
  }

  getCountByStatus(status: OrderStatus): number {
    return this.orders.filter(o => o.status === status).length;
  }

  viewDetails(orderId: string): void {
    this.router.navigate(['/staff/orders', orderId]);
  }

  formatTime(date: Date): string {
    const now = new Date();
    const orderDate = new Date(date);
    const diffMs = now.getTime() - orderDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    return orderDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  getEmptyMessage(): string {
    if (this.selectedStatus) {
      return `No ${this.selectedStatus} orders at the moment`;
    }
    return 'No active orders';
  }

  openPaymentModal(order: Order, event: Event): void {
    event.stopPropagation();
    this.selectedOrder = order;
    this.paymentMethod = 'cash';
    this.amountReceived = 0;
    this.showPaymentModal = true;
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.selectedOrder = null;
    this.paymentMethod = 'cash';
    this.amountReceived = 0;
  }

  get change(): number {
    if (!this.selectedOrder) return 0;
    return Math.max(0, this.amountReceived - this.selectedOrder.total);
  }

  processPayment(): void {
    if (!this.selectedOrder) return;

    if (this.paymentMethod === 'cash' && this.amountReceived < this.selectedOrder.total) {
      alert('Insufficient amount received!');
      return;
    }

    if (this.isProcessingPayment) {
      return;
    }

    this.isProcessingPayment = true;

    const paymentData = {
      order_id: this.selectedOrder.order_id.toString(),
      amount_paid: this.paymentMethod === 'cash' ? this.amountReceived : this.selectedOrder.total,
      payment_method: this.paymentMethod as any
    };

    this.paymentService.processPayment(paymentData).subscribe({
      next: (response) => {
        this.isProcessingPayment = false;

        if (response.success && response.data) {
          alert(`Payment successful! Change: ${this.change.toFixed(0)} ALL`);
          this.closePaymentModal();
          this.loadOrders(); // Refresh orders list
        } else {
          alert('Payment failed: ' + (response.message || 'Unknown error'));
        }
      },
      error: (error) => {
        this.isProcessingPayment = false;
        console.error('Error processing payment:', error);
        alert('Payment failed: ' + (error.error?.message || error.message || 'Network error'));
      }
    });
  }

}
