import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Membungkus route yang butuh login. `roles` opsional: kalau diisi, hanya
// peran yang disebut yang boleh mengakses — selain itu diarahkan ke dashboard.
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">
        Memuat...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
