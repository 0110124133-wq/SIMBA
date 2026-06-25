import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  FileSpreadsheet, 
  User, 
  LogOut, 
  Droplets,
  PlusCircle
} from 'lucide-react';

export default function Sidebar({ user, isOpen, toggleSidebar, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Droplets size={32} />
          <span>SIMBA</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        {user.role === 'admin' && (
          <>
            <NavLink 
              to="/admin/dashboard" 
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={toggleSidebar}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink 
              to="/admin/requests" 
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={toggleSidebar}
            >
              <FileText size={20} />
              <span>Kelola Pengajuan</span>
            </NavLink>
            <NavLink 
              to="/admin/users" 
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={toggleSidebar}
            >
              <Users size={20} />
              <span>Kelola User</span>
            </NavLink>
            <NavLink 
              to="/admin/reports" 
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={toggleSidebar}
            >
              <FileSpreadsheet size={20} />
              <span>Laporan</span>
            </NavLink>
          </>
        )}

        {user.role === 'petugas' && (
          <>
            <NavLink 
              to="/petugas/dashboard" 
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={toggleSidebar}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard Tugas</span>
            </NavLink>
          </>
        )}

        {user.role === 'user' && (
          <>
            <NavLink 
              to="/user/dashboard" 
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={toggleSidebar}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink 
              to="/user/new-request" 
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={toggleSidebar}
            >
              <PlusCircle size={20} />
              <span>Buat Pengajuan</span>
            </NavLink>
          </>
        )}

        <NavLink 
          to="/profile" 
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          onClick={toggleSidebar}
        >
          <User size={20} />
          <span>Profil Saya</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="btn-logout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
