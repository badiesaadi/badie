import { User, Facility, Appointment, MedicalRecord, SupplyRequest, Feedback, ChartDataPoint, AppointmentPayload, MedicalRecordPayload, FacilityPayload } from './types';
import { UserRole, AppointmentStatus } from './constants';

// --- Helper functions for consistency and convenience ---
const getFacilityName = (id: string) => mockFacilities.find(f => f.id === id)?.name || 'Unknown Facility';
const getUser = (id: string) => mockUsers.find(u => u.id === id);
const getUserName = (id: string) => getUser(id)?.username || 'Unknown User';
const getDoctorsByFacility = (facilityId: string) => mockUsers.filter(u => u.role === UserRole.Doctor && u.facility_id === facilityId); // Corrected UserRole.Ddoctor to UserRole.Doctor


// 1. Mock Users (Made mutable for registration/updates)
export let mockUsers: User[] = [
  // General Admin (Ministry of Health Official)
  {
    id: 'user-ga-1',
    username: 'ministryadmin',
    email: 'ga@example.com',
    role: UserRole.GeneralAdmin,
    facility_id: null,
  },
  // Hospital Admin
  {
    id: 'user-admin-1',
    username: 'hospitaladmin1',
    email: 'admin1@example.com',
    role: UserRole.Admin,
    facility_id: 'facility-1', // Assigned to Algiers General Hospital
  },
  {
    id: 'user-admin-2',
    username: 'hospitaladmin2',
    email: 'admin2@example.com',
    role: UserRole.Admin,
    facility_id: 'facility-2', // Assigned to Oran City Clinic
  },
  // Doctors
  {
    id: 'user-doc-1',
    username: 'drsmith',
    email: 'dr.smith@example.com',
    role: UserRole.Doctor, // Corrected UserRole.Ddoctor to UserRole.Doctor
    facility_id: 'facility-1',
  },
  {
    id: 'user-doc-2',
    username: 'drjones',
    email: 'dr.jones@example.com',
    role: UserRole.Doctor, // Corrected UserRole.Ddoctor to UserRole.Doctor
    facility_id: 'facility-1',
  },
  {
    id: 'user-doc-3',
    username: 'dralice',
    email: 'dr.alice@example.com',
    role: UserRole.Doctor, // Corrected UserRole.Ddoctor to UserRole.Doctor
    facility_id: 'facility-2',
  },
  // Clients
  {
    id: 'user-client-1',
    username: 'johndoe',
    email: 'john.doe@example.com',
    role: UserRole.Client,
    facility_id: null,
  },
  {
    id: 'user-client-2',
    username: 'janedoe',
    email: 'jane.doe@example.com',
    role: UserRole.Client,
    facility_id: null,
  },
  {
    id: 'user-client-3',
    username: 'petra',
    email: 'petra@example.com',
    role: UserRole.Client,
    facility_id: null,
  },
];

// 2. Mock Facilities (Made mutable for creation/updates)
export let mockFacilities: Facility[] = [
  {
    id: 'facility-1',
    name: 'Algiers General Hospital',
    type: 'hospital',
    address: '123 Hospital St, Algiers',
    phone: '021-111222',
    region: 'Algiers',
    doctors: getDoctorsByFacility('facility-1'),
    beds: 300,
    occupied_beds: 180,
  },
  {
    id: 'facility-2',
    name: 'Oran City Clinic',
    type: 'clinic',
    address: '456 Clinic Ave, Oran',
    phone: '041-333444',
    region: 'Oran',
    doctors: getDoctorsByFacility('facility-2'),
    beds: 50,
    occupied_beds: 30,
  },
  {
    id: 'facility-3',
    name: 'Constantine Health Center',
    type: 'health_center',
    address: '789 Health Rd, Constantine',
    phone: '031-555666',
    region: 'Constantine',
    doctors: [], // No doctors assigned yet for this example
    beds: 10,
    occupied_beds: 5,
  },
];

// 3. Mock Appointments (Made mutable for creation/updates)
export let mockAppointments: Appointment[] = [
  {
    id: 'appt-1',
    client_id: 'user-client-1',
    client_name: getUserName('user-client-1'),
    doctor_id: 'user-doc-1',
    doctor_name: getUserName('user-doc-1'),
    facility_id: 'facility-1',
    facility_name: getFacilityName('facility-1'),
    date_time: '2024-07-20T10:00:00Z',
    reason: 'Routine check-up',
    status: AppointmentStatus.Finished, // Changed to finished for medical record example
  },
  {
    id: 'appt-2',
    client_id: 'user-client-2',
    client_name: getUserName('user-client-2'),
    doctor_id: 'user-doc-1',
    doctor_name: getUserName('user-doc-1'),
    facility_id: 'facility-1',
    facility_name: getFacilityName('facility-1'),
    date_time: '2024-07-21T14:30:00Z',
    reason: 'Follow-up on blood pressure',
    status: AppointmentStatus.Pending,
  },
  {
    id: 'appt-3',
    client_id: 'user-client-1',
    client_name: getUserName('user-client-1'),
    doctor_id: 'user-doc-3',
    doctor_name: getUserName('user-doc-3'),
    facility_id: 'facility-2',
    facility_name: getFacilityName('facility-2'),
    date_time: '2024-07-15T09:00:00Z',
    reason: 'Annual physical exam',
    status: AppointmentStatus.Finished,
  },
  {
    id: 'appt-4',
    client_id: 'user-client-3',
    client_name: getUserName('user-client-3'),
    doctor_id: 'user-doc-2',
    doctor_name: getUserName('user-doc-2'),
    facility_id: 'facility-1',
    facility_name: getFacilityName('facility-1'),
    date_time: '2024-07-22T11:00:00Z',
    reason: 'Vaccination',
    status: AppointmentStatus.Approved,
  },
  {
    id: 'appt-5',
    client_id: 'user-client-3',
    client_name: getUserName('user-client-3'),
    doctor_id: 'user-doc-3',
    doctor_name: getUserName('user-doc-3'),
    facility_id: 'facility-2',
    facility_name: getFacilityName('facility-2'),
    date_time: '2024-07-10T16:00:00Z',
    reason: 'Consultation for rash',
    status: AppointmentStatus.Cancelled,
  },
];

