import { UserRole, AppointmentStatus } from "./constants";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  facility_id?: string; // For admin/doctor/nurse
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface Facility {
  id: string;
  name: string;
  address: string;
  phone: string;
  type: string; // e.g., 'hospital', 'clinic', 'health_center'
  region: string;
  doctors: User[];
  beds: number;
  occupied_beds: number;
}

export interface Appointment {
  id: string;
  client_id: string;
  client_name: string;
  doctor_id: string;
  doctor_name: string;
  facility_id: string;
  facility_name: string;
  date_time: string; // ISO string
  reason: string;
  status: AppointmentStatus;
}

export interface MedicalRecord {
  id: string;
  client_id: string;
  client_name: string;
  doctor_id: string;
  doctor_name: string;
  facility_id: string;
  facility_name: string;
  date: string; // ISO string
  diagnosis: string;
  notes: string;
  prescription: string;
}

export interface SupplyRequest {
  id: string;
  facility_id: string;
  facility_name: string;
  item_name: string;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string; // ISO string
  approved_at?: string; // ISO string
}

export interface Feedback {
  id: string;
  client_name: string;
  facility_id: string;
  facility_name: string;
  rating: number; // 1-5
  comment: string;
  date: string; // ISO string
}

export interface ChartDataPoint {
  name: string;
  value: number;
}
