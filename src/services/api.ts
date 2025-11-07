import axios, { AxiosResponse } from 'axios';
import { API_BASE_URL, UserRole, AppointmentStatus, USE_MOCK_DATA } from '../constants';
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

import {
  mockUsers, mockFacilities, mockAppointments, mockMedicalRecords, mockSupplyRequests, mockFeedback,
  getUser, getUserName, getFacilityName, getDoctorsByFacility,
  addMockUser, addMockFacility, updateMockFacility, assignMockDoctorToFacility,
  addMockAppointment, updateMockAppointmentStatus,
  addMockMedicalRecord,
  addMockSupplyRequest, updateMockSupplyRequestStatus,
} from '../mockData';

const API_DELAY = 500; // Simulate network latency

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Only add Authorization header if not using mock data
    if (!USE_MOCK_DATA) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Only apply success check for real API calls
    if (!USE_MOCK_DATA && response.data && typeof response.data.success === 'boolean' && !response.data.success) {
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
    // Basic error handling for unauthorized requests for real API
    if (!USE_MOCK_DATA && error.response && error.response.status === 401) {
      console.error('Unauthorized request. Logging out...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.hash = '#/login'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

// Fix: Refactor mockResponse to correctly handle `success` and `message` properties
// The generic type T now represents the full expected response interface (which extends SuccessResponse).
// The `dataPayload` argument expects only the properties specific to T, excluding `success` and `message`
// which are provided as separate parameters or by default.
const mockResponse = <T extends SuccessResponse>(
  dataPayload: Omit<T, 'success' | 'message'>,
  success: boolean = true,
  message: string = 'Success',
  status: number = 200
) => {
  return new Promise<AxiosResponse<T>>((resolve, reject) => {
    setTimeout(() => {
      const responseData: T = { success, message, ...dataPayload } as T;
      if (success) {
        resolve({
          data: responseData,
          status,
          statusText: 'OK',
          headers: {},
          config: {},
          request: {},
        });
      } else {
        reject({
          response: {
            data: responseData,
            status,
            statusText: 'Error',
            headers: {},
            config: {},
            request: {},
          },
        });
      }
    }, API_DELAY);
  });
};

// --- Auth Endpoints ---
const authServiceMock = {
  register: (userData: any) => {
    const existingUser = mockUsers.find(u => u.username === userData.username || u.email === userData.email);
    if (existingUser) {
      return mockResponse<AuthLoginRegisterResponse>({ message: 'Username or email already exists.' }, false, 'Registration failed', 409);
    }
    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      facility_id: null, // Assume no facility assigned on initial registration
    };
    addMockUser(newUser);
    const token = `mock-token-${newUser.id}`;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(newUser));
    // Fix: Pass token and user in dataPayload
    return mockResponse<AuthLoginRegisterResponse>({ token, user: newUser }, true, 'Registration successful');
  },
  login: (credentials: any) => {
    const user = mockUsers.find(u => u.username === credentials.username);
    // Simple password check for mock data
    if (user && credentials.password === 'password') { // Assume 'password' is the default mock password
      const token = `mock-token-${user.id}`;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      // Fix: Pass token and user in dataPayload
      return mockResponse<AuthLoginRegisterResponse>({ token, user }, true, 'Login successful');
    }
    return mockResponse({ message: 'Invalid credentials.' }, false, 'Login failed', 401);
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Fix: Pass empty dataPayload, message is handled by mockResponse
    return mockResponse<SuccessResponse>({}, true, 'Logged out successfully');
  },
  getProfile: () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // Fix: Pass user in dataPayload
      return mockResponse<GetProfileResponse>({ user }, true);
    }
    return mockResponse({ message: 'Not authenticated.' }, false, 'Authentication required', 401);
  },
  requestReset: (email: string) => {
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      console.log(`Mock: Password reset code for ${email} would be sent.`);
      // Fix: Pass reset_code in dataPayload, message is handled by mockResponse
      return mockResponse<RequestResetResponse>({ reset_code: '123456' }, true, 'If an account with that email exists, a reset link has been sent.');
    }
    return mockResponse({ message: 'Email not found.' }, false, 'Request failed', 404);
  },
  confirmReset: (data: any) => {
    const user = mockUsers.find(u => u.email === data.email);
    // In a real scenario, 'token' would be validated
    if (user && data.token === 'mock-reset-token' || data.token === '123456') { // Allow '123456' as mock code
      console.log(`Mock: Password for ${user.username} has been reset to ${data.new_password}`);
      // Fix: Pass empty dataPayload, message is handled by mockResponse
      return mockResponse<ResetPasswordResponse>({}, true, 'Password has been reset successfully.');
    }
    return mockResponse({ message: 'Invalid or expired token.' }, false, 'Reset failed', 400);
  },
};

