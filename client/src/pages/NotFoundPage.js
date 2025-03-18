import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-md">
        <svg
          className="h-24 w-24 text-primary-600 mx-auto mb-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
          404 - Page Not Found
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Link
            to="/"
            className="btn btn-primary px-6 py-3"
          >
            Go back home
          </Link>
          
          <Link
            to="/dashboard"
            className="btn btn-secondary px-6 py-3"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 