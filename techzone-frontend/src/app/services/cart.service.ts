import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Cart } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:8080/api/cart';
  
  cart = signal<Cart | null>(null);
  itemCount = signal<number>(0);
  sessionId: string;

  constructor(private http: HttpClient) {
    let savedSession = localStorage.getItem('techzone_session_id');
    if (!savedSession) {
      savedSession = 'session_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('techzone_session_id', savedSession);
    }
    this.sessionId = savedSession;
    this.loadCart();
  }

  loadCart(): void {
    this.http.get<Cart>(this.apiUrl, { params: { sessionId: this.sessionId } }).subscribe({
      next: (cartData) => this.updateCartState(cartData),
      error: () => {}
    });
  }

  addToCart(productOrId: any, quantity: number = 1): Observable<Cart> {
    const productId = typeof productOrId === 'object' ? productOrId.id : productOrId;
    return this.http.post<Cart>(`${this.apiUrl}/add`, {
      productId,
      quantity,
      sessionId: this.sessionId
    }).pipe(
      tap(updatedCart => this.updateCartState(updatedCart))
    );
  }

  updateQuantity(itemId: number, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(`${this.apiUrl}/items/${itemId}`, null, {
      params: { quantity: quantity.toString() }
    }).pipe(
      tap(updatedCart => this.updateCartState(updatedCart))
    );
  }

  removeItem(itemId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/items/${itemId}`).pipe(
      tap(updatedCart => this.updateCartState(updatedCart))
    );
  }

  private updateCartState(cartData: Cart): void {
    this.cart.set(cartData);
    const count = cartData.items ? cartData.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
    this.itemCount.set(count);
  }
}
