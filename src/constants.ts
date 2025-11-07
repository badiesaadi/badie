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