import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { CartItem } from '../../../core/models/order.model';

/**
 * Cart Component
 * Displays shopping cart and allows quantity adjustments
 */
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']

})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  subtotal = 0;
  tax = 0;
  total = 0;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.updateTotals();
    });
  }

  updateTotals(): void {
    this.subtotal = this.cartService.subtotal;
    this.tax = this.cartService.tax;
    this.total = this.cartService.total;
  }

  increaseQuantity(productId: string): void {
    const item = this.cartItems.find(i => i.product.id === productId);
    if (item) {
      this.cartService.updateQuantity(productId, item.quantity + 1);
    }
  }

  decreaseQuantity(productId: string): void {
    const item = this.cartItems.find(i => i.product.id === productId);
    if (item && item.quantity > 1) {
      this.cartService.updateQuantity(productId, item.quantity - 1);
    }
  }

  removeItem(productId: string): void {
    if (confirm('Remove this item from cart?')) {
      this.cartService.removeFromCart(productId);
    }
  }

  clearCart(): void {
    if (confirm('Clear entire cart?')) {
      this.cartService.clearCart();
    }
  }

  proceedToCheckout(): void {
    this.router.navigate(['/customer/checkout']);
  }
}