
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
  
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
  console.log('🔥 Interceptor running for:', request.url);
  
  const token = this.authService.getToken();
  console.log('🔑 Token:', token);
    
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
        if (error.status === 401) {
          // Unauthorized - logout and redirect to login
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        
        return throwError(() => error);
      })
    );
  }
}