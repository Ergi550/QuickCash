import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { CartItem } from '../../../core/models/order.model';

/**
 * Checkout Component
 * Handles order placement
 */
@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="checkout-container">
      <div class="container">
        <div class="checkout-header">
          <h1>Checkout</h1>
        </div>

        <div class="checkout-content">
          <!-- Order Form -->
          <div class="checkout-form">
            <form [formGroup]="checkoutForm" (ngSubmit)="placeOrder()">
              <div class="form-section">
                <h2>Customer Information</h2>
                
                <div class="form-group">
                  <label for="customerName">Full Name *</label>
                  <input 
                    type="text" 
                    id="customerName"
                    formControlName="customerName"
                    placeholder="Enter your name"
                  />
                  <span class="error-message" 
                    *ngIf="checkoutForm.get('customerName')?.invalid && checkoutForm.get('customerName')?.touched">
                    Name is required
                  </span>
                </div>

                <div class="form-group">
                  <label for="tableNumber">Table Number (optional)</label>
                  <input 
                    type="number" 
                    id="tableNumber"
                    formControlName="tableNumber"
                    placeholder="Enter table number"
                  />
                </div>

                <div class="form-group">
                  <label for="notes">Special Instructions (optional)</label>
                  <textarea 
                    id="notes"
                    formControlName="notes"
                    rows="3"
                    placeholder="Any special requests?"
                  ></textarea>
                </div>
              </div>

              <!-- Error Message -->
              <div class="alert alert-error" *ngIf="errorMessage">
                {{ errorMessage }}
              </div>

              <!-- Submit Button -->
              <button 
                type="submit" 
                class="btn btn-primary btn-block"
                [disabled]="checkoutForm.invalid || isSubmitting || cartItems.length === 0"
              >
                {{ isSubmitting ? 'Placing Order...' : 'Place Order' }}
              </button>
            </form>
          </div>

          <!-- Order Summary -->
          <div class="order-summary">
            <div class="summary-card">
              <h2>Order Summary</h2>

              <div class="order-items">
                <div *ngFor="let item of cartItems" class="summary-item">
                  <div class="item-info">
                    <span class="item-name">{{ item.product.name }}</span>
                    <span class="item-qty">x{{ item.quantity }}</span>
                  </div>
                  <span class="item-price">{{ item.product.price * item.quantity }} ALL</span>
                </div>
              </div>

              <div class="summary-totals">
                <div class="summary-row">
                  <span>Subtotal</span>
                  <span>{{ subtotal }} ALL</span>
                </div>
                <div class="summary-row">
                  <span>Tax (20%)</span>
                  <span>{{ tax }} ALL</span>
                </div>
                <div class="summary-row total">
                  <span>Total</span>
                  <span>{{ total }} ALL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-container {
      padding: 2rem 0;
      min-height: calc(100vh - 200px);
      background: #f5f5f5;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .checkout-header {
      margin-bottom: 2rem;
    }

    .checkout-header h1 {
      color: #333;
    }

    .checkout-content {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 2rem;
    }

    .checkout-form {
      background: white;
      border-radius: 10px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .form-section {
      margin-bottom: 2rem;
    }

    .form-section h2 {
      font-size: 1.25rem;
      color: #333;
      margin-bottom: 1.5rem;
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

    input, textarea {
      width: 100%;
      padding: 12px;
      border: 2px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      font-family: inherit;
      transition: border-color 0.3s;
    }

    input:focus, textarea:focus {
      outline: none;
      border-color: #667eea;
    }

    .error-message {
      display: block;
      color: #e74c3c;
      font-size: 12px;
      margin-top: 5px;
    }

    .alert {
      padding: 12px 15px;
      border-radius: 5px;
      margin-bottom: 1.5rem;
    }

    .alert-error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .btn-block {
      width: 100%;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 14px 28px;
      border: none;
      border-radius: 5px;
      font-weight: 600;
      font-size: 16px;
      cursor: pointer;
      transition: transform 0.3s;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .order-summary {
      position: sticky;
      top: 2rem;
      height: fit-content;
    }

    .summary-card {
      background: white;
      border-radius: 10px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .summary-card h2 {
      margin: 0 0 1.5rem 0;
      font-size: 1.5rem;
      color: #333;
    }

    .order-items {
      margin-bottom: 1.5rem;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid #eee;
    }

    .summary-item:last-child {
      border-bottom: none;
    }

    .item-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .item-name {
      font-weight: 500;
      color: #333;
    }

    .item-qty {
      font-size: 0.875rem;
      color: #666;
    }

    .item-price {
      font-weight: 600;
      color: #667eea;
    }

    .summary-totals {
      border-top: 2px solid #eee;
      padding-top: 1rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
    }

    .summary-row.total {
      border-top: 2px solid #667eea;
      padding-top: 1rem;
      margin-top: 0.5rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: #667eea;
    }

    @media (max-width: 968px) {
      .checkout-content {
        grid-template-columns: 1fr;
      }

      .order-summary {
        position: static;
        order: -1;
      }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  cartItems: CartItem[] = [];
  subtotal = 0;
  tax = 0;
  total = 0;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {
    const currentUser = this.authService.currentUserValue;
    
    this.checkoutForm = this.fb.group({
      customerName: [currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '', Validators.required],
      tableNumber: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.updateTotals();

      // Redirect if cart is empty
      if (items.length === 0) {
        this.router.navigate(['/customer/cart']);
      }
    });
  }

  updateTotals(): void {
    this.subtotal = this.cartService.subtotal;
    this.tax = this.cartService.tax;
    this.total = this.cartService.total;
  }

  placeOrder(): void {
    if (this.checkoutForm.invalid || this.cartItems.length === 0) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const orderData = {
      customerId: this.authService.currentUserValue?.id,
      customerName: this.checkoutForm.value.customerName,
      tableNumber: this.checkoutForm.value.tableNumber || undefined,
      notes: this.checkoutForm.value.notes || undefined,
      items: this.cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        notes: item.notes
      }))
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Clear cart
          this.cartService.clearCart();
          
          // Show success and redirect
          alert(`Order placed successfully! Order #${response.data.orderNumber}`);
          this.router.navigate(['/customer/orders']);
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error?.message || 'Failed to place order. Please try again.';
        console.error('Error placing order:', error);
      }
    });
  }
}