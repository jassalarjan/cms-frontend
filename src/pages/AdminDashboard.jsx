// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { toast } from "react-toastify";
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
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const AdminDashboard = () => {
  const [reports, setReports] = useState({
    byStatus: [],
    bySupplier: [],
    byProduct: [],
    avgResolutionTime: 0,
    monthlyTrends: [],
  });

  const fetchReports = async () => {
    try {
      const [statusRes, supplierRes, productRes, avgRes, trendsRes] =
        await Promise.all([
          API.get("/reports/by-status"),
          API.get("/reports/by-supplier"),
          API.get("/reports/by-product"),
          API.get("/reports/avg-resolution-time"),
          API.get("/reports/monthly-trends"),
        ]);

      // Format monthly trends for chart
      const formattedTrends = Array.isArray(trendsRes.data)
        ? trendsRes.data.map((item) => ({
            ...item,
            month: new Date(item.month).toLocaleString("default", {
              month: "short",
              year: "numeric",
            }),
          }))
        : [];

      setReports({
        byStatus: Array.isArray(statusRes.data) ? statusRes.data : [],
        bySupplier: Array.isArray(supplierRes.data) ? supplierRes.data : [],
        byProduct: Array.isArray(productRes.data) ? productRes.data : [],
        avgResolutionTime: avgRes.data?.avg_hours ?? 0, // safe fallback
        monthlyTrends: formattedTrends,
      });
    } catch (err) {
      console.error("Error fetching reports:", err);
      toast.error("Failed to fetch reports");
      setReports({
        byStatus: [],
        bySupplier: [],
        byProduct: [],
        avgResolutionTime: 0,
        monthlyTrends: [],
      });
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold mb-6">Admin Reports Dashboard</h2>

      {/* Status Distribution */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-4">Reports by Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={reports.byStatus}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ status, total }) => `${status}: ${total}`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="total"
            >
              {reports.byStatus.map((entry, index) => (
                <Cell
                  key={`cell-status-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Supplier Distribution */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-4">Reports by Supplier</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={reports.bySupplier}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ supplier, total }) => `${supplier}: ${total}`}
              outerRadius={100}
              fill="#82ca9d"
              dataKey="total"
            >
              {reports.bySupplier.map((entry, index) => (
                <Cell
                  key={`cell-supplier-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Product Distribution */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-4">Reports by Product</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={reports.byProduct}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ product, total }) => `${product}: ${total}`}
              outerRadius={100}
              fill="#ffc658"
              dataKey="total"
            >
              {reports.byProduct.map((entry, index) => (
                <Cell
                  key={`cell-product-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Avg Resolution Time */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-2">Average Resolution Time</h3>
        <p className="text-2xl font-bold text-blue-600">
          {reports.avgResolutionTime.toFixed(2)} hours
        </p>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-4">Monthly Report Trends</h3>
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
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminDashboard;
