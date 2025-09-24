import React, { useEffect, useState } from "react";
import api from "../../api/axios"; // ✅ your shared axios instance
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from "recharts";

const AdminReports = () => {
  const [stats, setStats] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [daily, setDaily] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all reports data
  const fetchReports = async () => {
    try {
      setLoading(true);
      const [statsRes, monthlyRes, dailyRes, statusRes] = await Promise.all([
        api.get("/reports/stats"),
        api.get("/reports/monthly-trends"),
        api.get("/reports/daily-trends"),
        api.get("/reports/by-status"),
      ]);

      console.log('Stats response:', statsRes.data);
      console.log('Monthly response:', monthlyRes.data);
      console.log('Daily response:', dailyRes.data);
      console.log('Status response:', statusRes.data);

      setStats(statsRes.data);
      setMonthly(monthlyRes.data);
      setDaily(dailyRes.data);
      setStatusData(statusRes.data);
    } catch (err) {
      console.error("Error loading reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return <p className="text-center mt-8">Loading reports...</p>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white shadow rounded-xl p-4">
            <h3 className="text-gray-500">Total Complaints</h3>
            <p className="text-2xl font-bold">{stats.totalComplaints || 0}</p>
          </div>
          <div className="bg-white shadow rounded-xl p-4">
            <h3 className="text-gray-500">Resolved Complaints</h3>
            <p className="text-2xl font-bold text-green-600">{stats.resolvedComplaints || 0}</p>
          </div>
          <div className="bg-white shadow rounded-xl p-4">
            <h3 className="text-gray-500">Avg Resolution Time (hrs)</h3>
            <p className="text-2xl font-bold">
              {stats.avgResolutionTime ? Number(stats.avgResolutionTime).toFixed(2) : '0.00'}
            </p>
          </div>
          <div className="bg-white shadow rounded-xl p-4">
            <h3 className="text-gray-500">Customer Satisfaction</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.customerSatisfaction || 0}%</p>
          </div>
        </div>
      )}

      {/* Monthly Trends */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Monthly Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthly}>
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
        </ResponsiveContainer>
      </div>

      {/* Daily Trends */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Daily Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={daily}>
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
              name="total"
              dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="resolved"
              stroke="#10B981"
              strokeWidth={2}
              name="resolved"
              dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="open"
              stroke="#F59E0B"
              strokeWidth={2}
              name="open"
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
        </ResponsiveContainer>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Complaints by Status</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={statusData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminReports;
