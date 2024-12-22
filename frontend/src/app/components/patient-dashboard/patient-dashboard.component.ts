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
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.css']
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
      state: { selectedDoctor: doctor },
      skipLocationChange: true
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