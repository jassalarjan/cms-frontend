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
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ZoneManagement() {
  const navigate = useNavigate();
  const [zones, setZones] = useState([]);
  const [filteredZones, setFilteredZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: ''
  });

  const totals = useMemo(() => {
    const totalZones = zones.length;
    const totalUsers = zones.reduce((sum, z) => sum + (Number(z.assigned_users) || 0), 0);
    const totalComplaints = zones.reduce((sum, z) => sum + (Number(z.total_complaints) || 0), 0);
    const totalCircles = zones.reduce((sum, z) => sum + (Number(z.circle_count) || 0), 0);
    return { totalZones, totalUsers, totalComplaints, totalCircles };
  }, [zones]);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const response = await API.get('/locations/zones');
      setZones(response.data.data);
      setFilteredZones(response.data.data);
    } catch (error) {
      console.error('Error fetching zones:', error);
      toast.error('Failed to fetch zones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  useEffect(() => {
    const filtered = zones.filter(zone =>
      zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.country?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredZones(filtered);
  }, [searchTerm, zones]);

  const handleAddZone = async () => {
    try {
      const zoneData = { ...formData, type: 'ZONE' };
      await API.post('/locations', zoneData);
      toast.success('Zone added successfully');
      setShowAddModal(false);
      resetForm();
      fetchZones();
    } catch (error) {
      console.error('Error adding zone:', error);
      toast.error(error.response?.data?.message || 'Failed to add zone');
    }
  };

  const handleEditZone = async () => {
    try {
      const zoneData = { ...formData, type: 'ZONE' };
      await API.put(`/locations/${selectedZone.id}`, zoneData);
      toast.success('Zone updated successfully');
      setShowEditModal(false);
      resetForm();
      fetchZones();
    } catch (error) {
      console.error('Error updating zone:', error);
      toast.error(error.response?.data?.message || 'Failed to update zone');
    }
  };

  const handleDeleteZone = async (zoneId) => {
    if (!window.confirm('Are you sure you want to delete this zone? This will also delete all circles under it.')) return;

    try {
      await API.delete(`/locations/${zoneId}`);
      toast.success('Zone deleted successfully');
      fetchZones();
    } catch (error) {
      console.error('Error deleting zone:', error);
      toast.error(error.response?.data?.message || 'Failed to delete zone');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postal_code: ''
    });
    setSelectedZone(null);
  };

  const openEditModal = (zone) => {
    setSelectedZone(zone);
    setFormData({
      name: zone.name,
      description: zone.description || '',
      address: zone.address || '',
      city: zone.city || '',
      state: zone.state || '',
      country: zone.country || '',
      postal_code: zone.postal_code || ''
    });
    setShowEditModal(true);
  };

  const columns = [
    {
      title: 'Zone Name',
      key: 'name',
      render: (value) => <span className="font-medium text-gray-900">{value}</span>,
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
      render: (value) => value ?? 0,
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
            onClick={() => navigate(`/admin/zones/${row.id}/circles`)}
            className="p-1.5 rounded text-green-600 hover:text-green-800 hover:bg-green-50"
          >
            <MapPinIcon className="h-5 w-5" />
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
            onClick={() => handleDeleteZone(row.id)}
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
          <BuildingOfficeIcon className="h-6 w-6 mr-2" />
          Zone Management
        </h1>
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search zones..."
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
            Add Zone
          </button>
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

      <DataTable
        columns={columns}
        data={filteredZones}
        emptyMessage="No zones found"
        className="ring-1 ring-gray-200"
      />

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Zone"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          handleAddZone();
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Zone Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              Add Zone
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
        title="Edit Zone"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          handleEditZone();
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Zone Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              Update Zone
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}