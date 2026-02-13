import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  RectangleGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

export default function AdminPanels() {
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchPanels();
  }, [statusFilter]);

  const fetchPanels = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/panels?status=${statusFilter}` : '/panels';
      const response = await API.get(url);
      setPanels(response.data.data || []);
    } catch (error) {
      console.error('Error fetching panels:', error);
      toast.error('Failed to load panel registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (panel) => {
    setSelectedPanel(panel);
    setShowDetailsModal(true);
  };

  const handleStatusUpdate = async (panelId, newStatus) => {
    try {
      await API.patch(`/panels/${panelId}/status`, { status: newStatus });
      toast.success('Panel status updated successfully');
      fetchPanels();
    } catch (error) {
      console.error('Error updating panel status:', error);
      toast.error('Failed to update panel status');
    }
  };

  const filteredPanels = panels.filter(panel => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      panel.registration_id?.toLowerCase().includes(searchLower) ||
      panel.customer_name?.toLowerCase().includes(searchLower) ||
      panel.panel_model?.toLowerCase().includes(searchLower) ||
      panel.serial_number?.toLowerCase().includes(searchLower) ||
      panel.manufacturer?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800 border-green-200',
      INACTIVE: 'bg-gray-100 text-gray-800 border-gray-200',
      MAINTENANCE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      DECOMMISSIONED: 'bg-red-100 text-red-800 border-red-200',
    };
    const icons = {
      ACTIVE: <CheckCircleIcon className="h-4 w-4 mr-1" />,
      INACTIVE: <XCircleIcon className="h-4 w-4 mr-1" />,
      MAINTENANCE: <ClockIcon className="h-4 w-4 mr-1" />,
      DECOMMISSIONED: <XCircleIcon className="h-4 w-4 mr-1" />,
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.INACTIVE}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  const columns = [
    {
      key: 'registration_id',
      label: 'Registration ID',
      render: (value) => (
        <span className="font-mono font-semibold text-blue-600">{value}</span>
      ),
    },
    {
      key: 'customer_name',
      label: 'Customer',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">{row.customer_email}</div>
        </div>
      ),
    },
    {
      key: 'panel_model',
      label: 'Panel Details',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">{row.panel_type} - {row.panel_capacity}</div>
        </div>
      ),
    },
    {
      key: 'serial_number',
      label: 'Serial Number',
      render: (value) => (
        <span className="font-mono text-sm text-gray-700">{value}</span>
      ),
    },
    {
      key: 'manufacturer',
      label: 'Manufacturer',
    },
    {
      key: 'installation_date',
      label: 'Installation',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A',
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => handleViewDetails(row)}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
        >
          <EyeIcon className="h-4 w-4" />
          View
        </button>
      ),
    },
  ];

  const stats = [
    {
      label: 'Total Panels',
      value: panels.length,
      icon: RectangleGroupIcon,
      bgColor: 'bg-blue-500',
    },
    {
      label: 'Active',
      value: panels.filter(p => p.status === 'ACTIVE').length,
      icon: CheckCircleIcon,
      bgColor: 'bg-green-500',
    },
    {
      label: 'Maintenance',
      value: panels.filter(p => p.status === 'MAINTENANCE').length,
      icon: ClockIcon,
      bgColor: 'bg-yellow-500',
    },
    {
      label: 'Inactive',
      value: panels.filter(p => p.status === 'INACTIVE').length,
      icon: XCircleIcon,
      bgColor: 'bg-gray-500',
    },
  ];

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel Registrations</h1>
          <p className="mt-1 text-sm text-gray-600">
            View and manage all solar panel registrations
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} rounded-lg p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by registration ID, customer, model, serial number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="DECOMMISSIONED">Decommissioned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <DataTable
          data={filteredPanels}
          columns={columns}
          emptyMessage="No panel registrations found"
        />
      </div>

      {/* Details Modal */}
      {selectedPanel && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedPanel(null);
          }}
          title="Panel Registration Details"
        >
          <div className="space-y-6">
            {/* Registration ID */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-sm text-gray-600 mb-1">Registration ID</div>
              <div className="text-2xl font-bold font-mono text-blue-700">
                {selectedPanel.registration_id}
              </div>
            </div>

            {/* Customer Information */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-gray-500" />
                Customer Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Name</div>
                  <div className="font-medium text-gray-900">{selectedPanel.customer_name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-medium text-gray-900">{selectedPanel.customer_email}</div>
                </div>
                {selectedPanel.customer_phone && (
                  <div>
                    <div className="text-sm text-gray-600">Phone</div>
                    <div className="font-medium text-gray-900">{selectedPanel.customer_phone}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Panel Information */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <RectangleGroupIcon className="h-5 w-5 mr-2 text-gray-500" />
                Panel Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Model</div>
                  <div className="font-medium text-gray-900">{selectedPanel.panel_model}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Type</div>
                  <div className="font-medium text-gray-900">{selectedPanel.panel_type}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Capacity</div>
                  <div className="font-medium text-gray-900">{selectedPanel.panel_capacity}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Serial Number</div>
                  <div className="font-medium font-mono text-gray-900">{selectedPanel.serial_number}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Manufacturer</div>
                  <div className="font-medium text-gray-900">{selectedPanel.manufacturer}</div>
                </div>
                {selectedPanel.manufacturing_date && (
                  <div>
                    <div className="text-sm text-gray-600">Manufacturing Date</div>
                    <div className="font-medium text-gray-900">
                      {new Date(selectedPanel.manufacturing_date).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Installation Details */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-gray-500" />
                Installation Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {selectedPanel.installation_date && (
                  <div>
                    <div className="text-sm text-gray-600">Installation Date</div>
                    <div className="font-medium text-gray-900">
                      {new Date(selectedPanel.installation_date).toLocaleDateString()}
                    </div>
                  </div>
                )}
                {selectedPanel.warranty_period && (
                  <div>
                    <div className="text-sm text-gray-600">Warranty Period</div>
                    <div className="font-medium text-gray-900">{selectedPanel.warranty_period} months</div>
                  </div>
                )}
                {selectedPanel.installation_address && (
                  <div className="col-span-2">
                    <div className="text-sm text-gray-600">Installation Address</div>
                    <div className="font-medium text-gray-900">
                      {selectedPanel.installation_address}
                      {selectedPanel.installation_city && `, ${selectedPanel.installation_city}`}
                      {selectedPanel.installation_state && `, ${selectedPanel.installation_state}`}
                      {selectedPanel.installation_postal_code && ` ${selectedPanel.installation_postal_code}`}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* System Integrator */}
            {selectedPanel.integrator_name && (
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 mr-2 text-gray-500" />
                  System Integrator
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Name</div>
                    <div className="font-medium text-gray-900">{selectedPanel.integrator_name}</div>
                  </div>
                  {selectedPanel.integrator_company && (
                    <div>
                      <div className="text-sm text-gray-600">Company</div>
                      <div className="font-medium text-gray-900">{selectedPanel.integrator_company}</div>
                    </div>
                  )}
                  {selectedPanel.integrator_phone && (
                    <div>
                      <div className="text-sm text-gray-600">Phone</div>
                      <div className="font-medium text-gray-900">{selectedPanel.integrator_phone}</div>
                    </div>
                  )}
                  {selectedPanel.integrator_email && (
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <div className="font-medium text-gray-900">{selectedPanel.integrator_email}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Details */}
            {(selectedPanel.inverter_model || selectedPanel.battery_model || selectedPanel.total_system_capacity) && (
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedPanel.inverter_model && (
                    <div>
                      <div className="text-sm text-gray-600">Inverter Model</div>
                      <div className="font-medium text-gray-900">{selectedPanel.inverter_model}</div>
                    </div>
                  )}
                  {selectedPanel.inverter_serial && (
                    <div>
                      <div className="text-sm text-gray-600">Inverter Serial</div>
                      <div className="font-medium font-mono text-gray-900">{selectedPanel.inverter_serial}</div>
                    </div>
                  )}
                  {selectedPanel.battery_model && (
                    <div>
                      <div className="text-sm text-gray-600">Battery Model</div>
                      <div className="font-medium text-gray-900">{selectedPanel.battery_model}</div>
                    </div>
                  )}
                  {selectedPanel.battery_serial && (
                    <div>
                      <div className="text-sm text-gray-600">Battery Serial</div>
                      <div className="font-medium font-mono text-gray-900">{selectedPanel.battery_serial}</div>
                    </div>
                  )}
                  {selectedPanel.total_system_capacity && (
                    <div>
                      <div className="text-sm text-gray-600">Total System Capacity</div>
                      <div className="font-medium text-gray-900">{selectedPanel.total_system_capacity}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status Update */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Update Status</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Status: {getStatusBadge(selectedPanel.status)}
                  </label>
                  <select
                    onChange={(e) => handleStatusUpdate(selectedPanel.id, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    defaultValue={selectedPanel.status}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="DECOMMISSIONED">Decommissioned</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedPanel.notes && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedPanel.notes}</p>
              </div>
            )}

            {/* Timestamps */}
            <div className="text-xs text-gray-500 pt-4 border-t">
              <div>Registered: {new Date(selectedPanel.created_at).toLocaleString()}</div>
              <div>Last Updated: {new Date(selectedPanel.updated_at).toLocaleString()}</div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
