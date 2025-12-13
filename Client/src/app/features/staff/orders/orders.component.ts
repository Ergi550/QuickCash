import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus } from '../../../core/models/order.model';

@Component({
    selector:'app-orders',
    standalone:true,
    imports:[CommonModule],
    template:` <div class="orders-page">
      <header class="page-header">
        <h1>Orders Management</h1>
        <button class="btn btn-primary" (click)="refreshOrders()">
          🔄 Refresh
        </button>
      </header>

      <!-- Status Filter Tabs -->
      <div class="status-tabs">
        <button 
          class="tab-btn"
          [class.active]="selectedStatus === null"
          (click)="filterByStatus(null)"
        >
          All ({{ orders.length }})
        </button>
        <button 
          class="tab-btn pending"
          [class.active]="selectedStatus === OrderStatus.PENDING"
          (click)="filterByStatus(OrderStatus.PENDING)"
        >
          Pending ({{ getCountByStatus(OrderStatus.PENDING) }})
        </button>
        <button 
          class="tab-btn preparing"
          [class.active]="selectedStatus === OrderStatus.PREPARING"
          (click)="filterByStatus(OrderStatus.PREPARING)"
        >
          Preparing ({{ getCountByStatus(OrderStatus.PREPARING) }})
        </button>
        <button 
          class="tab-btn ready"
          [class.active]="selectedStatus === OrderStatus.READY"
          (click)="filterByStatus(OrderStatus.READY)"
        >
          Ready ({{ getCountByStatus(OrderStatus.READY) }})
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Loading orders...</p>
      </div>

      <!-- Orders Grid -->
      <div *ngIf="!isLoading" class="orders-grid">
        <div 
          *ngFor="let order of filteredOrders" 
          class="order-card"
          [class]="'status-' + order.status"
          (click)="viewDetails(order.id)"
        >
          <div class="card-header">
            <div class="order-info">
              <h3>Order #{{ order.orderNumber }}</h3>
              <span class="badge" [class]="'badge-' + order.status">
                {{ order.status }}
              </span>
            </div>
            <div class="order-time">
              {{ formatTime(order.createdAt) }}
            </div>
          </div>

          <div class="card-body">
            <div class="customer-info" *ngIf="order.customerName">
              <strong>Customer:</strong> {{ order.customerName }}
            </div>
            <div class="table-info" *ngIf="order.tableNumber">
              <strong>Table:</strong> #{{ order.tableNumber }}
            </div>

            <div class="items-list">
              <div *ngFor="let item of order.items" class="item">
                <span>{{ item.productName }} x{{ item.quantity }}</span>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="total">
              Total: <strong>{{ order.total }} ALL</strong>
            </div>
            <div class="payment-status" [class]="'payment-' + order.paymentStatus">
              {{ order.paymentStatus }}
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="filteredOrders.length === 0" class="empty-state">
          <h3>No orders found</h3>
          <p>{{ getEmptyMessage() }}</p>
        </div>
      </div>
    </div>`,
    styles:[`.orders-page {
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
      background: #3498db;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
    }

    .status-tabs {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .tab-btn {
      padding: 12px 24px;
      border: 2px solid #ddd;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .tab-btn:hover {
      border-color: #3498db;
    }

    .tab-btn.active {
      background: #3498db;
      color: white;
      border-color: #3498db;
    }

    .tab-btn.pending.active { background: #f39c12; border-color: #f39c12; }
    .tab-btn.preparing.active { background: #e67e22; border-color: #e67e22; }
    .tab-btn.ready.active { background: #27ae60; border-color: #27ae60; }

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
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .orders-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .order-card {
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: all 0.3s;
      border-left: 4px solid #ddd;
    }

    .order-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 20px rgba(0,0,0,0.15);
    }

    .order-card.status-pending { border-left-color: #f39c12; }
    .order-card.status-confirmed { border-left-color: #3498db; }
    .order-card.status-preparing { border-left-color: #e67e22; }
    .order-card.status-ready { border-left-color: #27ae60; }
    .order-card.status-completed { border-left-color: #95a5a6; }

    .card-header {
      padding: 1.25rem;
      border-bottom: 1px solid #ecf0f1;
    }

    .order-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .order-info h3 {
      margin: 0;
      font-size: 1.125rem;
      color: #2c3e50;
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
    .badge-completed { background: #95a5a6; color: white; }
    .badge-cancelled { background: #e74c3c; color: white; }

    .order-time {
      font-size: 0.875rem;
      color: #7f8c8d;
    }

    .card-body {
      padding: 1.25rem;
    }

    .customer-info, .table-info {
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
      color: #555;
    }

    .items-list {
      margin-top: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 5px;
    }

    .item {
      padding: 0.25rem 0;
      font-size: 0.875rem;
      color: #555;
    }

    .card-footer {
      padding: 1rem 1.25rem;
      background: #f8f9fa;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom-left-radius: 10px;
      border-bottom-right-radius: 10px;
    }

    .total {
      font-size: 1.125rem;
      color: #2c3e50;
    }

    .total strong {
      color: #3498db;
    }

    .payment-status {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .payment-status.payment-pending {
      background: #fff3cd;
      color: #856404;
    }

    .payment-status.payment-paid {
      background: #d4edda;
      color: #155724;
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem;
      color: #7f8c8d;
    }

    @media (max-width: 768px) {
      .orders-page {
        padding: 1rem;
      }

      .orders-grid {
        grid-template-columns: 1fr;
      }
    }`]
})

export class OrdersComponent implements OnInit {
    OrderStatus=OrderStatus;
    orders: Order[] = [];
    filteredOrders:Order[] = [];
    selectedStatus:OrderStatus | null = null;
    isLoading=false;

    constructor(
        private orderService: OrderService,
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
                    new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()
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

}
