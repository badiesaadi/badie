import { UserRole, AppointmentStatus } from "./constants";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  facility_id?: string | null; // For admin/doctor/nurse, can be null
}

// Full Facility object, including optional address, phone, region for display
export interface Facility {
  id: string;
  name: string;
  type: string; // e.g., 'hospital', 'clinic', 'health_center'
  address: string;
  phone: string;
  region: string;
  doctors: User[]; // Doctors assigned to this facility
  beds: number;
  occupied_beds: number;
}

// For creating/updating a facility (subset of Facility)
export interface FacilityPayload {
  name: string;
  type: string;
  address: string;
  phone: string;
  region: string;
  beds: number;
  occupied_beds?: number; // Optional on creation, defaults to 0
}

export interface Appointment {
  id: string;
  client_id: string;
  client_name?: string; // Optional for creating, comes in lists
  doctor_id: string;
  doctor_name?: string; // Optional for creating, comes in lists
  facility_id: string;
  facility_name?: string; // Optional for creating, comes in lists
  date_time: string; // ISO string
  reason: string;
  status: AppointmentStatus;
}

// For creating an appointment (subset of Appointment)
export interface AppointmentPayload {
  client_id: string;
  facility_id: string;
  doctor_id: string;
  date_time: string;
  reason: string;
}

export interface MedicalRecord {
  id: string;
  client_id: string;
  client_name?: string;
  doctor_id: string;
  doctor_name?: string;
  facility_id: string;
  facility_name?: string;
  appointment_id?: string; // Optional, can be null
  date: string; // ISO string (or YYYY-MM-DD)
  diagnosis: string;
  notes: string;
  prescription: string;
}

// For adding a medical record (subset of MedicalRecord)
export interface MedicalRecordPayload {
  client_id: string;
  doctor_id: string;
  facility_id: string;
  appointment_id?: string | null;
  date: string;
  diagnosis: string;
  notes: string;
  prescription: string;
}

export interface SupplyRequest {
  id: string;
  facility_id: string;
  facility_name?: string; // Comes in lists
  item_name: string;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string; // ISO string
  approved_at?: string; // ISO string
}

export interface Feedback {
  id: string;
  client_name?: string; // Comes in lists
  facility_id: string;
  facility_name?: string; // Comes in lists
  rating: number; // 1-5
  comment: string;
  date: string; // ISO string
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

// --- API Response Wrappers (ensuring consistency across all endpoints) ---

export interface SuccessResponse {
  success: boolean;
  message?: string;
}

// Auth Responses
export interface AuthLoginRegisterResponse extends SuccessResponse {
  token: string;
  user: User;
}

export interface GetProfileResponse extends SuccessResponse {
  user: User;
}

export interface RequestResetResponse extends SuccessResponse {
  reset_code?: string; // Only for testing in development, should not be exposed in production
  message: string;
}

export interface ResetPasswordResponse extends SuccessResponse {
  message: string;
}

// Facilities Responses
export interface CreateFacilityResponse extends SuccessResponse {
  facility_id: string;
}

export interface ListFacilitiesResponse extends SuccessResponse {
  facilities: Facility[];
}

export interface AssignDoctorResponse extends SuccessResponse {
  message: string;
}

export interface MyFacilityResponse extends SuccessResponse {
  facility: Facility;
}

// Appointments Responses
export interface CreateAppointmentResponse extends SuccessResponse {
  appointment_id: string;
}

export interface UpdateAppointmentStatusResponse extends SuccessResponse {
  message: string;
}

export interface MyAppointmentsResponse extends SuccessResponse {
  appointments: Appointment[];
}

export interface FacilityAppointmentsResponse extends SuccessResponse {
  facility_id: string;
  appointments: Appointment[];
}

// Medical Records Responses
export interface AddMedicalRecordResponse extends SuccessResponse {
  record_id: string;
}

export interface ClientRecordsResponse extends SuccessResponse {
  records: MedicalRecord[];
}

// Ministry & Inventory Responses (Placeholders now with consistent wrappers)
export interface GetSupplyRequestsResponse extends SuccessResponse {
  data: SupplyRequest[];
}

export interface UpdateSupplyRequestStatusResponse extends SuccessResponse {
  message: string;
}

export interface GetInventoryResponse extends SuccessResponse {
  data: any[]; // Or define a specific InventoryItem type
}

export interface CreateSupplyRequestResponse extends SuccessResponse {
  message: string;
}

// Feedback Responses
export interface GetFeedbackResponse extends SuccessResponse {
  data: Feedback[];
}