// 4. Mock Medical Records (Made mutable for creation/updates)
export let mockMedicalRecords: MedicalRecord[] = [
  {
    id: 'rec-1',
    client_id: 'user-client-1',
    client_name: getUserName('user-client-1'),
    doctor_id: 'user-doc-1',
    doctor_name: getUserName('user-doc-1'),
    facility_id: 'facility-1',
    facility_name: getFacilityName('facility-1'),
    appointment_id: 'appt-1',
    date: '2024-07-20',
    diagnosis: 'Common cold',
    notes: 'Patient presented with mild fever and cough. Advised rest and hydration.',
    prescription: 'Paracetamol 500mg, twice daily for 3 days.',
  },
  {
    id: 'rec-2',
    client_id: 'user-client-1',
    client_name: getUserName('user-client-1'),
    doctor_id: 'user-doc-3',
    doctor_name: getUserName('user-doc-3'),
    facility_id: 'facility-2',
    facility_name: getFacilityName('facility-2'),
    appointment_id: 'appt-3',
    date: '2024-07-15',
    diagnosis: 'Annual check-up, healthy',
    notes: 'No significant findings. Advised continued healthy lifestyle.',
    prescription: 'None.',
  },
  {
    id: 'rec-3',
    client_id: 'user-client-2',
    client_name: getUserName('user-client-2'),
    doctor_id: 'user-doc-1',
    doctor_name: getUserName('user-doc-1'),
    facility_id: 'facility-1',
    facility_name: getFacilityName('facility-1'),
    appointment_id: null, // Example of a record not linked to a specific appointment
    date: '2024-06-01',
    diagnosis: 'Hypertension, controlled',
    notes: 'Regular blood pressure monitoring. Patient adherence good.',
    prescription: 'Lisinopril 10mg, once daily.',
  },
];

// 5. Mock Supply Requests (Made mutable for creation/updates)
export let mockSupplyRequests: SupplyRequest[] = [
  {
    id: 'req-1',
    facility_id: 'facility-1',
    facility_name: getFacilityName('facility-1'),
    item_name: 'Surgical Masks',
    quantity: 5000,
    status: 'pending',
    requested_at: '2024-07-01T10:30:00Z',
    approved_at: undefined,
  },
  {
    id: 'req-2',
    facility_id: 'facility-1',
    facility_name: getFacilityName('facility-1'),
    item_name: 'Hand Sanitizer (1L)',
    quantity: 100,
    status: 'approved',
    requested_at: '2024-06-25T14:00:00Z',
    approved_at: '2024-06-26T09:00:00Z',
  },
  {
    id: 'req-3',
    facility_id: 'facility-2',
    facility_name: getFacilityName('facility-2'),
    item_name: 'Gloves (Box of 100)',
    quantity: 50,
    status: 'pending',
    requested_at: '2024-07-05T09:15:00Z',
    approved_at: undefined,
  },
  {
    id: 'req-4',
    facility_id: 'facility-3',
    facility_name: getFacilityName('facility-3'),
    item_name: 'Painkillers (Tabs)',
    quantity: 2000,
    status: 'rejected',
    requested_at: '2024-06-20T11:00:00Z',
    approved_at: undefined,
  },
];

