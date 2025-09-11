import React, { useState } from 'react';
import API from '../../api/axios';
import Loading from '../../components/Loading';

export default function TrackComplaint() {
  const [complaintId, setComplaintId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!complaintId.trim()) {
      setError('Please enter a complaint ID');
      return;
    }
    setLoading(true);
    try {
      const res = await API.get(`/complaints/${complaintId.trim()}`);
      setResult(res.data);
    } catch (err) {
      setError('Complaint not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Track Complaint</h1>
        <p className="text-gray-600 mb-4">Enter your complaint ID to view its current status.</p>
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={complaintId}
            onChange={(e) => setComplaintId(e.target.value)}
            placeholder="Enter Complaint ID"
            className="flex-1 input-field"
          />
          <button type="submit" className="btn-primary">
            {loading ? <Loading type="spinner" size="sm" text="" /> : 'Track'}
          </button>
        </form>
        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
      </div>

      {result && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Complaint Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">ID</span>
              <span className="text-gray-900 font-medium">#{result.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Title</span>
              <span className="text-gray-900 font-medium">{result.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className={`status-badge status-${result.status?.toLowerCase()}`}>{result.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Created</span>
              <span className="text-gray-900">{result.created_at?.slice(0, 10)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


