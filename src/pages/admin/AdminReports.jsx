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
    monthlyTrends: [],
    dailyTrends: [],
    avgResolutionTime: 0,
    userGrowth: []
  });
  const [loading, setLoading] = useState(true);
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
  }, [dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [
        statusRes,
        supplierRes,
        productRes,
        categoryRes,
        monthlyRes,
        dailyRes,
        avgRes,
        userGrowthRes,
        statsRes
      ] = await Promise.all([
        API.get(`/reports/by-status?range=${dateRange}`),
        API.get(`/reports/by-supplier?range=${dateRange}`),
        API.get(`/reports/by-product?range=${dateRange}`),
        API.get(`/reports/by-category?range=${dateRange}`),
        API.get(`/reports/monthly-trends?range=${dateRange}`),
        API.get(`/reports/daily-trends?range=${dateRange}`),
        API.get(`/reports/avg-resolution-time?range=${dateRange}`),
        API.get(`/reports/user-growth?range=${dateRange}`),
        API.get(`/reports/stats?range=${dateRange}`)
      ]);

      setReports({
        byStatus: statusRes.data || [],
        bySupplier: supplierRes.data || [],
        byProduct: productRes.data || [],
        byCategory: categoryRes.data || [],
        monthlyTrends: monthlyRes.data || [],
        dailyTrends: dailyRes.data || [],
        avgResolutionTime: avgRes.data?.avg_hours || 0,
        userGrowth: userGrowthRes.data || []
      });

      setStats({
        totalComplaints: statsRes.data?.totalComplaints || 0,
        resolvedComplaints: statsRes.data?.resolvedComplaints || 0,
        avgResolutionTime: statsRes.data?.avgResolutionTime || 0,
        customerSatisfaction: statsRes.data?.customerSatisfaction || 0,
        trendsData: statsRes.data?.trendsData || {
          complaintsChange: 0,
          resolutionChange: 0,
          satisfactionChange: 0,
          timeChange: 0
        }
      });
    } catch (err) {
      console.error('Error fetching reports:', err);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      const response = await API.get(`/reports/export?format=${format}&range=${dateRange}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `complaints_report_${dateRange}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (err) {
      console.error('Error exporting report:', err);
      toast.error('Failed to export report');
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
          <div className="flex space-x-2">
            <button
              onClick={() => exportReport('pdf')}
              className="btn-secondary btn-sm"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export PDF
            </button>
            <button
              onClick={() => exportReport('excel')}
              className="btn-primary btn-sm"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export Excel
            </button>
          </div>
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
            <h3 className="text-xl font-bold text-gray-900">Complaints Trend</h3>
            <select
              className="text-sm border border-gray-200 rounded px-3 py-1 focus:border-blue-500"
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
            >
              <option value="complaints">Complaints</option>
              <option value="resolved">Resolved</option>
              <option value="users">New Users</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={reports.dailyTrends}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey={selectedMetric}
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Complaints by Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
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
                label={({ status, value, percent }) => 
                  `${status}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
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

        {/* Top Suppliers by Complaints */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Top Suppliers by Complaints</h3>
          </div>
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
              <Bar dataKey="total_complaints" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Resolution Trends */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Monthly Resolution Trends</h3>
          </div>
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
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Top Products by Complaints */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Top Products by Complaints</h3>
          <div className="space-y-4">
            {reports.byProduct.slice(0, 8).map((product, index) => (
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
                  <p className="text-sm font-medium text-gray-900">{product.total}</p>
                  <p className="text-sm text-gray-500">complaints</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Complaint Categories */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Complaint Categories</h3>
          <div className="space-y-4">
            {reports.byCategory.map((category, index) => (
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
                  <span className="text-sm text-gray-500 mr-3">{category.total}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${(category.total / Math.max(...reports.byCategory.map(c => c.total))) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
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
