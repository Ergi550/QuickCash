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
  template: `
    <div class="cart-container">
      <div class="container">
        <div class="cart-header">
          <h1>🛒 Shopping Cart</h1>
        </div>

        <!-- Empty Cart -->
        <div *ngIf="cartItems.length === 0" class="empty-cart">
          <div class="empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some delicious items from our menu!</p>
          <a routerLink="/customer/menu" class="btn btn-primary">
            Browse Menu
          </a>
        </div>

        <!-- Cart Items -->
        <div *ngIf="cartItems.length > 0" class="cart-content">
          <div class="cart-items">
            <div *ngFor="let item of cartItems" class="cart-item">
              <div class="item-image">
                <img 
                  [src]="item.product.imageUrl || 'assets/placeholder.png'" 
                  [alt]="item.product.name"
                />
              </div>

              <div class="item-details">
                <h3>{{ item.product.name }}</h3>
                <p class="item-price">{{ item.product.price }} ALL</p>
                <p *ngIf="item.notes" class="item-notes">
                  <strong>Notes:</strong> {{ item.notes }}
                </p>
              </div>

              <div class="item-quantity">
                <button 
                  class="qty-btn"
                  (click)="decreaseQuantity(item.product.id)"
                >
                  -
                </button>
                <span class="qty-display">{{ item.quantity }}</span>
                <button 
                  class="qty-btn"
                  (click)="increaseQuantity(item.product.id)"
                >
                  +
                </button>
              </div>

              <div class="item-subtotal">
                {{ item.product.price * item.quantity }} ALL
              </div>

              <button 
                class="btn-remove"
                (click)="removeItem(item.product.id)"
                title="Remove item"
              >
                🗑️
              </button>
            </div>
          </div>

          <!-- Cart Summary -->
          <div class="cart-summary">
            <div class="summary-card">
              <h2>Order Summary</h2>
              
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

              <button 
                class="btn btn-primary btn-block"
                (click)="proceedToCheckout()"
              >
                Proceed to Checkout
              </button>

              <a 
                routerLink="/customer/menu" 
                class="btn btn-outline btn-block"
              >
                Continue Shopping
              </a>

              <button 
                class="btn btn-danger btn-block"
                (click)="clearCart()"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-container {
      padding: 2rem 0;
      min-height: calc(100vh - 200px);
      background: #f5f5f5;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .cart-header {
      margin-bottom: 2rem;
    }

    .cart-header h1 {
      color: #333;
    }

    .empty-cart {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .empty-icon {
      font-size: 5rem;
      margin-bottom: 1rem;
    }

    .empty-cart h2 {
      color: #333;
      margin-bottom: 0.5rem;
    }

    .empty-cart p {
      color: #666;
      margin-bottom: 2rem;
    }

    .cart-content {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 2rem;
    }

    .cart-items {
      background: white;
      border-radius: 10px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .cart-item {
      display: grid;
      grid-template-columns: 80px 1fr auto auto auto;
      gap: 1rem;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #eee;
    }

    .cart-item:last-child {
      border-bottom: none;
    }

    .item-image {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      overflow: hidden;
      background: #f0f0f0;
    }

    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .item-details h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1.125rem;
      color: #333;
    }

    .item-price {
      color: #667eea;
      font-weight: 600;
      margin: 0;
    }

    .item-notes {
      font-size: 0.875rem;
      color: #666;
      margin: 0.5rem 0 0 0;
    }

    .item-quantity {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #f0f0f0;
      border-radius: 5px;
      padding: 5px;
    }

    .qty-btn {
      width: 30px;
      height: 30px;
      border: none;
      background: #667eea;
      color: white;
      border-radius: 5px;
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.3s;
    }

    .qty-btn:hover {
      background: #764ba2;
    }

    .qty-display {
      min-width: 40px;
      text-align: center;
      font-weight: 600;
    }

    .item-subtotal {
      font-size: 1.125rem;
      font-weight: 600;
      color: #333;
      min-width: 100px;
      text-align: right;
    }

    .btn-remove {
      background: transparent;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.5rem;
      transition: transform 0.3s;
    }

    .btn-remove:hover {
      transform: scale(1.2);
    }

    .cart-summary {
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

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid #eee;
    }

    .summary-row.total {
      border-top: 2px solid #667eea;
      border-bottom: none;
      padding-top: 1rem;
      margin-top: 0.5rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: #667eea;
    }

    .btn-block {
      width: 100%;
      margin-top: 1rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 5px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.3s;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
    }

    .btn-outline {
      background: transparent;
      border: 2px solid #667eea;
      color: #667eea;
      padding: 12px 24px;
      border-radius: 5px;
      font-weight: 600;
      cursor: pointer;
      text-align: center;
      display: block;
      text-decoration: none;
      transition: all 0.3s;
    }

    .btn-outline:hover {
      background: #667eea;
      color: white;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 5px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.3s;
    }

    .btn-danger:hover {
      opacity: 0.9;
    }

    @media (max-width: 968px) {
      .cart-content {
        grid-template-columns: 1fr;
      }

      .cart-summary {
        position: static;
      }

      .cart-item {
        grid-template-columns: 60px 1fr;
        gap: 0.75rem;
      }

      .item-quantity,
      .item-subtotal {
        grid-column: 2;
      }

      .btn-remove {
        grid-column: 2;
        justify-self: end;
      }
    }
  `]
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