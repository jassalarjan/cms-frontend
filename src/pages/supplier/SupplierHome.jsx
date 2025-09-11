import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import Loading from '../../components/Loading';
import { ExclamationTriangleIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
// (duplicate Link import removed)

export default function SupplierHome() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await fetchComplaints();
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await API.get("/complaints/supplier/list");
      setComplaints(res.data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    }
  };

  const updateComplaintStatus = async (id, status) => {
    try {
      setUpdating(true);
      await API.put(`/complaints/${id}/status`, { status });
      setComplaints(prev => prev.map(c => (c.id === id ? { ...c, status } : c)));
      toast.success(`Status updated to ${status}`);
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const sendResponse = async () => {
    if (!selectedComplaint || !responseText.trim()) {
      return toast.error('Please enter a response');
    }
    try {
      setUpdating(true);
      await API.post(`/complaints/${selectedComplaint.id}/responses`, { message: responseText });
      toast.success('Response sent');
      setResponseText('');
      setShowResponseModal(false);
    } catch (err) {
      console.error('Error sending response:', err);
      toast.error('Failed to send response');
    } finally {
      setUpdating(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading type="spinner" text="Loading dashboard..." size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Complaint Management</h1>
          <div className="w-72">
            <input
              type="text"
              className="input-field"
              placeholder="Search by title or status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="mb-4">
        <Link to="/supplier/create" className="btn-primary btn-sm inline-flex items-center">
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Complaint
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {complaints.length === 0 ? (
          <div className="text-center py-16">
            <ExclamationTriangleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No complaints assigned to you</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {complaints
              .filter(c => 
                c.title?.toLowerCase().includes(search.toLowerCase()) ||
                c.status?.toLowerCase().includes(search.toLowerCase())
              )
              .map((c) => (
                <li key={c.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{c.title}</p>
                    <p className="text-sm text-gray-500">Customer: {c.customer_name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      className="text-xs border border-gray-200 rounded px-2 py-1 focus:border-green-500"
                      value={c.status}
                      disabled={updating}
                      onChange={(e) => updateComplaintStatus(c.id, e.target.value)}
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                    <button
                      onClick={() => { setSelectedComplaint(c); setShowResponseModal(true); }}
                      className="btn-secondary btn-sm"
                      disabled={updating}
                    >
                      Respond
                    </button>
                    <span className={`status-badge status-${c.status?.toLowerCase()}`}>{c.status}</span>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>

      {showResponseModal && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Respond to: {selectedComplaint.title}</h3>
            <textarea
              className="input-field w-full"
              rows={5}
              placeholder="Write your response..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setShowResponseModal(false)} disabled={updating}>Cancel</button>
              <button className="btn-primary" onClick={sendResponse} disabled={updating || !responseText.trim()}>
                {updating ? 'Sending...' : 'Send Response'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
