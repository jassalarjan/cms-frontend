import React, { useEffect, useState, useRef } from 'react';
import API from '../../api/axios';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import {
  FunnelIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export default function AdvancedReports() {
  // State management
  const [loading, setLoading] = useState(true);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  
  // Data states
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [dailyTrends, setDailyTrends] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [productData, setProductData] = useState([]);
  
  // Filter states
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'ALL',
    priority: 'ALL',
    category: 'ALL',
    zone: 'ALL',
    product: 'ALL'
  });
  
  // View states
  const [chartType, setChartType] = useState('line'); // line, bar, area
  const [reportType, setReportType] = useState('comprehensive'); // comprehensive, status, category, trends
  const [showTable, setShowTable] = useState(true);
  const [showCharts, setShowCharts] = useState(true);
  
  // Refs for charts
  const chartRefs = {
    monthly: useRef(null),
    status: useRef(null),
    category: useRef(null),
    priority: useRef(null)
  };

  useEffect(() => {
    fetchReportData();
  }, [filters]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Fetch all necessary data
      const [
        complaintsRes,
        statsRes,
        monthlyRes,
        dailyRes,
        statusRes,
        categoryRes,
        priorityRes,
        productRes
      ] = await Promise.all([
        API.get('/complaints'),
        API.get('/reports/stats'),
        API.get('/reports/monthly-trends'),
        API.get('/reports/daily-trends'),
        API.get('/reports/by-status'),
        API.get('/reports/by-category'),
        API.get('/reports/by-priority'),
        API.get('/reports/by-product')
      ]);

      let complaintsData = Array.isArray(complaintsRes.data) ? complaintsRes.data : complaintsRes.data?.data || [];
      
      // Apply filters
      complaintsData = applyFilters(complaintsData);
      
      setComplaints(complaintsData);
      setStats(statsRes.data);
      setMonthlyTrends(monthlyRes.data || []);
      setDailyTrends(dailyRes.data || []);
      setStatusData(statusRes.data || []);
      setCategoryData(categoryRes.data || []);
      setPriorityData(priorityRes.data || []);
      setProductData((productRes.data || []).slice(0, 10)); // Top 10 products
      
    } catch (err) {
      console.error('Error fetching report data:', err);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data) => {
    return data.filter(item => {
      // Date filter
      if (filters.startDate && new Date(item.created_at) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(item.created_at) > new Date(filters.endDate)) return false;
      
      // Status filter
      if (filters.status !== 'ALL' && item.status !== filters.status) return false;
      
      // Priority filter
      if (filters.priority !== 'ALL' && item.priority !== filters.priority) return false;
      
      // Category filter
      if (filters.category !== 'ALL' && item.category !== filters.category) return false;
      
      // Product filter
      if (filters.product !== 'ALL' && item.product_name !== filters.product) return false;
      
      return true;
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      status: 'ALL',
      priority: 'ALL',
      category: 'ALL',
      zone: 'ALL',
      product: 'ALL'
    });
  };

  const exportToPDF = async () => {
    setExportingPDF(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let yPos = 20;

      // Header with logo/branding
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, pageWidth, 30, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Complaint Management System', pageWidth / 2, 15, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Advanced Analytics Report', pageWidth / 2, 22, { align: 'center' });
      
      yPos = 40;
      
      // Report Information
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 14, yPos);
      yPos += 5;
      doc.text(`Report Type: ${reportType.toUpperCase()}`, 14, yPos);
      yPos += 5;
      
      if (filters.startDate || filters.endDate) {
        const dateRange = `Date Range: ${filters.startDate || 'Start'} to ${filters.endDate || 'End'}`;
        doc.text(dateRange, 14, yPos);
        yPos += 5;
      }
      
      yPos += 5;
      
      // Summary Statistics
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text('Summary Statistics', 14, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      const statsTable = [
        ['Total Complaints', stats?.totalComplaints || 0],
        ['Resolved Complaints', stats?.resolvedComplaints || 0],
        ['Avg Resolution Time (hrs)', stats?.avgResolutionTime?.toFixed(2) || '0.00'],
        ['Customer Satisfaction', `${stats?.customerSatisfaction || 0}%`],
        ['Open Complaints', statusData.find(s => s.status === 'OPEN')?.count || 0],
        ['In Progress', statusData.find(s => s.status === 'IN_PROGRESS')?.count || 0]
      ];
      
      doc.autoTable({
        startY: yPos,
        head: [['Metric', 'Value']],
        body: statsTable,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
        margin: { left: 14, right: 14 }
      });
      
      yPos = doc.lastAutoTable.finalY + 10;
      
      // Status Distribution
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text('Status Distribution', 14, yPos);
      yPos += 8;
      
      const statusTableData = statusData.map(item => [
        item.status,
        item.count,
        `${((item.count / complaints.length) * 100).toFixed(1)}%`
      ]);
      
      doc.autoTable({
        startY: yPos,
        head: [['Status', 'Count', 'Percentage']],
        body: statusTableData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
        margin: { left: 14, right: 14 }
      });
      
      yPos = doc.lastAutoTable.finalY + 10;
      
      // Category Distribution
      if (categoryData.length > 0) {
        if (yPos > pageHeight - 60) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(59, 130, 246);
        doc.text('Category Distribution', 14, yPos);
        yPos += 8;
        
        const categoryTableData = categoryData.map(item => [
          item.category || 'N/A',
          item.count,
          `${((item.count / complaints.length) * 100).toFixed(1)}%`
        ]);
        
        doc.autoTable({
          startY: yPos,
          head: [['Category', 'Count', 'Percentage']],
          body: categoryTableData,
          theme: 'striped',
          headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
          margin: { left: 14, right: 14 }
        });
        
        yPos = doc.lastAutoTable.finalY + 10;
      }
      
      // Top Products
      if (productData.length > 0) {
        if (yPos > pageHeight - 60) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(59, 130, 246);
        doc.text('Top 10 Products by Complaints', 14, yPos);
        yPos += 8;
        
        const productTableData = productData.map((item, index) => [
          index + 1,
          item.product_name || 'N/A',
          item.category || 'N/A',
          item.count
        ]);
        
        doc.autoTable({
          startY: yPos,
          head: [['#', 'Product Name', 'Category', 'Complaints']],
          body: productTableData,
          theme: 'grid',
          headStyles: { fillColor: [139, 92, 246], textColor: [255, 255, 255] },
          margin: { left: 14, right: 14 }
        });
      }
      
      // Footer on last page
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        doc.text(
          '© 2025 Complaint Management System - All Rights Reserved',
          pageWidth / 2,
          pageHeight - 5,
          { align: 'center' }
        );
        doc.text(
          `Generated by: Admin | ${format(new Date(), 'yyyy-MM-dd HH:mm')}`,
          14,
          pageHeight - 5
        );
      }
      
      // Save PDF
      const filename = `CMS_Report_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
      doc.save(filename);
      
      toast.success('Report exported to PDF successfully!');
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      toast.error('Failed to export PDF');
    } finally {
      setExportingPDF(false);
    }
  };

  const exportToExcel = async () => {
    setExportingExcel(true);
    try {
      const workbook = XLSX.utils.book_new();
      
      // Summary Sheet
      const summaryData = [
        ['Complaint Management System - Advanced Report'],
        [''],
        ['Generated:', format(new Date(), 'PPpp')],
        ['Report Type:', reportType.toUpperCase()],
        ['Date Range:', `${filters.startDate || 'All'} to ${filters.endDate || 'All'}`],
        [''],
        ['Summary Statistics'],
        ['Metric', 'Value'],
        ['Total Complaints', stats?.totalComplaints || 0],
        ['Resolved Complaints', stats?.resolvedComplaints || 0],
        ['Avg Resolution Time (hrs)', stats?.avgResolutionTime?.toFixed(2) || '0.00'],
        ['Customer Satisfaction', `${stats?.customerSatisfaction || 0}%`],
        ['Open Complaints', statusData.find(s => s.status === 'OPEN')?.count || 0],
        ['In Progress', statusData.find(s => s.status === 'IN_PROGRESS')?.count || 0],
        ['Resolved', statusData.find(s => s.status === 'RESOLVED')?.count || 0],
        ['Closed', statusData.find(s => s.status === 'CLOSED')?.count || 0]
      ];
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
      
      // Complaints Data Sheet
      const complaintsHeaders = [
        'ID',
        'Title',
        'Status',
        'Priority',
        'Category',
        'Customer',
        'Product',
        'Created At',
        'Resolved At'
      ];
      
      const complaintsData = complaints.map(c => [
        c.complaint_id || c.id,
        c.title,
        c.status,
        c.priority,
        c.category || 'N/A',
        c.customer_name || 'N/A',
        c.product_name || 'N/A',
        c.created_at ? format(new Date(c.created_at), 'yyyy-MM-dd HH:mm') : 'N/A',
        c.resolved_at ? format(new Date(c.resolved_at), 'yyyy-MM-dd HH:mm') : 'Pending'
      ]);
      
      const complaintsSheet = XLSX.utils.aoa_to_sheet([complaintsHeaders, ...complaintsData]);
      complaintsSheet['!cols'] = complaintsHeaders.map(() => ({ wch: 15 }));
      XLSX.utils.book_append_sheet(workbook, complaintsSheet, 'Complaints');
      
      // Status Distribution Sheet
      const statusHeaders = ['Status', 'Count', 'Percentage'];
      const statusSheetData = statusData.map(item => [
        item.status,
        item.count,
        `${((item.count / complaints.length) * 100).toFixed(1)}%`
      ]);
      
      const statusSheet = XLSX.utils.aoa_to_sheet([statusHeaders, ...statusSheetData]);
      XLSX.utils.book_append_sheet(workbook, statusSheet, 'Status Distribution');
      
      // Category Distribution Sheet
      if (categoryData.length > 0) {
        const categoryHeaders = ['Category', 'Count', 'Percentage'];
        const categorySheetData = categoryData.map(item => [
          item.category || 'N/A',
          item.count,
          `${((item.count / complaints.length) * 100).toFixed(1)}%`
        ]);
        
        const categorySheet = XLSX.utils.aoa_to_sheet([categoryHeaders, ...categorySheetData]);
        XLSX.utils.book_append_sheet(workbook, categorySheet, 'Category Distribution');
      }
      
      // Priority Distribution Sheet
      if (priorityData.length > 0) {
        const priorityHeaders = ['Priority', 'Count', 'Percentage'];
        const prioritySheetData = priorityData.map(item => [
          item.priority,
          item.count,
          `${((item.count / complaints.length) * 100).toFixed(1)}%`
        ]);
        
        const prioritySheet = XLSX.utils.aoa_to_sheet([priorityHeaders, ...prioritySheetData]);
        XLSX.utils.book_append_sheet(workbook, prioritySheet, 'Priority Distribution');
      }
      
      // Monthly Trends Sheet
      if (monthlyTrends.length > 0) {
        const monthlyHeaders = ['Month', 'Total', 'Resolved'];
        const monthlySheetData = monthlyTrends.map(item => [
          item.month,
          item.total,
          item.resolved
        ]);
        
        const monthlySheet = XLSX.utils.aoa_to_sheet([monthlyHeaders, ...monthlySheetData]);
        XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Monthly Trends');
      }
      
      // Top Products Sheet
      if (productData.length > 0) {
        const productHeaders = ['#', 'Product Name', 'Category', 'Complaints'];
        const productSheetData = productData.map((item, index) => [
          index + 1,
          item.product_name || 'N/A',
          item.category || 'N/A',
          item.count
        ]);
        
        const productSheet = XLSX.utils.aoa_to_sheet([productHeaders, ...productSheetData]);
        XLSX.utils.book_append_sheet(workbook, productSheet, 'Top Products');
      }
      
      // Export
      const filename = `CMS_Report_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;
      XLSX.writeFile(workbook, filename);
      
      toast.success('Report exported to Excel successfully!');
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      toast.error('Failed to export Excel');
    } finally {
      setExportingExcel(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading advanced reports...</p>
        </div>
      </div>
    );
  }

  const renderChart = (data, dataKey, stroke, name) => {
    const ChartComponent = chartType === 'bar' ? BarChart : chartType === 'area' ? AreaChart : LineChart;
    const DataComponent = chartType === 'bar' ? Bar : chartType === 'area' ? Area : Line;
    
    return (
      <ResponsiveContainer width="100%" height={350}>
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey={dataKey} tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
          <YAxis />
          <Tooltip />
          <Legend />
          <DataComponent
            type="monotone"
            dataKey="total"
            stroke={stroke}
            fill={chartType === 'area' ? stroke : undefined}
            strokeWidth={2}
            name={name}
          />
          {data[0]?.resolved !== undefined && (
            <DataComponent
              type="monotone"
              dataKey="resolved"
              stroke="#10B981"
              fill={chartType === 'area' ? '#10B981' : undefined}
              strokeWidth={2}
              name="Resolved"
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Advanced Analytics & Reports</h1>
        <p className="text-blue-100">Comprehensive insights with advanced filtering and export capabilities</p>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Advanced Filters</h2>
          </div>
          <button
            onClick={resetFilters}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Reset</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="comprehensive">Comprehensive</option>
              <option value="status">Status Analysis</option>
              <option value="category">Category Analysis</option>
              <option value="trends">Trends Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chart Type</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
              <option value="area">Area Chart</option>
            </select>
          </div>

          <div className="flex items-end space-x-2">
            <button
              onClick={() => setShowCharts(!showCharts)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border ${
                showCharts
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              <ChartBarIcon className="h-4 w-4 inline mr-1" />
              Charts
            </button>
            <button
              onClick={() => setShowTable(!showTable)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border ${
                showTable
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              <TableCellsIcon className="h-4 w-4 inline mr-1" />
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={exportToPDF}
          disabled={exportingPDF}
          className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
        >
          <DocumentArrowDownIcon className="h-5 w-5" />
          <span>{exportingPDF ? 'Exporting...' : 'Export to PDF'}</span>
        </button>
        <button
          onClick={exportToExcel}
          disabled={exportingExcel}
          className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          <span>{exportingExcel ? 'Exporting...' : 'Export to Excel'}</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Complaints</p>
              <p className="text-3xl font-bold mt-2">{stats?.totalComplaints || 0}</p>
            </div>
            <DocumentTextIcon className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Resolved</p>
              <p className="text-3xl font-bold mt-2">{stats?.resolvedComplaints || 0}</p>
            </div>
            <ChartBarIcon className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Avg Resolution (hrs)</p>
              <p className="text-3xl font-bold mt-2">{stats?.avgResolutionTime?.toFixed(1) || '0.0'}</p>
            </div>
            <CalendarIcon className="h-12 w-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Satisfaction</p>
              <p className="text-3xl font-bold mt-2">{stats?.customerSatisfaction || 0}%</p>
            </div>
            <ChartBarIcon className="h-12 w-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {showCharts && (
        <>
          {/* Monthly Trends */}
          {monthlyTrends.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
              {renderChart(monthlyTrends, 'month', '#3B82F6', 'Total Complaints')}
            </div>
          )}

          {/* Status & Category Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.status}: ${entry.count}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Priority Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="priority" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution */}
          {categoryData.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top Products */}
          {productData.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Products by Complaints</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={productData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="product_name" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {/* Data Table */}
      {showTable && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Detailed Complaints Data</h3>
            <p className="text-sm text-gray-600 mt-1">
              Showing {complaints.length} complaint{complaints.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {complaints.slice(0, 100).map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {complaint.complaint_id || complaint.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {complaint.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        complaint.status === 'OPEN' ? 'bg-blue-100 text-blue-800' :
                        complaint.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                        complaint.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        complaint.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                        complaint.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        complaint.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {complaint.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {complaint.category || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {complaint.customer_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {complaint.created_at ? format(new Date(complaint.created_at), 'MMM dd, yyyy') : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {complaints.length > 100 && (
              <div className="px-6 py-4 bg-gray-50 text-center text-sm text-gray-600">
                Showing first 100 of {complaints.length} complaints. Export to Excel for complete data.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
