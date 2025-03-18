import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const { loginWithToken } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const processToken = async () => {
      if (!token) {
        setError('No authentication token found in the URL.');
        setLoading(false);
        return;
      }
      
      try {
        // Process the token and update auth state
        const result = await loginWithToken(token);
        
        if (result.success) {
          // Redirect to dashboard on success
          navigate('/dashboard');
        } else {
          setError(result.error);
          setLoading(false);
        }
      } catch (err) {
        setError('Authentication failed. Please try again.');
        setLoading(false);
        console.error('Auth callback error:', err);
      }
    };
    
    processToken();
  }, [token, loginWithToken, navigate]);
  
  if (loading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Authenticating, please wait...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
        <p className="text-red-600 mb-6">{error}</p>
        <button
          onClick={() => navigate('/login')}
          className="btn btn-primary px-6 py-2.5"
        >
          Return to Login
        </button>
      </div>
    );
  }
  
  return (
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Redirecting to dashboard...</p>
    </div>
  );
};

export default AuthCallbackPage; 