// 6. Mock Feedback (Made mutable for creation/updates)
export let mockFeedback: Feedback[] = [
  {
    id: 'fb-1',
    client_name: getUserName('user-client-1'),
    facility_id: 'facility-1',
    facility_name: getFacilityName('facility-1'),
    rating: 5,
    comment: 'Excellent service, Dr. Smith was very helpful and knowledgeable!',
    date: '2024-07-20T11:00:00Z',
  },
  {
    id: 'fb-2',
    client_name: getUserName('user-client-2'),
    facility_id: 'facility-1',
    facility_name: getFacilityName('facility-1'),
    rating: 4,
    comment: 'Waiting time was a bit long, but the staff were friendly.',
    date: '2024-07-18T15:00:00Z',
  },
  {
    id: 'fb-3',
    client_name: getUserName('user-client-3'),
    facility_id: 'facility-2',
    facility_name: getFacilityName('facility-2'),
    rating: 5,
    comment: 'Very clean clinic and efficient service. Highly recommended.',
    date: '2024-07-16T10:00:00Z',
  },
  {
    id: 'fb-4',
    client_name: getUserName('user-client-1'),
    facility_id: 'facility-2',
    facility_name: getFacilityName('facility-2'),
    rating: 3,
    comment: 'Doctor was good but parking was difficult to find.',
    date: '2024-07-15T10:30:00Z',
  },
  {
    id: 'fb-5',
    client_name: getUserName('user-client-2'),
    facility_id: 'facility-3',
    facility_name: getFacilityName('facility-3'),
    rating: 4,
    comment: 'Small health center but provided good basic care.',
    date: '2024-07-12T13:00:00Z',
  },
];

// 7. Mock Chart Data - can be derived or static examples
// Example: facility type distribution
export const mockFacilityTypeData: ChartDataPoint[] = [
  { name: 'Hospitals', value: mockFacilities.filter(f => f.type === 'hospital').length },
  { name: 'Clinics', value: mockFacilities.filter(f => f.type === 'clinic').length },
  { name: 'Health Centers', value: mockFacilities.filter(f => f.type === 'health_center').length },
];

// Example: appointment status distribution
export const mockAppointmentStatusData: ChartDataPoint[] = Object.values(AppointmentStatus).map(status => ({
  name: status.charAt(0).toUpperCase() + status.slice(1),
  value: mockAppointments.filter(a => a.status === status).length,
}));


// --- Exported Helpers for Mock API calls ---
export {
  getUser,
  getUserName,
  getFacilityName,
  getDoctorsByFacility
};

// --- Functions to modify mock data arrays (simulating database operations) ---

export const addMockUser = (userData: User) => {
  mockUsers.push(userData);
};

export const addMockFacility = (facilityData: Facility) => {
  mockFacilities.push(facilityData);
};

export const updateMockFacility = (facilityId: string, updates: Partial<FacilityPayload>) => {
  const index = mockFacilities.findIndex(f => f.id === facilityId);
  if (index !== -1) {
    mockFacilities[index] = { ...mockFacilities[index], ...updates };
    return true;
  }
  return false;
};

export const assignMockDoctorToFacility = (facilityId: string, doctorId: string) => {
  const facility = mockFacilities.find(f => f.id === facilityId);
  const doctor = mockUsers.find(u => u.id === doctorId && u.role === UserRole.Doctor); // Corrected UserRole.Ddoctor to UserRole.Doctor

  if (facility && doctor) {
    // Remove doctor from previous facility if assigned
    mockFacilities.forEach(f => {
      f.doctors = f.doctors.filter(d => d.id !== doctorId);
    });

    // Assign doctor to new facility
    doctor.facility_id = facilityId; // Update doctor's facility_id
    facility.doctors.push(doctor); // Add doctor object to facility's doctors array
    // Re-assign doctors array to trigger reactivity if needed in components
    facility.doctors = [...facility.doctors];
    return true;
  }
  return false;
};


export const addMockAppointment = (appointmentData: AppointmentPayload) => {
  const newAppointment: Appointment = {
    id: `appt-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    ...appointmentData,
    client_name: getUserName(appointmentData.client_id),
    doctor_name: getUserName(appointmentData.doctor_id),
    facility_name: getFacilityName(appointmentData.facility_id),
    status: AppointmentStatus.Pending,
  };
  mockAppointments.push(newAppointment);
  return newAppointment;
};

export const updateMockAppointmentStatus = (appointmentId: string, status: AppointmentStatus) => {
  const index = mockAppointments.findIndex(a => a.id === appointmentId);
  if (index !== -1) {
    mockAppointments[index].status = status;
    return true;
  }
  return false;
};

export const addMockMedicalRecord = (recordData: MedicalRecordPayload) => {
  const newRecord: MedicalRecord = {
    id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    ...recordData,
    client_name: getUserName(recordData.client_id),
    doctor_name: getUserName(recordData.doctor_id),
    facility_name: getFacilityName(recordData.facility_id),
  };
  mockMedicalRecords.push(newRecord);
  return newRecord;
};

export const addMockSupplyRequest = (requestData: Omit<SupplyRequest, 'id' | 'facility_name' | 'requested_at' | 'approved_at'>) => {
  const newRequest: SupplyRequest = {
    id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    ...requestData,
    facility_name: getFacilityName(requestData.facility_id),
    requested_at: new Date().toISOString(),
    approved_at: undefined,
  };
  mockSupplyRequests.push(newRequest);
  return newRequest;
};

export const updateMockSupplyRequestStatus = (requestId: string, status: 'approved' | 'rejected') => {
  const index = mockSupplyRequests.findIndex(r => r.id === requestId);
  if (index !== -1) {
    mockSupplyRequests[index].status = status;
    if (status === 'approved') {
      mockSupplyRequests[index].approved_at = new Date().toISOString();
    }
    return true;
  }
  return false;
};