import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-appointment-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="details-container">
      <div class="details-card">
        <div class="header">
          <h2>Appointment Details</h2>
          <div class="timestamp">Viewed: {{viewTimestamp | date:'medium'}}</div>
        </div>

        <div class="appointment-info">
          <h3>Appointment Information</h3>
          <div class="info-group">
            <label>Date:</label>
            <span>{{appointment?.appointment_time | date:'fullDate'}}</span>
          </div>
          <div class="info-group">
            <label>Time:</label>
            <span>{{appointment?.appointment_time | date:'shortTime'}}</span>
          </div>
          <div class="info-group">
            <label>Status:</label>
            <span class="status" [class.status-scheduled]="appointment?.status === 'scheduled'">
              {{appointment?.status}}
            </span>
          </div>
          <div class="info-group" *ngIf="appointment?.notes">
            <label>Notes:</label>
            <p class="notes">{{appointment?.notes}}</p>
          </div>
        </div>

        <div class="doctor-info" *ngIf="appointment?.doctor">
          <h3>Doctor Information</h3>
          <div class="info-group">
            <label>Name:</label>
            <span>{{appointment?.doctor?.name}}</span>
          </div>
          <div class="info-group">
            <label>Specialization:</label>
            <span>{{appointment?.doctor?.specialization || 'General Practice'}}</span>
          </div>
          <div class="info-group">
            <label>Email:</label>
            <span>{{appointment?.doctor?.email}}</span>
          </div>
          <div class="info-group">
            <label>Phone:</label>
            <span>{{appointment?.doctor?.phone}}</span>
          </div>
        </div>

        <div class="actions">
          <button class="back-btn" (click)="goBack()">Back to Dashboard</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .details-container {
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
    }

    .details-card {
      background: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
    }

    .timestamp {
      color: #666;
      font-size: 0.9em;
    }

    h2 {
      margin: 0;
      color: #333;
    }

    h3 {
      color: #444;
      margin: 25px 0 15px;
    }

    .info-group {
      margin: 15px 0;
    }

    label {
      font-weight: 500;
      color: #666;
      display: inline-block;
      width: 120px;
    }

    .status {
      padding: 4px 8px;
      border-radius: 4px;
      background: #f0f0f0;
    }

    .status-scheduled {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .notes {
      margin: 10px 0;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 4px;
      color: #555;
    }

    .actions {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    .back-btn {
      padding: 10px 20px;
      background: #2196F3;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .back-btn:hover {
      background: #1976D2;
    }
  `]
})
export class AppointmentDetailsComponent implements OnInit {
  appointment: any;
  viewTimestamp: Date = new Date();

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { appointment: any };
    
    if (state?.appointment) {
      this.appointment = state.appointment;
    }
  }

  ngOnInit() {
    if (!this.appointment) {
      this.goBack();
    }
  }

  goBack() {
    this.router.navigate(['/patient-dashboard']);
  }
} 