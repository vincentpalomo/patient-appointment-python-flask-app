import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../models/appointment.model';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <h2>Welcome Dr. {{userName}}</h2>
        <button (click)="logout()">Logout</button>
      </div>

      <div class="availability-section">
        <h3>Update Availability</h3>
        <div class="date-picker">
          <label>Add Available Date:</label>
          <input type="date" [(ngModel)]="selectedDate" [min]="minDate">
          <button (click)="addAvailableDate()">Add Date</button>
        </div>
        <div class="available-dates">
          <h4>Available Dates:</h4>
          <div *ngFor="let date of availableDates" class="date-item">
            {{date | date}}
            <button class="remove-btn" (click)="removeDate(date)">Remove</button>
          </div>
        </div>
      </div>

      <div class="appointments">
        <h3>Your Appointments</h3>
        <div class="appointment-list">
          <div *ngFor="let appointment of appointments" class="appointment-card">
            <p>Date: {{appointment.date | date}}</p>
            <p>Time: {{appointment.time}}</p>
            <p>Status: {{appointment.status}}</p>
          </div>
          <p *ngIf="appointments.length === 0">No appointments found.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .availability-section {
      margin-bottom: 30px;
    }
    .date-picker {
      margin-bottom: 20px;
    }
    .date-picker input {
      margin: 0 10px;
      padding: 5px;
    }
    .available-dates {
      margin-top: 20px;
    }
    .date-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      border: 1px solid #ccc;
      margin-bottom: 5px;
    }
    .appointment-list {
      display: grid;
      gap: 15px;
    }
    .appointment-card {
      border: 1px solid #ccc;
      padding: 15px;
      border-radius: 4px;
    }
    button {
      padding: 8px 16px;
      background-color: #4CAF50;
      color: white;
      border: none;
      cursor: pointer;
    }
    .remove-btn {
      background-color: #f44336;
      padding: 4px 8px;
    }
    button:hover {
      opacity: 0.9;
    }
  `]
})
export class DoctorDashboardComponent implements OnInit {
  userName: string = '';
  appointments: Appointment[] = [];
  availableDates: Date[] = [];
  selectedDate: string = '';
  minDate: string;

  constructor(
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private router: Router
  ) {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userName = currentUser.name;
    }
    // Set minimum date to today
    this.minDate = new Date().toISOString().split('T')[0];
  }

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.id) {
      this.appointmentService.getDoctorAppointments(currentUser.id)
        .subscribe(appointments => {
          this.appointments = appointments;
        });
    }
  }

  addAvailableDate() {
    if (this.selectedDate) {
      const newDate = new Date(this.selectedDate);
      if (!this.availableDates.some(date => date.getTime() === newDate.getTime())) {
        this.availableDates.push(newDate);
        this.availableDates.sort((a, b) => a.getTime() - b.getTime());
        // this.updateAvailability();
      }
    }
  }

  removeDate(date: Date) {
    this.availableDates = this.availableDates.filter(d => d.getTime() !== date.getTime());
    // this.updateAvailability();
  }

  // updateAvailability() {
  //   const currentUser = this.authService.getCurrentUser();
  //   if (currentUser?.id) {
  //     this.appointmentService.updateDoctorAvailability(currentUser.id, this.availableDates)
  //       .subscribe();
  //   }
  // }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
} 