import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errors: {
    email?: string;
    password?: string;
    auth?: string;
  } = {};

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  validateEmail(): boolean {
    if (!this.email) {
      this.errors.email = 'Email is required';
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errors.email = 'Please enter a valid email address';
      return false;
    }
    delete this.errors.email;
    return true;
  }

  validatePassword(): boolean {
    if (!this.password) {
      this.errors.password = 'Password is required';
      return false;
    }
    if (this.password.length < 8) {
      this.errors.password = 'Password must be at least 8 characters long';
      return false;
    }
    delete this.errors.password;
    return true;
  }

  validateForm(): boolean {
    const emailValid = this.validateEmail();
    const passwordValid = this.validatePassword();
    return emailValid && passwordValid;
  }

  onSubmit() {
    delete this.errors.auth;
    if (this.validateForm()) {
      this.authService.login(this.email, this.password).subscribe({
        next: (user) => {
          if (user) {
            if (user.role === 'patient') {
              this.router.navigate(['/patient-dashboard']);
            } else {
              this.router.navigate(['/doctor-dashboard']);
            }
          } else {
            this.errors.auth = 'Invalid credentials';
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          if (error.error?.msg) {
            this.errors.auth = error.error.msg;
          } else {
            this.errors.auth = 'Login failed. Please try again.';
          }
        }
      });
    }
  }
} 