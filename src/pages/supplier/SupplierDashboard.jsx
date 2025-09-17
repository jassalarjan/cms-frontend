import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Loading from '../../components/Loading';

const SupplierDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState({
    status: [],
    monthlyTrends: [],
    avgResolutionTime: 0,
    stats: {}
  });
  const [location, setLocation] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [userRes, statusRes, trendsRes, avgRes, statsRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/reports/by-status'),
        api.get('/reports/monthly-trends'),
        api.get('/reports/avg-resolution-time'),
        api.get('/reports/stats')
      ]);

      // Fetch location
      if (userRes.data.location_id) {
        const locationRes = await api.get(`/locations/${userRes.data.location_id}`);
        setLocation(locationRes.data);
      }

      setReports({
        status: statusRes.data,
        monthlyTrends: trendsRes.data,
        avgResolutionTime: avgRes.data.avg_resolution_time_hours,
        stats: statsRes.data
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Location Reports</h1>
      {location && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">Location: {location.name}</h2>
          <p className="text-blue-700">{location.city}, {location.state}</p>
        </div>
      )}

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-600">Total Complaints</p>
          <p className="text-3xl font-bold text-gray-900">{reports.stats.total_complaints}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-600">Open Complaints</p>
          <p className="text-3xl font-bold text-red-600">{reports.stats.open_complaints}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-600">Total Users</p>
          <p className="text-3xl font-bold text-gray-900">{reports.stats.total_users}</p>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Status Breakdown</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {reports.status.map((item) => (
              <div key={item.status} className="text-center">
                <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                <p className="text-sm text-gray-600 capitalize">{item.status}</p>
                <div className={`mt-2 h-2 rounded-full bg-${item.status.toLowerCase()}-200`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trends Bar Chart (Simple Tailwind bars) */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Complaint Trends</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {reports.monthlyTrends.map((item) => (
              <div key={item.month} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{item.month}</span>
                <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(item.count / Math.max(...reports.monthlyTrends.map(t => t.count), 1)) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Average Resolution Time */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Average Resolution Time</h3>
        </div>
        <div className="p-6">
          <p className="text-3xl font-bold text-gray-900">{Math.round(reports.avgResolutionTime)} hours</p>
          <p className="text-sm text-gray-600 mt-2">Average time to resolve complaints</p>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
