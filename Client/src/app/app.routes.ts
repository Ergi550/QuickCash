import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

/**
 * Application Routes
 */
export const routes: Routes = [
  // Public routes
  {
    path: '',
    redirectTo: '/customer',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component')
      .then(m => m.RegisterComponent)
  },

  // Customer routes (public access to menu, auth required for checkout)
  {
    path: 'customer',
    loadComponent: () => import('./features/customer/customer-layout/customer-layout')
      .then(m => m.CustomerLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'menu',
        pathMatch: 'full'
      },
      {
        path: 'menu',
        loadComponent: () => import('./features/customer/menu/menu.component')
          .then(m => m.MenuComponent)
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/customer/cart/cart.component')
          .then(m => m.CartComponent)
      },
      {
        path: 'checkout',
        loadComponent: () => import('./features/customer/checkout/checkout.component')
          .then(m => m.CheckoutComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/customer/my-orders/my-orders.component')
          .then(m => m.MyOrdersComponent),
        canActivate: [AuthGuard]
      }
    ]
  },

  // Staff routes (requires authentication + staff/manager role)
  {
    path: 'staff',
    loadComponent: () => import('./features/staff/staff-layout/staff-layout.component')
      .then(m => m.StaffLayoutComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['staff', 'manager'] },
    children: [
      {
        path: '',
        redirectTo: 'orders',
        pathMatch: 'full'
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/staff/orders/orders.component')
          .then(m => m.OrdersComponent)
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./features/staff/order-details/order-details')
          .then(m => m.OrderDetailsComponent)
      },
      {
        path: 'payment',
        loadComponent: () => import('./features/staff/payment/payment.component')
          .then(m => m.PaymentComponent)
      }
    ]
  },

  // Manager routes (requires authentication + manager role)
  {
    path: 'manager',
    loadComponent: () => import('./features/manager/manager-layout/manager-layout.component')
      .then(m => m.ManagerLayoutComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['manager'] },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/manager/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./features/manager/products/products.component')
          .then(m => m.ProductsComponent)
      },
      {
        path: 'inventory',
        loadComponent: () => import('./features/manager/inventory/inventory.component')
          .then(m => m.InventoryComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/manager/reports/reports.component')
          .then(m => m.ReportsComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/manager/users/users.component')
          .then(m => m.UsersComponent)
      }
    ]
  },

  // Error routes
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/components/unauthorized/unauthorized.component')
      .then(m => m.UnauthorizedComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component')
      .then(m => m.NotFoundComponent)
  }
];