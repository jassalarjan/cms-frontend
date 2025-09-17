import React, { useEffect, useState, useMemo } from 'react';
import API from '../../api/axios';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';
import { format } from 'date-fns';
import { 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  UserGroupIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminLocations() {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: ''
  });

  const totals = useMemo(() => {
    const totalLocations = locations.length;
    const totalUsers = locations.reduce((sum, l) => sum + (Number(l.assigned_users) || 0), 0);
    const totalComplaints = locations.reduce((sum, l) => sum + (Number(l.total_complaints) || 0), 0);
    return { totalLocations, totalUsers, totalComplaints };
  }, [locations]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await API.get('/locations');
      setLocations(response.data.data);
      setFilteredLocations(response.data.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    const filtered = locations.filter(location =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.country?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLocations(filtered);
  }, [searchTerm, locations]);

  const handleAddLocation = async () => {
    try {
      await API.post('/locations', formData);
      toast.success('Location added successfully');
      setShowAddModal(false);
      resetForm();
      fetchLocations();
    } catch (error) {
      console.error('Error adding location:', error);
      toast.error(error.response?.data?.message || 'Failed to add location');
    }
  };

  const handleEditLocation = async () => {
    try {
      await API.put(`/locations/${selectedLocation.id}`, formData);
      toast.success('Location updated successfully');
      setShowEditModal(false);
      resetForm();
      fetchLocations();
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error(error.response?.data?.message || 'Failed to update location');
    }
  };

  const handleDeleteLocation = async (locationId) => {
    if (!window.confirm('Are you sure you want to delete this location?')) return;
    
    try {
      await API.delete(`/locations/${locationId}`);
      toast.success('Location deleted successfully');
      fetchLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error(error.response?.data?.message || 'Failed to delete location');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postal_code: ''
    });
    setSelectedLocation(null);
  };

  const openEditModal = (location) => {
    setSelectedLocation(location);
    setFormData({
      name: location.name,
      address: location.address || '',
      city: location.city || '',
      state: location.state || '',
      country: location.country || '',
      postal_code: location.postal_code || ''
    });
    setShowEditModal(true);
  };

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (value) => <span className="font-medium text-gray-900">{value}</span>,
    },
    {
      title: 'Address',
      key: 'address',
      render: (value) => (
        <div className="max-w-xs truncate text-gray-700">{value || '-'}</div>
      ),
    },
    {
      title: 'City',
      key: 'city',
      render: (value) => value ? (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {value}
        </span>
      ) : '-',
    },
    {
      title: 'Country',
      key: 'country',
      render: (value) => value ? (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
          {value}
        </span>
      ) : '-',
    },
    {
      title: 'Users',
      key: 'assigned_users',
      render: (value) => value ?? 0,
    },
    {
      title: 'Complaints',
      key: 'total_complaints',
      render: (value) => value ?? 0,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_value, row) => (
        <div className="flex space-x-2">
          <button
            title="Edit location"
            onClick={() => openEditModal(row)}
            className="p-1.5 rounded text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            title="Delete location"
            onClick={() => handleDeleteLocation(row.id)}
            className="p-1.5 rounded text-red-600 hover:text-red-800 hover:bg-red-50"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <Loading />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <MapPinIcon className="h-6 w-6 mr-2" />
          Locations
        </h1>
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Add Location
          </button>
        </div>
        </div>
        
        {/* Summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg border bg-white p-4 shadow-sm flex items-center">
        <div className="p-2 rounded-md bg-blue-100 text-blue-600 mr-3">
        <MapPinIcon className="h-5 w-5" />
        </div>
        <div>
        <div className="text-sm text-gray-500">Locations</div>
        <div className="text-xl font-semibold">{totals.totalLocations}</div>
        </div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm flex items-center">
        <div className="p-2 rounded-md bg-emerald-100 text-emerald-600 mr-3">
        <UserGroupIcon className="h-5 w-5" />
        </div>
        <div>
        <div className="text-sm text-gray-500">Assigned Users</div>
        <div className="text-xl font-semibold">{totals.totalUsers}</div>
        </div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm flex items-center">
        <div className="p-2 rounded-md bg-amber-100 text-amber-600 mr-3">
        <ExclamationTriangleIcon className="h-5 w-5" />
        </div>
        <div>
        <div className="text-sm text-gray-500">Total Complaints</div>
        <div className="text-xl font-semibold">{totals.totalComplaints}</div>
        </div>
        </div>
        </div>
        
        <DataTable
        columns={columns}
        data={filteredLocations}
        emptyMessage="No locations found"
        className="ring-1 ring-gray-200"
      />

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Location"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          handleAddLocation();
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State/Province</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Location
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Edit Location"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          handleEditLocation();
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State/Province</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                resetForm();
              }}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Update Location
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
