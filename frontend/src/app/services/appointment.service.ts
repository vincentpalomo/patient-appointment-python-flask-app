import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Appointment } from '../models/appointment.model';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get all appointments for the logged-in user (patient or doctor)
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/api/appointments`);
  }

  // Get patient's appointments
  getPatientAppointments(patientId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/api/patients/profile`);
  }

  // Get doctor's appointments
  getDoctorAppointments(doctorId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/api/doctors/${doctorId}/appointments`);
  }

  // Book a new appointment or reschedule a canceled one
  bookAppointment(appointment: Appointment, existingAppointmentId?: number): Observable<any> {
    const appointmentTime = this.formatDateTime(appointment.date, appointment.time);

    if (existingAppointmentId) {
      // Update existing canceled appointment with new time only
      return this.http.put(`${this.apiUrl}/api/appointments/${existingAppointmentId}`, {
        appointment_time: appointmentTime
      }).pipe(
        catchError(error => {
          console.error('Appointment update error:', error);
          return throwError(() => error);
        })
      );
    } else {
      // Create new appointment
      return this.http.post(`${this.apiUrl}/api/appointments/create`, {
        doctor_id: appointment.doctorId,
        appointment_time: appointmentTime
      }).pipe(
        catchError(error => {
          console.error('Appointment booking error:', error);
          return throwError(() => error);
        })
      );
    }
  }

  // Cancel an appointment
  cancelAppointment(appointmentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/appointments/${appointmentId}`);
  }

  // Update an appointment
  updateAppointment(appointmentId: number, date: Date, time: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/appointments/${appointmentId}`, {
      appointment_time: this.formatDateTime(date, time)
    });
  }

  // Get all doctors
  getDoctors(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/api/doctors`);
  }

  // Helper method to format date and time for the API
  private formatDateTime(date: Date, time: string): string {
    try {
      // Ensure we have a valid date object
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date');
      }

      // Format date to YYYY-MM-DD
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      // Validate time format
      if (!/^\d{2}:\d{2}$/.test(time)) {
        throw new Error('Invalid time format');
      }

      return `${dateStr} ${time}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      throw error;
    }
  }
} 