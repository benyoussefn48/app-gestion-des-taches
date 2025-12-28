import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Tasks from './components/Tasks';
import Header from './components/Header';
import Footer from './components/Footer';
import './styles/App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    if (token && username) {
      setIsAuthenticated(true);
      setUser({ username });
    }
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    if (userData.token) {
      localStorage.setItem('token', userData.token);
      localStorage.setItem('username', userData.username);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUser(null);
  };

  // Show header/footer on all pages except maybe login/register
  const showHeaderFooter = !['/login', '/register'].includes(location.pathname);

  return (
    <div className="app">
      {showHeaderFooter && <Header isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />}
      
      <main className="main-content">
        <div className="container">
          <Routes>
            <Route path="/" element={
              isAuthenticated ? 
                <Navigate to="/tasks" /> : 
                <Navigate to="/login" />
            } />
            
            <Route path="/login" element={
              isAuthenticated ? 
                <Navigate to="/tasks" /> : 
                <Login onLogin={handleLogin} />
            } />
            
            <Route path="/register" element={
              isAuthenticated ? 
                <Navigate to="/tasks" /> : 
                <Register />
            } />
            
            <Route path="/tasks" element={
              isAuthenticated ? 
                <Tasks user={user} /> : 
                <Navigate to="/login" />
            } />
            
            {/* Catch all route */}
            <Route path="*" element={
              isAuthenticated ? 
                <Navigate to="/tasks" /> : 
                <Navigate to="/login" />
            } />
          </Routes>
        </div>
      </main>

      {showHeaderFooter && <Footer />}
    </div>
  );
}

export default App;
