import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { 
  Payment, 
  ProcessPaymentRequest, 
  PaymentResponse,
  ApiResponse 
} from '../models/payment.model';

/**
 * Payment Service
 * Handles payment operations
 */
@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly API_URL = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  /**
   * Process payment
   */
  processPayment(paymentData: ProcessPaymentRequest): Observable<ApiResponse<PaymentResponse>> {
    return this.http.post<ApiResponse<PaymentResponse>>(
      `${this.API_URL}/process`,
      paymentData
    );
  }

  /**
   * Get payment by ID
   */
  getPaymentById(paymentId: string): Observable<ApiResponse<Payment>> {
    return this.http.get<ApiResponse<Payment>>(`${this.API_URL}/${paymentId}`);
  }

  /**
   * Get payments by order
   */
  getPaymentsByOrder(orderId: string): Observable<ApiResponse<Payment[]>> {
    return this.http.get<ApiResponse<Payment[]>>(`${this.API_URL}/order/${orderId}`);
  }

  /**
   * Get all payments
   */
  getAllPayments(): Observable<ApiResponse<Payment[]>> {
    return this.http.get<ApiResponse<Payment[]>>(this.API_URL);
  }

  /**
   * Refund payment (Manager only)
   */
  refundPayment(paymentId: string, reason?: string): Observable<ApiResponse<Payment>> {
    return this.http.post<ApiResponse<Payment>>(
      `${this.API_URL}/${paymentId}/refund`,
      { reason }
    );
  }

  /**
   * Get total revenue
   */
  getTotalRevenue(startDate?: string, endDate?: string): Observable<ApiResponse<{ revenue: number; currency: string }>> {
    let params = new HttpParams();
    
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    
    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<ApiResponse<{ revenue: number; currency: string }>>(
      `${this.API_URL}/reports/revenue`,
      { params }
    );
  }
}