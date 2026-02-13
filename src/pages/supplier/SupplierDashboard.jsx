import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Loading from '../../components/Loading';
import { Link } from 'react-router-dom';
import {
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

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
        avgResolutionTime: avgRes.data.avg_hours,
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Bank Officer Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Overview of complaints and reports for your assigned zone
        </p>
      </div>

      {location && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">Assigned Zone: {location.name}</h2>
          <p className="text-blue-700 dark:text-blue-300">{location.city}, {location.state}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Complaints</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{reports.stats.totalComplaints || 0}</p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <ExclamationTriangleIcon className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Open</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{reports.stats.openComplaints || 0}</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <ClockIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Resolved</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{reports.stats.resolvedComplaints || 0}</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg Resolution</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{Math.round(reports.avgResolutionTime || 0)}h</p>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <ArrowTrendingUpIcon className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Satisfaction</p>
              <p className="text-3xl font-bold text-teal-600 mt-2">{reports.stats.customerSatisfaction || 0}%</p>
            </div>
            <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
              <ChartBarIcon className="h-8 w-8 text-teal-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/supplier/complaints"
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow text-white"
        >
          <ExclamationTriangleIcon className="h-10 w-10 mb-4" />
          <h3 className="text-xl font-bold mb-2">Manage Complaints</h3>
          <p className="text-purple-100">View and respond to complaints in your zone</p>
        </Link>

        <Link
          to="/supplier/reports"
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow text-white"
        >
          <ChartBarIcon className="h-10 w-10 mb-4" />
          <h3 className="text-xl font-bold mb-2">View Reports</h3>
          <p className="text-blue-100">Analyze complaint trends and metrics</p>
        </Link>

        <Link
          to="/supplier/profile"
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow text-white"
        >
          <CheckCircleIcon className="h-10 w-10 mb-4" />
          <h3 className="text-xl font-bold mb-2">My Profile</h3>
          <p className="text-green-100">Update your information</p>
        </Link>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Complaint Status Overview</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {reports.status.map((item) => (
              <div key={item.status} className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.count}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{item.status.replace('_', ' ')}</p>
                <div className={`mt-2 h-2 rounded-full bg-${item.status.toLowerCase()}-200`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Complaint Trends</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {reports.monthlyTrends.map((item) => (
              <div key={item.month} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.month}</span>
                <div className="flex-1 mx-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(item.total / Math.max(...reports.monthlyTrends.map(t => t.total), 1)) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
