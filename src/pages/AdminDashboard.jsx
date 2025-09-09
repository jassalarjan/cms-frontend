import React, { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import Loading from "../components/Loading";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { 
  UserGroupIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon, 
  ClockIcon,
  ArrowTrendingUpIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminDashboard() {
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
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalComplaints: 0,
    pendingApprovals: 0,
    resolvedComplaints: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchComplaints(),
        fetchReports(),
        fetchStats()
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
      const res = await API.get("/complaints-enhanced");
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

  const fetchStats = async () => {
    try {
      setStats({
        totalUsers: users.length,
        totalComplaints: complaints.length,
        pendingApprovals: users.filter(u => u.status === 'PENDING').length,
        resolvedComplaints: complaints.filter(c => c.status === 'RESOLVED').length
      });
    } catch (err) {
      console.error('Error calculating stats:', err);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await API.patch(`/admin/users/${id}/status`, { status: newStatus });
      setUsers(users.map((u) => (u.user_id === id ? { ...u, status: newStatus } : u)));
      toast.success(`User ${newStatus.toLowerCase()} successfully`);
    } catch (err) {
      console.error('Error updating user status:', err);
      toast.error("Failed to update user status");
    }
  };

  const approveUser = async (userId) => {
    try {
      await API.patch(`/admin/users/${userId}/status`, { status: 'ACTIVE' });
      setUsers(users.map(u => u.user_id === userId ? { ...u, status: 'ACTIVE' } : u));
      toast.success('User approved successfully');
    } catch (err) {
      console.error('Error approving user:', err);
      toast.error('Failed to approve user');
    }
  };

  const rejectUser = async (userId) => {
    try {
      await API.patch(`/admin/users/${userId}/status`, { status: 'INACTIVE' });
      setUsers(users.map(u => u.user_id === userId ? { ...u, status: 'INACTIVE' } : u));
      toast.success('User rejected successfully');
    } catch (err) {
      console.error('Error rejecting user:', err);
      toast.error('Failed to reject user');
    }
  };

  const userColumns = [
    {
      key: 'name',
      title: 'Name',
      render: (value, item) => (
        <div className="flex items-center">
          <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
            {value?.charAt(0)?.toUpperCase()}
          </div>
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    { key: 'email', title: 'Email' },
    {
      key: 'role',
      title: 'Role',
      render: (value) => (
        <span className={`status-badge ${
          value === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
          value === 'SUPPLIER' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <span className={`status-badge status-${value.toLowerCase()}`}>
          {value}
        </span>
      )
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
              setSelectedUser(item);
              setShowUserModal(true);
            }}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="View Details"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          {item.status === 'PENDING' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  approveUser(item.user_id);
                }}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
                title="Approve"
              >
                <CheckCircleIcon className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  rejectUser(item.user_id);
                }}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                title="Reject"
              >
                <XCircleIcon className="h-4 w-4" />
              </button>
            </>
          )}
          {item.status !== 'PENDING' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleStatus(item.user_id, item.status);
              }}
              className={`px-2 py-1 text-xs rounded ${
                item.status === 'ACTIVE' 
                  ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              {item.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            </button>
          )}
        </div>
      )
    }
  ];

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
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
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <Loading type="spinner" text="Loading dashboard data..." size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <button className="btn-primary btn-sm">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add User
              </button>
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
          />
          <StatCard
            title="Total Complaints"
            value={complaints.length}
            icon={ExclamationTriangleIcon}
            color="#F59E0B"
            change={-5}
          />
          <StatCard
            title="Pending Approvals"
            value={users.filter(u => u.status === 'PENDING').length}
            icon={ClockIcon}
            color="#EF4444"
          />
          <StatCard
            title="Avg Resolution Time"
            value={`${reports.avgResolutionTime.toFixed(1)}h`}
            icon={ArrowTrendingUpIcon}
            color="#10B981"
            change={8}
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
                  label={({ status, value }) => `${status}: ${value}`}
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

        {/* Reports by Supplier and Product */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Complaints by Supplier</h3>
              <div className="h-3 w-3 bg-purple-500 rounded-full animate-pulse"></div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reports.bySupplier}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="supplier_name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_complaints" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Complaints by Product</h3>
              <div className="h-3 w-3 bg-orange-500 rounded-full animate-pulse"></div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reports.byProduct}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product_name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Management Table */}
        <div className="mb-10 animate-fade-in">
          <div className="card">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">User Management</h3>
                <p className="text-gray-600 mt-1">Manage users, approve registrations, and control access</p>
              </div>
              <div className="flex space-x-3">
                <button className="btn-secondary btn-sm">
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter Users
                </button>
                <button className="btn-primary btn-sm">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Invite User
                </button>
              </div>
            </div>
            
            {/* Enhanced DataTable */}
            <div className="-m-6">
              <DataTable
                data={users}
                columns={userColumns}
                loading={loading}
                searchable
                sortable
                pagination
                pageSize={10}
                emptyMessage="No users found"
                className="rounded-t-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title="User Details"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{selectedUser.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <span className={`status-badge ${
                  selectedUser.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                  selectedUser.role === 'SUPPLIER' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedUser.role}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`status-badge status-${selectedUser.status?.toLowerCase()}`}>
                  {selectedUser.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-sm text-gray-900">{selectedUser.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Created</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedUser.created_at ? format(new Date(selectedUser.created_at), 'PPP') : 'N/A'}
                </p>
              </div>
            </div>
            {selectedUser.address && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <p className="mt-1 text-sm text-gray-900">{selectedUser.address}</p>
              </div>
            )}
          </div>
        )}
        <Modal.Footer>
          <button
            onClick={() => setShowUserModal(false)}
            className="btn-secondary"
          >
            Close
          </button>
          {selectedUser?.status === 'PENDING' && (
            <>
              <button
                onClick={() => {
                  approveUser(selectedUser.user_id);
                  setShowUserModal(false);
                }}
                className="btn-success"
              >
                Approve User
              </button>
              <button
                onClick={() => {
                  rejectUser(selectedUser.user_id);
                  setShowUserModal(false);
                }}
                className="btn-danger"
              >
                Reject User
              </button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
