import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../../app/services/auth.service';
import { environment } from '../../environments/environment';
import { UserProfileDTO } from '../interfaces/appointment.interface';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login user', () => {
    const email = 'test@example.com';
    const password = 'Password123!';

    const mockLoginResponse = {
      access_token: 'mock-jwt-token'
    };

    const mockProfile: UserProfileDTO = {
      id: 3,
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      appointments: []
    };

    service.login(email, password).subscribe({
      next: () => {
        // After login, the token should be stored in localStorage
        expect(localStorage.getItem('access_token')).toBe('mock-jwt-token');
      }
    });

    // Handle login request
    const loginReq = httpMock.expectOne(`${environment.apiUrl}/api/patients/login`);
    expect(loginReq.request.method).toBe('POST');
    expect(loginReq.request.body).toEqual({ email, password });
    loginReq.flush(mockLoginResponse);

    // Handle the automatic profile request that follows login
    const profileReq = httpMock.expectOne(`${environment.apiUrl}/api/patients/profile`);
    expect(profileReq.request.method).toBe('GET');
    profileReq.flush(mockProfile);
  });

  it('should get user profile', () => {
    // Set up mock JWT token
    localStorage.setItem('access_token', 'mock-jwt-token');

    const mockProfile: UserProfileDTO = {
      id: 3,
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      appointments: []
    };

    service.getUserProfile().subscribe(profile => {
      expect(profile).toBeDefined();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/patients/profile`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-jwt-token');
    req.flush(mockProfile);
  });
}); 