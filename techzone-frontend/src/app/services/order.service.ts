import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CheckoutRequest, Order, PaymentTransaction } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8080/api/orders';
  private paymentApiUrl = 'http://localhost:8080/api/payments';
  private devPaymentApiUrl = 'http://localhost:8080/api/dev/payments';

  constructor(private http: HttpClient) {}

  checkout(request: CheckoutRequest): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/checkout`, request);
  }

  getOrderByCode(orderCode: string, contact?: string): Observable<Order> {
    const options = contact ? { params: { contact } } : {};
    return this.http.get<Order>(`${this.apiUrl}/${orderCode}`, options);
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/my`);
  }

  getOrderPayments(orderCode: string, contact?: string): Observable<PaymentTransaction[]> {
    const options = contact ? { params: { contact } } : {};
    return this.http.get<PaymentTransaction[]>(`${this.paymentApiUrl}/orders/${orderCode}`, options);
  }

  getPaymentStatus(orderCode: string): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(`${this.paymentApiUrl}/${orderCode}/status`);
  }

  mockPayment(orderCode: string, status: 'success' | 'failed' | 'expired'): Observable<PaymentTransaction> {
    return this.http.post<PaymentTransaction>(`${this.devPaymentApiUrl}/${orderCode}/${status}`, {});
  }
}
