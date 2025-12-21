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
  templateUrl: './payment.component.html',
  styleUrls: [`./payment.component.css`]
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