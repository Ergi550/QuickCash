import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product, Category } from '../../../core/models/product.model';

/**
 * Menu Component
 * Displays products catalog for customers to browse and add to cart
 */
@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  selectedCategoryId: number | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.productService.getAllCategories(true).subscribe({
      next: (response)=>{
        if(response.success && response.data){
          this.categories = response.data;
        }
      },
      error:(error)=>{
        console.error('Error loading categories:', error);
      }
    });
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

  filterByCategory(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;

    if (categoryId === null) {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(p => p.category_id === categoryId);
    }
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
  }

  increaseQuantity(product: Product): void {
    const currentQty = this.getProductQuantity(product.product_id);
    this.cartService.updateQuantity(product.product_id, currentQty + 1);
  }

  decreaseQuantity(product: Product): void {
    const currentQty = this.getProductQuantity(product.product_id);
    if (currentQty > 0) {
      this.cartService.updateQuantity(product.product_id, currentQty - 1);
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