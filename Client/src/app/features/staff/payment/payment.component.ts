import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { PaymentService } from '../../../core/services/payment.service';
import { Order, PaymentMethod } from '../../../core/models/order.model';

/**
 * Payment Component
 * Process payments for orders
 */
@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="payment-page">
      <div class="page-header">
        <h1>💳 Process Payment</h1>
      </div>

      <!-- Order Lookup -->
      <div class="lookup-card">
        <h2>Find Order</h2>
        <form [formGroup]="lookupForm" (ngSubmit)="lookupOrder()">
          <div class="lookup-group">
            <input 
              type="text"
              formControlName="searchQuery"
              placeholder="Enter Order Number or ID"
              class="lookup-input"
            />
            <button type="submit" class="btn btn-primary">
              🔍 Search
            </button>
          </div>
        </form>

        <div class="quick-orders" *ngIf="recentOrders.length > 0">
          <h3>Ready for Payment:</h3>
          <div class="order-chips">
            <button 
              *ngFor="let order of recentOrders"
              class="order-chip"
              (click)="selectOrder(order)"
            >
              {{ order.orderNumber }} - {{ order.total }} ALL
            </button>
          </div>
        </div>
      </div>

      <!-- Selected Order Display -->
      <div *ngIf="selectedOrder" class="order-display">
        <div class="order-header">
          <h2>Order #{{ selectedOrder.orderNumber }}</h2>
          <span class="badge" [class]="'badge-' + selectedOrder.status">
            {{ selectedOrder.status }}
          </span>
        </div>

        <div class="order-details">
          <div class="detail-row">
            <span>Customer:</span>
            <strong>{{ selectedOrder.customerName || 'Walk-in' }}</strong>
          </div>
          <div class="detail-row" *ngIf="selectedOrder.tableNumber">
            <span>Table:</span>
            <strong>#{{ selectedOrder.tableNumber }}</strong>
          </div>
        </div>

        <div class="order-items">
          <h3>Items:</h3>
          <div *ngFor="let item of selectedOrder.items" class="item-row">
            <span>{{ item.productName }} x{{ item.quantity }}</span>
            <span>{{ item.subtotal }} ALL</span>
          </div>
        </div>

        <div class="order-totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>{{ selectedOrder.subtotal }} ALL</span>
          </div>
          <div class="total-row">
            <span>Tax (20%):</span>
            <span>{{ selectedOrder.tax }} ALL</span>
          </div>
          <div class="total-row grand">
            <span>Total:</span>
            <strong>{{ selectedOrder.total }} ALL</strong>
          </div>
        </div>

        <!-- Payment Already Processed -->
        <div *ngIf="selectedOrder.paymentStatus === 'paid'" class="alert alert-success">
          ✓ This order has already been paid ({{ selectedOrder.paymentMethod }})
        </div>

        <!-- Payment Form -->
        <div *ngIf="selectedOrder.paymentStatus === 'pending'" class="payment-form">
          <h3>Process Payment</h3>
          
          <form [formGroup]="paymentForm" (ngSubmit)="processPayment()">
            <div class="form-group">
              <label>Payment Method *</label>
              <div class="method-buttons">
                <button 
                  type="button"
                  class="method-btn"
                  [class.active]="paymentForm.value.method === 'cash'"
                  (click)="selectMethod('cash')"
                >
                  💵 Cash
                </button>
                <button 
                  type="button"
                  class="method-btn"
                  [class.active]="paymentForm.value.method === 'card'"
                  (click)="selectMethod('card')"
                >
                  💳 Card
                </button>
                <button 
                  type="button"
                  class="method-btn"
                  [class.active]="paymentForm.value.method === 'mobile'"
                  (click)="selectMethod('mobile')"
                >
                  📱 Mobile
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>Amount *</label>
              <input 
                type="number"
                formControlName="amount"
                class="amount-input"
                placeholder="Enter amount"
              />
              <button 
                type="button"
                class="btn-exact"
                (click)="setExactAmount()"
              >
                Use Exact Amount ({{ selectedOrder.total }} ALL)
              </button>
            </div>

            <div class="form-group" *ngIf="calculateChange() > 0">
              <div class="change-display">
                Change to return: <strong>{{ calculateChange() }} ALL</strong>
              </div>
            </div>

            <div class="form-group">
              <label>Notes (optional)</label>
              <textarea 
                formControlName="notes"
                rows="2"
                placeholder="Any notes about this payment..."
              ></textarea>
            </div>

            <div class="alert alert-error" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>

            <button 
              type="submit"
              class="btn btn-success btn-large"
              [disabled]="paymentForm.invalid || isProcessing"
            >
              {{ isProcessing ? 'Processing...' : '✓ Process Payment' }}
            </button>
          </form>
        </div>
      </div>

      <!-- Success Message -->
      <div *ngIf="showSuccess" class="success-overlay" (click)="closeSuccess()">
        <div class="success-card" (click)="$event.stopPropagation()">
          <div class="success-icon">✓</div>
          <h2>Payment Successful!</h2>
          <p>Receipt #{{ lastReceiptNumber }}</p>
          <p class="amount">{{ lastPaymentAmount }} ALL</p>
          <button class="btn btn-primary" (click)="closeSuccess()">
            Done
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-page {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .page-header h1 {
      margin: 0 0 2rem 0;
      color: #2c3e50;
    }

    .lookup-card, .order-display {
      background: white;
      border-radius: 10px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 1.5rem;
    }

    h2 {
      margin: 0 0 1.5rem 0;
      color: #2c3e50;
      font-size: 1.25rem;
    }

    h3 {
      margin: 0 0 1rem 0;
      color: #2c3e50;
      font-size: 1rem;
    }

    .lookup-group {
      display: flex;
      gap: 1rem;
    }

    .lookup-input {
      flex: 1;
      padding: 12px;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-size: 16px;
    }

    .lookup-input:focus {
      outline: none;
      border-color: #3498db;
    }

    .quick-orders {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #eee;
    }

    .order-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .order-chip {
      padding: 8px 16px;
      background: #f8f9fa;
      border: 2px solid #dee2e6;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 500;
    }

    .order-chip:hover {
      background: #3498db;
      color: white;
      border-color: #3498db;
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #eee;
    }

    .badge {
      padding: 6px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge-pending { background: #f39c12; color: white; }
    .badge-ready { background: #27ae60; color: white; }
    .badge-preparing { background: #e67e22; color: white; }

    .order-details {
      margin-bottom: 1.5rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
    }

    .order-items {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .item-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #dee2e6;
    }

    .item-row:last-child {
      border-bottom: none;
    }

    .order-totals {
      margin-bottom: 1.5rem;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
    }

    .total-row.grand {
      border-top: 2px solid #3498db;
      padding-top: 1rem;
      margin-top: 0.5rem;
      font-size: 1.25rem;
      color: #3498db;
    }

    .payment-form {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 2px solid #eee;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #555;
    }

    .method-buttons {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .method-btn {
      padding: 1rem;
      background: white;
      border: 2px solid #ddd;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .method-btn:hover {
      border-color: #3498db;
    }

    .method-btn.active {
      background: #3498db;
      color: white;
      border-color: #3498db;
    }

    .amount-input {
      width: 100%;
      padding: 12px;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-size: 18px;
      font-weight: 600;
    }

    .btn-exact {
      margin-top: 0.5rem;
      padding: 8px 16px;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
    }

    .btn-exact:hover {
      background: #e9ecef;
    }

    .change-display {
      padding: 1rem;
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 8px;
      text-align: center;
      font-size: 1.125rem;
    }

    .change-display strong {
      color: #856404;
      font-size: 1.5rem;
    }

    textarea {
      width: 100%;
      padding: 12px;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-family: inherit;
    }

    .alert {
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .alert-success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .alert-error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary {
      background: #3498db;
      color: white;
    }

    .btn-success {
      background: #27ae60;
      color: white;
      font-size: 18px;
    }

    .btn-large {
      width: 100%;
      padding: 16px;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .success-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .success-card {
      background: white;
      padding: 3rem;
      border-radius: 20px;
      text-align: center;
      max-width: 400px;
    }

    .success-icon {
      width: 80px;
      height: 80px;
      background: #27ae60;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      margin: 0 auto 1.5rem;
    }

    .success-card h2 {
      color: #27ae60;
      margin-bottom: 1rem;
    }

    .success-card p {
      margin: 0.5rem 0;
      color: #666;
    }

    .success-card .amount {
      font-size: 2rem;
      font-weight: 700;
      color: #27ae60;
      margin: 1rem 0;
    }
  `]
})
export class PaymentComponent implements OnInit {
  lookupForm: FormGroup;
  paymentForm: FormGroup;
  selectedOrder: Order | null = null;
  recentOrders: Order[] = [];
  isProcessing = false;
  errorMessage = '';
  showSuccess = false;
  lastReceiptNumber = '';
  lastPaymentAmount = 0;

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private paymentService: PaymentService
  ) {
    this.lookupForm = this.fb.group({
      searchQuery: ['', Validators.required]
    });

    this.paymentForm = this.fb.group({
      method: ['cash', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadReadyOrders();
  }

  loadReadyOrders(): void {
    this.orderService.getAllOrders('ready' as any).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.recentOrders = response.data.filter(o => o.paymentStatus === 'pending');
        }
      }
    });
  }

  lookupOrder(): void {
    const query = this.lookupForm.value.searchQuery;
    
    this.orderService.getAllOrders().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const order = response.data.find(o => 
            o.orderNumber === query || o.id === query
          );
          
          if (order) {
            this.selectOrder(order);
          } else {
            alert('Order not found');
          }
        }
      }
    });
  }

  selectOrder(order: Order): void {
    this.selectedOrder = order;
    this.paymentForm.patchValue({
      amount: order.total
    });
    this.errorMessage = '';
  }

  selectMethod(method: string): void {
    this.paymentForm.patchValue({ method });
  }

  setExactAmount(): void {
    if (this.selectedOrder) {
      this.paymentForm.patchValue({ amount: this.selectedOrder.total });
    }
  }

  calculateChange(): number {
    if (!this.selectedOrder) return 0;
    const amount = this.paymentForm.value.amount || 0;
    const change = amount - this.selectedOrder.total;
    return change > 0 ? change : 0;
  }

  processPayment(): void {
    if (!this.selectedOrder || this.paymentForm.invalid) return;

    this.isProcessing = true;
    this.errorMessage = '';

    const paymentData = {
      orderId: this.selectedOrder.id,
      amount: this.paymentForm.value.amount,
      method: this.paymentForm.value.method,
      notes: this.paymentForm.value.notes
    };

    this.paymentService.processPayment(paymentData).subscribe({
      next: (response) => {
        this.isProcessing = false;
        if (response.success && response.data) {
          this.lastReceiptNumber = response.data.payment.receiptNumber;
          this.lastPaymentAmount = response.data.payment.amount;
          this.showSuccess = true;
          
          // Reset
          setTimeout(() => {
            this.selectedOrder = null;
            this.lookupForm.reset();
            this.paymentForm.reset({ method: 'cash' });
            this.loadReadyOrders();
          }, 2000);
        } else {
          this.errorMessage = response.data?.message || 'Payment failed';
        }
      },
      error: (error) => {
        this.isProcessing = false;
        this.errorMessage = error.error?.message || 'Payment processing failed';
      }
    });
  }

  closeSuccess(): void {
    this.showSuccess = false;
  }
}