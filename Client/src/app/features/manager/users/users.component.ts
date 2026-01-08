import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrls: [`./users.component.css`]
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  showModal = false;
  userForm: FormGroup;
  isLoading = false;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      full_name: ['', Validators.required],
      phone: [''],
      role: ['staff', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.http.get<any>(`${environment.apiUrl}/auth/users`).subscribe({
      next: (response) => {
        if (response.success) {
          this.users = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading users:', error);
        alert('Failed to load users');
      }
    });
  }

  openAddModal(): void {
    this.userForm.reset({
      role: 'staff'
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.userForm.reset();
  }

  createUser(): void {
    if (this.userForm.invalid) {
      alert('Please fill in all required fields');
      return;
    }

    this.isLoading = true;
    const userData = this.userForm.value;

    // Use the new endpoint for creating internal users
    this.http.post<any>(`${environment.apiUrl}/auth/users/create`, userData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          alert('User created successfully!');
          this.loadUsers();
          this.closeModal();
        } else {
          alert('Failed to create user: ' + (response.message || 'Unknown error'));
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating user:', error);
        alert('Failed to create user: ' + (error.error?.message || error.message || 'Network error'));
      }
    });
  }

  deleteUser(user: any): void {
    if (confirm(`Delete user ${user.full_name}?`)) {
      this.http.delete<any>(`${environment.apiUrl}/auth/users/${user.user_id}`).subscribe({
        next: (response) => {
          if (response.success) {
            alert('User deleted!');
            this.loadUsers();
          }
        },
        error: () => alert('Failed to delete user')
      });
    }
  }

  toggleUserStatus(user: any): void {
    const newStatus = !user.is_active;
    this.http.patch<any>(`${environment.apiUrl}/auth/users/${user.user_id}`, {
      is_active: newStatus
    }).subscribe({
      next: () => this.loadUsers(),
      error: () => alert('Failed to update user status')
    });
  }
}
