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
  template: `
    <div class="inventory-page">
      <div class="page-header">
        <h1>📦 Inventory Management</h1>
        <div class="filter-tabs">
          <button [class.active]="filter === 'all'" (click)="setFilter('all')">All</button>
          <button [class.active]="filter === 'low'" (click)="setFilter('low')">Low Stock</button>
          <button [class.active]="filter === 'out'" (click)="setFilter('out')">Out of Stock</button>
        </div>
      </div>

      <div class="table-card">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Current Stock</th>
              <th>Adjust Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let product of filteredProducts">
              <td><strong>{{ product.name }}</strong></td>
              <td>
                <span [class.low]="product.stock < 10" [class.out]="product.stock === 0">
                  {{ product.stock }}
                </span>
              </td>
              <td>
                <div class="adjust-controls">
                  <input type="number" [(ngModel)]="adjustments[product.id]" placeholder="Quantity" min="1" />
                  <button class="btn-add" (click)="adjust(product, 'add')">+ Add</button>
                  <button class="btn-remove" (click)="adjust(product, 'subtract')">- Remove</button>
                </div>
              </td>
              <td>
                <button class="btn-set" (click)="setStock(product)">Set Stock</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .inventory-page { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    h1 { margin: 0; color: #2c3e50; }
    .filter-tabs { display: flex; gap: 0.5rem; }
    .filter-tabs button { padding: 8px 16px; border: 2px solid #ddd; background: white; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .filter-tabs button.active { background: #667eea; color: white; border-color: #667eea; }
    .table-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f8f9fa; padding: 1rem; text-align: left; font-weight: 600; }
    td { padding: 1rem; border-bottom: 1px solid #dee2e6; }
    .low { color: #f39c12; font-weight: 700; }
    .out { color: #e74c3c; font-weight: 700; }
    .adjust-controls { display: flex; gap: 0.5rem; align-items: center; }
    .adjust-controls input { width: 100px; padding: 8px; border: 2px solid #ddd; border-radius: 6px; }
    .btn-add, .btn-remove, .btn-set { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
    .btn-add { background: #27ae60; color: white; }
    .btn-remove { background: #e74c3c; color: white; }
    .btn-set { background: #3498db; color: white; }
  `]
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