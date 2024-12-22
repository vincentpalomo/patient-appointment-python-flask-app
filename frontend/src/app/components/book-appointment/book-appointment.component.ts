import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { User } from '../../models/user.model';
import { Appointment } from '../../models/appointment.model';

interface TimeSlot {
  time: string;
  label: string;
  isAvailable: boolean;
}

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-appointment.component.html',
  styleUrls: ['./book-appointment.component.css']
})
export class BookAppointmentComponent implements OnInit {
  doctors: User[] = [];
  selectedDoctorId: number | null = null;
  selectedDate: string = '';
  selectedTime: string = '';
  availableDates: Date[] = [];
  error: string | null = null;
  doctorAppointments: any[] = [];
  canceledAppointments: any = {};
  searchTerm: string = '';
  filteredDoctors: User[] = [];
  updateMode: boolean = false;
  appointmentId: number | null = null;

  timeSlots: TimeSlot[] = [
    { time: '09:00', label: '9:00 AM', isAvailable: true },
    { time: '10:00', label: '10:00 AM', isAvailable: true },
    { time: '11:00', label: '11:00 AM', isAvailable: true },
    { time: '14:00', label: '2:00 PM', isAvailable: true },
    { time: '15:00', label: '3:00 PM', isAvailable: true },
    { time: '16:00', label: '4:00 PM', isAvailable: true }
  ];

  constructor(
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private router: Router
  ) {
    // Initialize available dates (next 7 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.availableDates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });

    // Check for pre-selected doctor from router state
    const state = this.router.getCurrentNavigation()?.extras?.state as { 
      selectedDoctor: any,
      updateMode: boolean,
      appointmentId: number,
      currentDate: string,
      currentTime: string
    };

    if (state?.selectedDoctor) {
      this.selectedDoctorId = state.selectedDoctor.id;
      
      // If in update mode, set additional fields
      if (state.updateMode) {
        this.updateMode = true;
        this.appointmentId = state.appointmentId;
        this.selectedDate = new Date(state.currentDate).toISOString();
        this.selectedTime = state.currentTime;
        // Clear search term in update mode
        this.searchTerm = '';
      }
    }
  }

  ngOnInit() {
    this.loadDoctors().then(() => {
      if (this.selectedDoctorId) {
        this.onDoctorSelect(); // Trigger loading of doctor's appointments after doctors are loaded
      }
    });
  }

  loadDoctors() {
    return new Promise<void>((resolve) => {
      this.appointmentService.getDoctors().subscribe({
        next: (doctors) => {
          console.log('Loaded doctors:', doctors);
          this.doctors = doctors;
          this.filteredDoctors = doctors;
          resolve();
        },
        error: (error) => {
          console.error('Error loading doctors:', error);
          this.error = 'Failed to load doctors. Please try again later.';
          resolve();
        }
      });
    });
  }

  searchDoctor() {
    // Don't allow search in update mode
    if (this.updateMode) {
      return;
    }

    if (!this.searchTerm.trim()) {
      this.filteredDoctors = [];
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredDoctors = this.doctors.filter(doctor => {
      const nameMatch = doctor.name.toLowerCase().includes(searchTermLower);
      const specializationMatch = (doctor.specialization || '').toLowerCase().includes(searchTermLower);
      return nameMatch || specializationMatch;
    });
  }

  onDoctorSelect() {
    this.selectedDate = '';
    this.selectedTime = '';
    this.resetTimeSlots();
    
    if (this.selectedDoctorId) {
      this.loadDoctorAppointments();
    }
  }

  onDateSelect() {
    if (this.selectedDate) {
      this.updateAvailableTimeSlots();
    }
    this.selectedTime = '';
  }

  loadDoctorAppointments() {
    if (!this.selectedDoctorId) return;

    this.appointmentService.getDoctorAppointments(this.selectedDoctorId).subscribe({
      next: (appointments) => {
        console.log('Doctor appointments:', appointments);
        this.doctorAppointments = appointments;
        if (this.selectedDate) {
          this.updateAvailableTimeSlots();
        }
      },
      error: (error) => {
        console.error('Error loading doctor appointments:', error);
        this.error = 'Failed to load doctor\'s schedule. Please try again later.';
      }
    });
  }

  updateAvailableTimeSlots() {
    const selectedDate = new Date(this.selectedDate);
    selectedDate.setHours(0, 0, 0, 0);

    // Reset all slots to available
    this.resetTimeSlots();

    // Keep track of canceled appointments that can be rescheduled
    this.canceledAppointments = {};

    // Mark slots as unavailable based on doctor's scheduled appointments
    this.doctorAppointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.appointment_time);
      appointmentDate.setHours(0, 0, 0, 0);

      if (appointmentDate.getTime() === selectedDate.getTime()) {
        const timeStr = appointment.appointment_time.split(' ')[1].substring(0, 5);
        const slot = this.timeSlots.find(s => s.time === timeStr);
        
        if (slot) {
          if (appointment.status === 'scheduled') {
            slot.isAvailable = false;
          } else if (appointment.status === 'canceled') {
            // Store the canceled appointment ID for potential rescheduling
            this.canceledAppointments[timeStr] = appointment.id;
          }
        }
      }
    });

    console.log('Updated time slots:', this.timeSlots);
    console.log('Canceled appointments:', this.canceledAppointments);
  }

  resetTimeSlots() {
    this.timeSlots.forEach(slot => slot.isAvailable = true);
  }

  selectTime(time: string) {
    this.selectedTime = time;
  }

  get canBook(): boolean {
    return !!(this.selectedDoctorId && this.selectedDate && this.selectedTime);
  }

  bookAppointment() {
    if (!this.selectedDoctorId) {
      this.error = 'Please select a doctor';
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.error = 'Please log in to book an appointment';
      return;
    }

    const appointment: Appointment = {
      patientId: currentUser.id,
      doctorId: this.selectedDoctorId,
      date: new Date(this.selectedDate),
      time: this.selectedTime,
      status: 'scheduled'
    };

    // If in update mode, use updateAppointment, otherwise use bookAppointment
    const appointmentObservable = this.updateMode && this.appointmentId
      ? this.appointmentService.updateAppointment(this.appointmentId, appointment.date, appointment.time)
      : this.appointmentService.bookAppointment(appointment, this.canceledAppointments[this.selectedTime]);

    appointmentObservable.subscribe({
      next: (response) => {
        console.log(this.updateMode ? 'Update response:' : 'Booking response:', response);
        alert(this.updateMode ? 'Appointment updated successfully!' : 'Appointment booked successfully!');
        this.router.navigate(['/patient-dashboard']);
      },
      error: (error) => {
        console.error('Detailed error:', error);
        this.error = error.error?.msg || `Failed to ${this.updateMode ? 'update' : 'book'} appointment. Please try again.`;
      }
    });
  }

  goBack() {
    this.router.navigate(['/patient-dashboard']);
  }

  selectDoctor(doctor: User) {
    // Don't allow doctor selection in update mode
    if (this.updateMode) {
      return;
    }

    this.selectedDoctorId = doctor.id || null;
    this.searchTerm = doctor.name;
    this.filteredDoctors = [];
    this.onDoctorSelect();
  }
} 