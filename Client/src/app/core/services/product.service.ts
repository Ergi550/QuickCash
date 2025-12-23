import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { 
  Product, 
  ProductFormData, 
  Category,
  InventoryUpdate,
  ApiResponse 
} from '../models/product.model';

/**
 * Product Service
 * Handles product and inventory operations
 */
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = `${environment.apiUrl}/products`;
  private readonly CATEGORY_URL = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  /**
   * Get all products
   */
  getAllProducts(filters?: { 
    available?: boolean, 
    category_id?:number,
  }): Observable<ApiResponse<Product[]>> {
    let params = new HttpParams();
    
    if (filters?.available !== undefined) {
      params = params.set('available', filters.available.toString());
    }
    
    if (filters?.category_id) {
      params = params.set('category', filters.category_id.toString());
    }

    return this.http.get<ApiResponse<Product[]>>(this.API_URL, { params });
  }
   /**
   * Get all categories
   */
  getAllCategories(activeOnly: boolean = true): Observable<ApiResponse<Category[]>> {
    const params = new HttpParams().set('active', activeOnly.toString());
    return this.http.get<ApiResponse<Category[]>>(this.CATEGORY_URL, { params });
  }
  /**
   * Get product by ID
   */
  getProductById(productId: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.API_URL}/${productId}`);
  }
  getProductsByCategory(categoryId:number): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.API_URL}/category/${categoryId}`);
  }
  /**
   * Create new product (Manager only)
   */
  createProduct(productData: ProductFormData): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(this.API_URL, productData);
  }

  /**
   * Update product (Manager only)
   */
  updateProduct(productId: string, productData: Partial<ProductFormData>): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.API_URL}/${productId}`, productData);
  }

  /**
   * Delete product (Manager only)
   */
  deleteProduct(productId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${productId}`);
  }

  /**
   * Update inventory (Staff/Manager)
   */
  updateInventory(update: InventoryUpdate): Observable<ApiResponse<Product>> {
    return this.http.patch<ApiResponse<Product>>(
      `${this.API_URL}/${update.product_id}/inventory`,
      { quantity: update.current_quantity, action: update.action }
    );
  }

  /**
   * Get low stock products
   */
  getLowStockProducts(threshold: number = 10): Observable<ApiResponse<Product[]>> {
    const params = new HttpParams().set('threshold', threshold.toString());
    return this.http.get<ApiResponse<Product[]>>(`${this.API_URL}/inventory/low-stock`, { params });
  }

  /**
   * Get out of stock products
   */
  getOutOfStockProducts(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.API_URL}/inventory/out-of-stock`);
  }
}