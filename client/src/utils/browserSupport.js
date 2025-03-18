/**
 * Utility functions to detect browser compatibility
 */

/**
 * Check if the browser supports clipboard API
 * @returns {boolean} True if clipboard paste is supported
 */
export const isClipboardPasteSupported = () => {
  // Check for clipboard API support
  const hasClipboardAPI = !!(navigator.clipboard && navigator.clipboard.read);
  
  // Check for paste event support
  const hasPasteEvent = 'onpaste' in document.createElement('div');
  
  // Check for DataTransfer API support for older browsers
  const hasDataTransferAPI = !!(window.ClipboardEvent && window.DataTransfer);
  
  return hasClipboardAPI || (hasPasteEvent && hasDataTransferAPI);
};

/**
 * Get browser name and version
 * @returns {Object} Object containing browser name and version
 */
export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  let browserName = "Unknown";
  let browserVersion = "Unknown";
  
  // Detect browser name and version
  if (userAgent.match(/chrome|chromium|crios/i)) {
    browserName = "Chrome";
    browserVersion = userAgent.match(/(?:chrome|chromium|crios)\/(\d+)/i)?.[1] || "Unknown";
  } else if (userAgent.match(/firefox|fxios/i)) {
    browserName = "Firefox";
    browserVersion = userAgent.match(/(?:firefox|fxios)\/(\d+)/i)?.[1] || "Unknown";
  } else if (userAgent.match(/safari/i) && !userAgent.match(/chrome|chromium|crios/i)) {
    browserName = "Safari";
    browserVersion = userAgent.match(/version\/(\d+)/i)?.[1] || "Unknown";
  } else if (userAgent.match(/opr\//i)) {
    browserName = "Opera";
    browserVersion = userAgent.match(/opr\/(\d+)/i)?.[1] || "Unknown";
  } else if (userAgent.match(/edg/i)) {
    browserName = "Edge";
    browserVersion = userAgent.match(/edg\/(\d+)/i)?.[1] || "Unknown";
  } else if (userAgent.match(/trident/i)) {
    browserName = "Internet Explorer";
    browserVersion = userAgent.match(/trident\/(\d+)/i)?.[1] || "Unknown";
  }
  
  return {
    name: browserName,
    version: browserVersion
  };
};

/**
 * Check if the browser supports modern features needed for the app
 * @returns {boolean} True if the browser is supported
 */
export const isModernBrowser = () => {
  // Check for ES6 features
  const hasES6 = typeof Symbol !== 'undefined' && Symbol.iterator;
  
  // Check for Fetch API
  const hasFetch = typeof fetch !== 'undefined';
  
  // Check for modern CSS (flexbox)
  const hasFlexbox = typeof document !== 'undefined' && 
    'flexBasis' in document.documentElement.style;
  
  // Check for localStorage
  const hasStorage = typeof localStorage !== 'undefined';
  
  return hasES6 && hasFetch && hasFlexbox && hasStorage;
}; 