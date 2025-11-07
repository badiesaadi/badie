import axios from 'axios';
import { API_BASE_URL, UserRole, AppointmentStatus } from '../constants';
import { AuthResponse, User, Facility, Appointment, MedicalRecord, SupplyRequest, Feedback } from '../types';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Basic error handling for unauthorized requests
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized request. Logging out...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.hash = '#/login'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

// --- Auth Endpoints ---
export const authService = {
  register: (userData: any) => api.post<AuthResponse>('auth/register.php', userData),
  login: (credentials: any) => api.post<AuthResponse>('auth/login.php', credentials),
  logout: () => api.get<{ message: string }>('auth/logout.php'),
  getProfile: () => api.get<User>('auth/me.php'),
  requestReset: (email: string) => api.post<{ message: string }>('auth/request_reset.php', { email }),
  confirmReset: (data: any) => api.post<{ message: string }>('auth/reset_password.php', data),
};

// --- Facilities Endpoints ---
export const facilityService = {
  createFacility: (facilityData: Omit<Facility, 'id' | 'doctors' | 'occupied_beds'>) => api.post<Facility>('facilities/create.php', facilityData),
  listFacilities: () => api.get<Facility[]>('facilities/list.php'),
  assignDoctor: (facilityId: string, doctorId: string) => api.post<{ message: string }>('facilities/assign_doctor.php', { facility_id: facilityId, doctor_id: doctorId }),
  getMyFacility: () => api.get<Facility>('facilities/my_facility.php'),
};

// --- Appointments Endpoints ---
export const appointmentService = {
  createAppointment: (appointmentData: Omit<Appointment, 'id' | 'status' | 'client_name' | 'doctor_name' | 'facility_name'>) => api.post<Appointment>('appointments/create.php', appointmentData),
  updateStatus: (appointmentId: string, status: AppointmentStatus) => api.post<{ message: string }>('appointments/update_status.php', { appointment_id: appointmentId, status }),
  myAppointments: (role: UserRole) => api.get<Appointment[]>(`appointments/my_appointments.php?role=${role}`), // client/doctor
  facilityAppointments: (facilityId: string) => api.get<Appointment[]>(`appointments/facility_appointments.php?facility_id=${facilityId}`), // admin
};

// --- Medical Records Endpoints ---
export const medicalRecordService = {
  addRecord: (recordData: Omit<MedicalRecord, 'id' | 'client_name' | 'doctor_name' | 'facility_name'>) => api.post<MedicalRecord>('records/add.php', recordData),
  getClientRecords: (clientId: string) => api.get<MedicalRecord[]>(`records/client_records.php?client_id=${clientId}`),
};

// --- Simulated Ministry Requests ---
// Assuming there's an API for supply requests, not explicitly listed but derived from requirements
export const ministryService = {
  getSupplyRequests: () => api.get<SupplyRequest[]>('ministry/supply_requests.php'), // Placeholder
  updateSupplyRequestStatus: (requestId: string, status: 'approved' | 'rejected') => api.post<{ message: string }>('ministry/update_supply_request.php', { request_id: requestId, status }), // Placeholder
};

// --- Inventory (Hospital Admin) ---
export const inventoryService = {
  getInventory: (facilityId: string) => api.get<any[]>(`inventory/list.php?facility_id=${facilityId}`), // Placeholder
  updateInventory: (data: any) => api.post<{ message: string }>('inventory/update.php', data), // Placeholder
  createSupplyRequest: (data: Omit<SupplyRequest, 'id' | 'status' | 'requested_at' | 'facility_name'>) => api.post<{ message: string }>('inventory/request_supply.php', data), // Placeholder
};

// --- Feedback (Simulated) ---
// Since the prompt states "Display simulated patient feedback (JSON format)",
// we'll assume a static JSON file or a simple mock API.
// For now, let's assume an endpoint exists for fetching it.
export const feedbackService = {
  getFacilityFeedback: (facilityId: string) => api.get<Feedback[]>(`feedback/facility_feedback.php?facility_id=${facilityId}`), // Placeholder
  getNationalFeedback: () => api.get<Feedback[]>('feedback/national_feedback.php'), // Placeholder
  // addResponseToFeedback: (feedbackId: string, response: string) => api.post<{ message: string }>('feedback/respond.php', { feedback_id: feedbackId, response }), // Optional
};