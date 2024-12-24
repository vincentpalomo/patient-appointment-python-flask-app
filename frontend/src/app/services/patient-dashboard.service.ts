import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserProfile } from '../models/user-profile.model';
import { Appointment } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class PatientDashboardService {
  constructor(private http: HttpClient) {}

  getPatientProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${environment.apiUrl}/api/patients/profile`);
  }

  updateProfile(updateData: Partial<UserProfile>): Observable<{ msg: string }> {
    return this.http.put<{ msg: string }>(`${environment.apiUrl}/api/patients/profile`, updateData);
  }

  getUpcomingAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${environment.apiUrl}/api/patients/appointments/upcoming`);
  }

  getAppointmentHistory(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${environment.apiUrl}/api/patients/appointments/history`);
  }
} 