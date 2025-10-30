import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  ArrowLeftIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function CircleManagement() {
  const { zoneId } = useParams();
  const navigate = useNavigate();
  const [zone, setZone] = useState(null);
  const [circles, setCircles] = useState([]);
  const [filteredCircles, setFilteredCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCircle, setSelectedCircle] = useState(null);
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
    const totalCircles = circles.length;
    const totalUsers = circles.reduce((sum, c) => sum + (Number(c.assigned_users) || 0), 0);
    const totalComplaints = circles.reduce((sum, c) => sum + (Number(c.total_complaints) || 0), 0);
    return { totalCircles, totalUsers, totalComplaints };
  }, [circles]);

  const fetchZoneAndCircles = async () => {
    try {
      setLoading(true);
      const [zoneResponse, circlesResponse] = await Promise.all([
        API.get(`/locations/${zoneId}`),
        API.get(`/locations/zones/${zoneId}/circles`)
      ]);

      setZone(zoneResponse.data);
      setCircles(circlesResponse.data.data);
      setFilteredCircles(circlesResponse.data.data);
    } catch (error) {
      console.error('Error fetching zone and circles:', error);
      toast.error('Failed to fetch zone and circles');
      navigate('/admin/locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (zoneId) {
      fetchZoneAndCircles();
    }
  }, [zoneId]);

  useEffect(() => {
    const filtered = circles.filter(circle =>
      circle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      circle.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      circle.country?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCircles(filtered);
  }, [searchTerm, circles]);

  const handleAddCircle = async () => {
    try {
      const circleData = { ...formData, type: 'CIRCLE', parent_id: zoneId };
      await API.post('/locations', circleData);
      toast.success('Circle added successfully');
      setShowAddModal(false);
      resetForm();
      fetchZoneAndCircles();
    } catch (error) {
      console.error('Error adding circle:', error);
      toast.error(error.response?.data?.message || 'Failed to add circle');
    }
  };

  const handleEditCircle = async () => {
    try {
      const circleData = { ...formData, type: 'CIRCLE', parent_id: zoneId };
      await API.put(`/locations/${selectedCircle.id}`, circleData);
      toast.success('Circle updated successfully');
      setShowEditModal(false);
      resetForm();
      fetchZoneAndCircles();
    } catch (error) {
      console.error('Error updating circle:', error);
      toast.error(error.response?.data?.message || 'Failed to update circle');
    }
  };

  const handleDeleteCircle = async (circleId) => {
    if (!window.confirm('Are you sure you want to delete this circle?')) return;

    try {
      await API.delete(`/locations/${circleId}`);
      toast.success('Circle deleted successfully');
      fetchZoneAndCircles();
    } catch (error) {
      console.error('Error deleting circle:', error);
      toast.error(error.response?.data?.message || 'Failed to delete circle');
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
    setSelectedCircle(null);
  };

  const openEditModal = (circle) => {
    setSelectedCircle(circle);
    setFormData({
      name: circle.name,
      description: circle.description || '',
      address: circle.address || '',
      city: circle.city || '',
      state: circle.state || '',
      country: circle.country || '',
      postal_code: circle.postal_code || ''
    });
    setShowEditModal(true);
  };

  const columns = [
    {
      title: 'Circle Name',
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
            onClick={() => handleDeleteCircle(row.id)}
            className="p-1.5 rounded text-red-600 hover:text-red-800 hover:bg-red-50"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <Loading />;

  if (!zone) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">Zone not found</p>
          <button
            onClick={() => navigate('/admin/zones')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Zones
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin/zones')}
            className="mr-4 p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            title="Back to Zones"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <MapPinIcon className="h-6 w-6 mr-2" />
              Circle Management
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Managing circles under <span className="font-medium">{zone.name}</span>
            </p>
          </div>
        </div>
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search circles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Add Circle
          </button>
        </div>
      </div>

      {/* Zone Info */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex items-center">
          <BuildingOfficeIcon className="h-8 w-8 text-purple-600 mr-3" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{zone.name}</h2>
            <p className="text-sm text-gray-600">{zone.description || 'No description'}</p>
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <span>{zone.city && `${zone.city}, `}{zone.country}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
        data={filteredCircles}
        emptyMessage="No circles found in this zone"
        className="ring-1 ring-gray-200"
      />

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title={`Add New Circle to ${zone.name}`}
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          handleAddCircle();
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Circle Name</label>
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
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
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
        title="Edit Circle"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          handleEditCircle();
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Circle Name</label>
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
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Update Circle
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}