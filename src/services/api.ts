import axios from 'axios';
import { API_BASE_URL, UserRole, AppointmentStatus } from '../constants';
import {
  User, Facility, Appointment, MedicalRecord, SupplyRequest, Feedback,
  AuthLoginRegisterResponse, GetProfileResponse, RequestResetResponse, ResetPasswordResponse,
  CreateFacilityResponse, ListFacilitiesResponse, AssignDoctorResponse, MyFacilityResponse,
  CreateAppointmentResponse, UpdateAppointmentStatusResponse, MyAppointmentsResponse, FacilityAppointmentsResponse,
  AddMedicalRecordResponse, ClientRecordsResponse,
  GetSupplyRequestsResponse, UpdateSupplyRequestStatusResponse,
  GetInventoryResponse, CreateSupplyRequestResponse,
  GetFeedbackResponse, SuccessResponse,
  FacilityPayload, AppointmentPayload, MedicalRecordPayload
} from '../types';

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
  (response) => {
    // For responses that follow the { success: true, ... } pattern,
    // if success is false, treat it as an error to be caught by the .catch block.
    if (response.data && typeof response.data.success === 'boolean' && !response.data.success) {
      return Promise.reject({
        response: {
          status: response.status,
          data: response.data,
          message: response.data.message || 'Operation failed',
        },
      });
    }
    return response;
  },
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
  register: (userData: any) => api.post<AuthLoginRegisterResponse>('auth/register.php', userData),
  login: (credentials: any) => api.post<AuthLoginRegisterResponse>('auth/login.php', credentials),
  logout: () => api.get<SuccessResponse>('auth/logout.php'), // Returns {success: true}
  getProfile: () => api.get<GetProfileResponse>('auth/me.php'), // Now wrapped in {success:true, user: User}
  requestReset: (email: string) => api.post<RequestResetResponse>('auth/request_reset.php', { email }),
  confirmReset: (data: any) => api.post<ResetPasswordResponse>('auth/reset_password.php', data),
};

// --- Facilities Endpoints ---
export const facilityService = {
  createFacility: (facilityData: FacilityPayload) => api.post<CreateFacilityResponse>('facilities/create.php', facilityData),
  listFacilities: () => api.get<ListFacilitiesResponse>('facilities/list.php'),
  assignDoctor: (facilityId: string, doctorId: string) => api.post<AssignDoctorResponse>('facilities/assign_doctor.php', { facility_id: facilityId, doctor_id: doctorId }),
  getMyFacility: () => api.get<MyFacilityResponse>('facilities/my_facility.php'),
  // New: Example update facility endpoint
  updateFacility: (facilityId: string, facilityData: Partial<FacilityPayload>) => api.put<SuccessResponse>(`facilities/update.php?id=${facilityId}`, facilityData),
};

// --- Appointments Endpoints ---
export const appointmentService = {
  createAppointment: (appointmentData: AppointmentPayload) => api.post<CreateAppointmentResponse>('appointments/create.php', appointmentData),
  updateStatus: (appointmentId: string, status: AppointmentStatus) => api.post<UpdateAppointmentStatusResponse>('appointments/update_status.php', { appointment_id: appointmentId, status }),
  myAppointments: (role: UserRole) => api.get<MyAppointmentsResponse>(`appointments/my_appointments.php?role=${role}`),
  facilityAppointments: (facilityId: string) => api.get<FacilityAppointmentsResponse>(`appointments/facility_appointments.php?facility_id=${facilityId}`),
  // New: Example endpoint to list all doctors (for appointment booking / assignment)
  listDoctors: (facilityId?: string) => api.get<ListFacilitiesResponse>('users/doctors.php', { params: { facility_id: facilityId } }),
};

// --- Medical Records Endpoints ---
export const medicalRecordService = {
  addRecord: (recordData: MedicalRecordPayload) => api.post<AddMedicalRecordResponse>('records/add.php', recordData),
  getClientRecords: (clientId: string) => api.get<ClientRecordsResponse>(`records/client_records.php?client_id=${clientId}`),
  // New: Example endpoint to list clients for a doctor
  listClients: (doctorId?: string) => api.get<ListFacilitiesResponse>('users/clients.php', { params: { doctor_id: doctorId } }),
};

// --- Ministry Requests ---
export const ministryService = {
  getSupplyRequests: () => api.get<GetSupplyRequestsResponse>('ministry/supply_requests.php'),
  updateSupplyRequestStatus: (requestId: string, status: 'approved' | 'rejected') => api.post<UpdateSupplyRequestStatusResponse>('ministry/update_supply_request.php', { request_id: requestId, status }),
  // New: Placeholder for national overview KPIs from ministry perspective
  getNationalOverview: () => api.get<any>('ministry/national_overview.php'),
};

// --- Inventory (Hospital Admin) ---
export const inventoryService = {
  getInventory: (facilityId: string) => api.get<GetInventoryResponse>(`inventory/list.php?facility_id=${facilityId}`),
  updateInventory: (data: any) => api.post<SuccessResponse>('inventory/update.php', data),
  createSupplyRequest: (data: Omit<SupplyRequest, 'id' | 'status' | 'requested_at' | 'facility_name'>) => api.post<CreateSupplyRequestResponse>('inventory/request_supply.php', data),
};

// --- Feedback ---
export const feedbackService = {
  getFacilityFeedback: (facilityId: string) => api.get<GetFeedbackResponse>(`feedback/facility_feedback.php?facility_id=${facilityId}`),
  getNationalFeedback: () => api.get<GetFeedbackResponse>('feedback/national_feedback.php'),
};
