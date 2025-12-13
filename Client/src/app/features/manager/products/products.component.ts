import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product, ProductCategory } from '../../../core/models/product.model';

/**
 * Products Component
 * Full CRUD management for products
 */
@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="products-page">
      <div class="page-header">
        <h1>🛍️ Products Management</h1>
        <button class="btn btn-primary" (click)="openAddModal()">
          + Add Product
        </button>
      </div>

      <!-- Products Table -->
      <div class="table-card">
        <table class="products-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Cost</th>
              <th>Stock</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let product of products">
              <td>
                <strong>{{ product.name }}</strong>
                <small>{{ product.description }}</small>
              </td>
              <td>
                <span class="category-badge">{{ product.category }}</span>
              </td>
              <td>{{ product.price }} ALL</td>
              <td>{{ product.cost }} ALL</td>
              <td>
                <span [class.low-stock]="product.stock < 10">
                  {{ product.stock }}
                </span>
              </td>
              <td>
                <span class="status-badge" [class.active]="product.isAvailable">
                  {{ product.isAvailable ? 'Yes' : 'No' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn-icon" (click)="editProduct(product)" title="Edit">
                    ✏️
                  </button>
                  <button 
                    class="btn-icon" 
                    (click)="toggleAvailability(product)"
                    title="Toggle Availability"
                  >
                    {{ product.isAvailable ? '🔴' : '🟢' }}
                  </button>
                  <button class="btn-icon danger" (click)="deleteProduct(product)" title="Delete">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="products.length === 0" class="empty-state">
          No products found
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div *ngIf="showModal" class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingProduct ? 'Edit Product' : 'Add New Product' }}</h2>
            <button class="btn-close" (click)="closeModal()">×</button>
          </div>

          <form [formGroup]="productForm" (ngSubmit)="saveProduct()">
            <div class="form-group">
              <label>Product Name *</label>
              <input type="text" formControlName="name" />
            </div>

            <div class="form-group">
              <label>Description *</label>
              <textarea formControlName="description" rows="3"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Category *</label>
                <select formControlName="category">
                  <option value="food">Food</option>
                  <option value="beverage">Beverage</option>
                  <option value="dessert">Dessert</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div class="form-group">
                <label>Available</label>
                <select formControlName="isAvailable">
                  <option [value]="true">Yes</option>
                  <option [value]="false">No</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Price (ALL) *</label>
                <input type="number" formControlName="price" />
              </div>

              <div class="form-group">
                <label>Cost (ALL) *</label>
                <input type="number" formControlName="cost" />
              </div>

              <div class="form-group">
                <label>Stock *</label>
                <input type="number" formControlName="stock" />
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="productForm.invalid">
                {{ editingProduct ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .products-page {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .page-header h1 {
      margin: 0;
      color: #2c3e50;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-secondary {
      background: #95a5a6;
      color: white;
    }

    .table-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }

    .products-table {
      width: 100%;
      border-collapse: collapse;
    }

    .products-table th {
      background: #f8f9fa;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #555;
      border-bottom: 2px solid #dee2e6;
    }

    .products-table td {
      padding: 1rem;
      border-bottom: 1px solid #dee2e6;
    }

    .products-table td small {
      display: block;
      color: #6c757d;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .category-badge {
      padding: 4px 12px;
      background: #667eea;
      color: white;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: capitalize;
    }

    .low-stock {
      color: #e74c3c;
      font-weight: 700;
    }

    .status-badge {
      padding: 4px 12px;
      background: #e74c3c;
      color: white;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .status-badge.active {
      background: #27ae60;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .btn-icon {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.25rem;
    }

    .btn-icon.danger:hover {
      transform: scale(1.2);
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #95a5a6;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h2 {
      margin: 0;
      color: #2c3e50;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      color: #95a5a6;
      line-height: 1;
    }

    form {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #555;
    }

    input, select, textarea {
      width: 100%;
      padding: 10px;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-family: inherit;
    }

    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: #667eea;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding-top: 1rem;
      border-top: 1px solid #dee2e6;
    }
  `]
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  productForm: FormGroup;
  showModal = false;
  editingProduct: Product | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      category: ['food', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      cost: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      isAvailable: [true]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.products = response.data;
        }
      }
    });
  }

  openAddModal(): void {
    this.editingProduct = null;
    this.productForm.reset({ category: 'food', isAvailable: true });
    this.showModal = true;
  }

  editProduct(product: Product): void {
    this.editingProduct = product;
    this.productForm.patchValue(product);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingProduct = null;
    this.productForm.reset();
  }

  saveProduct(): void {
    if (this.productForm.invalid) return;

    const productData = this.productForm.value;

    if (this.editingProduct) {
      this.productService.updateProduct(this.editingProduct.id, productData).subscribe({
        next: () => {
          alert('Product updated!');
          this.loadProducts();
          this.closeModal();
        },
        error: () => alert('Failed to update product')
      });
    } else {
      this.productService.createProduct(productData).subscribe({
        next: () => {
          alert('Product created!');
          this.loadProducts();
          this.closeModal();
        },
        error: () => alert('Failed to create product')
      });
    }
  }

  toggleAvailability(product: Product): void {
    this.productService.updateProduct(product.id, {
      isAvailable: !product.isAvailable
    }).subscribe({
      next: () => {
        this.loadProducts();
      }
    });
  }

  deleteProduct(product: Product): void {
    if (confirm(`Delete ${product.name}?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          alert('Product deleted!');
          this.loadProducts();
        },
        error: () => alert('Failed to delete product')
      });
    }
  }
}