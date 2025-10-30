import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminHome from '../pages/admin/AdminHome';
import AdminComplaints from '../pages/admin/AdminComplaints';
import AdminUsers from '../pages/admin/AdminUsers';
import LocationManagement from '../pages/admin/LocationManagement';
import AdminReports from '../pages/admin/AdminReports';
import AdminLayout from '../layouts/AdminLayout';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminHome />} />
        <Route path="complaints" element={<AdminComplaints />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="locations" element={<LocationManagement />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
