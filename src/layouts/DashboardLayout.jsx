import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { menuForRole } from '../config/menu';

const ROLE_BADGE_CLASS = {
  Administrator: 'bg-blue-100 text-blue-700',
  Petugas: 'bg-indigo-100 text-indigo-700',
  Guru: 'bg-purple-100 text-purple-700',
  Siswa: 'bg-green-100 text-green-700',
};

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menus = menuForRole(user?.role);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const SidebarContent = (
    <>
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <img src="/logo-rajasa-192.png" alt="Logo SMKS Rajasa Surabaya" className="w-8 h-8 rounded" />
          <span className="text-white font-semibold text-lg tracking-wide">EduPKL</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {menus.map((menu) => (
            <NavLink
              key={menu.name}
              to={menu.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <menu.icon size={20} />
              <span className="ml-3">{menu.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          <span className="ml-3">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-300 flex-col transition-all duration-300">
        {SidebarContent}
      </aside>

      {/* Sidebar mobile (overlay) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 h-full bg-slate-900 text-slate-300 flex flex-col">
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setMobileOpen(true)}
              aria-label="Buka menu"
            >
              <Menu size={22} />
            </button>
            <span className="text-gray-500 font-medium hidden sm:block">Talent Matching Berbasis User Profiling</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <span className="text-sm font-medium text-gray-700">{user?.nama}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_BADGE_CLASS[user?.role] || 'bg-gray-100 text-gray-700'}`}>
                {user?.role}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
