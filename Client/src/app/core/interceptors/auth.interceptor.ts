import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

/**
 * Auth Interceptor
 * Automatically adds JWT token to outgoing requests
 * Handles 401 errors (redirects to login)
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  // Flag to prevent multiple 401 redirects
  private isRedirecting = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    // Clone request and add Authorization header if token exists
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Handle the request and catch errors
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !this.isRedirecting) {
          // Set flag to prevent duplicate redirects
          this.isRedirecting = true;

          // Unauthorized - logout and redirect to login
          this.authService.logout();
          this.router.navigate(['/login']).then(() => {
            // Reset flag after navigation completes
            this.isRedirecting = false;
          });
        }

        return throwError(() => error);
      })
    );
  }
}