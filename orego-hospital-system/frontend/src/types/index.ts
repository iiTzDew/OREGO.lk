export interface User {
  id: string;
  username: string;
  role: 'admin' | 'doctor' | 'nurse' | 'patient' | 'staff';
  name: string;
  birthday: string;
  id_card_number: string;
  address: string;
  phone_number: string;
  email: string;
  speciality?: string;
  medical_status?: string;
  operation_type?: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone_number: string;
  email: string;
  registration_number: string;
  total_beds: number;
  total_operation_theatres: number;
  description?: string;
  logo_url?: string;
  created_at: string;
}

export interface Resource {
  id: string;
  type: 'bed' | 'operation_theatre' | 'machine';
  resource_type?: string; // Alias for type
  name: string;
  resource_name?: string; // Alias for name
  resource_number?: string; // Combined identifier
  status: 'available' | 'booked' | 'maintenance';
  is_available?: boolean; // Computed from status
  ward_id?: string;
  bed_number?: string;
  ot_number?: string;
  serial_number?: string;
  identifier?: string;
  location?: string;
  description?: string;
  registered_date: string;
  created_at: string;
}

export interface Booking {
  id: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  booking_type: 'surgery' | 'appointment' | 'test';
  scheduled_date: string;
  scheduled_end_date: string;
  duration_hours: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  allocated_resources: BookingResource[];
  created_at: string;
}

export interface BookingResource {
  id: string;
  booking_id: string;
  resource_id?: string;
  resource_type: string;
  resource_name?: string;
  staff_id?: string;
  staff_name?: string;
  allocated_at: string;
  released_at?: string;
}

export interface Notification {
  id: string;
  recipient_id: string;
  title: string;
  message: string;
  type: 'booking' | 'discharge' | 'alert' | 'general';
  is_read: boolean;
  related_id?: string;
  created_at: string;
}

export interface Discharge {
  id: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  admission_date: string;
  discharge_date: string;
  duration_days: number;
  diagnosed_disease?: string;
  treatment_summary?: string;
  prescribed_medicines?: string;
  follow_up_instructions?: string;
  bed_id?: string;
  bed_info?: Resource;
  doctor_approval: boolean;
  discharge_summary?: string;
  created_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  user: User;
}
