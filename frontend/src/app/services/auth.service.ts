import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError, tap } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

interface LoginResponse {
  access_token: string;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  appointments: any[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUserSubject.next(JSON.parse(storedUser));
      }
    }
  }

  register(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/patients/register`, {
      name: user.name,
      email: user.email,
      password: user.password,
      phone: user.phone
    }).pipe(
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  login(email: string, password: string): Observable<User | null> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/api/patients/login`, {
      email,
      password
    }).pipe(
      switchMap(response => {
        if (this.isBrowser) {
          localStorage.setItem('access_token', response.access_token);
        }
        
        // Create headers with the token
        const headers = new HttpHeaders().set(
          'Authorization',
          `Bearer ${response.access_token}`
        );
        
        // Fetch user profile with token
        return this.http.get<UserProfile>(`${this.apiUrl}/api/patients/profile`, { headers });
      }),
      map(profile => {
        const user: User = {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          phone: profile.phone,
          role: 'patient'
        };
        
        if (this.isBrowser) {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
        this.currentUserSubject.next(user);
        return user;
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('access_token');
    }
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem('access_token') : null;
  }

  getUserProfile(): Observable<UserProfile> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token found'));
    }

    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${token}`
    );
  
    return this.http.get<UserProfile>(`${this.apiUrl}/api/patients/profile`, { headers }).pipe(
      catchError(error => {
        console.error('Error fetching user profile:', error);
        return throwError(() => error);
      })
    );
  }

  updateProfile(updateData: { name: string; email: string; phone: string }) {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token found'));
    }

    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${token}`
    );

    return this.http.put(`${this.apiUrl}/api/patients/profile`, updateData, { headers })
      .pipe(
        tap((response: any) => {
          const currentUser = this.getCurrentUser();
          if (currentUser) {
            const updatedUser = {
              ...currentUser,
              ...updateData
            };
            if (this.isBrowser) {
              localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            }
            this.currentUserSubject.next(updatedUser);
          }
        }),
        catchError(error => {
          console.error('Error updating profile:', error);
          return throwError(() => error);
        })
      );
  }
} 