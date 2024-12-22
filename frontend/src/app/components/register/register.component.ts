import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user: User = {
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'patient'
  };
  confirmPassword: string = '';
  errors: {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
  } = {};

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  validateName(): boolean {
    if (!this.user.name.trim()) {
      this.errors.name = 'Name is required';
      return false;
    }
    if (this.user.name.length < 2) {
      this.errors.name = 'Name must be at least 2 characters long';
      return false;
    }
    if (!/^[a-zA-Z\s]*$/.test(this.user.name)) {
      this.errors.name = 'Name can only contain letters and spaces';
      return false;
    }
    delete this.errors.name;
    return true;
  }

  validateEmail(): boolean {
    if (!this.user.email) {
      this.errors.email = 'Email is required';
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.user.email)) {
      this.errors.email = 'Please enter a valid email address';
      return false;
    }
    delete this.errors.email;
    return true;
  }

  validatePhone(): boolean {
    if (!this.user.phone) {
      this.errors.phone = 'Phone number is required';
      return false;
    }
    // Allow formats: (123) 456-7890, 123-456-7890, 1234567890
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (!phoneRegex.test(this.user.phone)) {
      this.errors.phone = 'Please enter a valid 10-digit phone number';
      return false;
    }
    delete this.errors.phone;
    return true;
  }

  validatePassword(): boolean {
    if (!this.user.password) {
      this.errors.password = 'Password is required';
      return false;
    }
    if (this.user.password.length < 8) {
      this.errors.password = 'Password must be at least 8 characters long';
      return false;
    }
    if (!/(?=.*[a-z])/.test(this.user.password)) {
      this.errors.password = 'Password must contain at least one lowercase letter';
      return false;
    }
    if (!/(?=.*[A-Z])/.test(this.user.password)) {
      this.errors.password = 'Password must contain at least one uppercase letter';
      return false;
    }
    if (!/(?=.*\d)/.test(this.user.password)) {
      this.errors.password = 'Password must contain at least one number';
      return false;
    }
    if (!/(?=.*[!@#$%^&*])/.test(this.user.password)) {
      this.errors.password = 'Password must contain at least one special character (!@#$%^&*)';
      return false;
    }
    delete this.errors.password;
    return true;
  }

  validateConfirmPassword(): boolean {
    if (!this.confirmPassword) {
      this.errors.confirmPassword = 'Please confirm your password';
      return false;
    }
    if (this.confirmPassword !== this.user.password) {
      this.errors.confirmPassword = 'Passwords do not match';
      return false;
    }
    delete this.errors.confirmPassword;
    return true;
  }

  validateForm(): boolean {
    const nameValid = this.validateName();
    const emailValid = this.validateEmail();
    const phoneValid = this.validatePhone();
    const passwordValid = this.validatePassword();
    const confirmPasswordValid = this.validateConfirmPassword();

    return nameValid && emailValid && phoneValid && passwordValid && confirmPasswordValid;
  }

  onSubmit() {
    if (this.validateForm()) {
      this.authService.register(this.user).subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Registration error:', error);
          if (error.error?.msg) {
            // Handle specific backend validation errors
            if (error.error.msg.includes('email')) {
              this.errors.email = error.error.msg;
            } else if (error.error.msg.includes('phone')) {
              this.errors.phone = error.error.msg;
            } else {
              alert(error.error.msg);
            }
          } else {
            alert('Registration failed. Please try again.');
          }
        }
      });
    }
  }
} 