import React from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiLogOut, FiHome, FiList, FiLogIn, FiUserPlus } from 'react-icons/fi';

const Header = ({ isAuthenticated, user, onLogout }) => {
  return (
    <header className="app-header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <FiHome /> Task Manager
          </Link>
          
          <nav className="nav-links">
            {isAuthenticated ? (
              <>
                <Link to="/tasks" className="nav-link">
                  <FiList /> Tasks
                </Link>
                <div className="user-info">
                  <div className="user-avatar">
                    {user?.username?.charAt(0).toUpperCase() || <FiUser />}
                  </div>
                  <span className="username">{user?.username}</span>
                  <button onClick={onLogout} className="logout-btn">
                    <FiLogOut /> Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  <FiLogIn /> Login
                </Link>
                <Link to="/register" className="nav-link">
                  <FiUserPlus /> Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
