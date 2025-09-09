import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Admin Layout and Pages
import AdminLayout from "./layouts/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdminReports from "./pages/admin/AdminReports";

// Supplier Layout and Pages
import SupplierLayout from "./layouts/SupplierLayout";
import SupplierHome from "./pages/supplier/SupplierHome";

// Customer Layout and Pages
import CustomerLayout from "./layouts/CustomerLayout";
import CustomerHome from "./pages/customer/CustomerHome";
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
      case "CUSTOMER":
        return "/customer";
      default:
        return "/login";
    }
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/status" element={<StatusPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
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
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="notifications" element={<div className="p-8"><h1 className="text-2xl font-bold">Notifications - Coming Soon</h1></div>} />
            <Route path="settings" element={<div className="p-8"><h1 className="text-2xl font-bold">Settings - Coming Soon</h1></div>} />
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
            <Route path="products" element={<div className="p-8"><h1 className="text-2xl font-bold">Products Management - Coming Soon</h1></div>} />
            <Route path="complaints" element={<div className="p-8"><h1 className="text-2xl font-bold">Supplier Complaints - Coming Soon</h1></div>} />
            <Route path="analytics" element={<div className="p-8"><h1 className="text-2xl font-bold">Analytics - Coming Soon</h1></div>} />
            <Route path="notifications" element={<div className="p-8"><h1 className="text-2xl font-bold">Notifications - Coming Soon</h1></div>} />
            <Route path="profile" element={<div className="p-8"><h1 className="text-2xl font-bold">Profile - Coming Soon</h1></div>} />
            <Route path="settings" element={<div className="p-8"><h1 className="text-2xl font-bold">Settings - Coming Soon</h1></div>} />
          </Route>
          
          {/* Customer Routes */}
          <Route
            path="/customer/*"
            element={
              <ProtectedRoute role="CUSTOMER">
                <CustomerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CustomerHome />} />
            <Route path="complaints" element={<div className="p-8"><h1 className="text-2xl font-bold">My Complaints - Coming Soon</h1></div>} />
            <Route path="complaints/new" element={<div className="p-8"><h1 className="text-2xl font-bold">Submit Complaint - Coming Soon</h1></div>} />
            <Route path="messages" element={<div className="p-8"><h1 className="text-2xl font-bold">Messages - Coming Soon</h1></div>} />
            <Route path="history" element={<div className="p-8"><h1 className="text-2xl font-bold">History - Coming Soon</h1></div>} />
            <Route path="notifications" element={<div className="p-8"><h1 className="text-2xl font-bold">Notifications - Coming Soon</h1></div>} />
            <Route path="profile" element={<div className="p-8"><h1 className="text-2xl font-bold">Profile - Coming Soon</h1></div>} />
            <Route path="settings" element={<div className="p-8"><h1 className="text-2xl font-bold">Settings - Coming Soon</h1></div>} />
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
      <App />
    </AuthProvider>
  );
}
