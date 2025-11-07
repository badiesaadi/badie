import { UserRole, AppointmentStatus } from '../constants';
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

// The generic type T now represents the full expected response interface (which extends SuccessResponse).
// The `dataPayload` argument expects only the properties specific to T, excluding `success` and `message`
// which are provided as separate parameters or by default.
const mockResponse = <T extends SuccessResponse>(
  dataPayload: Omit<T, 'success' | 'message'>,
  success: boolean = true,
  message: string = 'Success',
  status: number = 200
) => {
  return new Promise<any>((resolve, reject) => { // Changed to any as AxiosResponse is removed
    setTimeout(() => {
      const responseData: T = { success, message, ...dataPayload } as T;
      if (success) {
        resolve({
          data: responseData, // Wrap in data key to match previous axios response structure
          status,
        });
      } else {
        reject({
          response: {
            data: responseData,
            status,
            message: message, // Ensure message is available on error
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
      // Fix: Provide token and user as null or undefined for type compatibility in error response
      return mockResponse<AuthLoginRegisterResponse>({ token: null as any, user: null as any }, false, 'Username or email already exists.', 409);
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
    return mockResponse<AuthLoginRegisterResponse>({ token, user: newUser }, true, 'Registration successful');
  },
  login: (credentials: any) => {
    const user = mockUsers.find(u => u.username === credentials.username);
    // Simple password check for mock data
    if (user && credentials.password === 'password') { // Assume 'password' is the default mock password
      const token = `mock-token-${user.id}`;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return mockResponse<AuthLoginRegisterResponse>({ token, user }, true, 'Login successful');
    }
    return mockResponse({ /* empty data payload */ }, false, 'Invalid credentials.', 401);
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return mockResponse<SuccessResponse>({}, true, 'Logged out successfully');
  },
  getProfile: () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return mockResponse<GetProfileResponse>({ user }, true);
    }
    return mockResponse({ /* empty data payload */ }, false, 'Not authenticated.', 401);
  },
  requestReset: (email: string) => {
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      console.log(`Mock: Password reset code for ${email} would be sent.`);
      return mockResponse<RequestResetResponse>({ reset_code: '123456' }, true, 'If an account with that email exists, a reset link has been sent.');
    }
    return mockResponse({ /* empty data payload */ }, false, 'Email not found.', 404);
  },
  confirmReset: (data: any) => {
    const user = mockUsers.find(u => u.email === data.email);
    // In a real scenario, 'token' would be validated
    if (user && data.token === 'mock-reset-token' || data.token === '123456') { // Allow '123456' as mock code
      console.log(`Mock: Password for ${user.username} has been reset to ${data.new_password}`);
      return mockResponse<ResetPasswordResponse>({}, true, 'Password has been reset successfully.');
    }
    return mockResponse({ /* empty data payload */ }, false, 'Invalid or expired token.', 400);
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
    return mockResponse<CreateFacilityResponse>({ facility_id: newFacility.id }, true, 'Facility created successfully');
  },
  listFacilities: () => {
    // Ensure doctors array in facilities is always up-to-date with mockUsers
    const facilitiesWithUpdatedDoctors = mockFacilities.map(f => ({
      ...f,
      doctors: mockUsers.filter(u => u.role === UserRole.Doctor && u.facility_id === f.id)
    }));
    return mockResponse<ListFacilitiesResponse>({ facilities: facilitiesWithUpdatedDoctors }, true);
  },
  assignDoctor: (facilityId: string, doctorId: string) => {
    const success = assignMockDoctorToFacility(facilityId, doctorId);
    if (success) {
      return mockResponse<AssignDoctorResponse>({}, true, 'Doctor assigned successfully');
    }
    return mockResponse({ /* empty data payload */ }, false, 'Failed to assign doctor. Facility or doctor not found/invalid.', 404);
  },
  getMyFacility: () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return mockResponse({ /* empty data payload */ }, false, 'User not authenticated.', 401);
    const currentUser: User = JSON.parse(storedUser);

    if (!currentUser.facility_id) {
      return mockResponse({ /* empty data payload */ }, false, 'User not assigned to any facility.', 404);
    }
    const facility = mockFacilities.find(f => f.id === currentUser.facility_id);
    if (facility) {
      // Ensure facility doctors are updated
      facility.doctors = mockUsers.filter(u => u.role === UserRole.Doctor && u.facility_id === facility.id);
      return mockResponse<MyFacilityResponse>({ facility }, true);
    }
    return mockResponse({ /* empty data payload */ }, false, 'Facility not found.', 404);
  },
  updateFacility: (facilityId: string, facilityData: Partial<FacilityPayload>) => {
    const success = updateMockFacility(facilityId, facilityData);
    if (success) {
      return mockResponse<SuccessResponse>({}, true, 'Facility updated successfully.');
    }
    return mockResponse({ /* empty data payload */ }, false, 'Facility not found.', 404);
  },
};

// --- Appointments Endpoints ---
const appointmentServiceMock = {
  createAppointment: (appointmentData: AppointmentPayload) => {
    const newAppointment = addMockAppointment(appointmentData);
    if (newAppointment) {
      return mockResponse<CreateAppointmentResponse>({ appointment_id: newAppointment.id }, true, 'Appointment created successfully');
    }
    return mockResponse({ /* empty data payload */ }, false, 'Failed to create appointment.', 500);
  },
  updateStatus: (appointmentId: string, status: AppointmentStatus) => {
    const success = updateMockAppointmentStatus(appointmentId, status);
    if (success) {
      return mockResponse<UpdateAppointmentStatusResponse>({}, true, 'Appointment status updated successfully');
    }
    return mockResponse({ /* empty data payload */ }, false, 'Appointment not found.', 404);
  },
  myAppointments: (role: UserRole) => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return mockResponse({ /* empty data payload */ }, false, 'User not authenticated.', 401);
    const currentUser: User = JSON.parse(storedUser);

    let filteredAppointments: Appointment[] = [];
    if (role === UserRole.Client) {
      filteredAppointments = mockAppointments.filter(a => a.client_id === currentUser.id);
    } else if (role === UserRole.Doctor) {
      filteredAppointments = mockAppointments.filter(a => a.doctor_id === currentUser.id);
    }
    return mockResponse<MyAppointmentsResponse>({ appointments: filteredAppointments }, true);
  },
  facilityAppointments: (facilityId: string) => {
    // If facilityId is empty string, assume GeneralAdmin wants all appointments
    const filteredAppointments = facilityId
      ? mockAppointments.filter(a => a.facility_id === facilityId)
      : mockAppointments;
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
      return mockResponse<AddMedicalRecordResponse>({ record_id: newRecord.id }, true, 'Medical record added successfully');
    }
    return mockResponse({ /* empty data payload */ }, false, 'Failed to add medical record.', 500);
  },
  getClientRecords: (clientId: string) => {
    const records = mockMedicalRecords.filter(r => r.client_id === clientId);
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
    return mockResponse<GetSupplyRequestsResponse>({ data: mockSupplyRequests }, true);
  },
  updateSupplyRequestStatus: (requestId: string, status: 'approved' | 'rejected') => {
    const success = updateMockSupplyRequestStatus(requestId, status);
    if (success) {
      return mockResponse<UpdateSupplyRequestStatusResponse>({}, true, `Supply request ${status}.`);
    }
    return mockResponse({ /* empty data payload */ }, false, 'Supply request not found.', 404);
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
    return mockResponse<GetInventoryResponse>({ data: inventoryItems }, true);
  },
  updateInventory: (data: any) => {
    console.log('Mock: Updating inventory with:', data);
    return mockResponse<SuccessResponse>({}, true, 'Inventory updated successfully.');
  },
  createSupplyRequest: (data: Omit<SupplyRequest, 'id' | 'status' | 'requested_at' | 'facility_name'>) => {
    const newRequest = addMockSupplyRequest({ ...data, status: 'pending' });
    if (newRequest) {
      return mockResponse<CreateSupplyRequestResponse>({}, true, 'Supply request created successfully.');
    }
    return mockResponse({ /* empty data payload */ }, false, 'Failed to create supply request.', 500);
  },
};

// --- Feedback ---
const feedbackServiceMock = {
  getFacilityFeedback: (facilityId: string) => {
    const feedback = mockFeedback.filter(fb => fb.facility_id === facilityId);
    return mockResponse<GetFeedbackResponse>({ data: feedback }, true);
  },
  getNationalFeedback: () => {
    return mockResponse<GetFeedbackResponse>({ data: mockFeedback }, true);
  },
};


export const authService = authServiceMock;

export const facilityService = facilityServiceMock;

export const appointmentService = appointmentServiceMock;

export const medicalRecordService = medicalRecordServiceMock;

export const ministryService = ministryServiceMock;

export const inventoryService = inventoryServiceMock;

export const feedbackService = feedbackServiceMock;