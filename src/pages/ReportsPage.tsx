import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { useAuth } from '../hooks/useAuth';
import { Facility, Appointment, ChartDataPoint } from '../types';
import { facilityService, appointmentService, ministryService } from '../services/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Alert } from '../components/ui/Alert';
import { Card } from '../components/ui/Card';
import { BarChartCard } from '../components/charts/BarChartCard';
import { LineChartCard } from '../components/charts/LineChartCard';
import { PieChartCard } from '../components/charts/PieChartCard';
import { Download, TrendingUp, Hospital, CalendarClock, Stethoscope } from 'lucide-react'; // Added Stethoscope
import { Button } from '../components/ui/Button';
import { UserRole, AppointmentStatus } from '../constants';
import { motion } from 'framer-motion';

const KPIStat: React.FC<{ title: string; value: string | number; icon: React.ElementType; color: string; progress?: number }> = ({
  title,
  value,
  icon: Icon,
  color,
  progress,
}) => (
  <Card className="flex flex-col space-y-2">
    <div className="flex items-center justify-between">
      <div className={`p-2 rounded-full ${color} bg-opacity-20`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    </div>
    <p className="text-2xl font-bold text-text">{value}</p>
    {progress !== undefined && (
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
        <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${progress}%` }}></div>
      </div>
    )}
  </Card>
);

const GeneralAdminReports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);

  const fetchGeneralAdminReportsData = useCallback(async () => {
    try {
      setLoading(true);
      const facilitiesRes = await facilityService.listFacilities();
      setFacilities(facilitiesRes.data.facilities); // Extract from 'facilities' key

      // Fetch all appointments (requires a backend endpoint for general_admin to see all)
      // Assuming appointmentService.facilityAppointments with empty string acts as 'all' or a dedicated endpoint.
      // If the backend has a specific 'all_appointments.php' for general_admin, use that.
      // For now, we'll try with an empty string, which the backend will need to interpret.
      // A dedicated `appointmentService.listAllAppointments()` endpoint would be better here.
      const allAppointmentsRes = await appointmentService.facilityAppointments('');
      setAllAppointments(allAppointmentsRes.data.appointments); // Extract from 'appointments' key

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load general admin reports.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGeneralAdminReportsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="text-primary mx-auto" />;
  if (error) return <Alert type="error" message={error} />;

  // Data Processing for Charts
  const nationalOccupancy = facilities.length > 0 && facilities.reduce((sum, f) => sum + f.beds, 0) > 0
    ? (facilities.reduce((sum, f) => sum + f.occupied_beds, 0) / facilities.reduce((sum, f) => sum + f.beds, 0) * 100)
    : 0;

  const totalPatients = allAppointments.filter(app => app.status !== AppointmentStatus.Cancelled).length;
  const totalFacilities = facilities.length;
  const totalDoctors = facilities.reduce((sum, f) => sum + f.doctors.length, 0);

  const bedOccupancyData: ChartDataPoint[] = facilities.map(f => ({
    name: f.name,
    value: f.beds > 0 ? (f.occupied_beds / f.beds) * 100 : 0,
  }));

  const appointmentTrendsData: ChartDataPoint[] = (() => {
    const monthlyData: { [key: string]: number } = {};
    allAppointments.forEach(appt => {
      const monthYear = new Date(appt.date_time).toLocaleString('en-US', { month: 'short', year: '2-digit' });
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1;
    });
    return Object.keys(monthlyData).sort().map(key => ({ name: key, value: monthlyData[key] }));
  })();

  const facilityActivityData: ChartDataPoint[] = facilities.map(f => ({
    name: f.name,
    value: allAppointments.filter(app => app.facility_id === f.id).length,
  }));


  // Simulated Export Functions
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert("No data to export.");
      return;
    }
    const csvContent = "data:text/csv;charset=utf-8," +
      Object.keys(data[0]).join(',') + '\n' +
      data.map(row => Object.values(row).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportReport = (reportName: string, data: ChartDataPoint[]) => {
    // In a real app, this would generate a PDF or a more complex CSV.
    // For now, simulate by exporting chart data as CSV.
    alert(`Simulating export of ${reportName} report.`);
    exportToCSV(data, reportName.toLowerCase().replace(/\s/g, '_'));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-text">National Reports</h2>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <KPIStat title="Total Facilities" value={totalFacilities} icon={Hospital} color="text-blue-500" />
        <KPIStat title="Total Patients" value={totalPatients} icon={TrendingUp} color="text-green-500" />
        <KPIStat
          title="National Bed Occupancy"
          value={`${nationalOccupancy.toFixed(1)}%`}
          icon={CalendarClock}
          color="text-yellow-500"
          progress={Math.min(100, Math.max(0, nationalOccupancy))}
        />
        <KPIStat title="Total Doctors" value={totalDoctors} icon={Stethoscope} color="text-indigo-500" /> {/* Corrected icon */}
      </motion.div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <BarChartCard
          title="Facility Bed Occupancy (%)"
          data={bedOccupancyData}
          dataKey="value"
          fillColor="#0ea5e9" // Sky blue
        />
        <LineChartCard
          title="Appointment Trends"
          data={appointmentTrendsData}
          dataKey="value"
          strokeColor="#22c55e" // Emerald green
        />
        <BarChartCard
          title="Facility Activity (Appointments)"
          data={facilityActivityData}
          dataKey="value"
          fillColor="#facc15" // Amber yellow
        />
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button onClick={() => exportReport('Bed Occupancy', bedOccupancyData)} icon={Download}>
          Export Bed Occupancy
        </Button>
        <Button onClick={() => exportReport('Appointment Trends', appointmentTrendsData)} icon={Download}>
          Export Appointment Trends
        </Button>
        <Button onClick={() => exportReport('Facility Activity', facilityActivityData)} icon={Download}>
          Export Facility Activity
        </Button>
      </motion.div>
    </div>
  );
};

const HospitalAdminReports: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myFacility, setMyFacility] = useState<Facility | null>(null);
  const [facilityAppointments, setFacilityAppointments] = useState<Appointment[]>([]);

  const fetchHospitalAdminReportsData = useCallback(async () => {
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load hospital reports.');
    } finally {
      setLoading(false);
    }
  }, [user?.facility_id]);

  useEffect(() => {
    fetchHospitalAdminReportsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="text-primary mx-auto" />;
  if (error) return <Alert type="error" message={error} />;
  if (!myFacility) return <Alert type="info" message="No facility data available for reporting." />;

  // Data Processing for Charts
  const totalPatients = facilityAppointments.filter(app => app.status !== AppointmentStatus.Cancelled).length;
  const occupiedBeds = myFacility.occupied_beds;
  const bedOccupancyPercentage = myFacility.beds > 0 ? (occupiedBeds / myFacility.beds) * 100 : 0;
  const totalAppointments = facilityAppointments.length;

  const dailyAppointmentsData: ChartDataPoint[] = (() => {
    const daily: { [key: string]: number } = {};
    facilityAppointments.forEach(appt => {
      const date = new Date(appt.date_time).toLocaleDateString();
      daily[date] = (daily[date] || 0) + 1;
    });
    // Sort by date, taking last 7 days for example
    const sortedDates = Object.keys(daily).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).slice(-7);
    return sortedDates.map(date => ({ name: date, value: daily[date] || 0 }));
  })();

  const appointmentStatusBreakdown: ChartDataPoint[] = Object.values(AppointmentStatus).map((status) => ({
    name: status,
    value: facilityAppointments.filter((app) => app.status === status).length,
  }));
  const appointmentStatusColors = ['#facc15', '#22c55e', '#ef4444', '#0ea5e9']; // Pending, Approved, Cancelled, Finished

  const exportReport = (reportName: string, data: ChartDataPoint[]) => {
    alert(`Simulating export of ${reportName} report for ${myFacility.name}.`);
    // Example: exportToCSV(data, `${myFacility.name.toLowerCase().replace(/\s/g, '_')}_${reportName.toLowerCase().replace(/\s/g, '_')}`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-text">Hospital Reports: {myFacility.name}</h2>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <KPIStat title="Total Appointments" value={totalAppointments} icon={CalendarClock} color="text-primary" />
        <KPIStat title="Total Patients Served" value={totalPatients} icon={TrendingUp} color="text-green-500" />
        <KPIStat
          title="Bed Occupancy"
          value={`${bedOccupancyPercentage.toFixed(1)}%`}
          icon={Hospital}
          color="text-red-500"
          progress={Math.min(100, Math.max(0, bedOccupancyPercentage))}
        />
        <KPIStat title="Available Doctors" value={myFacility.doctors.length} icon={Stethoscope} color="text-purple-500" /> {/* Corrected icon */}
      </motion.div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <LineChartCard
          title="Daily Appointments"
          data={dailyAppointmentsData}
          dataKey="value"
          strokeColor="#3b82f6"
        />
        <PieChartCard
          title="Appointment Status Breakdown"
          data={appointmentStatusBreakdown}
          dataKey="value"
          nameKey="name"
          colors={appointmentStatusColors}
        />
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button onClick={() => exportReport('Daily Appointments', dailyAppointmentsData)} icon={Download}>
          Export Daily Appointments
        </Button>
        <Button onClick={() => exportReport('Appointment Status', appointmentStatusBreakdown)} icon={Download}>
          Export Appointment Status
        </Button>
      </motion.div>
    </div>
  );
};


export const ReportsPage: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner size="lg" className="text-primary mx-auto mt-10" />;
  }

  if (!user) {
    return <Alert type="error" message="User not authenticated." />;
  }

  const renderContent = () => {
    switch (user.role) {
      case UserRole.GeneralAdmin:
        return <GeneralAdminReports />;
      case UserRole.Admin:
      case UserRole.Doctor: // Corrected UserRole.Ddoctor to UserRole.Doctor
        return <HospitalAdminReports />;
      default:
        return <Alert type="info" message="You do not have access to view reports." />;
    }
  };

  return (
    <DashboardLayout title="Reports & Analytics">
      {renderContent()}
    </DashboardLayout>
  );
};