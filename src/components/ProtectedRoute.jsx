import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" />;
  
  // Admin has access to everything
  if (user.role === 'ADMIN') return children;
  
  // For non-admins, check specific role requirement
  if (role && user.role !== role) {
    // Redirect based on user's role
    switch (user.role) {
      case 'CUSTOMER':
        return <Navigate to="/customer" />;
      case 'SUPPLIER':
        return <Navigate to="/supplier" />;
      default:
        return <Navigate to="/" />;
    }
  }

  return children;
};

export default ProtectedRoute;
