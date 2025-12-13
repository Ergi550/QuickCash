import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Not Found Component
 * 404 - Page Not Found
 */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="error-page">
      <div class="error-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <p>It might have been moved or deleted.</p>
        <a routerLink="/" class="btn-home">Go to Home</a>
      </div>
    </div>
  `,
  styles: [`
    .error-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      padding: 2rem;
    }

    .error-content {
      max-width: 500px;
    }

    h1 {
      font-size: 8rem;
      margin: 0;
      font-weight: 900;
      opacity: 0.9;
    }

    h2 {
      font-size: 2rem;
      margin: 1rem 0;
    }

    p {
      font-size: 1.125rem;
      margin: 1rem 0;
      opacity: 0.9;
    }

    .btn-home {
      display: inline-block;
      margin-top: 2rem;
      padding: 12px 32px;
      background: white;
      color: #667eea;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: transform 0.3s;
    }

    .btn-home:hover {
      transform: translateY(-2px);
    }
  `]
})
export class NotFoundComponent {}