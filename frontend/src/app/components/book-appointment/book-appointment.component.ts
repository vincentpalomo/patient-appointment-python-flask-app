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
  template: `
    <div class="booking-container">
      <h2>Book Appointment</h2>
      
      <div class="form-group">
        <label for="search">Search Doctor:</label>
        <div class="search-container">
          <input
            type="text"
            id="search"
            [(ngModel)]="searchTerm"
            (input)="searchDoctor()"
            placeholder="Search by name or specialization"
            class="search-input"
          >
          <div class="search-results" *ngIf="searchTerm && filteredDoctors.length > 0">
            <div 
              *ngFor="let doctor of filteredDoctors" 
              class="search-result-item"
              (click)="selectDoctor(doctor)">
              <span class="doctor-name">{{doctor.name}}</span>
              <span class="doctor-specialization">{{doctor.specialization || 'General'}}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="doctor">Selected Doctor:</label>
        <select id="doctor" [(ngModel)]="selectedDoctorId" (change)="onDoctorSelect()">
          <option value="">Select a doctor</option>
          <option *ngFor="let doctor of doctors" [value]="doctor.id">
            {{doctor.name}} - {{doctor.specialization || 'General'}}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="date">Select Date:</label>
        <select id="date" [(ngModel)]="selectedDate" (change)="onDateSelect()" [disabled]="!selectedDoctorId">
          <option value="">Select a date</option>
          <option *ngFor="let slot of availableDates" [value]="slot.toISOString()">
            {{slot | date:'fullDate'}}
          </option>
        </select>
        <small class="hint" *ngIf="!selectedDoctorId">Please select a doctor first</small>
      </div>

      <div class="form-group">
        <label for="time">Select Time:</label>
        <div class="time-slots" [class.disabled]="!selectedDate">
          <button 
            *ngFor="let slot of timeSlots" 
            class="time-slot"
            [class.selected]="selectedTime === slot.time"
            [class.unavailable]="!slot.isAvailable"
            [disabled]="!selectedDate || !slot.isAvailable"
            (click)="selectTime(slot.time)">
            {{slot.label}}
          </button>
        </div>
        <small class="hint" *ngIf="!selectedDate">Please select a date first</small>
      </div>

      <div class="actions">
        <button (click)="bookAppointment()" [disabled]="!canBook">Book Appointment</button>
        <button (click)="goBack()" class="secondary">Back</button>
      </div>

      <div *ngIf="error" class="error">{{error}}</div>
    </div>
  `,
  styles: [`
    .booking-container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
    }
    select {
      width: 100%;
      padding: 8px;
      margin-bottom: 5px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    select:disabled {
      background-color: #f5f5f5;
      cursor: not-allowed;
    }
    .time-slots {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 10px;
      margin-top: 10px;
    }
    .time-slots.disabled {
      opacity: 0.7;
      pointer-events: none;
    }
    .time-slot {
      padding: 10px;
      border: 1px solid #4CAF50;
      border-radius: 4px;
      background: #e8f5e9;
      color: #2e7d32;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 500;
    }
    .time-slot:hover:not(:disabled) {
      background: #4CAF50;
      color: white;
    }
    .time-slot.selected {
      background: #2e7d32;
      color: white;
      border-color: #2e7d32;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .time-slot.unavailable {
      background: #f5f5f5;
      color: #999;
      border-color: #ddd;
      cursor: not-allowed;
      text-decoration: line-through;
    }
    .hint {
      color: #666;
      font-size: 0.8em;
      font-style: italic;
    }
    .actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }
    button {
      padding: 10px 20px;
      background-color: #2e7d32;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1em;
      min-width: 120px;
      transition: background-color 0.2s;
    }
    button:hover:not(:disabled) {
      background-color: #1b5e20;
    }
    button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    .secondary {
      background-color: #757575;
    }
    .secondary:hover {
      background-color: #616161;
    }
    .error {
      color: #f44336;
      padding: 10px;
      margin-top: 20px;
      border: 1px solid #f44336;
      border-radius: 4px;
    }
    .search-input {
      width: 100%;
      padding: 8px;
      margin-bottom: 5px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1em;
    }
    .search-input:focus {
      outline: none;
      border-color: #4CAF50;
      box-shadow: 0 0 3px rgba(76, 175, 80, 0.3);
    }
    .search-container {
      position: relative;
    }
    .search-results {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #ddd;
      border-top: none;
      border-radius: 0 0 4px 4px;
      max-height: 200px;
      overflow-y: auto;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .search-result-item {
      padding: 8px 12px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: background-color 0.2s;
    }
    .search-result-item:hover {
      background-color: #f5f5f5;
    }
    .doctor-name {
      font-weight: 500;
    }
    .doctor-specialization {
      color: #666;
      font-size: 0.9em;
    }
  `]
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
  }

  ngOnInit() {
    this.loadDoctors();
  }

  loadDoctors() {
    this.appointmentService.getDoctors().subscribe({
      next: (doctors) => {
        console.log('Loaded doctors:', doctors);
        this.doctors = doctors;
        this.filteredDoctors = doctors;
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
        this.error = 'Failed to load doctors. Please try again later.';
      }
    });
  }

  searchDoctor() {
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

    // Always create appointment with 'scheduled' status
    const appointment: Appointment = {
      patientId: currentUser.id,
      doctorId: this.selectedDoctorId,
      date: new Date(this.selectedDate),
      time: this.selectedTime,
      status: 'scheduled'  // Explicitly set status to scheduled
    };

    // Check if we're booking a canceled slot
    const existingAppointmentId = this.canceledAppointments[this.selectedTime];

    console.log('Booking appointment:', {
      appointment,
      existingAppointmentId,
      selectedTime: this.selectedTime,
      status: 'scheduled'  // Log the status
    });

    this.appointmentService.bookAppointment(appointment, existingAppointmentId)
      .subscribe({
        next: (response) => {
          console.log('Booking response:', response);
          alert('Appointment booked successfully!');
          this.router.navigate(['/patient-dashboard']);
        },
        error: (error) => {
          console.error('Detailed booking error:', error);
          this.error = error.error?.msg || 'Failed to book appointment. Please try again.';
        }
      });
  }

  goBack() {
    this.router.navigate(['/patient-dashboard']);
  }

  selectDoctor(doctor: User) {
    this.selectedDoctorId = doctor.id || null;
    this.searchTerm = doctor.name; // Update search input with selected doctor's name
    this.filteredDoctors = []; // Clear the filtered results to close dropdown
    this.onDoctorSelect();
  }
} 