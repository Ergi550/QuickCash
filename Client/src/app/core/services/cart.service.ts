import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../models/order.model';
import { Product } from '../models/product.model';

/**
 * Cart Service
 * Manages shopping cart state for customer orders
 */
@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'quickcash_cart';
  
  // Cart items state
  private cartItemsSubject = new BehaviorSubject<CartItem[]>(this.loadCartFromStorage());
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor() {}

  /**
   * Add product to cart
   */
  addToCart(product: Product, quantity: number = 1, notes?: string): void {
    const currentCart = this.cartItemsSubject.value;
    
    // Check if product already in cart
    const existingItemIndex = currentCart.findIndex(
      item => item.product.id === product.product_id
    );

    if (existingItemIndex > -1) {
      // Update quantity
      currentCart[existingItemIndex].quantity += quantity;
      if (notes) {
        currentCart[existingItemIndex].notes = notes;
      }
    } else {
      // Add new item
      const cartItem: CartItem = {
        product: {
          product_id: product.product_id,
          id: product.product_id,
          name: product.product_name,
          price: product.cost_price,
          imageUrl: product.image_url
        },
        quantity,
        notes
      };
      currentCart.push(cartItem);
    }

    this.updateCart(currentCart);
  }

  /**
   * Remove product from cart
   */
  removeFromCart(productId: string): void {
    const currentCart = this.cartItemsSubject.value.filter(
      item => item.product.id !== productId
    );
    this.updateCart(currentCart);
  }

  /**
   * Update item quantity
   */
  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentCart = this.cartItemsSubject.value.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity };
      }
      return item;
    });

    this.updateCart(currentCart);
  }

  /**
   * Update item notes
   */
  updateNotes(productId: string, notes: string): void {
    const currentCart = this.cartItemsSubject.value.map(item => {
      if (item.product.id === productId) {
        return { ...item, notes };
      }
      return item;
    });

    this.updateCart(currentCart);
  }

  /**
   * Clear entire cart
   */
  clearCart(): void {
    this.updateCart([]);
  }

  /**
   * Get cart items (synchronous)
   */
  get cartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  /**
   * Get cart item count
   */
  get itemCount(): number {
    return this.cartItemsSubject.value.reduce((count, item) => count + item.quantity, 0);
  }

  /**
   * Calculate subtotal
   */
  get subtotal(): number {
    return this.cartItemsSubject.value.reduce(
      (total, item) => total + (item.product.price * item.quantity),
      0
    );
  }

  /**
   * Calculate tax (20%)
   */
  get tax(): number {
    return this.subtotal * 0.20;
  }

  /**
   * Calculate total
   */
  get total(): number {
    return this.subtotal + this.tax;
  }

  /**
   * Update cart and persist to storage
   */
  private updateCart(items: CartItem[]): void {
    this.cartItemsSubject.next(items);
    this.saveCartToStorage(items);
  }

  /**
   * Save cart to localStorage
   */
  private saveCartToStorage(items: CartItem[]): void {
    localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(items));
  }

  /**
   * Load cart from localStorage
   */
  private loadCartFromStorage(): CartItem[] {
    const cartJson = localStorage.getItem(this.CART_STORAGE_KEY);
    return cartJson ? JSON.parse(cartJson) : [];
  }
}