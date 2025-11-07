// Set to true to use mock data for frontend development without a backend
export const USE_MOCK_DATA: boolean = true;
// Placeholder for API base URL. This would point to your backend in a real application.
export const API_BASE_URL: string = 'http://localhost:3000/api';

export enum UserRole {
  Client = 'client',
  Doctor = 'doctor', // Corrected typo: Ddoctor -> Doctor
  Admin = 'admin', // Hospital Admin
  GeneralAdmin = 'general_admin', // Ministry of Health Official
}

export enum AppointmentStatus {
  Pending = 'pending',
  Approved = 'approved',
  Cancelled = 'cancelled',
  Finished = 'finished',
}