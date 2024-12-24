import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppointmentService } from '../../app/services/appointment.service';
import { environment } from '../../environments/environment';
import { AppointmentDTO } from '../interfaces/appointment.interface';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AppointmentService]
    });
    service = TestBed.inject(AppointmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all appointments', () => {
    const mockAppointments: AppointmentDTO[] = [{
      id: 1,
      patient_id: 1,
      doctor_id: 1,
      appointment_time: '2024-01-20 14:30',
      status: 'scheduled',
      notes: 'Test appointment'
    }];

    service.getAppointments().subscribe(appointments => {
      expect(appointments).toBeDefined();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/appointments`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAppointments);
  });

  it('should get doctor appointments', () => {
    const doctorId = 1;
    const mockAppointments: AppointmentDTO[] = [{
      id: 1,
      patient_id: 1,
      doctor_id: doctorId,
      appointment_time: '2024-01-20 14:30',
      status: 'scheduled'
    }];

    service.getDoctorAppointments(doctorId).subscribe(appointments => {
      expect(appointments).toBeDefined();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/doctors/${doctorId}/appointments`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAppointments);
  });

  it('should get patient appointments', () => {
    const patientId = 1;
    const mockAppointments: AppointmentDTO[] = [{
      id: 1,
      patient_id: patientId,
      doctor_id: 1,
      appointment_time: '2024-01-20 14:30',
      status: 'scheduled'
    }];

    service.getPatientAppointments(patientId).subscribe(appointments => {
      expect(appointments).toBeDefined();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/patients/profile`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAppointments);
  });
}); 