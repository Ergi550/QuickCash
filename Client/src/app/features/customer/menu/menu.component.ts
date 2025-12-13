import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product, ProductCategory } from '../../../core/models/product.model';

/**
 * Menu Component
 * Displays products catalog for customers to browse and add to cart
 */
@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="menu-container">
      <div class="container">
        <!-- Header -->
        <div class="menu-header">
          <h1>Our Menu</h1>
          <p>Choose your favorite items</p>
        </div>

        <!-- Category Filter -->
        <div class="category-filter">
          <button 
            class="category-btn"
            [class.active]="selectedCategory === null"
            (click)="filterByCategory(null)"
          >
            All
          </button>
          <button 
            class="category-btn"
            [class.active]="selectedCategory === ProductCategory.BEVERAGE"
            (click)="filterByCategory(ProductCategory.BEVERAGE)"
          >
            🥤 Beverages
          </button>
          <button 
            class="category-btn"
            [class.active]="selectedCategory === ProductCategory.FOOD"
            (click)="filterByCategory(ProductCategory.FOOD)"
          >
            🍕 Food
          </button>
          <button 
            class="category-btn"
            [class.active]="selectedCategory === ProductCategory.DESSERT"
            (click)="filterByCategory(ProductCategory.DESSERT)"
          >
            🍰 Desserts
          </button>
          <button 
            class="category-btn"
            [class.active]="selectedCategory === ProductCategory.OTHER"
            (click)="filterByCategory(ProductCategory.OTHER)"
          >
            💠💠💠 Other
          </button>



        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading">
          <div class="spinner"></div>
          <p>Loading menu...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="errorMessage" class="alert alert-error">
          {{ errorMessage }}
        </div>

        <!-- Products Grid -->
        <div *ngIf="!isLoading && !errorMessage" class="products-grid">
          <div *ngFor="let product of filteredProducts" class="product-card">
            <div class="product-image">
              <img 
                [src]="product.imageUrl || 'assets/placeholder.png'" 
                [alt]="product.name"
                (error)="onImageError($event)"
              />
              <span 
                class="badge out-of-stock" 
                *ngIf="!product.isAvailable"
              >
                Out of Stock
              </span>
            </div>

            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-description">{{ product.description }}</p>
              
              <div class="product-footer">
                <div class="product-price">
                  {{ product.price }} ALL
                </div>
                
                <div class="product-actions">
                  <div class="quantity-selector" *ngIf="getProductQuantity(product.id) > 0">
                    <button 
                      class="qty-btn"
                      (click)="decreaseQuantity(product)"
                    >
                      -
                    </button>
                    <span class="qty-display">{{ getProductQuantity(product.id) }}</span>
                    <button 
                      class="qty-btn"
                      (click)="increaseQuantity(product)"
                      [disabled]="!product.isAvailable"
                    >
                      +
                    </button>
                  </div>
                  
                  <button 
                    *ngIf="getProductQuantity(product.id) === 0"
                    class="btn btn-primary"
                    (click)="addToCart(product)"
                    [disabled]="!product.isAvailable"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && filteredProducts.length === 0" class="empty-state">
          <h3>No products found</h3>
          <p>Try selecting a different category</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .menu-container {
      padding: 2rem 0;
      min-height: calc(100vh - 200px);
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .menu-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .menu-header h1 {
      color: #333;
      margin-bottom: 0.5rem;
    }

    .menu-header p {
      color: #666;
      font-size: 1.125rem;
    }

    .category-filter {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .category-btn {
      padding: 10px 20px;
      border: 2px solid #ddd;
      background: white;
      border-radius: 25px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s;
    }

    .category-btn:hover {
      border-color: #667eea;
      color: #667eea;
    }

    .category-btn.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-color: transparent;
    }

    .loading {
      text-align: center;
      padding: 3rem;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2rem;
    }

    .product-card {
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 20px rgba(0,0,0,0.15);
    }

    .product-image {
      position: relative;
      height: 200px;
      background: #f0f0f0;
      overflow: hidden;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .badge.out-of-stock {
      position: absolute;
      top: 10px;
      right: 10px;
      background: #dc3545;
      color: white;
      padding: 5px 10px;
      border-radius: 5px;
      font-size: 12px;
      font-weight: 600;
    }

    .product-info {
      padding: 1.25rem;
    }

    .product-name {
      font-size: 1.25rem;
      color: #333;
      margin: 0 0 0.5rem 0;
    }

    .product-description {
      color: #666;
      font-size: 0.875rem;
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    .product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .product-price {
      font-size: 1.5rem;
      font-weight: 700;
      color: #667eea;
    }

    .product-actions {
      display: flex;
      gap: 0.5rem;
    }

    .quantity-selector {
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

    .qty-btn:hover:not(:disabled) {
      background: #764ba2;
    }

    .qty-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .qty-display {
      min-width: 30px;
      text-align: center;
      font-weight: 600;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.3s;
    }

    .btn-primary:hover:not(:disabled) {
      transform: scale(1.05);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #666;
    }

    @media (max-width: 768px) {
      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
      }
    }
  `]
})
export class MenuComponent implements OnInit {
  ProductCategory = ProductCategory;

  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedCategory: ProductCategory | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getAllProducts({ available: true }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.products = response.data;
          this.filteredProducts = this.products;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load menu. Please try again.';
        this.isLoading = false;
        console.error('Error loading products:', error);
      }
    });
  }

  filterByCategory(category: ProductCategory | null): void {
    this.selectedCategory = category;
    
    if (category === null) {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(p => p.category === category);
    }
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
  }

  increaseQuantity(product: Product): void {
    const currentQty = this.getProductQuantity(product.id);
    this.cartService.updateQuantity(product.id, currentQty + 1);
  }

  decreaseQuantity(product: Product): void {
    const currentQty = this.getProductQuantity(product.id);
    if (currentQty > 0) {
      this.cartService.updateQuantity(product.id, currentQty - 1);
    }
  }

  getProductQuantity(productId: string): number {
    const cartItem = this.cartService.cartItems.find(item => item.product.id === productId);
    return cartItem ? cartItem.quantity : 0;
  }

  onImageError(event: any): void {
    event.target.src = 'assets/placeholder.png';
  }
}