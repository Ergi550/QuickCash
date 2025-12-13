import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { 
  Order, 
  CreateOrderRequest, 
  OrderStatus,
  ApiResponse 
} from '../models/order.model';

/**
 * Order Service
 * Handles order operations
 */
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly API_URL = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  /**
   * Get all orders
   */
  getAllOrders(status?: OrderStatus): Observable<ApiResponse<Order[]>> {
    let params = new HttpParams();
    
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<ApiResponse<Order[]>>(this.API_URL, { params });
  }

  /**
   * Get order by ID
   */
  getOrderById(orderId: string): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.API_URL}/${orderId}`);
  }

  /**
   * Get customer's orders
   */
  getCustomerOrders(customerId: string): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.API_URL}/customer/${customerId}`);
  }

  /**
   * Create new order
   */
  createOrder(orderData: CreateOrderRequest): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(this.API_URL, orderData);
  }

  /**
   * Update order status
   */
  updateOrderStatus(orderId: string, status: OrderStatus): Observable<ApiResponse<Order>> {
    return this.http.patch<ApiResponse<Order>>(
      `${this.API_URL}/${orderId}/status`,
      { status }
    );
  }

  /**
   * Cancel order
   */
  cancelOrder(orderId: string): Observable<ApiResponse<Order>> {
    return this.http.delete<ApiResponse<Order>>(`${this.API_URL}/${orderId}`);
  }

  /**
   * Get today's orders
   */
  getTodayOrders(): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.API_URL}/reports/today`);
  }

  /**
   * Get orders by date range
   */
  getOrdersByDateRange(startDate: string, endDate: string): Observable<ApiResponse<Order[]>> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<ApiResponse<Order[]>>(`${this.API_URL}/reports/range`, { params });
  }
}