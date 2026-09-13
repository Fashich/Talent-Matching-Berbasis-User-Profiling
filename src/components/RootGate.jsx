import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Landing from '../pages/Landing/Landing';

// Menjaga path "/": tampilkan Landing Page (publik) kalau belum login DAN
// memang sedang di path "/" persis; kalau belum login tapi mencoba path lain
// di bawah layout ini (mis. "/siswa" langsung tanpa login), arahkan ke
// /login seperti biasa. Kalau sudah login, teruskan ke DashboardLayout+Outlet.
const RootGate = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">
        Memuat...
      </div>
    );
  }

  if (!user) {
    if (location.pathname === '/') {
      return <Landing />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default RootGate;
