import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-container">
      <h2>Login</h2>
      <form (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" [(ngModel)]="email" name="email" required>
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" [(ngModel)]="password" name="password" required>
        </div>
        <button type="submit">Login</button>
        <p>Don't have an account? <a [routerLink]="['/register']">Register</a></p>
      </form>
    </div>
  `,
  styles: [`
    :host {
      display: block; /* Ensure the component takes up block space */
      width: 100%; /* Set the width to 100% of the parent container */
      max-width: 600px; /* Set a maximum width for the login component */
      margin: 0 auto; /* Center the component horizontally */
    }
    .login-container {
      padding: 20px;
      border: 1px solid #ccc;
      background-color: white; /* Ensure the background is white for contrast */
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* Add a subtle shadow for depth */
      display: flex;
      flex-direction: column;
      align-items: center; /* Center items horizontally */
      justify-content: center; /* Center items vertically */
    }
    .form-group {
      margin-bottom: 15px;
      width: 100%; /* Ensure form groups take full width */
    }
    label {
      display: block;
      margin-bottom: 5px;
    }
    input {
      width: 100%; /* Ensure input fields take full width */
      padding: 8px;
      margin-bottom: 10px;
    }
    button {
      width: 100%; /* Set button width to 100% to match input fields */
      padding: 10px;
      background-color: #4CAF50;
      color: white;
      border: none;
      cursor: pointer;
      margin-top: 10px; /* Optional: Add some space above the button */
    }
    button:hover {
      background-color: #45a049;
    }
  `]
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.authService.login(this.email, this.password).subscribe(user => {
      if (user) {
        if (user.role === 'patient') {
          this.router.navigate(['/patient-dashboard']);
        } else {
          this.router.navigate(['/doctor-dashboard']);
        }
      } else {
        alert('Invalid credentials');
      }
    });
  }
} 