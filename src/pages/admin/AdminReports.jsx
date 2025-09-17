import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import Loading from '../../components/Loading';
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
  AreaChart,
  Area
} from 'recharts';
import { 
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format, subDays, subMonths } from 'date-fns';

export default function AdminReports() {
  const [reports, setReports] = useState({
    byStatus: [],
    bySupplier: [],
    byProduct: [],
    byCategory: [],
    byLocation: [],
    monthlyTrends: [],
    dailyTrends: [],
    avgResolutionTime: 0,
    userGrowth: []
  });
  const [exportType, setExportType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('30days');
  const [selectedMetric, setSelectedMetric] = useState('complaints');
  const [stats, setStats] = useState({
    totalComplaints: 0,
    resolvedComplaints: 0,
    avgResolutionTime: 0,
    customerSatisfaction: 0,
    trendsData: {
      complaintsChange: 0,
      resolutionChange: 0,
      satisfactionChange: 0,
      timeChange: 0
    }
  });

  useEffect(() => {
    fetchReports();
  }, [dateRange, exportType]);

  const fetchReports = async () => {
    setLoading(true);
    const endpoints = [
      { key: 'byStatus', url: `/reports/by-status?range=${dateRange}`, errorMsg: 'Status report failed' },
      { key: 'bySupplier', url: `/reports/by-supplier?range=${dateRange}`, errorMsg: 'Supplier report failed' },
      { key: 'byProduct', url: `/reports/by-product?range=${dateRange}`, errorMsg: 'Product report failed' },
      { key: 'byCategory', url: `/reports/by-category?range=${dateRange}`, errorMsg: 'Category report failed' },
      { key: 'byLocation', url: `/reports/by-location?range=${dateRange}`, errorMsg: 'Location report failed' },
      { key: 'monthlyTrends', url: `/reports/monthly-trends?range=${dateRange}`, errorMsg: 'Monthly trends failed' },
      { key: 'dailyTrends', url: `/reports/daily-trends?range=${dateRange}`, errorMsg: 'Daily trends failed' },
      { key: 'avgResolutionTime', url: `/reports/avg-resolution-time?range=${dateRange}`, errorMsg: 'Resolution time failed' },
      { key: 'userGrowth', url: `/reports/user-growth?range=${dateRange}`, errorMsg: 'User growth failed' },
      { key: 'stats', url: `/reports/stats?range=${dateRange}`, errorMsg: 'Stats failed' }
    ];

    const newReports = {
      byStatus: [],
      bySupplier: [],
      byProduct: [],
      byCategory: [],
      byLocation: [],
      monthlyTrends: [],
      dailyTrends: [],
      avgResolutionTime: 0,
      userGrowth: []
    };

    const newStats = {
      totalComplaints: 0,
      resolvedComplaints: 0,
      avgResolutionTime: 0,
      customerSatisfaction: 0,
      trendsData: {
        complaintsChange: 0,
        resolutionChange: 0,
        satisfactionChange: 0,
        timeChange: 0
      }
    };

    let hasErrors = false;

    for (const endpoint of endpoints) {
      try {
        const response = await API.get(endpoint.url);
        if (endpoint.key === 'byStatus') newReports.byStatus = response.data || [];
        else if (endpoint.key === 'bySupplier') newReports.bySupplier = response.data || [];
        else if (endpoint.key === 'byProduct') newReports.byProduct = response.data || [];
        else if (endpoint.key === 'byCategory') newReports.byCategory = response.data || [];
        else if (endpoint.key === 'byLocation') newReports.byLocation = response.data || [];
        else if (endpoint.key === 'monthlyTrends') newReports.monthlyTrends = response.data || [];
        else if (endpoint.key === 'dailyTrends') newReports.dailyTrends = response.data || [];
        else if (endpoint.key === 'avgResolutionTime') newReports.avgResolutionTime = response.data?.avg_hours || 0;
        else if (endpoint.key === 'userGrowth') newReports.userGrowth = response.data || [];
        else if (endpoint.key === 'stats') {
          newStats.totalComplaints = response.data?.totalComplaints || 0;
          newStats.resolvedComplaints = response.data?.resolvedComplaints || 0;
          newStats.avgResolutionTime = response.data?.avgResolutionTime || 0;
          newStats.customerSatisfaction = response.data?.customerSatisfaction || 0;
          newStats.trendsData = response.data?.trendsData || newStats.trendsData;
        }
      } catch (err) {
        console.error(`Error fetching ${endpoint.key}:`, err);
        hasErrors = true;
        if (err.response) {
          let msg = endpoint.errorMsg;
          if (err.response.status === 403) msg += ' - Admin access required';
          else if (err.response.status === 404) msg += ' - Endpoint not found';
          else msg += ` - Status: ${err.response.status}`;
          toast.error(msg);
        } else {
          toast.error(`${endpoint.errorMsg} - Network error`);
        }
      }
    }

    setReports(newReports);
    setStats(newStats);

    if (!hasErrors) {
      toast.success('Reports loaded successfully');
      setError(null);
    } else {
      toast('Some reports loaded with partial data', { icon: '⚠️' });
      // Check if all data is empty - global error
      const allEmpty = Object.values(newReports).every(val => Array.isArray(val) ? val.length === 0 : val === 0) &&
                       Object.values(newStats).every(val => typeof val === 'number' ? val === 0 : Object.values(val).every(n => n === 0));
      if (allEmpty) {
        setError('All reports failed to load. Please check your connection and try again.');
      }
    }

    setLoading(false);
  };

  const handleExport = async () => {
    try {
      const response = await API.get(`/reports/export?type=${exportType}&format=csv&range=${dateRange}`, {
        responseType: 'blob'
      });
      if (!response.ok) {
        throw new Error(`Export failed with status: ${response.status}`);
      }
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${exportType}-${dateRange}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Report exported successfully');
    } catch (err) {
      console.error('Export error:', err);
      if (err.response) {
        toast.error(`Export failed: ${err.response.status} - ${err.response.data?.message || 'Server error'}`);
      } else {
        toast.error('Export failed - Network or download error');
      }
    }
  };


  const MetricCard = ({ title, value, change, icon: Icon, color, format = 'number' }) => {
    const formatValue = (val) => {
      switch (format) {
        case 'percentage': return `${val}%`;
        case 'hours': return `${val}h`;
        case 'time': return `${val.toFixed(1)}h`;
        default: return val.toLocaleString();
      }
    };

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{formatValue(value)}</p>
            {change !== undefined && (
              <div className={`inline-flex items-center mt-2 px-2 py-1 rounded-full text-xs font-semibold ${
                change >= 0 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                {change >= 0 ? (
                  <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
                )}
                {Math.abs(change)}%
              </div>
            )}
          </div>
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="h-6 w-6" style={{ color }} />
          </div>
        </div>
      </div>
    );
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading type="spinner" text="Loading reports..." size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Reports</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => { setError(null); fetchReports(); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <ChartBarIcon className="h-8 w-8 mr-3 text-purple-600" />
            Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive insights into your complaint management system
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
          >
            <option value="all">All Complaints</option>
            <option value="status">By Status</option>
            <option value="supplier">By Supplier</option>
            <option value="location">By Location</option>
            <option value="priority">By Priority</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Complaints"
          value={stats.totalComplaints}
          change={stats.trendsData.complaintsChange}
          icon={ExclamationTriangleIcon}
          color="#F59E0B"
        />
        <MetricCard
          title="Resolved Complaints"
          value={stats.resolvedComplaints}
          change={stats.trendsData.resolutionChange}
          icon={CheckCircleIcon}
          color="#10B981"
        />
        <MetricCard
          title="Avg Resolution Time"
          value={stats.avgResolutionTime}
          change={stats.trendsData.timeChange}
          icon={ClockIcon}
          color="#6366F1"
          format="time"
        />
        <MetricCard
          title="Customer Satisfaction"
          value={stats.customerSatisfaction}
          change={stats.trendsData.satisfactionChange}
          icon={UserGroupIcon}
          color="#EC4899"
          format="percentage"
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Complaints Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Daily Complaints Trend</h3>
          </div>
          {reports.dailyTrends.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <ArrowTrendingDownIcon className="h-12 w-12 mb-4 opacity-50" />
              <h4 className="text-lg font-medium mb-2">No daily data available</h4>
              <p className="text-sm text-gray-400">Try adjusting the date range to see trends</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={reports.dailyTrends}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Complaints by Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Complaints by Status</h3>
            <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          {reports.byStatus.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <FunnelIcon className="h-12 w-12 mb-4 opacity-50" />
              <h4 className="text-lg font-medium mb-2">No status data available</h4>
              <p className="text-sm text-gray-400">No complaints found for the selected period</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reports.byStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, value, percent }) =>
                    `${status}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {reports.byStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Suppliers by Complaints */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Top Suppliers by Complaints</h3>
          </div>
          {reports.bySupplier.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <UserGroupIcon className="h-12 w-12 mb-4 opacity-50" />
              <h4 className="text-lg font-medium mb-2">No supplier data available</h4>
              <p className="text-sm text-gray-400">No supplier-related complaints found</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reports.bySupplier.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="supplier_name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Monthly Resolution Trends */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Monthly Resolution Trends</h3>
          </div>
          {reports.monthlyTrends.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <CalendarIcon className="h-12 w-12 mb-4 opacity-50" />
              <h4 className="text-lg font-medium mb-2">No monthly data available</h4>
              <p className="text-sm text-gray-400">No trends found for the selected range</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reports.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  name="Total Complaints"
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10B981"
                  strokeWidth={3}
                  name="Resolved"
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Locations by Complaints */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Top Locations by Complaints</h3>
          </div>
          {reports.byLocation.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <ExclamationTriangleIcon className="h-12 w-12 mb-4 opacity-50" />
              <h4 className="text-lg font-medium mb-2">No location data available</h4>
              <p className="text-sm text-gray-400">No location-specific complaints found</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reports.byLocation.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="location_name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Top Products by Complaints */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Top Products by Complaints</h3>
          <div className="space-y-4">
            {reports.byProduct.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ChartBarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h4 className="text-lg font-medium mb-2">No product data available</h4>
                <p className="text-sm text-gray-400">No product-related complaints found</p>
              </div>
            ) : (
              reports.byProduct.slice(0, 8).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{product.product_name}</p>
                      <p className="text-sm text-gray-500">{product.category || 'General'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{product.count}</p>
                    <p className="text-sm text-gray-500">complaints</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Complaint Categories */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Complaint Categories</h3>
          <div className="space-y-4">
            {reports.byCategory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FunnelIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h4 className="text-lg font-medium mb-2">No category data available</h4>
                <p className="text-sm text-gray-400">No categorized complaints found</p>
              </div>
            ) : (
              reports.byCategory.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm font-medium text-gray-900">
                      {category.category || 'General'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-3">{category.count}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${(category.count / Math.max(...reports.byCategory.map(c => c.count || 1))) * 100}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-3">
              <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
              <h4 className="font-semibold text-gray-900">Resolution Rate</h4>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {stats.totalComplaints > 0 
                ? Math.round((stats.resolvedComplaints / stats.totalComplaints) * 100)
                : 0}%
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {stats.resolvedComplaints} out of {stats.totalComplaints} complaints resolved
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-3">
              <ClockIcon className="h-6 w-6 text-blue-500 mr-2" />
              <h4 className="font-semibold text-gray-900">Response Time</h4>
            </div>
            <p className="text-2xl font-bold text-blue-600">{reports.avgResolutionTime.toFixed(1)}h</p>
            <p className="text-sm text-gray-600 mt-1">Average time to resolve complaints</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-3">
              <UserGroupIcon className="h-6 w-6 text-purple-500 mr-2" />
              <h4 className="font-semibold text-gray-900">Customer Growth</h4>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              +{stats.trendsData.complaintsChange || 0}%
            </p>
            <p className="text-sm text-gray-600 mt-1">Growth in customer engagement</p>
          </div>
        </div>
      </div>
    </div>
  );
}
