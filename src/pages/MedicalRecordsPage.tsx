import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { useAuth } from '../hooks/useAuth';
import { MedicalRecord, User } from '../types';
import { medicalRecordService, appointmentService, facilityService } from '../services/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Alert } from '../components/ui/Alert';
import { Input, Textarea, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { Plus, FileText, CalendarCheck, User as UserIcon } from 'lucide-react';
import { UserRole, AppointmentStatus } from '../constants';
import { DatePicker } from '../components/ui/DatePicker';
import { motion } from 'framer-motion';
import { Pagination } from '../components/common/Pagination';

const DoctorAddRecord: React.FC = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<User[]>([]); // This would come from an API endpoint, simulating for now
  const [appointments, setAppointments] = useState<any[]>([]); // Filtered for finished appointments
  const [facilities, setFacilities] = useState<any[]>([]);

  const [selectedClient, setSelectedClient] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().slice(0, 16));

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate fetching clients and facilities for selection
      // In a real app, this would be `api.get('/users/clients')` and `api.get('/facilities')`
      setClients([
        { id: 'client1', username: 'Ahmed Said', email: 'ahmed@example.com', role: UserRole.Client },
        { id: 'client2', username: 'Fatima Zohra', email: 'fatima@example.com', role: UserRole.Client },
      ]);

      const facilitiesRes = await facilityService.listFacilities();
      setFacilities(facilitiesRes.data);

      const doctorAppointmentsRes = await appointmentService.myAppointments(UserRole.Doctor);
      // Filter for finished appointments not yet associated with a record
      setAppointments(doctorAppointmentsRes.data.filter(
          (appt: any) => appt.status === AppointmentStatus.Finished
      ));

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load initial data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    if (!user || !user.facility_id) {
        setFormError("Doctor information (facility_id) is missing.");
        setFormLoading(false);
        return;
    }
    if (!selectedClient || !diagnosis) {
        setFormError("Client and Diagnosis are required.");
        setFormLoading(false);
        return;
    }

    try {
      const selectedAppt = appointments.find(a => a.id === selectedAppointment);
      const targetClientId = selectedAppt ? selectedAppt.client_id : selectedClient; // Use appt client or manual
      const targetFacilityId = selectedAppt ? selectedAppt.facility_id : user.facility_id; // Use appt facility or doctor's facility

      await medicalRecordService.addRecord({
        client_id: targetClientId,
        doctor_id: user.id,
        facility_id: targetFacilityId,
        date: recordDate,
        diagnosis,
        notes,
        prescription,
      });
      // Clear form
      setSelectedClient('');
      setSelectedAppointment('');
      setDiagnosis('');
      setNotes('');
      setPrescription('');
      setRecordDate(new Date().toISOString().slice(0, 16));
      await fetchInitialData(); // Refresh data
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to add medical record.');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="text-primary mx-auto" />;
  if (error) return <Alert type="error" message={error} />;

  const clientOptions = [{ value: '', label: 'Select Client' }, ...clients.map(c => ({ value: c.id, label: c.username }))];
  const appointmentOptions = [{ value: '', label: 'Select Finished Appointment (Optional)' },
    ...appointments.map(appt => ({
      value: appt.id,
      label: `${appt.client_name} - ${new Date(appt.date_time).toLocaleString()}`,
    }))
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Card title="Add New Medical Record">
        {formError && <Alert type="error" message={formError} className="mb-4" />}
        <form onSubmit={handleSubmit}>
          <Select
            label="Client"
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            options={clientOptions}
            required
            disabled={!!selectedAppointment} // Disable if an appointment is selected
          />
          <Select
            label="Associated Finished Appointment"
            value={selectedAppointment}
            onChange={(e) => {
                setSelectedAppointment(e.target.value);
                // If an appointment is selected, pre-fill client.
                const appt = appointments.find(a => a.id === e.target.value);
                if (appt) {
                    setSelectedClient(appt.client_id);
                } else {
                    setSelectedClient('');
                }
            }}
            options={appointmentOptions}
          />
          <DatePicker
            label="Record Date and Time"
            value={recordDate}
            onChange={(e) => setRecordDate(e.target.value)}
            required
          />
          <Textarea label="Diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows={3} required />
          <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
          <Textarea label="Prescription" value={prescription} onChange={(e) => setPrescription(e.target.value)} rows={3} />
          <Button type="submit" loading={formLoading} className="w-full mt-4">
            Add Record
          </Button>
        </form>
      </Card>
    </motion.div>
  );
};

const ClientViewRecords: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchClientRecords = useCallback(async () => {
    if (!user) {
        setError("User not logged in.");
        setLoading(false);
        return;
    }
    try {
      setLoading(true);
      const res = await medicalRecordService.getClientRecords(user.id);
      setRecords(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load medical records.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchClientRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="text-primary mx-auto" />;
  if (error) return <Alert type="error" message={error} />;
  if (records.length === 0) return <Alert type="info" message="No medical records found for you." />;

  const totalPages = Math.ceil(records.length / itemsPerPage);
  const paginatedRecords = records.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Card title="My Medical History">
        <div className="space-y-4">
          {paginatedRecords.map((record) => (
            <div key={record.id} className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-primary flex items-center">
                    <FileText size={20} className="mr-2" /> {record.diagnosis}
                </h3>
                <span className="text-sm text-gray-600">
                    <CalendarCheck size={14} className="inline-block mr-1" />
                    {new Date(record.date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <UserIcon size={14} className="inline-block mr-1" />
                Doctor: <span className="font-medium">{record.doctor_name}</span> from {record.facility_name}
              </p>
              <p className="text-gray-800 text-sm font-light leading-relaxed">{record.notes}</p>
              {record.prescription && (
                <div className="mt-3 p-3 bg-white border border-gray-200 rounded-md">
                  <h4 className="font-semibold text-sm text-text">Prescription:</h4>
                  <p className="text-xs text-gray-700 whitespace-pre-wrap">{record.prescription}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        )}
      </Card>
    </motion.div>
  );
};

export const MedicalRecordsPage: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner size="lg" className="text-primary mx-auto mt-10" />;
  }

  if (!user) {
    return <Alert type="error" message="User not authenticated." />;
  }

  const renderContent = () => {
    switch (user.role) {
      case UserRole.Doctor:
        return <DoctorAddRecord />;
      case UserRole.Client:
        return <ClientViewRecords />;
      default:
        return <Alert type="info" message="You do not have access to manage medical records." />;
    }
  };

  return (
    <DashboardLayout title="Medical Records">
      {renderContent()}
    </DashboardLayout>
  );
};
