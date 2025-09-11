import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import DataTable from '../../components/DataTable';
import Loading from '../../components/Loading';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { 
  UserGroupIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon, 
  ClockIcon,
  ArrowTrendingUpIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function AdminHome() {
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [reports, setReports] = useState({
    byStatus: [],
    bySupplier: [],
    byProduct: [],
    avgResolutionTime: 0,
    monthlyTrends: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchComplaints(),
        fetchReports()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await API.get("/complaints/admin/enhanced");
      setComplaints(res.data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    }
  };

  const fetchReports = async () => {
    try {
      const [statusRes, supplierRes, productRes, avgRes, trendsRes] = await Promise.all([
        API.get("/reports/by-status"),
        API.get("/reports/by-supplier"),
        API.get("/reports/by-product"),
        API.get("/reports/avg-resolution-time"),
        API.get("/reports/monthly-trends")
      ]);
      setReports({
        byStatus: statusRes.data,
        bySupplier: supplierRes.data,
        byProduct: productRes.data,
        avgResolutionTime: avgRes.data?.avg_hours || 0,
        monthlyTrends: trendsRes.data
      });
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change, link }) => (
    <div className="card-simple card-hover relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: color }}></div>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <div className={`inline-flex items-center mt-2 px-2 py-1 rounded-full text-xs font-semibold ${
              change > 0 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              <ArrowTrendingUpIcon className={`h-3 w-3 mr-1 ${
                change < 0 ? 'transform rotate-180' : ''
              }`} />
              {change > 0 ? '+' : ''}{change}%
            </div>
          )}
          {link && (
            <Link 
              to={link} 
              className="inline-flex items-center mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View Details →
            </Link>
          )}
        </div>
        <div 
          className="p-4 rounded-xl shadow-sm"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="h-8 w-8" style={{ color }} />
        </div>
      </div>
    </div>
  );

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading type="spinner" text="Loading dashboard data..." size="lg" />
      </div>
    );
  }

  const recentUsers = users.slice(0, 5);
  const recentComplaints = complaints.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-10 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-lg text-gray-600">Comprehensive overview of your complaint management system</p>
          </div>
          <div className="hidden md:flex space-x-3">
            <button className="btn-secondary btn-sm">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Report
            </button>
            <Link to="/admin/users" className="btn-primary btn-sm">
              <PlusIcon className="h-4 w-4 mr-2" />
              Manage Users
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={users.length}
          icon={UserGroupIcon}
          color="#3B82F6"
          change={12}
          link="/admin/users"
        />
        <StatCard
          title="Total Complaints"
          value={complaints.length}
          icon={ExclamationTriangleIcon}
          color="#F59E0B"
          change={-5}
          link="/admin/complaints"
        />
        <StatCard
          title="Pending Approvals"
          value={users.filter(u => u.status === 'PENDING').length}
          icon={ClockIcon}
          color="#EF4444"
          link="/admin/users"
        />
        <StatCard
          title="Avg Resolution Time"
          value={`${reports.avgResolutionTime.toFixed(1)}h`}
          icon={ArrowTrendingUpIcon}
          color="#10B981"
          change={8}
          link="/admin/reports"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 animate-slide-in">
        {/* Complaints by Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Complaints by Status</h3>
            <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reports.byStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, total }) => `${status}: ${total}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="total"
              >
                {reports.byStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trends */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Monthly Trends</h3>
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reports.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Overview Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Recent Users</h3>
              <p className="text-gray-600 mt-1">Latest user registrations</p>
            </div>
            <Link 
              to="/admin/users" 
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {recentUsers.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <span className={`status-badge status-${user.status?.toLowerCase()}`}>
                  {user.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Recent Complaints</h3>
              <p className="text-gray-600 mt-1">Latest complaints submitted</p>
            </div>
            <Link 
              to="/admin/complaints" 
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {recentComplaints.map((complaint, index) => (
              <div key={complaint.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 truncate">{complaint.title}</p>
                  <p className="text-sm text-gray-500">
                    {complaint.customer_name} • {complaint.created_at ? format(new Date(complaint.created_at), 'MMM dd') : 'N/A'}
                  </p>
                </div>
                <span className={`status-badge status-${complaint.status?.toLowerCase()}`}>
                  {complaint.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
