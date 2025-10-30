import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminLocations() {
  const navigate = useNavigate();
  const [zones, setZones] = useState([]);
  const [circles, setCircles] = useState([]);
  const [filteredZones, setFilteredZones] = useState([]);
  const [filteredCircles, setFilteredCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showAddZoneModal, setShowAddZoneModal] = useState(false);
  const [showAddCircleModal, setShowAddCircleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('zones');
  const [formData, setFormData] = useState({
    name: '',
    type: 'ZONE',
    parent_id: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: ''
  });

  const totals = useMemo(() => {
    const totalZones = zones.length;
    const totalCircles = circles.length;
    const totalUsers = [...zones, ...circles].reduce((sum, l) => sum + (Number(l.assigned_users) || 0), 0);
    const totalComplaints = [...zones, ...circles].reduce((sum, l) => sum + (Number(l.total_complaints) || 0), 0);
    return { totalZones, totalCircles, totalUsers, totalComplaints };
  }, [zones, circles]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const [zonesResponse, circlesResponse] = await Promise.all([
        API.get('/locations/zones'),
        API.get('/locations')
      ]);

      const zonesData = zonesResponse.data.data;
      const allLocations = circlesResponse.data.data;
      const circlesData = allLocations.filter(loc => loc.type === 'CIRCLE');

      setZones(zonesData);
      setCircles(circlesData);
      setFilteredZones(zonesData);
      setFilteredCircles(circlesData);
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
    const filteredZ = zones.filter(zone =>
      zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.country?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredZones(filteredZ);

    const filteredC = circles.filter(circle =>
      circle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      circle.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      circle.country?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCircles(filteredC);
  }, [searchTerm, zones, circles]);

  const handleAddZone = async () => {
    try {
      const zoneData = { ...formData, type: 'ZONE' };
      await API.post('/locations', zoneData);
      toast.success('Zone added successfully');
      setShowAddZoneModal(false);
      resetForm();
      fetchLocations();
    } catch (error) {
      console.error('Error adding zone:', error);
      toast.error(error.response?.data?.message || 'Failed to add zone');
    }
  };

  const handleAddCircle = async () => {
    try {
      const circleData = { ...formData, type: 'CIRCLE' };
      await API.post('/locations', circleData);
      toast.success('Circle added successfully');
      setShowAddCircleModal(false);
      resetForm();
      fetchLocations();
    } catch (error) {
      console.error('Error adding circle:', error);
      toast.error(error.response?.data?.message || 'Failed to add circle');
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
      type: 'ZONE',
      parent_id: '',
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
      type: location.type || 'ZONE',
      parent_id: location.parent_id || '',
      address: location.address || '',
      city: location.city || '',
      state: location.state || '',
      country: location.country || '',
      postal_code: location.postal_code || ''
    });
    setShowEditModal(true);
  };

  const handleManageCircles = (zone) => {
    navigate(`/admin/zones/${zone.id}/circles`);
  };

  const zoneColumns = [
    {
      title: 'Zone Name',
      key: 'name',
      render: (value) => (
        <div className="flex items-center">
          <BuildingOfficeIcon className="h-5 w-5 text-purple-600 mr-2" />
          <span className="font-medium text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      title: 'Description',
      key: 'description',
      render: (value) => (
        <div className="max-w-xs truncate text-gray-700">{value || '-'}</div>
      ),
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
      title: 'Circles',
      key: 'circle_count',
      render: (value) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {value ?? 0} Circles
        </span>
      ),
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
            title="Manage circles"
            onClick={() => handleManageCircles(row)}
            className="p-1.5 rounded text-green-600 hover:text-green-800 hover:bg-green-50"
          >
            <ArrowRightIcon className="h-5 w-5" />
          </button>
          <button
            title="Edit zone"
            onClick={() => openEditModal(row)}
            className="p-1.5 rounded text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            title="Delete zone"
            onClick={() => handleDeleteLocation(row.id)}
            className="p-1.5 rounded text-red-600 hover:text-red-800 hover:bg-red-50"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  const circleColumns = [
    {
      title: 'Circle Name',
      key: 'name',
      render: (value, row) => (
        <div>
          <div className="flex items-center">
            <MapPinIcon className="h-5 w-5 text-green-600 mr-2" />
            <span className="font-medium text-gray-900">{value}</span>
          </div>
          {row.parent_name && (
            <div className="text-xs text-gray-500 mt-1">Under: {row.parent_name}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Description',
      key: 'description',
      render: (value) => (
        <div className="max-w-xs truncate text-gray-700">{value || '-'}</div>
      ),
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
            title="Edit circle"
            onClick={() => openEditModal(row)}
            className="p-1.5 rounded text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            title="Delete circle"
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
          Location Management
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
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg border bg-white p-4 shadow-sm flex items-center">
          <div className="p-2 rounded-md bg-purple-100 text-purple-600 mr-3">
            <BuildingOfficeIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Zones</div>
            <div className="text-xl font-semibold">{totals.totalZones}</div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm flex items-center">
          <div className="p-2 rounded-md bg-green-100 text-green-600 mr-3">
            <MapPinIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Circles</div>
            <div className="text-xl font-semibold">{totals.totalCircles}</div>
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

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('zones')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'zones'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BuildingOfficeIcon className="h-5 w-5 inline mr-2" />
              Zones ({totals.totalZones})
            </button>
            <button
              onClick={() => setActiveTab('circles')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'circles'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MapPinIcon className="h-5 w-5 inline mr-2" />
              Circles ({totals.totalCircles})
            </button>
          </nav>
        </div>
      </div>

      {/* Zones Tab */}
      {activeTab === 'zones' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Zone Management</h2>
            <button
              onClick={() => setShowAddZoneModal(true)}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              Add Zone
            </button>
          </div>
          <DataTable
            columns={zoneColumns}
            data={filteredZones}
            emptyMessage="No zones found"
            className="ring-1 ring-gray-200"
          />
        </div>
      )}

      {/* Circles Tab */}
      {activeTab === 'circles' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Circle Management</h2>
            <button
              onClick={() => setShowAddCircleModal(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              Add Circle
            </button>
          </div>
          <DataTable
            columns={circleColumns}
            data={filteredCircles}
            emptyMessage="No circles found"
            className="ring-1 ring-gray-200"
          />
        </div>
      )}

      <Modal
        isOpen={showAddZoneModal}
        onClose={() => {
          setShowAddZoneModal(false);
          resetForm();
        }}
        title="Add New Zone"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          handleAddZone();
        }}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Zone Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                  placeholder="Enter zone name..."
                  required
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 resize-none"
                placeholder="Enter zone description..."
              />
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Address Information
                <span className="text-sm font-normal text-gray-500 ml-2">(Optional)</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white placeholder-gray-400"
                      placeholder="Enter street address..."
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white placeholder-gray-400"
                      placeholder="Enter city..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white placeholder-gray-400"
                      placeholder="Enter state/province..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white placeholder-gray-400"
                      placeholder="Enter country..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                    <input
                      type="text"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white placeholder-gray-400"
                      placeholder="Enter postal code..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setShowAddZoneModal(false);
                resetForm();
              }}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              <BuildingOfficeIcon className="w-5 h-5 inline mr-2" />
              Add Zone
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showAddCircleModal}
        onClose={() => {
          setShowAddCircleModal(false);
          resetForm();
        }}
        title="Add New Circle"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          handleAddCircle();
        }}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Parent Zone
                </label>
                <div className="relative">
                  <select
                    value={formData.parent_id}
                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white text-gray-900"
                    required
                  >
                    <option value="">Select a zone...</option>
                    {zones.map(zone => (
                      <option key={zone.id} value={zone.id}>{zone.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Circle Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                    placeholder="Enter circle name..."
                    required
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <MapPinIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 resize-none"
                placeholder="Enter circle description..."
              />
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Address Information
                <span className="text-sm font-normal text-gray-500 ml-2">(Optional)</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white placeholder-gray-400"
                      placeholder="Enter street address..."
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white placeholder-gray-400"
                      placeholder="Enter city..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white placeholder-gray-400"
                      placeholder="Enter state/province..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white placeholder-gray-400"
                      placeholder="Enter country..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                    <input
                      type="text"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white placeholder-gray-400"
                      placeholder="Enter postal code..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setShowAddCircleModal(false);
                resetForm();
              }}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              <MapPinIcon className="w-5 h-5 inline mr-2" />
              Add Circle
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
        title={`Edit ${selectedLocation?.type === 'ZONE' ? 'Zone' : 'Circle'}`}
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          handleEditLocation();
        }}>
          <div className="space-y-6">
            {selectedLocation?.type === 'CIRCLE' && (
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Parent Zone
                </label>
                <div className="relative">
                  <select
                    value={formData.parent_id}
                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white text-gray-900"
                    required
                  >
                    <option value="">Select a zone...</option>
                    {zones.map(zone => (
                      <option key={zone.id} value={zone.id}>{zone.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                {selectedLocation?.type === 'ZONE' ? 'Zone' : 'Circle'} Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 ${
                    selectedLocation?.type === 'ZONE' ? 'focus:border-purple-500' : 'focus:border-green-500'
                  }`}
                  placeholder={`Enter ${selectedLocation?.type === 'ZONE' ? 'zone' : 'circle'} name...`}
                  required
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  {selectedLocation?.type === 'ZONE' ? (
                    <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <MapPinIcon className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {selectedLocation?.type === 'ZONE' && (
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 resize-none"
                  placeholder="Enter zone description..."
                />
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Address Information
                <span className="text-sm font-normal text-gray-500 ml-2">(Optional)</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className={`w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 transition-all duration-200 bg-white placeholder-gray-400 ${
                        selectedLocation?.type === 'ZONE' ? 'focus:border-purple-500 focus:ring-purple-200' : 'focus:border-green-500 focus:ring-green-200'
                      }`}
                      placeholder="Enter street address..."
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 transition-all duration-200 bg-white placeholder-gray-400 ${
                        selectedLocation?.type === 'ZONE' ? 'focus:border-purple-500 focus:ring-purple-200' : 'focus:border-green-500 focus:ring-green-200'
                      }`}
                      placeholder="Enter city..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 transition-all duration-200 bg-white placeholder-gray-400 ${
                        selectedLocation?.type === 'ZONE' ? 'focus:border-purple-500 focus:ring-purple-200' : 'focus:border-green-500 focus:ring-green-200'
                      }`}
                      placeholder="Enter state/province..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 transition-all duration-200 bg-white placeholder-gray-400 ${
                        selectedLocation?.type === 'ZONE' ? 'focus:border-purple-500 focus:ring-purple-200' : 'focus:border-green-500 focus:ring-green-200'
                      }`}
                      placeholder="Enter country..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                    <input
                      type="text"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 transition-all duration-200 bg-white placeholder-gray-400 ${
                        selectedLocation?.type === 'ZONE' ? 'focus:border-purple-500 focus:ring-purple-200' : 'focus:border-green-500 focus:ring-green-200'
                      }`}
                      placeholder="Enter postal code..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                resetForm();
              }}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-3 text-white rounded-xl transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl ${
                selectedLocation?.type === 'ZONE'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                  : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
              }`}
            >
              {selectedLocation?.type === 'ZONE' ? (
                <BuildingOfficeIcon className="w-5 h-5 inline mr-2" />
              ) : (
                <MapPinIcon className="w-5 h-5 inline mr-2" />
              )}
              Update {selectedLocation?.type === 'ZONE' ? 'Zone' : 'Circle'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
