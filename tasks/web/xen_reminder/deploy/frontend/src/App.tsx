import React, { useState } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import ReminderDashboard from './components/ReminderDashboard';
import Header from './components/Header';

const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState<boolean>(true);

  const toggleForm = () => {
    setShowLogin(!showLogin);
  };

  return (
    <div className="app">
      <Header />
      
      {isAuthenticated ? (
        <ReminderDashboard />
      ) : (
        <div className="auth-container">
          {showLogin ? (
            <Login onToggleForm={toggleForm} />
          ) : (
            <Register onToggleForm={toggleForm} />
          )}
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
