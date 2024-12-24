import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PatientDashboardService } from '../../app/services/patient-dashboard.service';
import { environment } from '../../environments/environment';
import { UserProfile } from '../../app/models/user-profile.model';
import { Appointment } from '../../app/models/appointment.model';

describe('PatientDashboardService', () => {
  let service: PatientDashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PatientDashboardService]
    });
    service = TestBed.inject(PatientDashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get patient profile', () => {
    const mockProfile: UserProfile = {
      id: 1,
      name: 'Test Patient',
      email: 'test@example.com',
      phone: '1234567890',
      appointments: []
    };

    service.getPatientProfile().subscribe((profile: UserProfile) => {
      expect(profile).toBeDefined();
      expect(profile.id).toBe(1);
      expect(profile.name).toBe('Test Patient');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/patients/profile`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProfile);
  });

  it('should update patient profile', () => {
    const updateData: Partial<UserProfile> = {
      name: 'Updated Name',
      email: 'updated@example.com',
      phone: '9876543210'
    };

    const mockResponse = {
      msg: 'Profile updated successfully'
    };

    service.updateProfile(updateData).subscribe((response: { msg: string }) => {
      expect(response).toBeDefined();
      expect(response.msg).toBe('Profile updated successfully');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/patients/profile`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateData);
    req.flush(mockResponse);
  });

  it('should get upcoming appointments', () => {
    const mockAppointments: Appointment[] = [{
      id: 1,
      patientId: 1,
      doctorId: 1,
      date: new Date('2024-01-20'),
      time: '14:30',
      status: 'scheduled',
      notes: 'Upcoming appointment'
    }];

    service.getUpcomingAppointments().subscribe((appointments: Appointment[]) => {
      expect(appointments).toBeDefined();
      expect(appointments.length).toBe(1);
      expect(appointments[0].status).toBe('scheduled');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/patients/appointments/upcoming`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAppointments);
  });

  it('should get appointment history', () => {
    const mockAppointments: Appointment[] = [{
      id: 1,
      patientId: 1,
      doctorId: 1,
      date: new Date('2023-12-20'),
      time: '14:30',
      status: 'completed',
      notes: 'Past appointment'
    }];

    service.getAppointmentHistory().subscribe((appointments: Appointment[]) => {
      expect(appointments).toBeDefined();
      expect(appointments.length).toBe(1);
      expect(appointments[0].status).toBe('completed');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/patients/appointments/history`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAppointments);
  });
}); 