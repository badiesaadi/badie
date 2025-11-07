import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { useAuth } from '../hooks/useAuth';
import { Facility, User, FacilityPayload } from '../types'; // Added FacilityPayload
import { facilityService, appointmentService } from '../services/api'; // Changed authService to appointmentService for listDoctors
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Alert } from '../components/ui/Alert';
import { Input, Select } from '../components/ui/Input'; // Removed Textarea as unused in modals
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Plus, UserPlus, Building, MapPin } from 'lucide-react'; // Removed Edit as unused
import { UserRole } from '../constants';
import { motion } from 'framer-motion';
import { SearchFilterBar } from '../components/common/SearchFilterBar';
import { Pagination } from '../components/common/Pagination';

// --- Modals ---
interface CreateFacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateFacilityModal: React.FC<CreateFacilityModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState('hospital');
  const [region, setRegion] = useState('');
  const [beds, setBeds] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload: FacilityPayload = {
        name,
        address,
        phone,
        type,
        region,
        beds: parseInt(beds),
        occupied_beds: 0, // Default to 0 on creation
      };
      await facilityService.createFacility(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create facility.');
    } finally {
      setLoading(false);
    }
  };

  const facilityTypeOptions = [
    { value: 'hospital', label: 'Hospital' },
    { value: 'clinic', label: 'Clinic' },
    { value: 'health_center', label: 'Health Center' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Facility" className="w-full max-w-lg">
      {error && <Alert type="error" message={error} className="mb-4" />}
      <form onSubmit={handleSubmit}>
        <Input label="Facility Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
        <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required type="tel" />
        <Select label="Type" value={type} onChange={(e) => setType(e.target.value)} options={facilityTypeOptions} required />
        <Input label="Region" value={region} onChange={(e) => setRegion(e.target.value)} required />
        <Input label="Total Beds" value={beds} onChange={(e) => setBeds(e.target.value)} required type="number" min="0" />
        <Button type="submit" loading={loading} className="w-full mt-4">
          Create Facility
        </Button>
      </form>
    </Modal>
  );
};

interface AssignDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  facilityId: string;
}

const AssignDoctorModal: React.FC<AssignDoctorModalProps> = ({ isOpen, onClose, onSuccess, facilityId }) => {
  const [doctorId, setDoctorId] = useState('');
  const [doctors, setDoctors] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      // Assuming appointmentService.listDoctors returns { success: true, data: User[] }
      const res = await appointmentService.listDoctors(); // Fetch all doctors
      setDoctors(res.data.facilities?.[0]?.doctors || []); // Assuming doctors are nested in a 'facilities' array within the response for now
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch doctors.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
    }
  }, [isOpen, fetchDoctors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await facilityService.assignDoctor(facilityId, doctorId);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign doctor.');
    } finally {
      setLoading(false);
    }
  };

  const doctorOptions = [{ value: '', label: 'Select Doctor' }, ...doctors.map(d => ({ value: d.id, label: d.username }))];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Doctor to Facility" className="w-full max-w-lg">
      {error && <Alert type="error" message={error} className="mb-4" />}
      {loading ? (
        <LoadingSpinner className="mx-auto" />
      ) : (
        <form onSubmit={handleSubmit}>
          <Select label="Doctor" value={doctorId} onChange={(e) => setDoctorId(e.target.value)} options={doctorOptions} required />
          <Button type="submit" loading={loading} className="w-full mt-4">
            Assign Doctor
          </Button>
        </form>
      )}
    </Modal>
  );
};


// --- Main Page Component ---
export const FacilitiesPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedFacilityForAssignment, setSelectedFacilityForAssignment] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchFacilities = useCallback(async () => {
    setLoading(true);
    try {
      if (user?.role === UserRole.Admin) {
        // Hospital admin sees only their facility
        const res = await facilityService.getMyFacility();
        setFacilities(res.data.facility ? [res.data.facility] : []); // Extract from 'facility' key
      } else { // GeneralAdmin, Client, Doctor all see all facilities
        const res = await facilityService.listFacilities();
        setFacilities(res.data.facilities); // Extract from 'facilities' key
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load facilities.');
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    if (!authLoading) {
      fetchFacilities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  const openAssignDoctorModal = (facilityId: string) => {
    setSelectedFacilityForAssignment(facilityId);
    setIsAssignModalOpen(true);
  };

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          facility.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          facility.region.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || facility.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredFacilities.length / itemsPerPage);
  const paginatedFacilities = filteredFacilities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const facilityColumns = [
    { header: 'Name', key: 'name', render: (f: Facility) => (
        <div className="flex items-center">
            <Building size={16} className="mr-2 text-primary" /> {f.name}
        </div>
    )},
    { header: 'Type', key: 'type', render: (f: Facility) => (
        <span className="capitalize">{f.type.replace('_', ' ')}</span>
    )},
    { header: 'Address', key: 'address', className: 'truncate' },
    { header: 'Region', key: 'region', render: (f: Facility) => (
        <div className="flex items-center">
            <MapPin size={14} className="mr-1 text-gray-500" /> {f.region}
        </div>
    )},
    { header: 'Beds', key: 'beds', render: (f: Facility) => `${f.occupied_beds}/${f.beds}` },
    { header: 'Doctors', key: 'doctors', render: (f: Facility) => f.doctors?.length || 0 },
  ];

  if (user?.role === UserRole.GeneralAdmin) {
    facilityColumns.push({
      header: 'Actions',
      key: 'actions',
      render: (facility: Facility) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="secondary" icon={UserPlus} onClick={() => openAssignDoctorModal(facility.id)}>
            Assign Doctor
          </Button>
          {/* <Button size="sm" variant="outline" icon={Edit}>Edit</Button> */}
        </div>
      ),
    });
  }

  const filterOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'hospital', label: 'Hospital' },
    { value: 'clinic', label: 'Clinic' },
    { value: 'health_center', label: 'Health Center' },
  ];

  if (authLoading || loading) return <LoadingSpinner size="lg" className="text-primary mx-auto" />;
  if (error) return <Alert type="error" message={error} />;
  if (!user) return <Alert type="error" message="User not authenticated." />;

  return (
    <DashboardLayout title="Facilities Management">
      <div className="space-y-6">
        {user.role === UserRole.GeneralAdmin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <Button onClick={() => setIsCreateModalOpen(true)} icon={Plus}>
              Add New Facility
            </Button>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.5 }}>
          <SearchFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterOptions={filterOptions}
            selectedFilter={filterType}
            onFilterChange={setFilterType}
            placeholder="Search facilities by name, address, or region..."
          />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <Card title="Available Facilities">
            <Table<Facility>
              data={paginatedFacilities}
              columns={facilityColumns}
              keyExtractor={(f) => f.id}
              emptyMessage="No facilities found."
            />
            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            )}
          </Card>
        </motion.div>
      </div>

      <CreateFacilityModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchFacilities}
      />
      {selectedFacilityForAssignment && (
        <AssignDoctorModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          onSuccess={fetchFacilities}
          facilityId={selectedFacilityForAssignment}
        />
      )}
    </DashboardLayout>
  );
};