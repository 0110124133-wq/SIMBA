import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import UserNewRequest from './pages/UserNewRequest';
import AdminDashboard from './pages/AdminDashboard';
import AdminRequests from './pages/AdminRequests';
import AdminUsers from './pages/AdminUsers';
import AdminReports from './pages/AdminReports';
import Profile from './pages/Profile';
import PetugasDashboard from './pages/PetugasDashboard';

function MainLayout({ user, onLogout, onProfileUpdate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const isPublicPath = ['/', '/api/login', '/api/register'].includes(location.pathname);

  if (isPublicPath || !user) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/api/login" element={<Login onLoginSuccess={onProfileUpdate} />} />
        <Route path="/api/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  const isUser = user.role === 'user';
  const isAdmin = user.role === 'admin';
  const isPetugas = user.role === 'petugas';

  return (
    <div className="app-container">
      <Sidebar 
        user={user} 
        isOpen={sidebarOpen} 
        toggleSidebar={closeSidebar} 
        onLogout={onLogout} 
      />
      
      <div className="main-content">
        <Navbar user={user} toggleSidebar={toggleSidebar} />
        
        <Routes>
          {/* Shared protected */}
          <Route path="/api/profile" element={<Profile onProfileUpdate={onProfileUpdate} />} />

          {/* User routes */}
          {isUser && (
            <>
              <Route path="/api/user/dashboard" element={<UserDashboard />} />
              <Route path="/api/user/new-request" element={<UserNewRequest />} />
              <Route path="*" element={<Navigate to="/api/user/dashboard" replace />} />
            </>
          )}

          {/* Petugas routes */}
          {isPetugas && (
            <>
              <Route path="/api/petugas/dashboard" element={<PetugasDashboard />} />
              <Route path="*" element={<Navigate to="/api/petugas/dashboard" replace />} />
            </>
          )}

          {/* Admin routes */}
          {isAdmin && (
            <>
              <Route path="/api/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/api/admin/requests" element={<AdminRequests />} />
              <Route path="/api/admin/users" element={<AdminUsers currentUser={user} />} />
              <Route path="/api/admin/reports" element={<AdminReports currentUser={user} />} />
              <Route path="*" element={<Navigate to="/api/admin/dashboard" replace />} />
            </>
          )}
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('simba_user');
    const token = localStorage.getItem('simba_token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('simba_token');
    localStorage.removeItem('simba_user');
    setUser(null);
  };

  const handleProfileUpdate = (updatedUser) => {
    localStorage.setItem('simba_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <p style={{ fontWeight: 600, color: 'var(--primary)' }}>Memuat SIMBA...</p>
      </div>
    );
  }

  return (
    <Router>
      <MainLayout user={user} onLogout={handleLogout} onProfileUpdate={handleProfileUpdate} />
    </Router>
  );
}
