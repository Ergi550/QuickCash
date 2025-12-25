import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product, Category } from '../../../core/models/product.model';

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
export class PosComponent implements OnInit {
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


  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.productService.getAllCategories().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.categories = response.data;
        }
      }
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getAllProducts({ available: true }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.products = response.data;
          this.filteredProducts = this.products;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
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
    this.amountReceived = this.total;
    this.showPaymentModal = true;
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
  }

  processPayment(): void {
    if (this.paymentMethod === 'cash' && this.amountReceived < this.total) {
      alert('Insufficient amount received!');
      return;
    }

    // Create order object
    this.lastOrder = {
      orderNumber: 'ORD-' + Date.now(),
      date: new Date(),
      items: [...this.cart],
      subtotal: this.subtotal,
      tax: this.taxAmount,
      total: this.total,
      paymentMethod: this.paymentMethod,
      amountReceived: this.amountReceived,
      change: this.change,
      customerName: this.customerName,
      customerPhone: this.customerPhone,
      tableNumber: this.tableNumber,
      note: this.orderNote
    };

    // TODO: Send to backend
    // this.orderService.createOrder(this.lastOrder).subscribe(...)

    this.showPaymentModal = false;
    this.showReceiptModal = true;
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