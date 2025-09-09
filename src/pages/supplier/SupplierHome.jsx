import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import Loading from '../../components/Loading';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts';
import { 
  ShoppingBagIcon, 
  ExclamationTriangleIcon, 
  ChartBarIcon, 
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function SupplierHome() {
  const [products, setProducts] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalComplaints: 0,
    openComplaints: 0,
    resolvedComplaints: 0,
    avgResolutionTime: 0
  });
  const [chartData, setChartData] = useState({
    monthlyComplaints: [],
    productPerformance: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProducts(),
        fetchComplaints(),
        fetchChartData()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await API.get("/supplier/products");
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await API.get("/supplier/complaints");
      setComplaints(res.data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    }
  };

  const fetchChartData = async () => {
    try {
      const [monthlyRes, performanceRes] = await Promise.all([
        API.get("/supplier/reports/monthly-complaints"),
        API.get("/supplier/reports/product-performance")
      ]);
      
      setChartData({
        monthlyComplaints: monthlyRes.data || [],
        productPerformance: performanceRes.data || []
      });
    } catch (err) {
      console.error('Error fetching chart data:', err);
    }
  };

  useEffect(() => {
    if (products.length || complaints.length) {
      setStats({
        totalProducts: products.length,
        activeProducts: products.filter(p => p.status === 'ACTIVE').length,
        totalComplaints: complaints.length,
        openComplaints: complaints.filter(c => c.status === 'OPEN').length,
        resolvedComplaints: complaints.filter(c => c.status === 'RESOLVED').length,
        avgResolutionTime: complaints.length > 0 
          ? complaints.reduce((acc, c) => acc + (c.resolution_time || 0), 0) / complaints.length 
          : 0
      });
    }
  }, [products, complaints]);

  const StatCard = ({ title, value, icon: Icon, color, subtitle, link }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {link && (
            <Link 
              to={link} 
              className="inline-flex items-center mt-3 text-sm text-green-600 hover:text-green-800 font-medium"
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Supplier Dashboard</h1>
            <p className="text-lg text-gray-600">Monitor your products and manage customer complaints</p>
          </div>
          <div className="hidden md:flex space-x-3">
            <Link to="/supplier/products" className="btn-secondary btn-sm">
              <EyeIcon className="h-4 w-4 mr-2" />
              View Products
            </Link>
            <Link to="/supplier/products/add" className="btn-primary btn-sm">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={ShoppingBagIcon}
          color="#10B981"
          subtitle={`${stats.activeProducts} active`}
          link="/supplier/products"
        />
        <StatCard
          title="Total Complaints"
          value={stats.totalComplaints}
          icon={ExclamationTriangleIcon}
          color="#F59E0B"
          subtitle={`${stats.openComplaints} open`}
          link="/supplier/complaints"
        />
        <StatCard
          title="Resolved Issues"
          value={stats.resolvedComplaints}
          icon={CheckCircleIcon}
          color="#3B82F6"
          subtitle="All time"
        />
        <StatCard
          title="Avg Resolution Time"
          value={`${stats.avgResolutionTime.toFixed(1)}h`}
          icon={ClockIcon}
          color="#8B5CF6"
          subtitle="Hours to resolve"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Complaints Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Monthly Complaints</h3>
            <div className="h-3 w-3 bg-orange-500 rounded-full animate-pulse"></div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.monthlyComplaints}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="complaints" 
                stroke="#F59E0B" 
                strokeWidth={3}
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Product Performance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Product Performance</h3>
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.productPerformance.slice(0, 6)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="product_name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="complaint_count" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recent Products */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Recent Products</h3>
              <p className="text-gray-600 mt-1">Your latest product additions</p>
            </div>
            <Link 
              to="/supplier/products" 
              className="text-green-600 hover:text-green-800 font-medium text-sm"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {products.slice(0, 5).map((product) => (
              <div key={product.product_id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {product.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.category || 'General'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`status-badge ${
                    product.status === 'ACTIVE' ? 'status-active' : 'status-inactive'
                  }`}>
                    {product.status}
                  </span>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="text-center py-8">
                <ShoppingBagIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No products added yet</p>
                <Link to="/supplier/products/add" className="btn-primary btn-sm mt-4">
                  Add Your First Product
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Recent Complaints</h3>
              <p className="text-gray-600 mt-1">Latest complaints about your products</p>
            </div>
            <Link 
              to="/supplier/complaints" 
              className="text-green-600 hover:text-green-800 font-medium text-sm"
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
                    {complaint.customer_name} • {complaint.created_at ? format(new Date(complaint.created_at), 'MMM dd') : 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`status-badge ${
                    complaint.status === 'OPEN' ? 'status-open' :
                    complaint.status === 'IN_PROGRESS' ? 'status-in-progress' :
                    complaint.status === 'RESOLVED' ? 'status-resolved' :
                    'status-closed'
                  }`}>
                    {complaint.status?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
            {complaints.length === 0 && (
              <div className="text-center py-8">
                <CheckCircleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No complaints yet</p>
                <p className="text-sm text-gray-400">Great job maintaining quality!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 border border-green-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-3">
              <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
              <h4 className="font-semibold text-gray-900">Quality Score</h4>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {stats.totalComplaints > 0 
                ? Math.max(0, 100 - (stats.totalComplaints * 5))
                : 100}%
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Based on complaint frequency
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-3">
              <ClockIcon className="h-6 w-6 text-blue-500 mr-2" />
              <h4 className="font-semibold text-gray-900">Response Time</h4>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.avgResolutionTime.toFixed(1)}h</p>
            <p className="text-sm text-gray-600 mt-1">Average resolution time</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-orange-500 mr-2" />
              <h4 className="font-semibold text-gray-900">Action Required</h4>
            </div>
            <p className="text-2xl font-bold text-orange-600">{stats.openComplaints}</p>
            <p className="text-sm text-gray-600 mt-1">Open complaints to address</p>
          </div>
        </div>
      </div>
    </div>
  );
}
