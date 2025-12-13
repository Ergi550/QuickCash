import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Login Component
 * Handles user authentication
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>QuickCash POS</h1>
        <h2>Login</h2>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <!-- Email -->
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email"
              formControlName="email"
              placeholder="Enter your email"
              [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
            />
            <span class="error-message" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              Valid email is required
            </span>
          </div>

          <!-- Password -->
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password"
              formControlName="password"
              placeholder="Enter your password"
              [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
            />
            <span class="error-message" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              Password is required
            </span>
          </div>

          <!-- Error message -->
          <div class="alert alert-error" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <!-- Submit button -->
          <button 
            type="submit" 
            class="btn btn-primary"
            [disabled]="loginForm.invalid || isLoading"
          >
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <p class="register-link">
          Don't have an account? 
          <a routerLink="/register">Register here</a>
        </p>

        <!-- Test accounts info -->
        <div class="test-accounts">
          <h3>Test Accounts:</h3>
          <p><strong>Manager:</strong> admin@quickcash.com / password123</p>
          <p><strong>Staff:</strong> staff@quickcash.com / password123</p>
          <p><strong>Customer:</strong> customer@example.com / password123</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      width: 100%;
      max-width: 400px;
    }

    h1 {
      text-align: center;
      color: #667eea;
      margin-bottom: 10px;
      font-size: 28px;
    }

    h2 {
      text-align: center;
      color: #333;
      margin-bottom: 30px;
      font-size: 24px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      color: #555;
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 12px;
      border: 2px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      transition: border-color 0.3s;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
    }

    input.error {
      border-color: #e74c3c;
    }

    .error-message {
      display: block;
      color: #e74c3c;
      font-size: 12px;
      margin-top: 5px;
    }

    .alert {
      padding: 12px;
      border-radius: 5px;
      margin-bottom: 20px;
    }

    .alert-error {
      background-color: #ffe6e6;
      color: #c0392b;
      border: 1px solid #e74c3c;
    }

    .btn {
      width: 100%;
      padding: 12px;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .register-link {
      text-align: center;
      margin-top: 20px;
      color: #666;
    }

    .register-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }

    .register-link a:hover {
      text-decoration: underline;
    }

    .test-accounts {
      margin-top: 30px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 5px;
      font-size: 12px;
    }

    .test-accounts h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #667eea;
    }

    .test-accounts p {
      margin: 5px 0;
      color: #666;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        if (response.success && response.data?.user) {
          // Redirect based on role
          const role = response.data.user.role;
          
          if (role === 'manager') {
            this.router.navigate(['/manager']);
          } else if (role === 'staff') {
            this.router.navigate(['/staff']);
          } else {
            this.router.navigate(['/customer']);
          }
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';
      }
    });
  }
}