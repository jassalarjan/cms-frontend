import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import Loading from '../../components/Loading';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon,
  PlusCircleIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format, isToday, isYesterday, subDays } from 'date-fns';
import { Link } from 'react-router-dom';

export default function CustomerHome() {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    totalComplaints: 0,
    openComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
    avgResponseTime: 0
  });
  const [chartData, setChartData] = useState({
    monthlyTrend: [],
    statusDistribution: []
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchComplaints(),
        fetchChartData(),
        fetchRecentActivity()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await API.get("/customer/complaints");
      setComplaints(res.data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    }
  };

  const fetchChartData = async () => {
    try {
      const [trendRes, statusRes] = await Promise.all([
        API.get("/customer/reports/monthly-trend"),
        API.get("/customer/reports/status-distribution")
      ]);
      
      setChartData({
        monthlyTrend: trendRes.data || [],
        statusDistribution: statusRes.data || []
      });
    } catch (err) {
      console.error('Error fetching chart data:', err);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const res = await API.get("/customer/activity/recent");
      setRecentActivity(res.data || []);
    } catch (err) {
      console.error('Error fetching recent activity:', err);
    }
  };

  useEffect(() => {
    if (complaints.length > 0) {
      setStats({
        totalComplaints: complaints.length,
        openComplaints: complaints.filter(c => c.status === 'OPEN').length,
        inProgressComplaints: complaints.filter(c => c.status === 'IN_PROGRESS').length,
        resolvedComplaints: complaints.filter(c => c.status === 'RESOLVED').length,
        avgResponseTime: complaints.length > 0 
          ? complaints.reduce((acc, c) => acc + (c.response_time || 0), 0) / complaints.length 
          : 0
      });
    }
  }, [complaints]);

  const StatCard = ({ title, value, icon: Icon, color, subtitle, link, trend }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`inline-flex items-center mt-2 px-2 py-1 rounded-full text-xs font-semibold ${
              trend > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              <ArrowTrendingUpIcon className={`h-3 w-3 mr-1 ${
                trend < 0 ? 'transform rotate-180' : ''
              }`} />
              {Math.abs(trend)}% vs last month
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
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
      </div>
    </div>
  );

  const getTimeAgo = (date) => {
    const now = new Date();
    const then = new Date(date);
    
    if (isToday(then)) return 'Today';
    if (isYesterday(then)) return 'Yesterday';
    
    const days = Math.floor((now - then) / (1000 * 60 * 60 * 24));
    if (days <= 7) return `${days} days ago`;
    
    return format(then, 'MMM dd, yyyy');
  };

  const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading type="spinner" text="Loading dashboard..." size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back!</h1>
            <p className="text-lg text-gray-600">Track your complaints and get support when you need it</p>
          </div>
          <div className="hidden md:flex space-x-3">
            <Link to="/customer/complaints" className="btn-secondary btn-sm">
              <EyeIcon className="h-4 w-4 mr-2" />
              View All
            </Link>
            <Link to="/customer/complaints/new" className="btn-primary btn-sm">
              <PlusCircleIcon className="h-4 w-4 mr-2" />
              New Complaint
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Complaints"
          value={stats.totalComplaints}
          icon={ExclamationTriangleIcon}
          color="#6366F1"
          subtitle="All time"
          link="/customer/complaints"
          trend={5}
        />
        <StatCard
          title="Open Issues"
          value={stats.openComplaints}
          icon={ClockIcon}
          color="#F59E0B"
          subtitle="Awaiting response"
          link="/customer/complaints?status=OPEN"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgressComplaints}
          icon={ChatBubbleLeftRightIcon}
          color="#3B82F6"
          subtitle="Being resolved"
          link="/customer/complaints?status=IN_PROGRESS"
        />
        <StatCard
          title="Resolved"
          value={stats.resolvedComplaints}
          icon={CheckCircleIcon}
          color="#10B981"
          subtitle="Successfully closed"
          link="/customer/complaints?status=RESOLVED"
          trend={12}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Quick Actions</h3>
            <p className="text-gray-600 mt-1">Get things done faster with these shortcuts</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/customer/complaints/new"
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <PlusCircleIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-gray-900">Submit New Complaint</h4>
                <p className="text-sm text-gray-600">Report an issue or concern</p>
              </div>
            </div>
          </Link>
          
          <Link
            to="/customer/messages"
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-gray-900">Check Messages</h4>
                <p className="text-sm text-gray-600">View responses and updates</p>
              </div>
            </div>
          </Link>
          
          <Link
            to="/customer/history"
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                <ClockIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-gray-900">View History</h4>
                <p className="text-sm text-gray-600">See all past complaints</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Your Activity Trend</h3>
            <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="complaints" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Complaint Status</h3>
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.statusDistribution}
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
                {chartData.statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity and Complaints */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recent Complaints */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Recent Complaints</h3>
              <p className="text-gray-600 mt-1">Your latest submissions</p>
            </div>
            <Link 
              to="/customer/complaints" 
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {complaints.slice(0, 5).map((complaint) => (
              <div key={complaint.complaint_id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 truncate">{complaint.subject}</p>
                  <p className="text-sm text-gray-500">
                    {complaint.product_name} • {getTimeAgo(complaint.created_at)}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <span className={`status-badge ${
                    complaint.status === 'OPEN' ? 'status-open' :
                    complaint.status === 'IN_PROGRESS' ? 'status-in-progress' :
                    complaint.status === 'RESOLVED' ? 'status-resolved' :
                    'status-closed'
                  }`}>
                    {complaint.status?.replace('_', ' ')}
                  </span>
                  {complaint.priority && (
                    <p className="text-xs text-gray-500 mt-1">{complaint.priority} priority</p>
                  )}
                </div>
              </div>
            ))}
            {complaints.length === 0 && (
              <div className="text-center py-8">
                <ExclamationTriangleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No complaints yet</p>
                <Link to="/customer/complaints/new" className="btn-primary btn-sm mt-4">
                  Submit Your First Complaint
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
              <p className="text-gray-600 mt-1">Latest updates and responses</p>
            </div>
          </div>
          <div className="space-y-4">
            {recentActivity.slice(0, 6).map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                  activity.type === 'response' ? 'bg-green-100' :
                  activity.type === 'status_change' ? 'bg-blue-100' :
                  'bg-gray-100'
                }`}>
                  {activity.type === 'response' ? (
                    <ChatBubbleLeftRightIcon className="h-4 w-4 text-green-600" />
                  ) : activity.type === 'status_change' ? (
                    <ClockIcon className="h-4 w-4 text-blue-600" />
                  ) : (
                    <ExclamationTriangleIcon className="h-4 w-4 text-gray-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{getTimeAgo(activity.created_at)}</p>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-gray-600 mb-6">Our support team is here to assist you</p>
          <div className="flex justify-center space-x-4">
            <button className="btn-secondary">
              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
              Live Chat
            </button>
            <button className="btn-primary">
              <PlusCircleIcon className="h-4 w-4 mr-2" />
              Submit Complaint
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
