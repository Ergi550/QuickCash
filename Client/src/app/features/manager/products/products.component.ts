import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product, Category, ProductFormData } from '../../../core/models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  productForm: FormGroup;
  showModal = false;
  editingProduct: Product | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService
  ) {
    this.productForm = this.fb.group({
      product_name: ['', Validators.required],
      description: [''],
      category_id: [null],
      selling_price: [0, [Validators.required, Validators.min(0)]],
      cost_price: [0, [Validators.required, Validators.min(0)]],
      initial_quantity: [0, [Validators.required, Validators.min(0)]],
      is_available: [true]
    });
  }

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
      },
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.products = response.data;
        }
      },
      error: (err) => console.error('Error loading products:', err)
    });
  }

  openAddModal(): void {
    this.editingProduct = null;
    this.productForm.reset({ 
      category_id: null, 
      is_available: true,
      selling_price: 0,
      cost_price: 0,
      initial_quantity: 0
    });
    this.showModal = true;
  }

  editProduct(product: Product): void {
    this.editingProduct = product;
    this.productForm.patchValue({
      product_name: product.product_name,
      description: product.description,
      category_id: product.category_id,
      selling_price: product.selling_price,
      cost_price: product.cost_price,
      initial_quantity: product.current_quantity,
      is_available: product.is_available
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingProduct = null;
    this.productForm.reset();
  }

  saveProduct(): void {
    if (this.productForm.invalid) return;

    const formValue = this.productForm.value;
    
    const productData: ProductFormData = {
      product_name: formValue.product_name,
      description: formValue.description,
      category_id: formValue.category_id ? Number(formValue.category_id) : undefined,
      selling_price: Number(formValue.selling_price),
      cost_price: Number(formValue.cost_price),
      current_quantity: Number(formValue.initial_quantity),
      is_available: formValue.is_available
    };

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
      next: () => this.loadProducts()
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