// --- Facilities Endpoints ---
const facilityServiceMock = {
  createFacility: (facilityData: FacilityPayload) => {
    const newFacility: Facility = {
      id: `facility-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      ...facilityData,
      occupied_beds: facilityData.occupied_beds || 0,
      doctors: [], // No doctors initially
    };
    addMockFacility(newFacility);
    // Fix: Pass facility_id in dataPayload
    return mockResponse<CreateFacilityResponse>({ facility_id: newFacility.id }, true, 'Facility created successfully');
  },
  listFacilities: () => {
    // Ensure doctors array in facilities is always up-to-date with mockUsers
    const facilitiesWithUpdatedDoctors = mockFacilities.map(f => ({
      ...f,
      doctors: mockUsers.filter(u => u.role === UserRole.Doctor && u.facility_id === f.id)
    }));
    // Fix: Pass facilities in dataPayload
    return mockResponse<ListFacilitiesResponse>({ facilities: facilitiesWithUpdatedDoctors }, true);
  },
  assignDoctor: (facilityId: string, doctorId: string) => {
    const success = assignMockDoctorToFacility(facilityId, doctorId);
    if (success) {
      // Fix: Pass empty dataPayload, message is handled by mockResponse
      return mockResponse<AssignDoctorResponse>({}, true, 'Doctor assigned successfully');
    }
    return mockResponse({ message: 'Failed to assign doctor. Facility or doctor not found/invalid.' }, false, 'Assignment failed', 404);
  },
  getMyFacility: () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return mockResponse({ message: 'User not authenticated.' }, false, 'Error', 401);
    const currentUser: User = JSON.parse(storedUser);

    if (!currentUser.facility_id) {
      return mockResponse({ message: 'User not assigned to any facility.' }, false, 'Not assigned', 404);
    }
    const facility = mockFacilities.find(f => f.id === currentUser.facility_id);
    if (facility) {
      // Ensure facility doctors are updated
      facility.doctors = mockUsers.filter(u => u.role === UserRole.Doctor && u.facility_id === facility.id);
      // Fix: Pass facility in dataPayload
      return mockResponse<MyFacilityResponse>({ facility }, true);
    }
    return mockResponse({ message: 'Facility not found.' }, false, 'Not found', 404);
  },
  updateFacility: (facilityId: string, facilityData: Partial<FacilityPayload>) => {
    const success = updateMockFacility(facilityId, facilityData);
    if (success) {
      // Fix: Pass empty dataPayload, message is handled by mockResponse
      return mockResponse<SuccessResponse>({}, true, 'Facility updated successfully.');
    }
    return mockResponse({ message: 'Facility not found.' }, false, 'Update failed', 404);
  },
};

// --- Appointments Endpoints ---
const appointmentServiceMock = {
  createAppointment: (appointmentData: AppointmentPayload) => {
    const newAppointment = addMockAppointment(appointmentData);
    if (newAppointment) {
      // Fix: Pass appointment_id in dataPayload
      return mockResponse<CreateAppointmentResponse>({ appointment_id: newAppointment.id }, true, 'Appointment created successfully');
    }
    return mockResponse({ message: 'Failed to create appointment.' }, false, 'Creation failed', 500);
  },
  updateStatus: (appointmentId: string, status: AppointmentStatus) => {
    const success = updateMockAppointmentStatus(appointmentId, status);
    if (success) {
      // Fix: Pass empty dataPayload, message is handled by mockResponse
      return mockResponse<UpdateAppointmentStatusResponse>({}, true, 'Appointment status updated successfully');
    }
    return mockResponse({ message: 'Appointment not found.' }, false, 'Update failed', 404);
  },
  myAppointments: (role: UserRole) => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return mockResponse({ message: 'User not authenticated.' }, false, 'Error', 401);
    const currentUser: User = JSON.parse(storedUser);

    let filteredAppointments: Appointment[] = [];
    if (role === UserRole.Client) {
      filteredAppointments = mockAppointments.filter(a => a.client_id === currentUser.id);
    } else if (role === UserRole.Doctor) {
      filteredAppointments = mockAppointments.filter(a => a.doctor_id === currentUser.id);
    }
    // Fix: Pass appointments in dataPayload
    return mockResponse<MyAppointmentsResponse>({ appointments: filteredAppointments }, true);
  },
  facilityAppointments: (facilityId: string) => {
    // If facilityId is empty string, assume GeneralAdmin wants all appointments
    const filteredAppointments = facilityId
      ? mockAppointments.filter(a => a.facility_id === facilityId)
      : mockAppointments;
    // Fix: Pass facility_id and appointments in dataPayload
    return mockResponse<FacilityAppointmentsResponse>({ facility_id: facilityId, appointments: filteredAppointments }, true);
  },
  listDoctors: (facilityId?: string) => {
    let doctors = mockUsers.filter(u => u.role === UserRole.Doctor);
    if (facilityId) {
      doctors = doctors.filter(d => d.facility_id === facilityId);
    }
    // Mimic the facilities/list endpoint structure for doctors for now, as it's the expected return type
    // In a real app, this would likely be a direct `users: User[]`
    const mockFacilityResponse: ListFacilitiesResponse = {
      success: true,
      facilities: [{ // Wrap in a dummy facility structure for type compatibility
        id: 'dummy-facility-for-doctors',
        name: 'All Doctors',
        type: 'virtual',
        address: '', phone: '', region: '', beds: 0, occupied_beds: 0,
        doctors: doctors,
      }],
    };
    return mockResponse(mockFacilityResponse, true);
  },
};

// --- Medical Records Endpoints ---
const medicalRecordServiceMock = {
  addRecord: (recordData: MedicalRecordPayload) => {
    const newRecord = addMockMedicalRecord(recordData);
    if (newRecord) {
      // Fix: Pass record_id in dataPayload
      return mockResponse<AddMedicalRecordResponse>({ record_id: newRecord.id }, true, 'Medical record added successfully');
    }
    return mockResponse({ message: 'Failed to add medical record.' }, false, 'Creation failed', 500);
  },
  getClientRecords: (clientId: string) => {
    const records = mockMedicalRecords.filter(r => r.client_id === clientId);
    // Fix: Pass records in dataPayload
    return mockResponse<ClientRecordsResponse>({ records }, true);
  },
  listClients: (doctorId?: string) => {
    let clients = mockUsers.filter(u => u.role === UserRole.Client);
    if (doctorId) {
      // Simulate clients associated with this doctor via appointments or records
      const associatedClientIds = new Set<string>();
      mockAppointments.filter(a => a.doctor_id === doctorId).forEach(a => associatedClientIds.add(a.client_id));
      mockMedicalRecords.filter(r => r.doctor_id === doctorId).forEach(r => associatedClientIds.add(r.client_id));
      clients = clients.filter(c => associatedClientIds.has(c.id));
    }
    // Mimic the facilities/list endpoint structure for clients for now, as it's the expected return type
    const mockFacilityResponse: ListFacilitiesResponse = {
      success: true,
      facilities: [{ // Wrap in a dummy facility structure for type compatibility
        id: 'dummy-facility-for-clients',
        name: 'All Clients',
        type: 'virtual',
        address: '', phone: '', region: '', beds: 0, occupied_beds: 0,
        doctors: clients, // Using doctors array to hold client objects for type compatibility
      }],
    };
    return mockResponse(mockFacilityResponse, true);
  },
};

// --- Ministry Requests ---
const ministryServiceMock = {
  getSupplyRequests: () => {
    // Fix: Pass data in dataPayload
    return mockResponse<GetSupplyRequestsResponse>({ data: mockSupplyRequests }, true);
  },
  updateSupplyRequestStatus: (requestId: string, status: 'approved' | 'rejected') => {
    const success = updateMockSupplyRequestStatus(requestId, status);
    if (success) {
      // Fix: Pass empty dataPayload, message is handled by mockResponse
      return mockResponse<UpdateSupplyRequestStatusResponse>({}, true, `Supply request ${status}.`);
    }
    return mockResponse({ message: 'Supply request not found.' }, false, 'Update failed', 404);
  },
  getNationalOverview: () => {
    // Aggregate mock data for national overview
    const totalFacilities = mockFacilities.length;
    const totalBeds = mockFacilities.reduce((sum, f) => sum + f.beds, 0);
    const totalOccupiedBeds = mockFacilities.reduce((sum, f) => sum + f.occupied_beds, 0);
    const nationalAvgOccupancy = totalBeds > 0 ? (totalOccupiedBeds / totalBeds) * 100 : 0;
    const pendingRequests = mockSupplyRequests.filter(req => req.status === 'pending').length;
    const totalDoctors = mockUsers.filter(u => u.role === UserRole.Doctor).length;

    return mockResponse({
      totalFacilities,
      nationalAvgOccupancy: nationalAvgOccupancy.toFixed(1),
      pendingRequests,
      totalDoctors,
      // Add more data points as needed for the dashboard
    }, true);
  },
};

// --- Inventory (Hospital Admin) ---
const inventoryServiceMock = {
  getInventory: (facilityId: string) => {
    // For mock, we'll use supply requests as a proxy for inventory items specific to a facility
    const inventoryItems = mockSupplyRequests.filter(req => req.facility_id === facilityId);
    // Fix: Pass data in dataPayload
    return mockResponse<GetInventoryResponse>({ data: inventoryItems }, true);
  },
  updateInventory: (data: any) => {
    console.log('Mock: Updating inventory with:', data);
    // Fix: Pass empty dataPayload, message is handled by mockResponse
    return mockResponse<SuccessResponse>({}, true, 'Inventory updated successfully.');
  },
  createSupplyRequest: (data: Omit<SupplyRequest, 'id' | 'status' | 'requested_at' | 'facility_name'>) => {
    const newRequest = addMockSupplyRequest({ ...data, status: 'pending' });
    if (newRequest) {
      // Fix: Pass empty dataPayload, message is handled by mockResponse
      return mockResponse<CreateSupplyRequestResponse>({}, true, 'Supply request created successfully.');
    }
    return mockResponse({ message: 'Failed to create supply request.' }, false, 'Creation failed', 500);
  },
};

// --- Feedback ---
const feedbackServiceMock = {
  getFacilityFeedback: (facilityId: string) => {
    const feedback = mockFeedback.filter(fb => fb.facility_id === facilityId);
    // Fix: Pass data in dataPayload
    return mockResponse<GetFeedbackResponse>({ data: feedback }, true);
  },
  getNationalFeedback: () => {
    // Fix: Pass data in dataPayload
    return mockResponse<GetFeedbackResponse>({ data: mockFeedback }, true);
  },
};


export const authService = USE_MOCK_DATA ? authServiceMock : {
  register: (userData: any) => api.post<AuthLoginRegisterResponse>('auth/register.php', userData),
  login: (credentials: any) => api.post<AuthLoginRegisterResponse>('auth/login.php', credentials),
  logout: () => api.get<SuccessResponse>('auth/logout.php'), // Returns {success: true}
  getProfile: () => api.get<GetProfileResponse>('auth/me.php'), // Now wrapped in {success:true, user: User}
  requestReset: (email: string) => api.post<RequestResetResponse>('auth/request_reset.php', { email }),
  confirmReset: (data: any) => api.post<ResetPasswordResponse>('auth/reset_password.php', data),
};

export const facilityService = USE_MOCK_DATA ? facilityServiceMock : {
  createFacility: (facilityData: FacilityPayload) => api.post<CreateFacilityResponse>('facilities/create.php', facilityData),
  listFacilities: () => api.get<ListFacilitiesResponse>('facilities/list.php'),
  assignDoctor: (facilityId: string, doctorId: string) => api.post<AssignDoctorResponse>('facilities/assign_doctor.php', { facility_id: facilityId, doctor_id: doctorId }),
  getMyFacility: () => api.get<MyFacilityResponse>('facilities/my_facility.php'),
  // New: Example update facility endpoint
  updateFacility: (facilityId: string, facilityData: Partial<FacilityPayload>) => api.put<SuccessResponse>(`facilities/update.php?id=${facilityId}`, facilityData),
};

export const appointmentService = USE_MOCK_DATA ? appointmentServiceMock : {
  createAppointment: (appointmentData: AppointmentPayload) => api.post<CreateAppointmentResponse>('appointments/create.php', appointmentData),
  updateStatus: (appointmentId: string, status: AppointmentStatus) => api.post<UpdateAppointmentStatusResponse>('appointments/update_status.php', { appointment_id: appointmentId, status }),
  myAppointments: (role: UserRole) => api.get<MyAppointmentsResponse>(`appointments/my_appointments.php?role=${role}`),
  facilityAppointments: (facilityId: string) => api.get<FacilityAppointmentsResponse>(`appointments/facility_appointments.php?facility_id=${facilityId}`),
  // New: Example endpoint to list all doctors (for appointment booking / assignment)
  listDoctors: (facilityId?: string) => api.get<ListFacilitiesResponse>('users/doctors.php', { params: { facility_id: facilityId } }),
};

export const medicalRecordService = USE_MOCK_DATA ? medicalRecordServiceMock : {
  addRecord: (recordData: MedicalRecordPayload) => api.post<AddMedicalRecordResponse>('records/add.php', recordData),
  getClientRecords: (clientId: string) => api.get<ClientRecordsResponse>(`records/client_records.php?client_id=${clientId}`),
  // New: Example endpoint to list clients for a doctor
  listClients: (doctorId?: string) => api.get<ListFacilitiesResponse>('users/clients.php', { params: { doctor_id: doctorId } }),
};

export const ministryService = USE_MOCK_DATA ? ministryServiceMock : {
  getSupplyRequests: () => api.get<GetSupplyRequestsResponse>('ministry/supply_requests.php'),
  updateSupplyRequestStatus: (requestId: string, status: 'approved' | 'rejected') => api.post<UpdateSupplyRequestStatusResponse>('ministry/update_supply_request.php', { request_id: requestId, status }),
  // New: Placeholder for national overview KPIs from ministry perspective
  getNationalOverview: () => api.get<any>('ministry/national_overview.php'),
};

export const inventoryService = USE_MOCK_DATA ? inventoryServiceMock : {
  getInventory: (facilityId: string) => api.get<GetInventoryResponse>(`inventory/list.php?facility_id=${facilityId}`),
  updateInventory: (data: any) => api.post<SuccessResponse>('inventory/update.php', data),
  createSupplyRequest: (data: Omit<SupplyRequest, 'id' | 'status' | 'requested_at' | 'facility_name'>) => api.post<CreateSupplyRequestResponse>('inventory/request_supply.php', data),
};

export const feedbackService = USE_MOCK_DATA ? feedbackServiceMock : {
  getFacilityFeedback: (facilityId: string) => api.get<GetFeedbackResponse>(`feedback/facility_feedback.php?facility_id=${facilityId}`),
  getNationalFeedback: () => api.get<GetFeedbackResponse>('feedback/national_feedback.php'),
};