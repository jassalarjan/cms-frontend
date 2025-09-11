import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';
import { 
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [response, setResponse] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const statusOptions = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    filterComplaints();
  }, [complaints, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await API.get("/complaints/admin/enhanced");
      setComplaints(res.data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const filterComplaints = () => {
    let filtered = complaints;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(complaint => 
        complaint.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(complaint => complaint.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'ALL') {
      filtered = filtered.filter(complaint => complaint.priority === priorityFilter);
    }

    // Category filter
    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter(complaint => complaint.category === categoryFilter);
    }

    setFilteredComplaints(filtered);
  };

  const updateComplaintStatus = async (complaintId, status) => {
    try {
      await API.put(`/complaints/${complaintId}/status`, { status });
      setComplaints(complaints.map(c => 
        c.id === complaintId ? { ...c, status } : c
      ));
      toast.success(`Complaint status updated to ${status}`);
    } catch (err) {
      console.error('Error updating complaint status:', err);
      toast.error('Failed to update complaint status');
    }
  };

  const deleteComplaint = async (complaintId) => {
    if (!window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
      return;
    }

    try {
      await API.delete(`/complaints/${complaintId}`);
      setComplaints(complaints.filter(c => c.id !== complaintId));
      toast.success('Complaint deleted successfully');
    } catch (err) {
      console.error('Error deleting complaint:', err);
      toast.error('Failed to delete complaint');
    }
  };

  const handleResponse = async () => {
    if (!response.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      await API.post(`/complaints/${selectedComplaint.id}/responses`, {
        message: response
      });

      if (newStatus) await updateComplaintStatus(selectedComplaint.id, newStatus);

      setShowResponseModal(false);
      setResponse('');
      setNewStatus('');
      toast.success('Response sent successfully');
    } catch (err) {
      console.error('Error sending response:', err);
      toast.error('Failed to send response');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const complaintColumns = [
    {
      key: 'id',
      title: 'ID',
      render: (value) => `#${value}`
    },
    {
      key: 'title',
      title: 'Title',
      render: (value, item) => (
        <div>
          <div className="font-medium text-gray-900 truncate max-w-xs">{value}</div>
          <div className="text-sm text-gray-500">
            {item.customer_name}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <span className={`status-badge ${getStatusColor(value)}`}>
          {value?.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'priority',
      title: 'Priority',
      render: (value) => (
        <span className={`status-badge ${getPriorityColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'category',
      title: 'Category',
      render: (value) => value || 'General'
    },
    {
      key: 'created_at',
      title: 'Created',
      render: (value) => value ? format(new Date(value), 'MMM dd, yyyy') : 'N/A'
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, item) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedComplaint(item);
              setShowComplaintModal(true);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedComplaint(item);
              setNewStatus('');
              setShowResponseModal(true);
            }}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Respond"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
          </button>
          <select
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              updateComplaintStatus(item.id, e.target.value);
            }}
            value={item.status}
            className="text-xs border border-gray-200 rounded px-2 py-1 focus:border-blue-500"
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </select>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteComplaint(item.id);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Complaint"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading type="spinner" text="Loading complaints..." size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 mr-3 text-orange-600" />
            Complaints Management
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor, respond to, and resolve customer complaints efficiently
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Complaints</p>
              <p className="text-2xl font-bold text-gray-900">{complaints.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open</p>
              <p className="text-2xl font-bold text-blue-600">
                {complaints.filter(c => c.status === 'OPEN').length}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">
                {complaints.filter(c => c.status === 'IN_PROGRESS').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">
                {complaints.filter(c => c.status === 'RESOLVED').length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search complaints by subject, customer, or product..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="ALL">All Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable
          data={filteredComplaints}
          columns={complaintColumns}
          loading={loading}
          pagination
          pageSize={15}
          emptyMessage="No complaints found"
          className="rounded-xl"
        />
      </div>

      {/* Complaint Details Modal */}
      <Modal
        isOpen={showComplaintModal}
        onClose={() => setShowComplaintModal(false)}
        title="Complaint Details"
        size="xl"
      >
        {selectedComplaint && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Complaint ID</label>
                <p className="text-gray-900">#{selectedComplaint.complaint_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <p className="text-gray-900">{selectedComplaint.customer_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <p className="text-gray-900">{selectedComplaint.product_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <p className="text-gray-900">{selectedComplaint.supplier_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`status-badge ${getStatusColor(selectedComplaint.status)}`}>
                  {selectedComplaint.status?.replace('_', ' ')}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <span className={`status-badge ${getPriorityColor(selectedComplaint.priority)}`}>
                  {selectedComplaint.priority}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <p className="text-gray-900">{selectedComplaint.category || 'General'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <p className="text-gray-900">
                  {selectedComplaint.created_at ? format(new Date(selectedComplaint.created_at), 'PPP') : 'N/A'}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <p className="text-gray-900">{selectedComplaint.subject}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900 whitespace-pre-wrap">{selectedComplaint.description}</p>
              </div>
            </div>
            {selectedComplaint.admin_response && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Response</label>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedComplaint.admin_response}</p>
                </div>
              </div>
            )}
          </div>
        )}
        <Modal.Footer>
          <button
            onClick={() => setShowComplaintModal(false)}
            className="btn-secondary"
          >
            Close
          </button>
          <button
            onClick={() => {
              setShowComplaintModal(false);
              setShowResponseModal(true);
            }}
            className="btn-primary"
          >
            Respond
          </button>
        </Modal.Footer>
      </Modal>

      {/* Response Modal */}
      <Modal
        isOpen={showResponseModal}
        onClose={() => setShowResponseModal(false)}
        title="Respond to Complaint"
        size="lg"
      >
        {selectedComplaint && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900">#{selectedComplaint.complaint_id} - {selectedComplaint.subject}</h4>
              <p className="text-sm text-gray-600 mt-1">
                From: {selectedComplaint.customer_name} • Product: {selectedComplaint.product_name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Response</label>
              <textarea
                className="input-field"
                rows={6}
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Enter your response to the customer..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Update Status (Optional)</label>
              <select
                className="input-field"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="">Keep current status ({selectedComplaint.status?.replace('_', ' ')})</option>
                {statusOptions.filter(s => s !== selectedComplaint.status).map(status => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        <Modal.Footer>
          <button
            onClick={() => setShowResponseModal(false)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleResponse}
            className="btn-primary"
            disabled={!response.trim()}
          >
            Send Response
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
