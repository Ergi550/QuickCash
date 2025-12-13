import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { PaymentService } from '../../../core/services/payment.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="reports-page">
      <h1>📈 Sales Reports</h1>
      
      <div class="report-card">
        <h2>Date Range Report</h2>
        <form [formGroup]="dateForm" (ngSubmit)="generateReport()">
          <div class="form-row">
            <div class="form-group">
              <label>Start Date</label>
              <input type="date" formControlName="startDate" />
            </div>
            <div class="form-group">
              <label>End Date</label>
              <input type="date" formControlName="endDate" />
            </div>
            <button type="submit" class="btn btn-primary">Generate</button>
          </div>
        </form>

        <div *ngIf="reportData" class="results">
          <div class="stat-grid">
            <div class="stat">
              <h3>Total Revenue</h3>
              <p>{{ reportData.revenue }} ALL</p>
            </div>
            <div class="stat">
              <h3>Orders</h3>
              <p>{{ reportData.orderCount }}</p>
            </div>
            <div class="stat">
              <h3>Average Order</h3>
              <p>{{ reportData.avgOrder }} ALL</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-page { padding: 2rem; max-width: 1000px; margin: 0 auto; }
    h1 { color: #2c3e50; margin-bottom: 2rem; }
    .report-card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
    h2 { margin: 0 0 1.5rem 0; color: #2c3e50; }
    .form-row { display: flex; gap: 1rem; align-items: flex-end; }
    .form-group { flex: 1; }
    label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
    input { width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px; }
    .btn-primary { padding: 10px 24px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .results { margin-top: 2rem; padding-top: 2rem; border-top: 2px solid #eee; }
    .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
    .stat { text-align: center; padding: 1.5rem; background: #f8f9fa; border-radius: 8px; }
    .stat h3 { margin: 0 0 0.5rem 0; color: #7f8c8d; font-size: 0.875rem; }
    .stat p { margin: 0; font-size: 2rem; font-weight: 700; color: #667eea; }
  `]
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