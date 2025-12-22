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
  templateUrl: './products.component.html',
  styleUrls: [`./products.component.css`]
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
      this.productService.updateProduct(this.editingProduct.product_id, productData).subscribe({
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
    this.productService.updateProduct(product.product_id, {
      is_available: !product.is_available
    }).subscribe({
      next: () => {
        this.loadProducts();
      }
    });
  }

  deleteProduct(product: Product): void {
    if (confirm(`Delete ${product.product_name}?`)) {
      this.productService.deleteProduct(product.product_id).subscribe({
        next: () => {
          alert('Product deleted!');
          this.loadProducts();
        },
        error: () => alert('Failed to delete product')
      });
    }
  }
}