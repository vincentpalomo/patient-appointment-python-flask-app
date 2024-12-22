import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  appointments: any[];
}

interface Doctor {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
}

interface AppointmentWithDoctor extends UserProfile {
  appointments: Array<{
    id: number;
    appointment_time: string;
    status: string;
    doctor?: Doctor;
  }>;
}

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <div class="patient-info-sidebar">
        <div class="user-info">
          <h2>Welcome, {{profile?.name || 'Patient'}}</h2>
          <p class="email">{{profile?.email}}</p>
          <p class="phone">Phone: {{profile?.phone}}</p>
          <button class="logout-btn" (click)="logout()">Logout</button>
        </div>
        <div class="actions">
          <button class="book-btn" (click)="navigateToBookAppointment()">Book New Appointment</button>
        </div>
      </div>

      <div class="appointments-section">
        <h3>Your Appointments</h3>
        <div *ngIf="loading" class="loading">Loading appointments...</div>
        <div *ngIf="error" class="error">{{error}}</div>
        <div class="appointment-list" *ngIf="!loading && !error">
          <div *ngFor="let appointment of profile?.appointments" class="appointment-card">
            <div class="appointment-header">
              <div class="appointment-time">
                <div class="date">{{appointment.appointment_time | date:'fullDate'}}</div>
                <div class="time">{{appointment.appointment_time | date:'shortTime'}}</div>
              </div>
              <span class="status" [class.status-scheduled]="appointment.status === 'scheduled'">
                {{appointment.status}}
              </span>
            </div>
            
            <div class="appointment-details" *ngIf="appointment.doctor">
              <div class="doctor-info">
                <div class="doctor-name">{{appointment.doctor.name}}</div>
                <div class="doctor-specialization">{{appointment.doctor.specialization || 'General Practice'}}</div>
              </div>
              <div class="contact-info">
                <div class="contact-item">
                  <span class="icon">📧</span>
                  <span class="text">{{appointment.doctor.email}}</span>
                </div>
                <div class="contact-item">
                  <span class="icon">📞</span>
                  <span class="text">{{appointment.doctor.phone}}</span>
                </div>
              </div>
            </div>

            <button 
              *ngIf="appointment.status === 'scheduled'"
              (click)="cancelAppointment(appointment.id)"
              class="cancel-btn">
              Cancel Appointment
            </button>
          </div>
          <p *ngIf="!profile?.appointments?.length" class="no-appointments">No appointments found.</p>
        </div>
      </div>

      <div class="doctors-sidebar">
        <h3>Available Doctors</h3>
        <div class="doctors-list">
          <div *ngFor="let doctor of doctors" class="doctor-card">
            <div class="doctor-info">
              <div class="doctor-name">{{doctor.name}}</div>
              <div class="doctor-specialization">{{doctor.specialization || 'General Practice'}}</div>
            </div>
            <button class="book-btn" (click)="bookWithDoctor(doctor)">Book</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: grid;
      grid-template-columns: 250px 1fr 300px;
      gap: 20px;
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .patient-info-sidebar {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      height: fit-content;
    }

    .appointments-section {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .appointments-section h3 {
      margin: 0 0 20px 0;
      color: #333;
    }

    .user-info {
      margin-bottom: 20px;
    }

    .user-info h2 {
      margin: 0 0 10px 0;
    }

    .email, .phone {
      margin: 5px 0;
      color: #666;
    }

    .actions {
      margin-bottom: 20px;
    }

    .appointment-list {
      display: grid;
      gap: 15px;
    }

    .appointment-card {
      border: 1px solid #e0e0e0;
      padding: 20px;
      border-radius: 8px;
      background-color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .appointment-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
    }

    .appointment-time {
      flex: 1;
    }

    .date {
      font-size: 1.1em;
      font-weight: bold;
      color: #333;
      margin-bottom: 4px;
    }

    .time {
      color: #666;
      font-size: 0.9em;
    }

    .status {
      padding: 6px 12px;
      border-radius: 20px;
      background-color: #f0f0f0;
      font-size: 0.9em;
      text-transform: capitalize;
    }

    .status-scheduled {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .appointment-details {
      display: grid;
      gap: 20px;
    }

    .doctor-info {
      margin-bottom: 15px;
    }

    .doctor-name {
      font-size: 1.2em;
      font-weight: 500;
      color: #333;
      margin-bottom: 4px;
    }

    .doctor-specialization {
      color: #666;
      font-size: 0.9em;
    }

    .contact-info {
      display: grid;
      gap: 10px;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #555;
    }

    .icon {
      font-size: 1.2em;
    }

    .text {
      font-size: 0.9em;
    }

    button {
      padding: 10px 20px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1em;
      transition: background-color 0.2s;
    }

    .cancel-btn {
      background-color: #f44336;
      margin-top: 20px;
      width: 100%;
    }

    button:hover {
      opacity: 0.9;
    }

    .loading {
      text-align: center;
      padding: 20px;
      color: #666;
    }

    .error {
      color: #f44336;
      padding: 10px;
      border: 1px solid #f44336;
      border-radius: 4px;
      margin-bottom: 10px;
    }

    .no-appointments {
      text-align: center;
      color: #666;
      padding: 20px;
    }

    .doctors-sidebar {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      height: fit-content;
    }

    .doctors-sidebar h3 {
      margin: 0 0 15px 0;
      color: #333;
    }

    .doctors-list {
      display: grid;
      gap: 15px;
    }

    .doctor-card {
      padding: 15px;
      border: 1px solid #eee;
      border-radius: 8px;
      background: #f8f9fa;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    .doctor-card .doctor-info {
      flex: 1;
    }

    .doctor-card .doctor-name {
      font-weight: 500;
      color: #333;
      margin-bottom: 4px;
    }

    .doctor-card .doctor-specialization {
      font-size: 0.9em;
      color: #666;
    }

    .doctor-card .book-btn {
      padding: 6px 12px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9em;
      transition: background-color 0.2s;
    }

    .doctor-card .book-btn:hover {
      background: #45a049;
    }

    .logout-btn {
      width: 100%;
      margin-top: 10px;
      background-color: #757575;
    }

    .logout-btn:hover {
      background-color: #616161;
    }

    .book-btn {
      width: 100%;
      margin-top: 10px;
    }

    @media (max-width: 1200px) {
      .dashboard-container {
        grid-template-columns: 1fr 1fr;
      }
      
      .patient-info-sidebar {
        grid-column: span 2;
      }
    }

    @media (max-width: 768px) {
      .dashboard-container {
        grid-template-columns: 1fr;
      }
      
      .patient-info-sidebar,
      .appointments-section,
      .doctors-sidebar {
        grid-column: 1;
      }
      
      .doctors-sidebar {
        order: 2;
      }
      
      .appointments-section {
        order: 3;
      }
    }
  `]
})
export class PatientDashboardComponent implements OnInit {
  profile: any = null;
  loading: boolean = false;
  error: string | null = null;
  doctors: any[] = [];

  constructor(
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProfile();
    this.loadDoctors();
  }

  loadDoctors() {
    this.appointmentService.getDoctors().subscribe({
      next: (doctors) => {
        console.log('Loaded doctors:', doctors);
        this.doctors = doctors;
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
        this.error = 'Failed to load doctors';
      }
    });
  }

  bookWithDoctor(doctor: any) {
    // Navigate to book appointment page with pre-selected doctor
    this.router.navigate(['/book-appointment'], { 
      state: { selectedDoctor: doctor }
    });
  }

  loadProfile() {
    this.loading = true;
    this.error = null;
    
    // Get both profile and doctors data
    forkJoin({
      profile: this.authService.getUserProfile(),
      doctors: this.appointmentService.getDoctors()
    }).pipe(
      map(({ profile, doctors }) => {
        // Add doctor details to each appointment
        const profileWithDoctors: AppointmentWithDoctor = {
          ...profile,
          appointments: profile.appointments.map(appointment => {
            const doctorId = appointment.doctor_id;
            const doctor = doctors.find(d => d.id === doctorId);
            return {
              ...appointment,
              doctor
            };
          })
        };
        return profileWithDoctors;
      })
    ).subscribe({
      next: (profileWithDoctors) => {
        console.log('Loaded profile with doctors:', profileWithDoctors);
        this.profile = profileWithDoctors;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.error = 'Failed to load profile and appointments. Please try again later.';
        this.loading = false;
      }
    });
  }

  cancelAppointment(appointmentId: number) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.appointmentService.cancelAppointment(appointmentId)
        .subscribe({
          next: () => {
            this.loadProfile(); // Reload profile to get updated appointments
          },
          error: (error) => {
            console.error('Error canceling appointment:', error);
            this.error = 'Failed to cancel appointment. Please try again later.';
          }
        });
    }
  }

  navigateToBookAppointment() {
    this.router.navigate(['/book-appointment']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
} 