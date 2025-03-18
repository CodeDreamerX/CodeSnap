import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Simple header */}
      <header className="bg-white shadow-sm">
        <div className="container py-4">
          <Link to="/" className="text-xl font-bold text-primary-600 flex items-center">
            <svg className="h-8 w-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3V7C8 8.10457 7.10457 9 6 9H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M16 3V7C16 8.10457 16.8954 9 18 9H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M21 15V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M10 9L12 11L14 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 11V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            CodeSnap
          </Link>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Outlet />
        </div>
      </main>
      
      {/* Simple footer */}
      <footer className="py-4 bg-white border-t">
        <div className="container text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} CodeSnap. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout; 