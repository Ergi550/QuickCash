import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { PaymentService } from '../../../core/services/payment.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reports.component.html',
  styleUrls: [`./reports.component.css`]
})
export class ReportsComponent {
  dateForm: FormGroup;
  reportData: any = null;

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private paymentService: PaymentService
  ) {
    const today = new Date().toISOString().split('T')[0];
    this.dateForm = this.fb.group({
      startDate: [today],
      endDate: [today]
    });
  }

  generateReport(): void {
    const { startDate, endDate } = this.dateForm.value;
    
    this.orderService.getOrdersByDateRange(startDate, endDate).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const orders = response.data.filter((o: any) => o.paymentStatus === 'paid');
          const revenue = orders.reduce((sum: number, o: any) => sum + o.total, 0);
          
          this.reportData = {
            revenue,
            orderCount: orders.length,
            avgOrder: orders.length > 0 ? Math.round(revenue / orders.length) : 0
          };
        }
      }
    });
  }
}