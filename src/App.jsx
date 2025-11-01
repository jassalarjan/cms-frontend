import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext, ThemeProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserGuide from "./pages/UserGuide";
import FlowchartPage from "./pages/FlowchartPage";

// Admin Layout and Pages
import AdminLayout from "./layouts/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdvancedReports from "./pages/admin/AdvancedReports";
import AdminLocations from "./pages/admin/AdminLocations";

// Supplier Layout and Pages
import SupplierLayout from "./layouts/SupplierLayout";
import SupplierHome from "./pages/supplier/SupplierHome";
import SupplierCreate from "./pages/supplier/SupplierCreate";

// System Integrator Layout and Pages
import SystemIntegratorLayout from "./layouts/SystemIntegratorLayout";
import SystemIntegratorDashboard from "./pages/supplier/SystemIntegratorDashboard";
import SystemIntegratorComplaints from "./pages/supplier/SystemIntegratorComplaints";
import SupplierDashboard from "./pages/SupplierDashboard";

// Customer Layout and Pages
import CustomerLayout from "./layouts/CustomerLayout";
import CustomerHome from "./pages/customer/CustomerHome";
import CustomerCreate from "./pages/customer/CustomerCreate";
import StatusPage from "./pages/StatusPage";
import "./index.css";
function App() {
  const { user } = useContext(AuthContext);

  const getDashboardRoute = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "ADMIN":
        return "/admin";
      case "SUPPLIER":
        return "/supplier";
      case "SYSTEM_INTEGRATOR":
        return "/system-integrator";
      case "CUSTOMER":
        return "/customer";
      default:
        return "/login";
    }
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Routes>
          <Route path="/status" element={<StatusPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/user-guide" element={<UserGuide />} />
          <Route path="/flowchart" element={<FlowchartPage />} />
          
          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminHome />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="locations" element={<AdminLocations />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="advanced-reports" element={<AdvancedReports />} />
          </Route>
          
          {/* Supplier Routes */}
          <Route
            path="/supplier/*"
            element={
              <ProtectedRoute role="SUPPLIER">
                <SupplierLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SupplierHome />} />
          </Route>
          
          {/* System Integrator Routes */}
          <Route
            path="/system-integrator/*"
            element={
              <ProtectedRoute role="SYSTEM_INTEGRATOR">
                <SystemIntegratorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SystemIntegratorDashboard />} />
            <Route path="complaints" element={<SystemIntegratorComplaints />} />
            <Route path="reports" element={<SupplierDashboard />} />
            <Route path="profile" element={<StatusPage />} />
          </Route>
          
          {/* Customer Routes (My Complaints only) */}
          <Route
            path="/customer/*"
            element={
              <ProtectedRoute role="CUSTOMER">
                <CustomerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CustomerHome />} />
            <Route path="create" element={<CustomerCreate />} />
          </Route>
          <Route path="/" element={<Navigate to={getDashboardRoute()} />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10B981',
                color: '#fff',
              },
            },
            error: {
              style: {
                background: '#EF4444',
                color: '#fff',
              },
            },
          }}
        />
      </div>
    </BrowserRouter>
  );
}

export default function WrappedApp() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  );
}
