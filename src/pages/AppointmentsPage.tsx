import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { useAuth } from '../hooks/useAuth';
import { Appointment, Facility, User, AppointmentPayload } from '../types'; // Added AppointmentPayload
import { appointmentService, facilityService } from '../services/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Alert } from '../components/ui/Alert';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { Calendar as LucideCalendar, CheckCircle, XCircle, Dot } from 'lucide-react'; // Removed Clock as unused
import { UserRole, AppointmentStatus } from '../constants';
import { DatePicker } from '../components/ui/DatePicker';
import { motion } from 'framer-motion';

const getStatusColor = (status: AppointmentStatus) => {
  switch (status) {
    case AppointmentStatus.Pending: return 'text-status-pending';
    case AppointmentStatus.Approved: return 'text-status-approved';
    case AppointmentStatus.Cancelled: return 'text-status-cancelled';
    case AppointmentStatus.Finished: return 'text-status-finished';
    default: return 'text-gray-500';
  }
};

const AppointmentStatusBadge: React.FC<{ status: AppointmentStatus }> = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    status === AppointmentStatus.Pending ? 'bg-status-pending text-white' :
    status === AppointmentStatus.Approved ? 'bg-status-approved text-white' :
    status === AppointmentStatus.Cancelled ? 'bg-status-cancelled text-white' :
    'bg-status-finished text-white'
  }`}>
    <Dot className="h-4 w-4 -ml-1 mr-1" />
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);


const ClientAppointments: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [appointmentDateTime, setAppointmentDateTime] = useState('');
  const [reason, setReason] = useState('');

  const fetchClientData = useCallback(async () => {
    try {
      setLoading(true);
      const apptsRes = await appointmentService.myAppointments(UserRole.Client);
      setAppointments(apptsRes.data.appointments); // Extract from 'appointments' key

      const facilitiesRes = await facilityService.listFacilities();
      setFacilities(facilitiesRes.data.facilities); // Extract from 'facilities' key
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchDoctorsForFacility = async () => {
      if (selectedFacilityId) {
        try {
          // This endpoint needs to be adjusted in api.ts to fetch doctors associated with a facility
          // For now, let's assume it returns a list of users with role 'doctor'
          const res = await appointmentService.listDoctors(selectedFacilityId);
          setDoctors(res.data.facilities?.[0]?.doctors || []); // Assuming doctors are nested in facility for listDoctors
        } catch (err: any) {
          console.error("Failed to fetch doctors for facility:", err);
          setDoctors([]);
        }
      } else {
        setDoctors([]);
      }
      setSelectedDoctorId('');
    };

    fetchDoctorsForFacility();
  }, [selectedFacilityId]);


  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    if (!user || !user.id) {
        setFormError("User not logged in.");
        setFormLoading(false);
        return;
    }
    try {
      const payload: AppointmentPayload = {
        client_id: user.id,
        facility_id: selectedFacilityId,
        doctor_id: selectedDoctorId,
        date_time: appointmentDateTime,
        reason,
      };
      await appointmentService.createAppointment(payload);
      await fetchClientData(); // Refresh list
      setSelectedFacilityId('');
      setSelectedDoctorId('');
      setAppointmentDateTime('');
      setReason('');
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create appointment.');
    } finally {
      setFormLoading(false);
    }
  };

  const appointmentColumns = [
    { header: 'Facility', key: 'facility_name' },
    { header: 'Doctor', key: 'doctor_name' },
    {
      header: 'Date & Time',
      key: 'date_time',
      render: (appt: Appointment) => new Date(appt.date_time).toLocaleString(),
    },
    { header: 'Reason', key: 'reason' },
    {
      header: 'Status',
      key: 'status',
      render: (appt: Appointment) => <AppointmentStatusBadge status={appt.status} />,
    },
  ];

  if (loading) return <LoadingSpinner size="lg" className="text-primary mx-auto" />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Card title="Book New Appointment">
          {formError && <Alert type="error" message={formError} className="mb-4" />}
          <form onSubmit={handleCreateAppointment}>
            <Select
              label="Select Facility"
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              options={[{ value: '', label: 'Select Facility' }, ...facilities.map(f => ({ value: f.id, label: f.name }))]}
              required
            />
            <Select
              label="Select Doctor"
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              options={[{ value: '', label: 'Select Doctor' }, ...doctors.map(d => ({ value: d.id, label: d.username }))]}
              disabled={!selectedFacilityId}
              required
            />
            <DatePicker
              label="Appointment Date and Time"
              value={appointmentDateTime}
              onChange={(e) => setAppointmentDateTime(e.target.value)}
              min={new Date().toISOString().slice(0, 16)} // Prevent booking in the past
              required
            />
            <Textarea
              label="Reason for Appointment"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
            />
            <Button type="submit" loading={formLoading} className="w-full mt-4">
              Book Appointment
            </Button>
          </form>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
        <Card title="My Appointments">
          <Table<Appointment>
            data={appointments}
            columns={appointmentColumns}
            keyExtractor={(appt) => appt.id}
            emptyMessage="You have no appointments booked yet."
          />
        </Card>
      </motion.div>
    </div>
  );
};

const DoctorAppointments: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctorAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await appointmentService.myAppointments(UserRole.Doctor);
      setAppointments(res.data.appointments); // Extract from 'appointments' key
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctorAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateStatus = async (appointmentId: string, status: AppointmentStatus) => {
    try {
      await appointmentService.updateStatus(appointmentId, status);
      await fetchDoctorAppointments(); // Refresh list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update appointment status.');
    }
  };

  const appointmentColumns = [
    { header: 'Client', key: 'client_name' },
    {
      header: 'Date & Time',
      key: 'date_time',
      render: (appt: Appointment) => new Date(appt.date_time).toLocaleString(),
    },
    { header: 'Reason', key: 'reason' },
    {
      header: 'Status',
      key: 'status',
      render: (appt: Appointment) => <AppointmentStatusBadge status={appt.status} />,
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (appt: Appointment) => (
        <div className="flex space-x-2">
          {appt.status === AppointmentStatus.Pending && (
            <>
              <Button size="sm" variant="secondary" icon={CheckCircle} onClick={() => handleUpdateStatus(appt.id, AppointmentStatus.Approved)}>
                Approve
              </Button>
              <Button size="sm" variant="danger" icon={XCircle} onClick={() => handleUpdateStatus(appt.id, AppointmentStatus.Cancelled)}>
                Cancel
              </Button>
            </>
          )}
          {appt.status === AppointmentStatus.Approved && (
            <Button size="sm" variant="primary" icon={CheckCircle} onClick={() => handleUpdateStatus(appt.id, AppointmentStatus.Finished)}>
              Mark as Finished
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner size="lg" className="text-primary mx-auto" />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Card title="My Scheduled Appointments">
          <Table<Appointment>
            data={appointments}
            columns={appointmentColumns}
            keyExtractor={(appt) => appt.id}
            emptyMessage="You have no scheduled appointments."
          />
        </Card>
      </motion.div>
    </div>
  );
};

const AdminAppointments: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFacilityAppointments = useCallback(async () => {
    if (!user?.facility_id) {
      setError("User is not assigned to a facility to view appointments.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await appointmentService.facilityAppointments(user.facility_id);
      setAppointments(res.data.appointments); // Extract from 'appointments' key
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load facility appointments.');
    } finally {
      setLoading(false);
    }
  }, [user?.facility_id]);

  useEffect(() => {
    fetchFacilityAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.facility_id]);

  // Group appointments by date for calendar view
  const appointmentsByDate = appointments.reduce((acc, appt) => {
    const date = new Date(appt.date_time).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(appt);
    return acc;
  }, {} as { [key: string]: Appointment[] });

  // Basic Calendar Grid - could be replaced with a library for more advanced features
  const renderCalendar = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 for Sunday, 1 for Monday
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const calendarCells: (Date | null)[] = [];
    // Fill leading empty cells
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarCells.push(null);
    }
    // Fill days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      calendarCells.push(new Date(currentYear, currentMonth, i));
    }

    return (
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="font-semibold text-text py-2 border-b border-gray-200">
            {day}
          </div>
        ))}
        {calendarCells.map((day, index) => (
          <div
            key={index}
            className={`p-2 h-24 border border-gray-200 flex flex-col justify-between ${
              day ? 'bg-white' : 'bg-gray-100 text-gray-400'
            }`}
          >
            {day && (
              <>
                <div className="text-right text-xs font-semibold">{day.getDate()}</div>
                <div className="flex-1 overflow-y-auto mt-1 space-y-0.5">
                  {appointmentsByDate[day.toDateString()]?.map((appt) => (
                    <div key={appt.id} className={`px-1 py-0.5 rounded-sm text-xs text-white ${
                        appt.status === AppointmentStatus.Pending ? 'bg-status-pending' :
                        appt.status === AppointmentStatus.Approved ? 'bg-status-approved' :
                        appt.status === AppointmentStatus.Cancelled ? 'bg-status-cancelled' :
                        'bg-status-finished'
                    }`}>
                      <span className="font-medium mr-1">{new Date(appt.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="truncate">{appt.client_name} - {appt.doctor_name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <LoadingSpinner size="lg" className="text-primary mx-auto" />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Card title="Facility Appointments Calendar">
          <h3 className="text-lg font-semibold text-text mb-4">
            <LucideCalendar className="inline-block mr-2" />
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          {renderCalendar()}
        </Card>
      </motion.div>
    </div>
  );
};


export const AppointmentsPage: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner size="lg" className="text-primary mx-auto mt-10" />;
  }

  if (!user) {
    return <Alert type="error" message="User not authenticated." />;
  }

  const renderContent = () => {
    switch (user.role) {
      case UserRole.Client:
        return <ClientAppointments />;
      case UserRole.Doctor:
        return <DoctorAppointments />;
      case UserRole.Admin:
        return <AdminAppointments />;
      default:
        return <Alert type="info" message="You do not have access to manage appointments." />;
    }
  };

  return (
    <DashboardLayout title="Appointments">
      {renderContent()}
    </DashboardLayout>
  );
};