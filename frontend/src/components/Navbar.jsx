import React from 'react';
import { Menu, Droplet } from 'lucide-react';

export default function Navbar({ user, toggleSidebar }) {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle Sidebar">
          <Menu size={24} />
        </button>
        <div className="navbar-brand">
          <Droplet fill="currentColor" size={24} />
          <span>SIMBA</span>
        </div>
      </div>
      
      {user && (
        <div className="navbar-user">
          <div className="navbar-user-info">
            <div className="navbar-user-name">{user.name}</div>
            <div className="navbar-user-role">{user.role === 'admin' ? 'Admin PDAM' : user.role === 'petugas' ? 'Petugas Lapangan' : 'Masyarakat'}</div>
          </div>
          <div className="navbar-avatar">
            {getInitials(user.name)}
          </div>
        </div>
      )}
    </nav>
  );
}
