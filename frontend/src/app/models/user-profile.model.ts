import { Appointment } from './appointment.model';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  appointments: Appointment[];
} 