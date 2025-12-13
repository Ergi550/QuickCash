import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { User } from '../../../core/models/user.model';

/**
 * Customer Layout Component
 * Main layout for customer interface with navigation
 */
@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
    <div class="customer-layout">
      <!-- Header -->
      <header class="header">
        <div class="container">
          <div class="header-content">
            <div class="logo">
              <h1>🍕 QuickCash</h1>
            </div>

            <nav class="nav">
              <a routerLink="/customer/menu" routerLinkActive="active">Menu</a>
              <a routerLink="/customer/cart" routerLinkActive="active" class="cart-link">
                🛒 Cart
                <span class="badge" *ngIf="cartItemCount > 0">{{ cartItemCount }}</span>
              </a>
              <a routerLink="/customer/orders" routerLinkActive="active" *ngIf="currentUser">
                My Orders
              </a>
            </nav>

            <div class="user-menu">
              <span *ngIf="currentUser" class="user-name">
                👋 {{ currentUser.firstName }}
              </span>
              <button *ngIf="!currentUser" (click)="goToLogin()" class="btn btn-outline">
                Login
              </button>
              <button *ngIf="currentUser" (click)="logout()" class="btn btn-outline">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="footer">
        <div class="container">
          <p>&copy; 2024 QuickCash POS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .customer-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem 0;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    }

    .logo h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    }

    .nav {
      display: flex;
      gap: 2rem;
      flex: 1;
    }

    .nav a {
      color: white;
      text-decoration: none;
      font-weight: 500;
      transition: opacity 0.3s;
      position: relative;
    }

    .nav a:hover {
      opacity: 0.8;
    }

    .nav a.active {
      border-bottom: 2px solid white;
    }

    .cart-link {
      position: relative;
    }

    .badge {
      position: absolute;
      top: -8px;
      right: -12px;
      background: #ff4757;
      color: white;
      border-radius: 12px;
      padding: 2px 6px;
      font-size: 12px;
      font-weight: 600;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-name {
      font-weight: 500;
    }

    .btn-outline {
      background: transparent;
      border: 2px solid white;
      color: white;
      padding: 8px 16px;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s;
    }

    .btn-outline:hover {
      background: white;
      color: #667eea;
    }

    .main-content {
      flex: 1;
      background: #f5f5f5;
    }

    .footer {
      background: #333;
      color: white;
      padding: 1.5rem 0;
      text-align: center;
    }

    .footer p {
      margin: 0;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
      }

      .nav {
        width: 100%;
        justify-content: center;
      }

      .user-menu {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class CustomerLayoutComponent implements OnInit {
  currentUser: User | null = null;
  cartItemCount = 0;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Subscribe to cart count
    this.cartService.cartItems$.subscribe(items => {
      this.cartItemCount = items.reduce((count, item) => count + item.quantity, 0);
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/customer/menu']);
  }
}