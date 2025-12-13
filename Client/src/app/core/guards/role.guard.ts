import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router 
} from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Role Guard
 * Protects routes based on user role
 * Usage in routes: data: { roles: ['manager', 'staff'] }
 */
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Get required roles from route data
    const requiredRoles = route.data['roles'] as string[];
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Check if user has any of the required roles
    if (this.authService.hasAnyRole(requiredRoles)) {
      return true;
    }

    // Access denied - redirect to unauthorized page
    this.router.navigate(['/unauthorized']);
    return false;
  }
}