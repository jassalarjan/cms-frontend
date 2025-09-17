import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import API from '../../api/axios';
import Loading from '../../components/Loading';
import Timeline from '../../components/Timeline';
import { ExclamationTriangleIcon, ClockIcon, CheckIcon, EyeIcon, DocumentIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function SupplierHome() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [updatingId, setUpdatingId] = useState(null); // Track complaint being updated
  const [location, setLocation] = useState(null);
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 });
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewComplaint, setViewComplaint] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token is missing. Please log in again.');
        window.location.href = '/login';
        return;
      }

      const userResponse = await API.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!userResponse.data?.location_id) {
        toast.error('No location assigned. Please contact administrator.');
        return;
      }

      const locationResponse = await API.get(`/locations/${userResponse.data.location_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLocation(locationResponse.data);

      await fetchComplaints(token);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
      } else {
        console.error('Error fetching data:', err);
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaints = async (token) => {
    try {
      const res = await API.get('/complaints/supplier/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(res.data.data || []);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    }
  };
  
  useEffect(() => {
    const total = complaints.length;
    const open = complaints.filter(c => c.status === 'OPEN').length;
    const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS').length;
    const resolved = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
    setStats({ total, open, inProgress, resolved });
  }, [complaints]);

  const updateComplaintStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      await API.put(`/complaints/${id}/status`, { status });
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c))
      );
      toast.success(`Status updated to ${status}`);
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const sendResponse = async () => {
    if (!selectedComplaint || !responseText.trim()) {
      return toast.error('Please enter a response');
    }
    try {
      setUpdatingId(selectedComplaint.id);
      await API.post(`/complaints/${selectedComplaint.id}/responses`, {
        message: responseText,
      });
      toast.success('Response sent');
      setResponseText('');
      setShowResponseModal(false);
    } catch (err) {
      console.error('Error sending response:', err);
      toast.error('Failed to send response');
    } finally {
      setUpdatingId(null);
    }
  };
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'RESOLVED':
      case 'CLOSED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const viewComplaintDetails = async (id) => {
    setViewLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await API.get(`/complaints/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setViewComplaint(res.data);
      setShowViewModal(true);
    } catch (err) {
      console.error('Error fetching complaint details:', err);
      toast.error('Failed to load complaint details');
    } finally {
      setViewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading type="spinner" text="Loading dashboard..." size="lg" />
      </div>
    );
  }

  const recentComplaints = complaints.slice(0, 5);
  const filteredComplaints = complaints.filter((c) =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.status?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Location Complaints
            </h1>
            {location && (
              <p className="text-gray-600 mt-1">
                Assigned Location:{' '}
                <span className="font-medium">{location.name}</span>
              </p>
            )}
          </div>
          <div className="w-72">
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              placeholder="Search by title or status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <ClockIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Complaints</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open</p>
              <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <ClockIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CheckIcon className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="bg-white rounded-lg shadow border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Complaints</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentComplaints.map((c) => (
                <tr key={c.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.complaint_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.customer_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      c.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                      c.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {c.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {recentComplaints.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No recent complaints
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {filteredComplaints.length === 0 ? (
          <div className="text-center py-16">
            <ExclamationTriangleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No complaints found</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredComplaints.map((c) => (
              <li
                key={c.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="min-w-0 flex items-center gap-3">
                  <span className="font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded text-sm min-w-max">
                    {c.complaint_id}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900 truncate">
                      {c.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      Customer: {c.customer_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    className="text-xs border border-gray-200 rounded px-2 py-1 focus:border-green-500"
                    value={c.status}
                    disabled={updatingId === c.id}
                    onChange={(e) =>
                      updateComplaintStatus(c.id, e.target.value)
                    }
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                  <button
                    onClick={() => {
                      setSelectedComplaint(c);
                      setShowResponseModal(true);
                    }}
                    className="px-3 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
                    disabled={updatingId === c.id}
                  >
                    Respond
                  </button>
                  <button
                    onClick={() => viewComplaintDetails(c.id)}
                    className="px-3 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-100 flex items-center gap-1"
                    disabled={viewLoading || updatingId === c.id}
                  >
                    <EyeIcon className="h-4 w-4" />
                    View
                  </button>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(c.status)}`}>
                    {c.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Respond to: {selectedComplaint.title}
            </h3>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              rows={5}
              placeholder="Write your response..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100"
                onClick={() => setShowResponseModal(false)}
                disabled={updatingId === selectedComplaint.id}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                onClick={sendResponse}
                disabled={
                  updatingId === selectedComplaint.id || !responseText.trim()
                }
              >
                {updatingId === selectedComplaint.id
                  ? 'Sending...'
                  : 'Send Response'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Complaint Modal */}
      {showViewModal && viewComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 overflow-y-auto p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Complaint Details - {viewComplaint.complaint_id || viewComplaint.id}
                  </h3>
                  <p className="text-gray-600 mt-1">{viewComplaint.title || 'N/A'}</p>
                </div>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewComplaint(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={viewLoading}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {viewLoading ? (
                <Loading type="spinner" text="Loading details..." size="md" />
              ) : (
                <>
                  {/* Complaint Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusClass(viewComplaint.status || 'OPEN')} `}>
                        {viewComplaint.status || 'Unknown'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Priority</h4>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                        viewComplaint.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                        viewComplaint.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {viewComplaint.priority || 'Low'}
                      </span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Name:</span> {viewComplaint.customer?.name || viewComplaint.customer_name || 'N/A'}</p>
                      {viewComplaint.customer?.email && <p><span className="font-medium">Email:</span> {viewComplaint.customer.email}</p>}
                      {viewComplaint.customer?.phone && <p><span className="font-medium">Phone:</span> {viewComplaint.customer.phone}</p>}
                      {(!viewComplaint.customer?.email && viewComplaint.customer_email) && <p><span className="font-medium">Email:</span> {viewComplaint.customer_email}</p>}
                      {(!viewComplaint.customer?.phone && viewComplaint.customer_phone) && <p><span className="font-medium">Phone:</span> {viewComplaint.customer_phone}</p>}
                    </div>
                  </div>

                  {/* Description */}
                  {viewComplaint.description && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Description</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{viewComplaint.description}</p>
                    </div>
                  )}

                  {/* Location and Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Location</h4>
                      <p className="text-gray-700">{viewComplaint.location?.name || viewComplaint.location_name || location?.name || 'N/A'}</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Dates</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Created:</span> {viewComplaint.created_at ? new Date(viewComplaint.created_at).toLocaleString() : 'N/A'}</p>
                        {viewComplaint.updated_at && <p><span className="font-medium">Updated:</span> {new Date(viewComplaint.updated_at).toLocaleString()}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Responses / Timeline */}
                  {viewComplaint.responses?.length > 0 && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Responses</h4>
                      <Timeline
                        events={viewComplaint.responses.map(r => ({
                          id: r.id || `response-${Math.random()}`,
                          type: 'response',
                          message: r.message || r.content || 'Response added',
                          created_at: r.created_at || r.timestamp,
                          user_type: r.sender_type || r.user_type || 'supplier',
                          user_name: r.sender_name || r.user_name || 'Supplier',
                        }))}
                      />
                    </div>
                  )}

                  {/* Attachments */}
                  {viewComplaint.attachments?.length > 0 && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Attachments</h4>
                      <div className="flex flex-wrap gap-2">
                        {viewComplaint.attachments.map((file) => (
                          <a
                            key={file.id || file.filename}
                            href={file.url || file.path || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                          >
                            <DocumentIcon className="h-4 w-4 mr-1" />
                            {file.filename || file.name || 'Attachment'}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
