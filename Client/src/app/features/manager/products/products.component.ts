import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product, Category, ProductFormData } from '../../../core/models/product.model';
import { environment } from '../../../../environments/environment.development';

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
  selectedImageFile: File | null = null;
  imagePreview: string | null = null;
  isUploading = false;

  // Base URL for images (without /api/v1)
  private readonly imageBaseUrl = environment.apiUrl.replace('/api/v1', '');

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
    this.selectedImageFile = null;
    this.imagePreview = null;
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
    this.selectedImageFile = null;
    // Show existing image as preview if available
    this.imagePreview = product.image_url ? this.getImageUrl(product.image_url) : null;
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

    this.isUploading = true;

    if (this.editingProduct) {
      this.productService.updateProduct(this.editingProduct.product_id, productData).subscribe({
        next: () => {
          // Upload image if selected
          if (this.selectedImageFile) {
            this.uploadImageForProduct(this.editingProduct!.product_id);
          } else {
            this.isUploading = false;
            alert('Product updated!');
            this.loadProducts();
            this.closeModal();
          }
        },
        error: () => {
          this.isUploading = false;
          alert('Failed to update product');
        }
      });
    } else {
      this.productService.createProduct(productData).subscribe({
        next: (response) => {
          // Upload image if selected
          if (this.selectedImageFile && response.data) {
            this.uploadImageForProduct(response.data.product_id);
          } else {
            this.isUploading = false;
            alert('Product created!');
            this.loadProducts();
            this.closeModal();
          }
        },
        error: () => {
          this.isUploading = false;
          alert('Failed to create product');
        }
      });
    }
  }

  private uploadImageForProduct(productId: string): void {
    if (!this.selectedImageFile) return;

    this.productService.uploadProductImage(productId, this.selectedImageFile).subscribe({
      next: () => {
        this.isUploading = false;
        alert(this.editingProduct ? 'Product updated with image!' : 'Product created with image!');
        this.loadProducts();
        this.closeModal();
      },
      error: (err) => {
        this.isUploading = false;
        console.error('Image upload failed:', err);
        alert('Product saved, but image upload failed. You can try uploading the image again.');
        this.loadProducts();
        this.closeModal();
      }
    });
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return '';
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) return imageUrl;
    // Otherwise, prepend the base URL
    return `${this.imageBaseUrl}${imageUrl}`;
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

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImageFile = file;

      // Create image preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImageFile = null;
    this.imagePreview = null;
  }
}