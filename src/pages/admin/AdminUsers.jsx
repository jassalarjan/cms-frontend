import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';
import { 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'CUSTOMER',
    phone: '',
    address: '',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // Role filter
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
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
      await API.post(`/admin/users/${userId}/approve`);
      setUsers(users.map(u => u.user_id === userId ? { ...u, status: 'ACTIVE' } : u));
      toast.success('User approved successfully');
    } catch (err) {
      console.error('Error approving user:', err);
      toast.error('Failed to approve user');
    }
  };

  const rejectUser = async (userId, reason) => {
    try {
      await API.post(`/admin/users/${userId}/reject`, { reason });
      setUsers(users.map(u => u.user_id === userId ? { ...u, status: 'REJECTED' } : u));
      toast.success('User rejected successfully');
    } catch (err) {
      console.error('Error rejecting user:', err);
      toast.error('Failed to reject user');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await API.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u.user_id !== userId));
      toast.success('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Failed to delete user');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/admin/users', formData);
      setUsers([...users, res.data]);
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        role: 'CUSTOMER',
        phone: '',
        address: '',
        password: ''
      });
      toast.success('User added successfully');
    } catch (err) {
      console.error('Error adding user:', err);
      toast.error('Failed to add user');
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      
      const res = await API.patch(`/admin/users/${selectedUser.user_id}`, updateData);
      setUsers(users.map(u => u.user_id === selectedUser.user_id ? res.data : u));
      setShowEditModal(false);
      setSelectedUser(null);
      toast.success('User updated successfully');
    } catch (err) {
      console.error('Error updating user:', err);
      toast.error('Failed to update user');
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'CUSTOMER',
      phone: user.phone || '',
      address: user.address || '',
      password: ''
    });
    setShowEditModal(true);
  };

  const userColumns = [
    {
      key: 'name',
      title: 'Name',
      render: (value, item) => (
        <div className="flex items-center">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
            {value?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{item.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Role',
      render: (value) => (
        <span className={`status-badge ${
          value === 'ADMIN' ? 'bg-purple-100 text-purple-800 border-purple-200' :
          value === 'SUPPLIER' ? 'bg-blue-100 text-blue-800 border-blue-200' :
          'bg-green-100 text-green-800 border-green-200'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <span className={`status-badge status-${value?.toLowerCase()}`}>
          {value}
        </span>
      )
    },
    {
      key: 'phone',
      title: 'Phone',
      render: (value) => value || 'N/A'
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
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(item);
            }}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Edit User"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          {item.status === 'PENDING' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  approveUser(item.user_id);
                }}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Approve"
              >
                <CheckCircleIcon className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  rejectUser(item.user_id);
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                item.status === 'ACTIVE' 
                  ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              {item.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteUser(item.user_id);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete User"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  const UserForm = ({ onSubmit, title, isEdit = false }) => (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
            type="text"
            required
            className="input-field"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Enter full name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            required
            className="input-field"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="Enter email address"
            disabled={isEdit}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <select
            className="input-field"
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
          >
            <option value="CUSTOMER">Customer</option>
            <option value="SUPPLIER">Supplier</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            className="input-field"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="Enter phone number"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <textarea
            className="input-field"
            rows={3}
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            placeholder="Enter address"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isEdit ? 'Password (leave blank to keep current)' : 'Password'}
          </label>
          <input
            type="password"
            className="input-field"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            placeholder={isEdit ? "Enter new password" : "Enter password"}
            required={!isEdit}
          />
        </div>
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading type="spinner" text="Loading users..." size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <UserGroupIcon className="h-8 w-8 mr-3 text-blue-600" />
            User Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage users, approve registrations, and control access permissions
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-orange-600">
                {users.filter(u => u.status === 'PENDING').length}
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-green-600">
                {users.filter(u => u.status === 'ACTIVE').length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive Users</p>
              <p className="text-2xl font-bold text-red-600">
                {users.filter(u => u.status === 'INACTIVE').length}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <XCircleIcon className="h-6 w-6 text-red-600" />
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
              placeholder="Search users by name or email..."
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
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="PENDING">Pending</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPPLIER">Supplier</option>
              <option value="CUSTOMER">Customer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable
          data={filteredUsers}
          columns={userColumns}
          loading={loading}
          pagination
          pageSize={15}
          emptyMessage="No users found"
          className="rounded-xl"
        />
      </div>

      {/* User Details Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title="User Details"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900">{selectedUser.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <span className={`status-badge ${
                  selectedUser.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                  selectedUser.role === 'SUPPLIER' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedUser.role}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`status-badge status-${selectedUser.status?.toLowerCase()}`}>
                  {selectedUser.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <p className="text-gray-900">{selectedUser.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <p className="text-gray-900">
                  {selectedUser.created_at ? format(new Date(selectedUser.created_at), 'PPP') : 'N/A'}
                </p>
              </div>
            </div>
            {selectedUser.address && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <p className="text-gray-900">{selectedUser.address}</p>
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

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New User"
        size="xl"
      >
        <UserForm onSubmit={handleAddUser} title="Add User" />
        <Modal.Footer>
          <button
            onClick={() => setShowAddModal(false)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleAddUser}
            className="btn-primary"
          >
            Add User
          </button>
        </Modal.Footer>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
        size="xl"
      >
        <UserForm onSubmit={handleEditUser} title="Edit User" isEdit={true} />
        <Modal.Footer>
          <button
            onClick={() => setShowEditModal(false)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleEditUser}
            className="btn-primary"
          >
            Update User
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
