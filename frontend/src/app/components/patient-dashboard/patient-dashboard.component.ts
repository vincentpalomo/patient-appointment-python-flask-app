import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.css']
})
export class PatientDashboardComponent implements OnInit {
  profile: any = null;
  loading: boolean = false;
  error: string | null = null;
  doctors: any[] = [];

  // Filter states
  statusFilter: string = 'all'; // 'all', 'scheduled', 'canceled'
  sortOrder: string = 'new'; // 'new', 'old'
  specializationFilter: string = 'all';
  doctorFilter: string = 'all';
  availableDoctorsSpecFilter: string = 'all'; // New filter for available doctors

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
        // console.log('Loaded doctors:', doctors);
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

  updateAppointment(appointment: any) {
    // Navigate to book appointment page with pre-filled data
    this.router.navigate(['/book-appointment'], { 
      state: { 
        updateMode: true,
        appointmentId: appointment.id,
        selectedDoctor: appointment.doctor,
        currentDate: appointment.appointment_time,
        currentTime: appointment.appointment_time.split(' ')[1].substring(0, 5),
        currentNotes: appointment.notes
      },
      skipLocationChange: true
    });
  }

  rescheduleAppointment(appointment: any) {
    // Navigate to book appointment page with pre-filled doctor
    this.router.navigate(['/book-appointment'], { 
      state: { 
        selectedDoctor: appointment.doctor,
        updateMode: true,
        isReschedule: true,
        appointmentId: appointment.id,
        currentNotes: appointment.notes
      },
      skipLocationChange: true
    });
  }

  // Get unique specializations from appointments
  get specializations(): string[] {
    if (!this.profile?.appointments) return [];
    const specs = new Set(this.profile.appointments
      .map((apt: any) => apt.doctor?.specialization || 'General')
      .filter((spec: string) => spec));
    return Array.from(specs).filter((spec): spec is string => spec !== 'all');
  }

  // Get unique doctors from appointments
  get appointmentDoctors(): string[] {
    if (!this.profile?.appointments) return [];
    const docs = new Set(this.profile.appointments
      .map((apt: any) => apt.doctor?.name)
      .filter((name: string) => name));
    return Array.from(docs).filter((name): name is string => name !== 'all');
  }

  // Get filtered and sorted appointments
  get filteredAppointments(): any[] {
    if (!this.profile?.appointments) return [];
    
    return this.profile.appointments
      .filter((apt: any) => {
        // Status filter
        if (this.statusFilter !== 'all' && apt.status !== this.statusFilter) {
          return false;
        }
        // Specialization filter
        if (this.specializationFilter !== 'all' && 
            apt.doctor?.specialization !== this.specializationFilter) {
          return false;
        }
        // Doctor filter
        if (this.doctorFilter !== 'all' && 
            apt.doctor?.name !== this.doctorFilter) {
          return false;
        }
        return true;
      })
      .sort((a: any, b: any) => {
        // Sort by date
        const dateA = new Date(a.appointment_time).getTime();
        const dateB = new Date(b.appointment_time).getTime();
        return this.sortOrder === 'new' ? dateB - dateA : dateA - dateB;
      });
  }

  // Reset all filters
  resetFilters() {
    this.statusFilter = 'all';
    this.sortOrder = 'new';
    this.specializationFilter = 'all';
    this.doctorFilter = 'all';
  }

  // Get unique specializations from available doctors
  get availableSpecializations(): string[] {
    if (!this.doctors) return [];
    const specs = new Set(this.doctors
      .map(doctor => doctor.specialization || 'General')
      .filter(spec => spec));
    return Array.from(specs);
  }

  // Get filtered available doctors
  get filteredAvailableDoctors(): any[] {
    if (!this.doctors) return [];
    
    return this.doctors.filter(doctor => {
      if (this.availableDoctorsSpecFilter === 'all') return true;
      return (doctor.specialization || 'General') === this.availableDoctorsSpecFilter;
    });
  }

  navigateToUpdateProfile() {
    this.router.navigate(['/update-profile']);
  }

  viewDetails(appointment: any) {
    this.router.navigate(['/appointment-details'], { 
      state: { appointment },
      skipLocationChange: true
    });
  }
} 