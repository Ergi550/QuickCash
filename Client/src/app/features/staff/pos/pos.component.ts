import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { ProductService } from '../../../core/services/product.service';
import { OrderService } from '../../../core/services/order.service';
import { PaymentService } from '../../../core/services/payment.service';
import { Product, Category } from '../../../core/models/product.model';
import { CreateOrderRequest } from '../../../core/models/order.model';

interface CartItem {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.css']
})
export class PosComponent implements OnInit, OnDestroy {
  Math = Math;
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  selectedCategoryId: number | null = null;

  cart: CartItem[] = [];
  searchTerm: string = '';

  // Customer info
  customerName: string = '';
  customerPhone: string = '';
  tableNumber: string = '';
  orderNote: string = '';

  // Payment
  paymentMethod: 'cash' | 'card' | 'transfer' = 'cash';
  amountReceived: number = 0;

  isLoading = false;
  showPaymentModal = false;
  showReceiptModal = false;
  lastOrder: any = null;
  isSavingOrder = false;

  // Subscription cleanup
  private destroy$ = new Subject<void>();


  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategories(): void {
    this.productService.getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.categories = response.data;
          }
        }
      });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getAllProducts({ available: true })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.products = response.data;
            this.filteredProducts = this.products;
          }
        },
        error: () => {
          // Error already handled by finalize
        }
      });
  }

  filterByCategory(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    this.applyFilters();
  }

  searchProducts(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = this.products;

    // Filter by category
    if (this.selectedCategoryId !== null) {
      result = result.filter(p => p.category_id === this.selectedCategoryId);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p => 
        p.product_name.toLowerCase().includes(term) ||
        p.product_id?.toLowerCase().includes(term)
      );
    }

    this.filteredProducts = result;
  }

  // Cart functions
  addToCart(product: Product): void {
    const existingItem = this.cart.find(item => item.product.product_id === product.product_id);
    
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cart.push({ product, quantity: 1 });
    }
  }

  removeFromCart(index: number): void {
    this.cart.splice(index, 1);
  }

  updateQuantity(index: number, change: number): void {
    const item = this.cart[index];
    item.quantity += change;
    
    if (item.quantity <= 0) {
      this.removeFromCart(index);
    }
  }

  setQuantity(index: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(index);
    } else {
      this.cart[index].quantity = quantity;
    }
  }

  clearCart(): void {
    if (this.cart.length > 0 && confirm('Clear all items from cart?')) {
      this.cart = [];
      this.customerName = '';
      this.customerPhone = '';
      this.tableNumber = '';
      this.orderNote = '';
    }
  }

  // Calculations
  get subtotal(): number {
    return this.cart.reduce((sum, item) => sum + (item.product.selling_price * item.quantity), 0);
  }

  get taxAmount(): number {
    return this.cart.reduce((sum, item) => {
      const itemTotal = item.product.selling_price * item.quantity;
      const tax = itemTotal * (item.product.tax_rate || 0) / 100;
      return sum + tax;
    }, 0);
  }

  get total(): number {
    return this.subtotal + this.taxAmount;
  }

  get change(): number {
    return Math.max(0, this.amountReceived - this.total);
  }

  get totalItems(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  

  // Payment
  openPaymentModal(): void {
    if (this.cart.length === 0) {
      alert('Cart is empty!');
      return;
    }
    // Reset payment method to cash and amount to 0 for new order
    this.paymentMethod = 'cash';
    this.amountReceived = 0;
    this.showPaymentModal = true;
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
  }

  placeOrder(): void {
    // Early return if already processing - prevents double-click
    if (this.isSavingOrder) {
      return;
    }

    if (this.cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    // Set flag IMMEDIATELY before any async operation
    this.isSavingOrder = true;

    // Prepare order data for backend (status will be PENDING)
    const orderRequest: any = {
      items: this.cart.map(item => ({
        product_id: parseInt(item.product.product_id as any),
        quantity: item.quantity
      })),
      table_number: this.tableNumber || undefined,
      notes: this.orderNote || undefined
    };

    // Add customer name to notes if provided
    if (this.customerName && this.orderNote) {
      orderRequest.notes = `Customer: ${this.customerName}\n${this.orderNote}`;
    } else if (this.customerName) {
      orderRequest.notes = `Customer: ${this.customerName}`;
    }

    // Save order to backend with PENDING status
    this.orderService.createOrder(orderRequest)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSavingOrder = false)
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            alert(`Order #${response.data.order_number} placed successfully! You can pay it later from Orders section.`);

            // Clear cart and form
            this.cart = [];
            this.customerName = '';
            this.customerPhone = '';
            this.tableNumber = '';
            this.orderNote = '';
            this.amountReceived = 0;
          } else {
            alert('Failed to place order: ' + (response.message || 'Unknown error'));
          }
        },
        error: (error) => {
          console.error('Error placing order:', error);
          alert('Failed to place order: ' + (error.error?.message || error.message || 'Network error'));
        }
      });
  }

  processPayment(): void {
    // Early return if already processing - prevents double-click
    if (this.isSavingOrder) {
      return;
    }

    if (this.paymentMethod === 'cash' && this.amountReceived < this.total) {
      alert('Insufficient amount received!');
      return;
    }

    // Set flag IMMEDIATELY before any async operation
    this.isSavingOrder = true;

    // Prepare order data for backend
    const orderRequest: any = {
      items: this.cart.map(item => ({
        product_id: parseInt(item.product.product_id as any),
        quantity: item.quantity
      })),
      table_number: this.tableNumber || undefined,
      notes: this.orderNote || undefined
    };

    // Add customer name to notes if provided (for walk-in customers)
    if (this.customerName && this.orderNote) {
      orderRequest.notes = `Customer: ${this.customerName}\n${this.orderNote}`;
    } else if (this.customerName) {
      orderRequest.notes = `Customer: ${this.customerName}`;
    }

    // Save order to backend
    this.orderService.createOrder(orderRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const orderId = response.data.order_id;

            // Now process the payment
            const paymentData = {
              order_id: orderId.toString(),
              amount_paid: this.paymentMethod === 'cash' ? this.amountReceived : this.total,
              payment_method: this.paymentMethod as any
            };

            this.paymentService.processPayment(paymentData)
              .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.isSavingOrder = false)
              )
              .subscribe({
                next: (paymentResponse) => {
                  if (paymentResponse.success && paymentResponse.data && response.data) {
                    // Store order info for receipt
                    this.lastOrder = {
                      orderNumber: response.data.order_number,
                      orderId: response.data.order_id,
                      date: response.data.created_at,
                      items: [...this.cart],
                      subtotal: this.subtotal,
                      tax: this.taxAmount,
                      total: this.total,
                      paymentMethod: this.paymentMethod,
                      amountReceived: this.paymentMethod === 'cash' ? this.amountReceived : this.total,
                      change: this.paymentMethod === 'cash' ? this.change : 0,
                      customerName: this.customerName,
                      customerPhone: this.customerPhone,
                      tableNumber: this.tableNumber,
                      note: this.orderNote
                    };

                    this.showPaymentModal = false;
                    this.showReceiptModal = true;
                  } else {
                    alert('Payment failed: ' + (paymentResponse.message || 'Unknown error'));
                  }
                },
                error: (error) => {
                  console.error('Error processing payment:', error);
                  alert('Payment failed: ' + (error.error?.message || error.message || 'Network error'));
                }
              });
          } else {
            this.isSavingOrder = false;
            alert('Failed to create order: ' + (response.message || 'Unknown error'));
          }
        },
        error: (error) => {
          this.isSavingOrder = false;
          console.error('Error creating order:', error);
          alert('Failed to create order: ' + (error.error?.message || error.message || 'Network error'));
        }
      });
  }

  closeReceipt(): void {
    this.showReceiptModal = false;
    // Clear everything for next order
    this.cart = [];
    this.customerName = '';
    this.customerPhone = '';
    this.tableNumber = '';
    this.orderNote = '';
    this.amountReceived = 0;
  }

  printReceipt(): void {
    window.print();
  }

  getProductEmoji(categoryName: string | undefined): string {
    if (!categoryName) return '🛒';
    
    const name = categoryName.toLowerCase();
    if (name.includes('food') || name.includes('ushqim')) return '🍕';
    if (name.includes('beverage') || name.includes('pije')) return '🥤';
    if (name.includes('dessert') || name.includes('ëmbëlsirë')) return '🍰';
    if (name.includes('coffee') || name.includes('kafe')) return '☕';
    if (name.includes('pizza')) return '🍕';
    if (name.includes('burger')) return '🍔';
    
    return '📦';
  }
}