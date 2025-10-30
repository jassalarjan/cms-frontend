// src/pages/admin/AdminHome.jsx
import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import DataTable from "../../components/DataTable";
import Loading from "../../components/Loading";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  UserGroupIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export default function AdminHome() {
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [reports, setReports] = useState({
    stats: {},
    byStatus: [],
    monthlyTrends: [],
    dailyTrends: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchUsers(), fetchComplaints(), fetchReports()]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await API.get("/complaints/admin/enhanced");
      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    }
  };

  const fetchReports = async () => {
    try {
      const [statsRes, monthlyRes, dailyRes, statusRes] = await Promise.all([
        API.get("/reports/stats"),
        API.get("/reports/monthly-trends"),
        API.get("/reports/daily-trends"),
        API.get("/reports/by-status"),
      ]);


      // Format monthly trends
      const formattedTrends = Array.isArray(monthlyRes.data)
        ? monthlyRes.data.map((item) => ({
            ...item,
            month: new Date(item.month).toLocaleString("default", {
              month: "short",
              year: "numeric",
            }),
          }))
        : [];

      setReports({
        stats: statsRes.data || {},
        byStatus: Array.isArray(statusRes.data) ? statusRes.data : [],
        monthlyTrends: formattedTrends,
        dailyTrends: Array.isArray(dailyRes.data) ? dailyRes.data : [],
      });
    } catch (err) {
      console.error("Error fetching reports:", err);
      setReports({
        stats: {},
        byStatus: [],
        monthlyTrends: [],
        dailyTrends: [],
      });
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change, link }) => (
    <div className="card-simple card-hover relative overflow-hidden">
      <div
        className="absolute top-0 left-0 w-1 h-full"
        style={{ backgroundColor: color }}
      ></div>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <div
              className={`inline-flex items-center mt-2 px-2 py-1 rounded-full text-xs font-semibold ${
                change > 0
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              <ArrowTrendingUpIcon
                className={`h-3 w-3 mr-1 ${
                  change < 0 ? "transform rotate-180" : ""
                }`}
              />
              {change > 0 ? "+" : ""}
              {change}%
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

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Comprehensive overview of your complaint management system
            </p>
          </div>
          <div className="hidden md:flex space-x-3">
              
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
          value={users.filter((u) => u.status === "PENDING").length}
          icon={ClockIcon}
          color="#EF4444"
          link="/admin/users"
        />
        <StatCard
          title="Avg Resolution Time"
          value={`${reports.stats.avgResolutionTime?.toFixed(1) || '0.0'}h`}
          icon={ArrowTrendingUpIcon}
          color="#10B981"
          change={8}
          link="/admin/reports"
        />
      </div>

      {/* Main Reports Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 animate-slide-in">
        {/* Complaints by Status - Bar Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Complaints by Status
            </h3>
            <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            {reports.byStatus.length > 0 ? (
              <BarChart data={reports.byStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="status"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [value, "Total Complaints"]}
                  labelFormatter={(label) => `Status: ${label}`}
                />
                <Bar
                  dataKey="count"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                >
                  {reports.byStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No status data available
              </div>
            )}
          </ResponsiveContainer>
        </div>

        {/* Monthly Trends - Enhanced */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Monthly Trends</h3>
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            {reports.monthlyTrends.length > 0 ? (
              <LineChart data={reports.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [value, name === 'total' ? 'Total Complaints' : 'Resolved Complaints']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  name="Total Complaints"
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10B981"
                  strokeWidth={3}
                  name="Resolved Complaints"
                  dot={{ fill: "#10B981", strokeWidth: 2, r: 5 }}
                />
                <Legend />
              </LineChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No monthly data available
              </div>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Complaint Reports */}
      <div className="grid grid-cols-1 gap-8">
        {/* Daily Trends */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Daily Trends</h3>
              <p className="text-gray-600 mt-1">Daily complaint patterns</p>
            </div>
            <Link
              to="/admin/reports"
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              View Details →
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            {reports.dailyTrends.length > 0 ? (
              <LineChart data={reports.dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [value, name === 'total' ? 'Total Complaints' : name === 'resolved' ? 'Resolved' : name === 'open' ? 'Open' : 'In Progress']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Total"
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Resolved"
                  dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="open"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  name="Open"
                  dot={{ fill: "#F59E0B", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="in_progress"
                  stroke="#EF4444"
                  strokeWidth={2}
                  name="In Progress"
                  dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
                />
                <Legend />
              </LineChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No daily data available
              </div>
            )}
          </ResponsiveContainer>
        </div>

        {/* Stats Summary */}
         <div className="card">
           <div className="flex items-center justify-between mb-6">
             <div>
               <h3 className="text-xl font-bold text-gray-900">Resolution Stats</h3>
               <p className="text-gray-600 mt-1">Key performance metrics</p>
             </div>
             <Link
               to="/admin/reports"
               className="text-blue-600 hover:text-blue-800 font-medium text-sm"
             >
               View Details →
             </Link>
           </div>
           <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
               <div>
                 <p className="text-sm text-gray-600">Total Complaints</p>
                 <p className="text-2xl font-bold text-blue-600">{reports.stats.totalComplaints || 0}</p>
               </div>
               <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                 <ExclamationTriangleIcon className="h-6 w-6 text-blue-600" />
               </div>
             </div>
             <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
               <div>
                 <p className="text-sm text-gray-600">Resolved Complaints</p>
                 <p className="text-2xl font-bold text-green-600">{reports.stats.resolvedComplaints || 0}</p>
               </div>
               <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                 <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
               </div>
             </div>
             <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
               <div>
                 <p className="text-sm text-gray-600">Customer Satisfaction</p>
                 <p className="text-2xl font-bold text-purple-600">{reports.stats.customerSatisfaction || 0}%</p>
               </div>
               <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                 <UserGroupIcon className="h-6 w-6 text-purple-600" />
               </div>
             </div>
           </div>
         </div>
      </div>
    </div>
  );
}
