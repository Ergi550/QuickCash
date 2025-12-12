import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { User, AuthResponse, LoginRequest } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private tokenKey = 'quickcash_token';
  private userKey = 'quickcash_user';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Lexo user nga localStorage
    const storedUser = localStorage.getItem(this.userKey);
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // Merr current user value
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Merr token
  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Check nëse është logged in
  public get isLoggedIn(): boolean {
    return !!this.getToken() && !!this.currentUserValue;
  }

  // Check role
  public hasRole(roles: string[]): boolean {
    const user = this.currentUserValue;
    return user ? roles.includes(user.role) : false;
  }

  // Login
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.token) {
            // Ruaj token dhe user
            localStorage.setItem(this.tokenKey, response.token);
            localStorage.setItem(this.userKey, JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
          }
        }),
        catchError(this.handleError)
      );
  }

  // Logout
  logout(): void {
    // Fshi nga localStorage
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    
    // Redirect në login
    this.router.navigate(['/auth/login']);
  }

  // Register (për staff të rinj)
  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData)
      .pipe(catchError(this.handleError));
  }

  // Forgot password
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/forgot-password`, { email })
      .pipe(catchError(this.handleError));
  }

  // Reset password
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset-password`, { token, password: newPassword })
      .pipe(catchError(this.handleError));
  }

  // Refresh token (nëse implementohet në backend)
  refreshToken(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/refresh`, {})
      .pipe(
        tap((response: any) => {
          if (response.token) {
            localStorage.setItem(this.tokenKey, response.token);
          }
        }),
        catchError(this.handleError)
      );
  }

  // Error handler
  private handleError(error: any) {
    let errorMessage = 'Ka ndodhur një gabim!';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.message || error.message || errorMessage;
    }
    
    console.error('Auth Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
