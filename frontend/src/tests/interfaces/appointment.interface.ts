export interface AppointmentDTO {
    id?: number;
    patient_id: number;
    doctor_id: number;
    appointment_time: string;
    status: string;
    notes?: string;
}

export interface LoginResponse {
    access_token: string;
}

export interface UserProfileDTO {
    id: number;
    name: string;
    email: string;
    phone: string;
    appointments: AppointmentDTO[];
} 