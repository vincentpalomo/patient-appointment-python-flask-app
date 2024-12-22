export interface User {
    id?: number;
    email: string;
    password?: string;
    name: string;
    phone?: string;
    role: 'patient' | 'doctor';
    specialization?: string;
} 
