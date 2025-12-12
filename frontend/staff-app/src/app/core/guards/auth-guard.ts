import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const currentUser = this.authService.currentUserValue;

    if (currentUser && this.authService.isLoggedIn) {
      // Check nëse route kërkon role specifike
      const requiredRoles = route.data['roles'] as string[];
      
      if (requiredRoles && !this.authService.hasRole(requiredRoles)) {
        // User nuk ka role të duhur
        this.router.navigate(['/dashboard']);
        return false;
      }

      return true;
    }

    // Nuk është logged in, redirect në login
    this.router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }
}
