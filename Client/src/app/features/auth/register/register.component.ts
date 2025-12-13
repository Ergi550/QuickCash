import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Register Component
 * Handles new customer registration
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="register-container">
      <div class="register-card">
        <h1>QuickCash POS</h1>
        <h2>Create Account</h2>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <!-- First Name -->
          <div class="form-group">
            <label for="firstName">First Name *</label>
            <input 
              type="text" 
              id="firstName"
              formControlName="firstName"
              placeholder="Enter your first name"
            />
            <span class="error-message" *ngIf="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched">
              First name is required
            </span>
          </div>

          <!-- Last Name -->
          <div class="form-group">
            <label for="lastName">Last Name *</label>
            <input 
              type="text" 
              id="lastName"
              formControlName="lastName"
              placeholder="Enter your last name"
            />
            <span class="error-message" *ngIf="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched">
              Last name is required
            </span>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label for="email">Email *</label>
            <input 
              type="email" 
              id="email"
              formControlName="email"
              placeholder="Enter your email"
            />
            <span class="error-message" *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
              Valid email is required
            </span>
          </div>

          <!-- Phone -->
          <div class="form-group">
            <label for="phone">Phone (optional)</label>
            <input 
              type="tel" 
              id="phone"
              formControlName="phone"
              placeholder="+355 69 123 4567"
            />
          </div>

          <!-- Password -->
          <div class="form-group">
            <label for="password">Password *</label>
            <input 
              type="password" 
              id="password"
              formControlName="password"
              placeholder="Enter your password"
            />
            <span class="error-message" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
              Password must be at least 6 characters
            </span>
          </div>

          <!-- Confirm Password -->
          <div class="form-group">
            <label for="confirmPassword">Confirm Password *</label>
            <input 
              type="password" 
              id="confirmPassword"
              formControlName="confirmPassword"
              placeholder="Confirm your password"
            />
            <span class="error-message" *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched">
              Passwords must match
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
            [disabled]="registerForm.invalid || isLoading"
          >
            {{ isLoading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>

        <p class="login-link">
          Already have an account? 
          <a routerLink="/login">Login here</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .register-card {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      width: 100%;
      max-width: 500px;
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

    .login-link {
      text-align: center;
      margin-top: 20px;
      color: #666;
    }

    .login-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }

    .login-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { confirmPassword, ...userData } = this.registerForm.value;

    this.authService.register(userData).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Registration successful! Welcome to QuickCash!');
          this.router.navigate(['/customer/menu']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}