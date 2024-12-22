import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
    { path: 'register', loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent) },
    { path: 'patient-dashboard', loadComponent: () => import('./components/patient-dashboard/patient-dashboard.component').then(m => m.PatientDashboardComponent) },
    { path: 'doctor-dashboard', loadComponent: () => import('./components/doctor-dashboard/doctor-dashboard.component').then(m => m.DoctorDashboardComponent) },
    { path: 'book-appointment', loadComponent: () => import('./components/book-appointment/book-appointment.component').then(m => m.BookAppointmentComponent) },
    { path: 'update-profile', loadComponent: () => import('./components/update-profile/update-profile.component').then(m => m.UpdateProfileComponent) },
    { path: 'appointment-details', loadComponent: () => import('./components/appointment-details/appointment-details.component').then(m => m.AppointmentDetailsComponent) },
    { path: 'appointment-history', loadComponent: () => import('./components/appointment-history/appointment-history.component').then(m => m.AppointmentHistoryComponent) }
];
