// Fix: Add type assertion for 'import.meta' to bypass TypeScript error when 'vite/client' types are not implicitly available.
export const API_BASE_URL: string = (import.meta as any).env.VITE_API_URL || "http://localhost/med/backend";

export enum UserRole {
  Client = 'client',
  Doctor = 'doctor',
  Admin = 'admin', // Hospital Admin
  GeneralAdmin = 'general_admin', // Ministry of Health Official
}

export enum AppointmentStatus {
  Pending = 'pending',
  Approved = 'approved',
  Cancelled = 'cancelled',
  Finished = 'finished',
}