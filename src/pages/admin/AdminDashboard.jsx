// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import {
  ChartBarIcon,
  TableCellsIcon,
  FunnelIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCharts, setShowCharts] = useState(true);
  const [showTables, setShowTables] = useState(true);
  
  // Data states
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [dateRange, setDateRange] = useState("30"); // days

  const fetchDashboardData = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      else setRefreshing(true);

      const [
        statsRes,
        complaintsRes,
        statusRes,
        categoryRes,
        priorityRes,
        trendsRes,
      ] = await Promise.all([
        API.get("/reports/stats"),
        API.get("/complaints/admin/enhanced"),
        API.get("/reports/by-status"),
        API.get("/reports/by-category"),
        API.get("/reports/by-priority"),
        API.get("/reports/monthly-trends"),
      ]);

      setStats(statsRes.data);
      setComplaints(Array.isArray(complaintsRes.data) ? complaintsRes.data : []);
      setStatusData(Array.isArray(statusRes.data) ? statusRes.data : []);
      setCategoryData(Array.isArray(categoryRes.data) ? categoryRes.data : []);
      setPriorityData(Array.isArray(priorityRes.data) ? priorityRes.data : []);
      
      console.log("Dashboard Data Loaded:", {
        stats: statsRes.data,
        complaintsCount: complaintsRes.data?.length || 0,
        statusDataCount: statusRes.data?.length || 0,
        categoryDataCount: categoryRes.data?.length || 0,
        priorityDataCount: priorityRes.data?.length || 0,
      });
      
      // Format monthly trends
      const formattedTrends = Array.isArray(trendsRes.data)
        ? trendsRes.data.map((item) => ({
            ...item,
            month: new Date(item.month).toLocaleString("default", {
              month: "short",
              year: "numeric",
            }),
          }))
        : [];
      setMonthlyTrends(formattedTrends);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Apply filters
  const filteredComplaints = complaints
    .filter((c) => {
      // Status filter
      if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
      
      // Priority filter
      if (priorityFilter !== "ALL" && c.priority !== priorityFilter) return false;
      
      // Category filter
      if (categoryFilter !== "ALL" && c.category !== categoryFilter) return false;
      
      // Date range filter
      if (dateRange !== "ALL") {
        const daysAgo = parseInt(dateRange);
        const complainDate = new Date(c.created_at);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
        if (complainDate < cutoffDate) return false;
      }
      
      return true;
    })
    .slice(0, 50); // Limit to 50 for performance

  const handleResetFilters = () => {
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setCategoryFilter("ALL");
    setDateRange("30");
  };

  // Export to CSV
  const exportToCSV = () => {
    try {
      // Prepare CSV data
      const headers = ['ID', 'Title', 'Status', 'Priority', 'Category', 'Customer', 'Created Date'];
      const csvRows = [headers.join(',')];

      filteredComplaints.forEach(complaint => {
        const row = [
          complaint.id,
          `"${complaint.title.replace(/"/g, '""')}"`, // Escape quotes
          complaint.status,
          complaint.priority,
          complaint.category,
          `"${complaint.customer_name || 'N/A'}"`,
          new Date(complaint.created_at).toLocaleDateString()
        ];
        csvRows.push(row.join(','));
      });

      // Add summary statistics
      csvRows.push('');
      csvRows.push('SUMMARY STATISTICS');
      csvRows.push(`Total Complaints,${stats?.totalComplaints || 0}`);
      csvRows.push(`Resolved Complaints,${stats?.resolvedComplaints || 0}`);
      csvRows.push(`Avg Resolution Time (hrs),${stats?.avgResolutionTime ? Number(stats.avgResolutionTime).toFixed(2) : '0.00'}`);
      csvRows.push(`Customer Satisfaction,${stats?.customerSatisfaction || 0}%`);

      // Create blob and download
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `dashboard_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Report exported to CSV successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  // Export filtered data to JSON
  const exportToJSON = () => {
    try {
      const exportData = {
        generated: new Date().toISOString(),
        filters: {
          status: statusFilter,
          priority: priorityFilter,
          category: categoryFilter,
          dateRange: dateRange
        },
        statistics: stats,
        complaints: filteredComplaints,
        distributions: {
          status: statusData,
          category: categoryData,
          priority: priorityData
        },
        trends: monthlyTrends
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `dashboard_data_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Data exported to JSON successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN": return "bg-yellow-100 text-yellow-800";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
      case "RESOLVED": return "bg-green-100 text-green-800";
      case "CLOSED": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "CRITICAL": return "bg-red-100 text-red-800";
      case "HIGH": return "bg-orange-100 text-orange-800";
      case "MEDIUM": return "bg-yellow-100 text-yellow-800";
      case "LOW": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Modern Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard Overview</h1>
            <p className="text-blue-100 text-lg">
              Real-time complaint management statistics and insights
            </p>
          </div>
          <button
            onClick={() => fetchDashboardData(false)}
            disabled={refreshing}
            className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 rounded-xl transition-all disabled:opacity-50 font-medium"
          >
            <ArrowPathIcon className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Enhanced Summary Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 text-white transform hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <ChartBarIcon className="h-8 w-8" />
              </div>
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full">All Time</span>
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-2">Total Complaints</h3>
            <p className="text-5xl font-bold mb-2">{stats.totalComplaints || 0}</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="opacity-75">Total cases recorded</span>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 text-white transform hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Success</span>
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-2">Resolved</h3>
            <p className="text-5xl font-bold mb-2">{stats.resolvedComplaints || 0}</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="opacity-75">
                {stats.totalComplaints > 0
                  ? `${((stats.resolvedComplaints / stats.totalComplaints) * 100).toFixed(1)}% success rate`
                  : "0% success rate"}
              </span>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 text-white transform hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Average</span>
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-2">Avg Resolution Time</h3>
            <p className="text-5xl font-bold mb-2">
              {stats.avgResolutionTime ? Number(stats.avgResolutionTime).toFixed(1) : "0.0"}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="opacity-75">hours per case</span>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-pink-500 via-pink-600 to-rose-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 text-white transform hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Rating</span>
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-2">Satisfaction</h3>
            <p className="text-5xl font-bold mb-2">{stats.customerSatisfaction || 0}%</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="opacity-75">Customer rating</span>
            </div>
          </div>
        </div>
      )}

      {/* Modern Filters Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FunnelIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Filters & Controls</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="ALL">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="ALL">All Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="ALL">All Categories</option>
              <option value="PRODUCT_DEFECT">Product Defect</option>
              <option value="SERVICE_ISSUE">Service Issue</option>
              <option value="DELIVERY_PROBLEM">Delivery Problem</option>
              <option value="WARRANTY_CLAIM">Warranty Claim</option>
              <option value="BILLING_DISPUTE">Billing Dispute</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="ALL">All Time</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={handleResetFilters}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all text-sm font-semibold border-2 border-gray-200"
          >
            Reset Filters
          </button>
          <button
            onClick={exportToCSV}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all text-sm font-semibold flex items-center gap-2 shadow-lg"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            Export CSV
          </button>
          <button
            onClick={exportToJSON}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl transition-all text-sm font-semibold flex items-center gap-2 shadow-lg"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            Export JSON
          </button>
          <button
            onClick={() => navigate("/admin/advanced-reports")}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all text-sm font-semibold flex items-center gap-2 shadow-lg"
          >
            <ChartBarIcon className="h-5 w-5" />
            Advanced Reports
          </button>
        </div>
      </div>

      {/* Modern View Toggle */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowTables(!showTables)}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all font-semibold ${
            showTables
              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
              : "bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300"
          }`}
        >
          <TableCellsIcon className="h-5 w-5" />
          {showTables ? "Tables Visible" : "Show Tables"}
        </button>
        <button
          onClick={() => setShowCharts(!showCharts)}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all font-semibold ${
            showCharts
              ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg"
              : "bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300"
          }`}
        >
          <ChartBarIcon className="h-5 w-5" />
          {showCharts ? "Charts Visible" : "Show Charts"}
        </button>
      </div>

      {/* Tables Section */}
      {showTables && (
        <>
          {/* Recent Complaints Table */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Recent Complaints</h3>
                  <p className="text-sm text-gray-600 mt-1">{filteredComplaints.length} results found</p>
                </div>
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  Top 50
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredComplaints.length > 0 ? (
                    filteredComplaints.map((complaint) => (
                      <tr key={complaint.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                          #{complaint.id}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {complaint.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-lg ${getStatusColor(
                              complaint.status
                            )}`}
                          >
                            {complaint.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-lg ${getPriorityColor(
                              complaint.priority
                            )}`}
                          >
                            {complaint.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                          {complaint.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(complaint.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <svg className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-gray-500 font-medium">No complaints found matching the selected filters</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Distribution Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status Distribution Table */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 border-b border-blue-600">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Status Distribution
                </h3>
              </div>
              <div className="p-6">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b-2 border-blue-100">
                      <th className="text-left py-3 text-sm font-bold text-gray-700">Status</th>
                      <th className="text-right py-3 text-sm font-bold text-gray-700">Count</th>
                      <th className="text-right py-3 text-sm font-bold text-gray-700">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusData.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-blue-50 transition-colors">
                        <td className="py-3 text-sm font-semibold text-gray-900">{item.status}</td>
                        <td className="py-3 text-sm text-right font-bold text-blue-600">{item.count}</td>
                        <td className="py-3 text-sm text-right font-medium text-gray-700">
                          {stats?.totalComplaints > 0
                            ? ((item.count / stats.totalComplaints) * 100).toFixed(1)
                            : 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category Distribution Table */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow">
              <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 border-b border-green-600">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Category Distribution
                </h3>
              </div>
              <div className="p-6">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b-2 border-green-100">
                      <th className="text-left py-3 text-sm font-bold text-gray-700">Category</th>
                      <th className="text-right py-3 text-sm font-bold text-gray-700">Count</th>
                      <th className="text-right py-3 text-sm font-bold text-gray-700">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryData.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-green-50 transition-colors">
                        <td className="py-3 text-sm font-semibold text-gray-900">{item.category}</td>
                        <td className="py-3 text-sm text-right font-bold text-green-600">{item.count}</td>
                        <td className="py-3 text-sm text-right font-medium text-gray-700">
                          {stats?.totalComplaints > 0
                            ? ((item.count / stats.totalComplaints) * 100).toFixed(1)
                            : 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Priority Distribution Table */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow">
              <div className="px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 border-b border-purple-600">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Priority Distribution
                </h3>
              </div>
              <div className="p-6">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b-2 border-purple-100">
                      <th className="text-left py-3 text-sm font-bold text-gray-700">Priority</th>
                      <th className="text-right py-3 text-sm font-bold text-gray-700">Count</th>
                      <th className="text-right py-3 text-sm font-bold text-gray-700">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priorityData.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-purple-50 transition-colors">
                        <td className="py-3 text-sm font-semibold text-gray-900">{item.priority}</td>
                        <td className="py-3 text-sm text-right font-bold text-purple-600">{item.count}</td>
                        <td className="py-3 text-sm text-right font-medium text-gray-700">
                          {stats?.totalComplaints > 0
                            ? ((item.count / stats.totalComplaints) * 100).toFixed(1)
                            : 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Charts Section */}
      {showCharts && (
        <>
          {/* Monthly Trends Chart */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Monthly Trends</h3>
                <p className="text-sm text-gray-600">Total vs Resolved complaints over time</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  style={{ fontSize: '12px', fontWeight: '600' }}
                />
                <YAxis 
                  style={{ fontSize: '12px', fontWeight: '600' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: 'none', 
                    borderRadius: '12px', 
                    color: '#fff',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '14px', fontWeight: '600' }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  name="Total Complaints"
                  dot={{ fill: '#3B82F6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10B981"
                  strokeWidth={3}
                  name="Resolved Complaints"
                  dot={{ fill: '#10B981', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Status</h3>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status}: ${count}`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: 'none', 
                      borderRadius: '8px', 
                      color: '#fff' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Category</h3>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="category" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    style={{ fontSize: '10px', fontWeight: '600' }}
                  />
                  <YAxis style={{ fontSize: '12px', fontWeight: '600' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: 'none', 
                      borderRadius: '8px', 
                      color: '#fff' 
                    }}
                  />
                  <Bar dataKey="count" fill="#10B981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Priority Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Priority</h3>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="priority"
                    style={{ fontSize: '12px', fontWeight: '600' }}
                  />
                  <YAxis style={{ fontSize: '12px', fontWeight: '600' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: 'none', 
                      borderRadius: '8px', 
                      color: '#fff' 
                    }}
                  />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
