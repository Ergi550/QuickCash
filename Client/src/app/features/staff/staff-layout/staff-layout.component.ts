import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
selector : 'app-staff-layout',
standalone:true,
imports:[CommonModule,RouterLink,RouterOutlet],
template:`<div class="staff-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="logo">
          <h1>⚡ QuickCash</h1>
          <p class="role-badge">Staff</p>
        </div>

        <nav class="nav">
          <a routerLink="/staff/orders" routerLinkActive="active">
            📋 Orders
          </a>
          <a routerLink="/staff/payment" routerLinkActive="active">
            💳 Payment
          </a>
        </nav>

        <div class="user-section">
          <div class="user-info" *ngIf="currentUser">
            <div class="avatar">{{ currentUser.firstName.charAt(0) }}</div>
            <div class="user-details">
              <strong>{{ currentUser.firstName }} {{ currentUser.lastName }}</strong>
              <small>{{ currentUser.email }}</small>
            </div>
          </div>
          <button class="btn-logout" (click)="logout()">
            Logout
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles : [`.staff-layout {
      display: flex;
      height: 100vh;
    }

    .sidebar {
      width: 260px;
      background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
      color: white;
      display: flex;
      flex-direction: column;
      box-shadow: 2px 0 10px rgba(0,0,0,0.1);
    }

    .logo {
      padding: 2rem 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .logo h1 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
    }

    .role-badge {
      background: rgba(255,255,255,0.2);
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      display: inline-block;
      margin: 0;
    }

    .nav {
      flex: 1;
      padding: 1.5rem 0;
    }

    .nav a {
      display: block;
      padding: 1rem 1.5rem;
      color: rgba(255,255,255,0.8);
      text-decoration: none;
      transition: all 0.3s;
      font-weight: 500;
    }

    .nav a:hover {
      background: rgba(255,255,255,0.1);
      color: white;
    }

    .nav a.active {
      background: rgba(255,255,255,0.15);
      color: white;
      border-left: 3px solid #3498db;
    }

    .user-section {
      padding: 1.5rem;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    .user-info {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      align-items: center;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #3498db;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.25rem;
    }

    .user-details {
      flex: 1;
      min-width: 0;
    }

    .user-details strong {
      display: block;
      font-size: 0.875rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-details small {
      display: block;
      font-size: 0.75rem;
      opacity: 0.7;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .btn-logout {
      width: 100%;
      padding: 10px;
      background: rgba(231, 76, 60, 0.2);
      border: 1px solid rgba(231, 76, 60, 0.5);
      color: white;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s;
    }

    .btn-logout:hover {
      background: rgba(231, 76, 60, 0.3);
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
      background: #ecf0f1;
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 100%;
        height: auto;
      }

      .staff-layout {
        flex-direction: column;
      }

      .nav {
        display: flex;
        padding: 0;
      }

      .nav a {
        flex: 1;
        text-align: center;
        padding: 1rem 0.5rem;
        font-size: 0.875rem;
      }
    }`]
}) 

export class StaffLayoutComponent implements OnInit{
    currentUser:User|null=null;

    constructor(
        private authService:AuthService,
        private router:Router
    ){}

    ngOnInit(): void {
        this.authService.currentUser$.subscribe(user =>{
            this.currentUser = user;
        });
    }
    logout():void{
        if(confirm('Are you sure you want to logout ?')){
            this.authService.logout();
            this.router.navigate(['/login']);
        }
    }
}