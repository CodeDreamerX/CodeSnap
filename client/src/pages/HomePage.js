import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* Hero section */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-900 text-white py-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Share Code Screenshots, <span className="text-secondary-400">Securely</span>
              </h1>
              <p className="text-xl mb-8 text-gray-100">
                CodeSnap scans your code screenshots for security risks before you post them online. Protect sensitive information and credentials with our intelligent OCR analysis.
              </p>
              <div className="flex space-x-4">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn btn-secondary font-semibold px-6 py-3">
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-secondary font-semibold px-6 py-3">
                      Get Started
                    </Link>
                    <Link to="/login" className="px-6 py-3 text-white font-semibold underline">
                      Login
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex justify-center">
              <div className="bg-white rounded-lg shadow-xl p-4 max-w-md transform rotate-1">
                <div className="bg-dark-800 rounded-md p-4 font-mono text-green-400 text-sm">
                  <div className="flex items-center mb-4 space-x-2">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <div className="text-gray-400 text-xs ml-2">code-example.js</div>
                  </div>
                  <pre className="whitespace-pre-wrap">
{`// This is safe to share
function calculateTotal(items) {
  return items.reduce((total, item) => {
    return total + item.price;
  }, 0);
}

// DON'T share this!
const API_KEY = "sk_live_1234567890abcdef";
`}
                  </pre>
                </div>
                <div className="bg-red-100 border-l-4 border-red-500 mt-4 p-4 text-red-700">
                  <div className="flex">
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-bold">Security Risk Detected!</p>
                      <p>API key exposed in code (line 9)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">How CodeSnap Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card">
              <div className="rounded-full bg-primary-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload or Paste</h3>
              <p className="text-gray-600">
                Simply upload your code screenshot from your device or paste directly from clipboard with Ctrl+V.
              </p>
            </div>
            
            <div className="card">
              <div className="rounded-full bg-primary-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Intelligent Scan</h3>
              <p className="text-gray-600">
                Our OCR technology extracts code text and scans for security risks like API keys and credentials.
              </p>
            </div>
            
            <div className="card">
              <div className="rounded-full bg-primary-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Share With Confidence</h3>
              <p className="text-gray-600">
                Get a detailed security report with our ScanFactor confidence score so you can share safely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to Share Code Securely?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Join developers who use CodeSnap to ensure they never accidentally expose sensitive information.
            </p>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary px-8 py-3 text-lg">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/register" className="btn btn-primary px-8 py-3 text-lg">
                Create Your Free Account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 