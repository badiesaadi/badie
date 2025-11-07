import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { useAuth } from '../hooks/useAuth';
import { UserRole, AppointmentStatus } from '../constants';
import { Card } from '../components/ui/Card';
import { BarChartCard } from '../components/charts/BarChartCard';
import { LineChartCard } from '../components/charts/LineChartCard';
import { PieChartCard } from '../components/charts/PieChartCard';
import { Users, CalendarCheck, Stethoscope, Bed, CircleDollarSign, Hospital } from 'lucide-react'; // Removed HeartPulse as it was unused
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Alert } from '../components/ui/Alert';
import { Facility, Appointment, ChartDataPoint, SupplyRequest, Feedback } from '../types';
import { facilityService, appointmentService, ministryService, inventoryService, feedbackService } from '../services/api';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';

const KPIStat: React.FC<{ title: string; value: string | number; icon: React.ElementType; color: string }> = ({
  title,
  value,
  icon: Icon,
  color,
}) => (
  <Card className="flex items-center space-x-4">
    <div className={`p-3 rounded-full ${color} bg-opacity-20`}>
      <Icon className={`h-6 w-6 ${color}`} />
    </div>
    <div>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-bold text-text">{value}</p>
    </div>
  </Card>
);

const HospitalDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myFacility, setMyFacility] = useState<Facility | null>(null);
  const [facilityAppointments, setFacilityAppointments] = useState<Appointment[]>([]);
  const [supplyRequests, setSupplyRequests] = useState<SupplyRequest[]>([]); // This will now hold InventoryItem or SupplyRequest
  const [feedback, setFeedback] = useState<Feedback[]>([]);

  const fetchHospitalData = async () => {
    if (!user?.facility_id) {
      setError("User is not assigned to a facility.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const facilityRes = await facilityService.getMyFacility();
      setMyFacility(facilityRes.data.facility); // Extract from 'facility' key

      const appointmentsRes = await appointmentService.facilityAppointments(user.facility_id);
      setFacilityAppointments(appointmentsRes.data.appointments); // Extract from 'appointments' key

      // Simulate fetching inventory requests specific to this facility
      // As per requirement, "Send Request to Ministry" button adds new request visible in Ministry dashboard.
      // So, this would be a filtered view of ministry's requests or a separate facility-specific endpoint.
      const requestsRes = await inventoryService.getInventory(user.facility_id); // Re-using inventory for demo
      setSupplyRequests(requestsRes.data.data); // Extract from 'data' key

      const feedbackRes = await feedbackService.getFacilityFeedback(user.facility_id);
      setFeedback(feedbackRes.data.data); // Extract from 'data' key

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load hospital data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.facility_id]);

  if (loading) return <LoadingSpinner size="lg" className="text-primary mx-auto" />;
  if (error) return <Alert type="error" message={error} />;
  if (!myFacility) return <Alert type="info" message="No facility data available for this user." />;

  // KPIs
  const totalPatients = facilityAppointments.length; // Simplified
  const occupiedBeds = myFacility.occupied_beds;
  const availableBeds = myFacility.beds - occupiedBeds;
  const totalDoctors = myFacility.doctors.length;
  const dailyAppointments = facilityAppointments.filter(
    (app) => new Date(app.date_time).toDateString() === new Date().toDateString()
  ).length;

  // Chart data
  const occupancyData: ChartDataPoint[] = [
    { name: 'Occupied', value: occupiedBeds },
    { name: 'Available', value: availableBeds },
  ];

  const appointmentStatusData: ChartDataPoint[] = Object.values(AppointmentStatus).map((status) => ({
    name: status,
    value: facilityAppointments.filter((app) => app.status === status).length,
  }));
  const appointmentStatusColors = {
    [AppointmentStatus.Pending]: 'var(--status-pending)',
    [AppointmentStatus.Approved]: 'var(--status-approved)',
    [AppointmentStatus.Cancelled]: 'var(--status-cancelled)',
    [AppointmentStatus.Finished]: 'var(--status-finished)',
  };


  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-text">Hospital Dashboard: {myFacility.name}</h2>

      {/* KPIs */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <KPIStat title="Total Patients" value={totalPatients} icon={Users} color="text-blue-500" />
        <KPIStat title="Occupied Beds" value={`${occupiedBeds}/${myFacility.beds}`} icon={Bed} color="text-yellow-500" />
        <KPIStat title="Available Doctors" value={totalDoctors} icon={Stethoscope} color="text-green-500" />
        <KPIStat title="Daily Appointments" value={dailyAppointments} icon={CalendarCheck} color="text-indigo-500" />
      </motion.div>

      {/* Charts */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <PieChartCard
          title="Bed Occupancy"
          data={occupancyData}
          dataKey="value"
          nameKey="name"
          colors={['#ef4444', '#22c55e']} // Red for occupied, Green for available
        />
        <BarChartCard
          title="Appointment Statuses"
          data={appointmentStatusData}
          dataKey="value"
          fillColor={appointmentStatusColors[AppointmentStatus.Approved]} // Example, can be dynamic
        />
      </motion.div>

      {/* Quick Links / Actions */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button variant="outline" className="h-full py-4 text-lg">Add Patient</Button>
        <Button variant="outline" className="h-full py-4 text-lg">Manage Staff</Button>
        <Button variant="outline" className="h-full py-4 text-lg">Manage Inventory</Button>
      </motion.div>

      {/* Recent Activity / Requests */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card title="Recent Supply Requests">
          {supplyRequests.length === 0 ? (
            <p className="text-gray-500">No recent supply requests.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {/* Assuming supplyRequests contain 'item_name', 'quantity', 'status' */}
              {supplyRequests.slice(0, 5).map((request: any) => ( // Use any for demo or create InventoryItem type
                <li key={request.id} className="py-2 flex justify-between items-center">
                  <span className="text-text">{request.item_name} ({request.quantity})</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      request.status === 'pending' ? 'bg-status-pending text-white' :
                      request.status === 'approved' ? 'bg-status-approved text-white' :
                      'bg-status-cancelled text-white'
                  }`}>
                    {request.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Button variant="ghost" className="mt-4">View All Requests</Button>
        </Card>
      </motion.div>

      {/* Feedback Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card title="Patient Feedback">
          {feedback.length === 0 ? (
            <p className="text-gray-500">No patient feedback yet.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {feedback.slice(0, 3).map((fb) => (
                <li key={fb.id} className="py-2">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-text">{fb.client_name}</p>
                    <div className="text-yellow-500 flex items-center">
                        {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 italic">"{fb.comment}"</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(fb.date).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          )}
          <Button variant="ghost" className="mt-4">View All Feedback</Button>
        </Card>
      </motion.div>
    </div>
  );
};

const MinistryDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [supplyRequests, setSupplyRequests] = useState<SupplyRequest[]>([]);
  const [nationalFeedback, setNationalFeedback] = useState<Feedback[]>([]);

  const fetchMinistryData = async () => {
    try {
      setLoading(true);
      const facilitiesRes = await facilityService.listFacilities();
      setFacilities(facilitiesRes.data.facilities); // Extract from 'facilities' key

      const requestsRes = await ministryService.getSupplyRequests();
      setSupplyRequests(requestsRes.data.data); // Extract from 'data' key

      const feedbackRes = await feedbackService.getNationalFeedback();
      setNationalFeedback(feedbackRes.data.data); // Extract from 'data' key

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load ministry data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMinistryData();
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="text-primary mx-auto" />;
  if (error) return <Alert type="error" message={error} />;

  // KPIs
  const totalHospitals = facilities.filter(f => f.type === 'hospital').length;
  const totalClinics = facilities.filter(f => f.type === 'clinic').length;
  const totalFacilities = facilities.length;
  const pendingRequests = supplyRequests.filter(req => req.status === 'pending').length;
  const nationalAvgOccupancy = facilities.length > 0 && facilities.reduce((sum, f) => sum + f.beds, 0) > 0
    ? (facilities.reduce((sum, f) => sum + f.occupied_beds, 0) / facilities.reduce((sum, f) => sum + f.beds, 0) * 100).toFixed(1)
    : 0;
  const totalDoctors = facilities.reduce((sum, f) => sum + f.doctors.length, 0);

  // Chart Data
  const facilityTypeData: ChartDataPoint[] = [
    { name: 'Hospitals', value: totalHospitals },
    { name: 'Clinics', value: totalClinics },
    { name: 'Health Centers', value: facilities.filter(f => f.type === 'health_center').length },
  ];
  const facilityTypeColors = ['#3b82f6', '#10b981', '#f59e0b']; // Primary, Green, Yellow

  const occupancyPerRegionData: ChartDataPoint[] = facilities.reduce((acc, facility) => {
    const existing = acc.find(item => item.name === facility.region);
    const occupancy = facility.beds > 0 ? (facility.occupied_beds / facility.beds) * 100 : 0;
    if (existing) {
      // If multiple facilities in same region, average their occupancy or sum beds
      // For now, let's average the occupancy percentage
      existing.value = (existing.value + occupancy) / 2;
    } else {
      acc.push({ name: facility.region, value: occupancy });
    }
    return acc;
  }, [] as ChartDataPoint[]);

  const requestStatusData: ChartDataPoint[] = [
    { name: 'Pending', value: supplyRequests.filter(req => req.status === 'pending').length },
    { name: 'Approved', value: supplyRequests.filter(req => req.status === 'approved').length },
    { name: 'Rejected', value: supplyRequests.filter(req => req.status === 'rejected').length },
  ];
  const requestStatusColors = ['#facc15', '#22c55e', '#ef4444'];


  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-text">National Dashboard</h2>

      {/* KPIs */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <KPIStat title="Total Facilities" value={totalFacilities} icon={Hospital} color="text-primary" />
        <KPIStat title="National Avg. Occupancy" value={`${nationalAvgOccupancy}%`} icon={Bed} color="text-teal-500" />
        <KPIStat title="Pending Requests" value={pendingRequests} icon={CircleDollarSign} color="text-orange-500" />
        <KPIStat title="Total Doctors" value={totalDoctors} icon={Stethoscope} color="text-purple-500" />
      </motion.div>

      {/* Charts */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <PieChartCard
          title="Facility Types"
          data={facilityTypeData}
          dataKey="value"
          nameKey="name"
          colors={facilityTypeColors}
        />
        <BarChartCard
          title="Occupancy Per Region"
          data={occupancyPerRegionData}
          dataKey="value"
          fillColor="#14b8a6" // Teal
        />
      </motion.div>

      {/* Request Management Overview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card title="Supply Request Status Overview">
          <PieChartCard
            title="Supply Request Status"
            data={requestStatusData}
            dataKey="value"
            nameKey="name"
            colors={requestStatusColors}
            className="!p-0 !shadow-none"
          />
          <Button variant="ghost" className="mt-4">Manage All Requests</Button>
        </Card>
      </motion.div>

      {/* National Feedback Overview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card title="National Patient Satisfaction">
          {nationalFeedback.length === 0 ? (
            <p className="text-gray-500">No national patient feedback yet.</p>
          ) : (
            <p className="text-lg font-semibold text-text">
                Average Rating: {(nationalFeedback.reduce((sum, fb) => sum + fb.rating, 0) / nationalFeedback.length).toFixed(1)} / 5
            </p>
          )}
          <Button variant="ghost" className="mt-4">View Detailed Feedback Report</Button>
        </Card>
      </motion.div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner size="lg" className="text-primary mx-auto mt-10" />;
  }

  if (!user) {
    // This case should ideally be caught by ProtectedRoute, but for safety
    return <Alert type="error" message="User not authenticated." />;
  }

  const renderDashboardContent = () => {
    switch (user.role) {
      case UserRole.Client:
        return <Alert type="info" message="Welcome to your client dashboard! You can book appointments and view your medical records." />;
      case UserRole.Doctor:
      case UserRole.Admin:
        return <HospitalDashboard />;
      case UserRole.GeneralAdmin:
        return <MinistryDashboard />;
      default:
        return <Alert type="info" message="Welcome to the dashboard!" />;
    }
  };

  return (
    <DashboardLayout title="Dashboard">
      {renderDashboardContent()}
    </DashboardLayout>
  );
};