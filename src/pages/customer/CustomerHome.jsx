import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import Loading from '../../components/Loading';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function CustomerHome() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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
      const res = await API.get("/complaints/me/list");
      setComplaints(res.data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    }
  };

  const getDate = (date) => (date ? format(new Date(date), 'MMM dd, yyyy') : 'N/A');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading type="spinner" text="Loading dashboard..." size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Complaints</h1>
          <div className="flex space-x-3">
            <div className="w-72">
              <input
                type="text"
                className="input-field"
                placeholder="Search by title or status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <a href="/customer/create" className="btn-primary px-4 py-2">
              Create Complaint
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {complaints.length === 0 ? (
          <div className="text-center py-16">
            <ExclamationTriangleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No complaints found</p>
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
                  <div>
                    <p className="font-medium text-gray-900">{c.title}</p>
                    <p className="text-sm text-gray-500">Created {getDate(c.created_at)}</p>
                  </div>
                  <span className={`status-badge status-${c.status?.toLowerCase()}`}>{c.status}</span>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
