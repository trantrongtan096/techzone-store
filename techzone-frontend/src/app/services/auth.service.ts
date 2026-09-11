import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  
  currentUser = signal<User | null>(null);
  token = signal<string | null>(localStorage.getItem('techzone_token'));

  constructor(private http: HttpClient, private router: Router) {
    const savedUser = localStorage.getItem('techzone_user');
    if (savedUser) {
      try {
        this.currentUser.set(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('techzone_user');
      }
    }
  }

  login(credentials: { email: string; password: String }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  register(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  logout(): void {
    localStorage.removeItem('techzone_token');
    localStorage.removeItem('techzone_user');
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/'], { replaceUrl: true });
  }

  isAdmin(): boolean {
    const role = this.currentUser()?.role;
    return role === 'ROLE_ADMIN' || role === 'ROLE_SUPER_ADMIN';
  }

  isSuperAdmin(): boolean {
    return this.currentUser()?.role === 'ROLE_SUPER_ADMIN';
  }

  private handleAuthSuccess(res: AuthResponse): void {
    if (res.token) {
      localStorage.setItem('techzone_token', res.token);
      const user: User = { email: res.email, fullName: res.fullName, role: res.role };
      localStorage.setItem('techzone_user', JSON.stringify(user));
      this.token.set(res.token);
      this.currentUser.set(user);
    }
  }
}

