export interface Appointment {
    id?: number;
    patientId: number;
    doctorId: number;
    date: Date;
    time: string;
    status: 'scheduled' | 'canceled' | 'completed';
} 