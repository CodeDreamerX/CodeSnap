import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Initialize: Check for token and validate it
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        // Configure axios with token
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Validate token by getting user info
        const response = await axios.get('/api/auth/user');
        
        setCurrentUser(response.data.user);
        setIsAuthenticated(true);
        setError(null);
      } catch (err) {
        console.error('Authentication error:', err);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setError('Authentication failed. Please log in again.');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Register with email and password
  const register = async (email, password, name) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/register', {
        email,
        password,
        name
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return {
        success: false,
        error: err.response?.data?.message || 'Registration failed'
      };
    } finally {
      setLoading(false);
    }
  };
  
  // Login with email and password
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });
      
      const { token, user } = response.data;
      
      // Store token and update auth state
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setCurrentUser(user);
      setIsAuthenticated(true);
      setError(null);
      
      return {
        success: true,
        data: user
      };
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return {
        success: false,
        error: err.response?.data?.message || 'Login failed'
      };
    } finally {
      setLoading(false);
    }
  };
  
  // Login with token (for OAuth callbacks)
  const loginWithToken = (token) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Fetch user info
    return axios.get('/api/auth/user')
      .then(response => {
        setCurrentUser(response.data.user);
        setIsAuthenticated(true);
        setError(null);
        
        return {
          success: true,
          data: response.data.user
        };
      })
      .catch(err => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        
        setError(err.response?.data?.message || 'Authentication failed');
        return {
          success: false,
          error: err.response?.data?.message || 'Authentication failed'
        };
      });
  };
  
  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    
    setCurrentUser(null);
    setIsAuthenticated(false);
  };
  
  // Clear error
  const clearError = () => {
    setError(null);
  };
  
  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    loginWithToken,
    logout,
    clearError
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 