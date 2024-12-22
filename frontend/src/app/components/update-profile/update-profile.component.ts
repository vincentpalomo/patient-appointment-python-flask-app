import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-update-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.css']
})
export class UpdateProfileComponent implements OnInit {
  name: string = '';
  email: string = '';
  phone: string = '';
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Load current user data
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.name = currentUser.name;
      this.email = currentUser.email;
      this.phone = currentUser.phone || '';
    }
  }

  get canSubmit(): boolean {
    return !!(this.name && this.email && this.phone);
  }

  updateProfile() {
    if (!this.canSubmit) return;

    const updateData = {
      name: this.name,
      email: this.email,
      phone: this.phone
    };

    this.authService.updateProfile(updateData).subscribe({
      next: () => {
        alert('Profile updated successfully!');
        this.router.navigate(['/patient-dashboard']);
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.error = error.error?.msg || 'Failed to update profile. Please try again.';
      }
    });
  }

  goBack() {
    this.router.navigate(['/patient-dashboard']);
  }
} 