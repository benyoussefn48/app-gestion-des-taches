import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogIn, FiMail, FiLock, FiUserPlus, FiEye, FiEyeOff } from 'react-icons/fi';
import authService from '../services/authService';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await authService.login(formData);
      localStorage.setItem('username', response.username);
      onLogin(response);
      navigate('/tasks');
    } catch (error) {
      setLoginError(error.error || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setFormData({
      email: 'alice@example.com',
      password: 'password123'
    });
    
    setLoading(true);
    
    try {
      const response = await authService.login({
        email: 'alice@example.com',
        password: 'password123'
      });
      localStorage.setItem('username', response.username);
      onLogin(response);
      navigate('/tasks');
    } catch (error) {
      setLoginError('Demo login failed. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password'); // You'll need to create this route
  };

  return (
    <div className="form-container">
      <div className="card">
        <h2 className="text-center mb-4">Welcome Back</h2>
        <p className="text-center text-muted mb-4">
          Please enter your credentials to access your account
        </p>
        
        {loginError && (
          <div className="alert alert-error mb-3" style={{ 
            background: '#f8d7da', 
            color: '#721c24', 
            padding: '1rem',
            borderRadius: '4px',
            border: '1px solid #f5c6cb',
            fontSize: '0.875rem'
          }}>
            {loginError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">
              <FiMail className="icon" /> Email Address
            </label>
            <input
              type="email"
              name="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              disabled={loading}
              autoComplete="email"
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label className="form-label">
              <FiLock className="icon" /> Password
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                disabled={loading}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>
          
          <div className="form-group">
            <button
              type="button"
              className="forgot-password-link"
              onClick={handleForgotPassword}
              disabled={loading}
            >
              Forgot password?
            </button>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block mb-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span> Logging in...
              </>
            ) : (
              <>
                <FiLogIn /> Sign In
              </>
            )}
          </button>
          
          <button 
            type="button" 
            className="btn btn-outline-secondary btn-block mb-3"
            onClick={handleDemoLogin}
            disabled={loading}
            style={{ border: '1px solid #ccc' }}
          >
            Try Demo Account
          </button>
          
          <div className="divider">
            <span>OR</span>
          </div>
          
          <div className="register-cta">
            <p className="text-center">
              New to Task Manager?
            </p>
            <Link 
              to="/register" 
              className="btn btn-secondary btn-block"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <FiUserPlus /> Create New Account
            </Link>
          </div>
        </form>
        
        <div className="login-footer text-center mt-4">
          <p className="demo-credentials" style={{ fontSize: '0.875rem', color: '#666' }}>
            <strong>Demo Account:</strong> alice@example.com / password123
          </p>
          <p className="mt-2" style={{ fontSize: '0.875rem', color: '#666' }}>
            Need help?{' '}
            <Link to="/contact" className="link">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Add these CSS styles to your existing stylesheet
const styles = `
.form-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 1rem;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.form-input.error {
  border-color: #dc3545;
}

.password-input-container {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.25rem;
}

.password-toggle:hover {
  color: #333;
}

.form-error {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  display: block;
  width: 100%;
  font-weight: 500;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #28a745;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #218838;
}

.btn-outline-secondary {
  background-color: white;
  color: #333;
  border: 1px solid #ddd;
}

.btn-outline-secondary:hover:not(:disabled) {
  background-color: #f8f9fa;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-block {
  display: block;
  width: 100%;
}

.text-center {
  text-align: center;
}

.text-muted {
  color: #666;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-3 {
  margin-bottom: 1rem;
}

.mb-4 {
  margin-bottom: 1.5rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-3 {
  margin-top: 1rem;
}

.mt-4 {
  margin-top: 1.5rem;
}

.alert-error {
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
}

.link {
  color: #007bff;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.forgot-password-link {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0;
  text-align: left;
  text-decoration: underline;
}

.forgot-password-link:hover {
  color: #0056b3;
}

.divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  color: #666;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid #ddd;
}

.divider span {
  padding: 0 1rem;
}

.register-cta {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.icon {
  font-size: 1.1rem;
}
`;

export default Login;