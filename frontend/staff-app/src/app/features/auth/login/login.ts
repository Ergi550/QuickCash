import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  returnUrl = '/dashboard';
  hidePassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Redirect në dashboard nëse tashmë është logged in
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
    // Krijo form
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    // Merr returnUrl nga query params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  // Convenience getter për form controls
  get f() {
    return this.loginForm.controls;
  }

  // Toggle password visibility
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  // Submit login
  onSubmit(): void {
    this.submitted = true;
    this.error = '';

    // Ndaloje nëse form invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    const credentials = {
      email: this.f['email'].value,
      password: this.f['password'].value
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        
        // Redirect në returnUrl ose dashboard
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.error = error.message || 'Email ose password i gabuar!';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  // Forgot password
  onForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }
}