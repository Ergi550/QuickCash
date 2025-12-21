import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus } from '../../../core/models/order.model';

@Component({
    selector:'app-orders',
    standalone:true,
    imports:[CommonModule],
    templateUrl:`./orders.component.html`,
    styleUrls:[`./orders.component.css`]
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
