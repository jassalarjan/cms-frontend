import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';

export default function PanelManagementPage() {
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchPanels();
  }, []);

  const fetchPanels = async () => {
    try {
      setLoading(true);
      const response = await API.get('/panels');
      if (response.data.success) {
        setPanels(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching panels:', error);
      toast.error('Failed to fetch panel registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (panel) => {
    try {
      const response = await API.get(`/panels/${panel.id}`);
      if (response.data.success) {
        setSelectedPanel(response.data.data);
        setShowDetails(true);
      }
    } catch (error) {
      console.error('Error fetching panel details:', error);
      toast.error('Failed to fetch panel details');
    }
  };

  const handleStatusChange = async (panelId, newStatus) => {
    try {
      await API.patch(`/panels/${panelId}/status`, { status: newStatus });
      toast.success('Status updated successfully');
      fetchPanels();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const columns = [
    { key: 'registration_id', label: 'Registration ID', sortable: true },
    { key: 'customer_name', label: 'Customer', sortable: true },
    { key: 'panel_model', label: 'Panel Model', sortable: true },
    { key: 'panel_capacity', label: 'Capacity', sortable: true },
    { key: 'serial_number', label: 'Serial Number', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { 
      key: 'created_at', 
      label: 'Registered', 
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => handleViewDetails(row)}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          View Details
        </button>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Panel Registrations
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage all registered solar panel systems
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Panels</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{panels.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {panels.filter(p => p.status === 'ACTIVE').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {panels.filter(p => p.status === 'PENDING').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Expired</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {panels.filter(p => p.status === 'EXPIRED').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <DataTable
          data={panels}
          columns={columns}
          searchable
          searchPlaceholder="Search by registration ID, customer, model..."
        />
      </div>

      {/* Details Modal */}
      {showDetails && selectedPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Panel Details
              </h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Registration Info */}
              <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Registration Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Registration ID</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedPanel.registration_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedPanel.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      selectedPanel.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      selectedPanel.status === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedPanel.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Customer Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedPanel.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Customer Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedPanel.customer_email}</p>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="bg-green-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Panel Type</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedPanel.panel_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Model</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedPanel.panel_model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Capacity</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedPanel.panel_capacity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Serial Number</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedPanel.serial_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manufacturer</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedPanel.manufacturer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Warranty Period</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedPanel.warranty_period ? `${selectedPanel.warranty_period} months` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Installation Info */}
              {selectedPanel.installation_address && (
                <div className="bg-purple-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Installation Location</h3>
                  <p className="text-gray-900 dark:text-white">
                    {selectedPanel.installation_address}, {selectedPanel.installation_city}, {selectedPanel.installation_state} {selectedPanel.installation_postal_code}
                  </p>
                </div>
              )}

              {/* Notes */}
              {selectedPanel.notes && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes</h3>
                  <p className="text-gray-900 dark:text-white">{selectedPanel.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
