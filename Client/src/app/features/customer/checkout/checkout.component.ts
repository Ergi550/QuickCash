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
  templateUrl: './checkout.component.html',
  styleUrls: [`./checkout.component.css`]
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
      customerName: [currentUser ? ` ${currentUser.full_name}` : '', Validators.required],
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
      customer_id: this.authService.currentUserValue?.user_id,
      customer_name: this.checkoutForm.value.customer_name,
      table_number: this.checkoutForm.value.table_number || undefined,
      notes: this.checkoutForm.value.notes || undefined,
      items: this.cartItems.map(item => ({
        product_id: item.product.product_id,
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
          alert(`Order placed successfully! Order #${response.data.order_number}`);
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