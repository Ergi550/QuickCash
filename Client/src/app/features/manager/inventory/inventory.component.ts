import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

/**
 * Inventory Component
 * Manage product stock levels
 */
@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.component.html',
  styleUrls: [`./inventory.component.css`]
})
export class InventoryComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  adjustments: { [key: string]: number } = {};
  filter = 'all';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.products = response.data;
          this.applyFilter();
        }
      }
    });
  }

  setFilter(filter: string): void {
    this.filter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.filter === 'low') {
      this.filteredProducts = this.products.filter(p => p.stock <= 10 && p.stock > 0);
    } else if (this.filter === 'out') {
      this.filteredProducts = this.products.filter(p => p.stock === 0);
    } else {
      this.filteredProducts = this.products;
    }
  }

  adjust(product: Product, action: 'add' | 'subtract'): void {
    const qty = this.adjustments[product.id] || 0;
    if (qty <= 0) {
      alert('Please enter a quantity');
      return;
    }
    
    this.productService.updateInventory({ productId: product.id, quantity: qty, action }).subscribe({
      next: () => {
        this.loadProducts();
        this.adjustments[product.id] = 0;
      },
      error: () => alert('Failed to update stock')
    });
  }

  setStock(product: Product): void {
    const qty = prompt(`Set stock for ${product.name}:`, product.stock.toString());
    if (qty && !isNaN(Number(qty))) {
      this.productService.updateInventory({ 
        productId: product.id, 
        quantity: Number(qty), 
        action: 'set' 
      }).subscribe({
        next: () => this.loadProducts(),
        error: () => alert('Failed to set stock')
      });
    }
  }
}