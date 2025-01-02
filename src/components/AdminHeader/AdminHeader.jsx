import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaClipboardList, 
  FaUtensils, 
  FaUsers, 
  FaChartBar, 
  FaCog, 
  FaSearch, 
  FaBell, 
  FaUserCircle 
} from 'react-icons/fa';
import './AdminHeader.css';

const AdminHeader = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <>
      {/* Top Header */}
      <header className="admin-top-header">
        <div className="admin-top-container">
          <div className="search-box">
            <FaSearch />
            <input type="text" placeholder="Search..." />
          </div>
          
          <div className="admin-top-right">
            <div className="notification-bell">
              <FaBell />
              <span className="notification-badge">3</span>
            </div>
            <div className="admin-profile">
              <FaUserCircle />
              <span>Admin Name</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <Link to="/admin" className="admin-logo">
            Nyaata Aadaa
          </Link>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/admin" className={`nav-item ${isActive('/admin')}`}>
            <FaChartBar /> Dashboard
          </Link>
          <Link to="/admin/orders" className={`nav-item ${isActive('/admin/orders')}`}>
            <FaClipboardList /> Ajaja
          </Link>
          <Link to="/admin/menu" className={`nav-item ${isActive('/admin/menu')}`}>
            <FaUtensils /> Menu
          </Link>
          <Link to="/admin/users" className={`nav-item ${isActive('/admin/users')}`}>
            <FaUsers /> Fayyadamtoota
          </Link>
          <Link to="/admin/analytics" className={`nav-item ${isActive('/admin/analytics')}`}>
            <FaChartBar /> Analytics
          </Link>
          <Link to="/admin/settings" className={`nav-item ${isActive('/admin/settings')}`}>
            <FaCog /> Settings
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button className="admin-logout">
            Ba'i
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminHeader; 