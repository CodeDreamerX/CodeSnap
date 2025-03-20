import React, { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { isClipboardPasteSupported, getBrowserInfo } from '../utils/browserSupport';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [clipboardSupported, setClipboardSupported] = useState(true);
  const [browserInfo, setBrowserInfo] = useState({ name: '', version: '' });
  const fileInputRef = useRef(null);
  const pasteAreaRef = useRef(null);

  // Check browser compatibility on component mount
  useEffect(() => {
    const supported = isClipboardPasteSupported();
    setClipboardSupported(supported);
    setBrowserInfo(getBrowserInfo());
  }, []);

  // Function to handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === 'image/jpeg' || selectedFile.type === 'image/png')) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError(null);
      setResults(null);
    } else {
      setError('Please select a valid JPEG or PNG image');
      setFile(null);
      setPreviewUrl(null);
    }
  };

  // Function to handle file upload
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading file');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle paste event
  const handlePaste = useCallback(async (e) => {
    e.preventDefault();
    const items = e.clipboardData?.items;
    
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        setFile(blob);
        setPreviewUrl(URL.createObjectURL(blob));
        setError(null);
        setResults(null);
        
        // Automatically analyze pasted image
        setLoading(true);
        
        const formData = new FormData();
        formData.append('imageData', await blobToBase64(blob));
        
        try {
          const response = await axios.post('/api/upload/paste', { 
            imageData: await blobToBase64(blob) 
          });
          setResults(response.data);
        } catch (err) {
          setError(err.response?.data?.message || 'Error processing pasted image');
          console.error('Paste error:', err);
        } finally {
          setLoading(false);
        }
        
        break;
      }
    }
  }, []);

  // Convert Blob to base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Set up paste event listener
  React.useEffect(() => {
    const pasteArea = pasteAreaRef.current;
    
    if (pasteArea) {
      pasteArea.addEventListener('paste', handlePaste);
      
      // Focus the paste area when component mounts
      pasteArea.focus();
      
      return () => {
        pasteArea.removeEventListener('paste', handlePaste);
      };
    }
  }, [handlePaste]);

  // Render security issues list
  const renderIssues = () => {
    if (!results || !results.issues || results.issues.length === 0) {
      return (
        <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-4">
          <div className="flex">
            <svg className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-700 font-medium">No security issues found! Your code is safe to share.</p>
          </div>
        </div>
      );
    }

    return (
      <div>
        <h3 className="text-lg font-semibold mb-2 text-red-600">
          Security Issues Detected ({results.issues.length})
        </h3>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <ul className="space-y-2">
            {results.issues.map((issue, index) => (
              <li key={index} className="flex items-start">
                <svg className="h-5 w-5 text-red-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-medium">{issue.type} - {issue.severity} Risk</p>
                  <p className="text-sm text-gray-600">{issue.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  // Render ScanFactor
  const renderScanFactor = () => {
    if (!results || !results.scanFactor) return null;
    
    const scanFactor = results.scanFactor;
    let colorClass, message;
    
    if (scanFactor >= 90) {
      colorClass = 'text-green-700 bg-green-100';
      message = 'Excellent confidence in the analysis.';
    } else if (scanFactor >= 70) {
      colorClass = 'text-yellow-700 bg-yellow-100';
      message = 'Good confidence in the analysis.';
    } else {
      colorClass = 'text-red-700 bg-red-100';
      message = 'Low confidence. Consider uploading a clearer image for better results.';
    }
    
    return (
      <div className={`rounded-md p-3 mb-4 ${colorClass}`}>
        <div className="flex items-center">
          <div className="mr-3">
            <span className="font-bold text-xl">{scanFactor}%</span>
          </div>
          <div>
            <h4 className="font-medium">ScanFactor</h4>
            <p className="text-sm">{message}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="py-12">
      <div className="container max-w-5xl">
        <h1 className="text-3xl font-bold mb-2">Code Screenshot Scanner</h1>
        <p className="text-gray-600 mb-8">
          Upload or paste a screenshot of your code to check for security issues before sharing.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Paste Area */}
            <div 
              ref={pasteAreaRef}
              tabIndex="0"
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors cursor-pointer bg-gray-50 text-center"
              onClick={() => fileInputRef.current.click()}
              onPaste={handlePaste}
            >
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              
              <p className="text-gray-700 mb-1">
                <span className="font-medium">Click to browse</span> {clipboardSupported && 'or paste screenshot (Ctrl+V)'}
              </p>
              <p className="text-sm text-gray-500">
                Only JPEG or PNG images up to 5MB
              </p>
              
              {!clipboardSupported && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                  <p>
                    <span className="font-medium">Note:</span> Clipboard paste is not fully supported in {browserInfo.name} {browserInfo.version}.
                  </p>
                  <p className="mt-1">Please use the file upload option instead.</p>
                </div>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg, image/png"
                className="hidden"
              />
            </div>
            
            {/* Preview */}
            {previewUrl && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Preview</h3>
                <div className="border rounded-lg overflow-hidden">
                  <img 
                    src={previewUrl} 
                    alt="Code Preview" 
                    className="w-full object-cover" 
                    style={{ maxHeight: '400px' }}
                  />
                </div>
              </div>
            )}
            
            {/* Upload Button */}
            {previewUrl && !loading && !results && (
              <button
                onClick={handleUpload}
                className="btn btn-primary px-6 py-3"
                disabled={loading}
              >
                Analyze Screenshot
              </button>
            )}
            
            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Processing your screenshot...</p>
              </div>
            )}
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
                <div className="flex">
                  <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Results Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-card p-5 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Analysis Results</h2>
              
              {!results && !loading ? (
                <p className="text-gray-500">Upload or paste a screenshot to see results.</p>
              ) : (
                !loading && results && (
                  <div>
                    {renderScanFactor()}
                    {renderIssues()}
                    
                    <div className="mt-6 pt-4 border-t">
                      <p className="text-sm text-gray-500 mb-4">
                        {results.issuesFound 
                          ? 'Security issues found. Consider removing sensitive information before sharing.' 
                          : 'No security issues found. This code appears safe to share.'}
                      </p>
                      
                      <button 
                        onClick={() => {
                          setFile(null);
                          setPreviewUrl(null);
                          setResults(null);
                        }}
                        className="btn btn-secondary w-full mb-2"
                      >
                        Scan Another Screenshot
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 