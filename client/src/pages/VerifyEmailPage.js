import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token found in the URL. Please check your email for the correct verification link.');
        return;
      }
      
      try {
        const response = await axios.get(`/api/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(response.data.message || 'Your email has been verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Email verification failed. The token may be invalid or expired.');
        console.error('Verification error:', err);
      }
    };
    
    verifyEmail();
  }, [token]);
  
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Email Verification</h1>
        <p className="mt-2 text-gray-600">Verifying your email address...</p>
      </div>
      
      <div className="text-center">
        {status === 'loading' && (
          <div className="mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying your email address...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-600 font-medium mb-6">{message}</p>
            <Link 
              to="/login" 
              className="btn btn-primary px-6 py-2.5"
            >
              Sign in to your account
            </Link>
          </div>
        )}
        
        {status === 'error' && (
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-600 font-medium mb-6">{message}</p>
            <div className="flex flex-col space-y-2 items-center">
              <Link 
                to="/register" 
                className="btn btn-primary px-6 py-2.5"
              >
                Try registering again
              </Link>
              <span className="text-gray-500">or</span>
              <Link 
                to="/login" 
                className="text-primary-600 hover:text-primary-700"
              >
                Return to login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage; 