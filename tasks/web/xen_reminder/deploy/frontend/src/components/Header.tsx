import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="app-title">
          <div className="logo-container">
            <div className="logo">XR</div>
            <div className="logo-text">
              <h1>XenReminder</h1>
              <p>Корпоративное решение для напоминаний</p>
            </div>
          </div>
        </div>
        {isAuthenticated && user && (
          <div className="user-section">
            <div className="user-info">
              <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
              <div className="user-details">
                <span className="username">{user.username}</span>
              </div>
            </div>
            <button onClick={logout} className="logout-button">
              Выйти
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
