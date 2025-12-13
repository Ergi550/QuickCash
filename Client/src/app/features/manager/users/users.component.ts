import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="users-page">
      <h1>👥 User Management</h1>
      
      <div class="table-card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td><strong>{{ user.firstName }} {{ user.lastName }}</strong></td>
              <td>{{ user.email }}</td>
              <td>
                <span class="role-badge" [class]="'role-' + user.role">
                  {{ user.role }}
                </span>
              </td>
              <td>{{ user.phone || '-' }}</td>
              <td>
                <span class="status-badge" [class.active]="user.isActive">
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .users-page { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    h1 { color: #2c3e50; margin-bottom: 2rem; }
    .table-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f8f9fa; padding: 1rem; text-align: left; font-weight: 600; }
    td { padding: 1rem; border-bottom: 1px solid #dee2e6; }
    .role-badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
    .role-manager { background: #667eea; color: white; }
    .role-staff { background: #3498db; color: white; }
    .role-customer { background: #95a5a6; color: white; }
    .status-badge { padding: 4px 12px; background: #e74c3c; color: white; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .status-badge.active { background: #27ae60; }
  `]
})
export class UsersComponent implements OnInit {
  users: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/auth/users`).subscribe({
      next: (response) => {
        if (response.success) {
          this.users = response.data;
        }
      }
    });
  }
}