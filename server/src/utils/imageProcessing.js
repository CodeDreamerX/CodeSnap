const fs = require('fs');
const Jimp = require('jimp');
const path = require('path');
const { createWorker } = require('tesseract.js');

/**
 * Preprocesses an image to optimize it for OCR
 * @param {string} inputPath - Path to the input image
 * @returns {Promise<string>} - Path to the preprocessed image
 */
const preprocessImage = async (inputPath) => {
  try {
    // Read the image
    const image = await Jimp.read(inputPath);
    
    // Convert to grayscale for better OCR
    image.grayscale();
    
    // Create a processed filename
    const processedPath = `${inputPath}-processed.png`;
    
    // Find the dominant background color
    const colorMap = {};
    
    // Sample corners to determine the most common color (likely background)
    const width = image.getWidth();
    const height = image.getHeight();
    
    // Sample various points at the edges to find common background color
    const samplePoints = [
      { x: 0, y: 0 },
      { x: width - 1, y: 0 },
      { x: 0, y: height - 1 },
      { x: width - 1, y: height - 1 },
      { x: Math.floor(width / 2), y: 0 },
      { x: 0, y: Math.floor(height / 2) },
      { x: width - 1, y: Math.floor(height / 2) },
      { x: Math.floor(width / 2), y: height - 1 }
    ];
    
    // Get colors from sample points
    for (const point of samplePoints) {
      const color = image.getPixelColor(point.x, point.y);
      const hex = Jimp.intToRGBA(color);
      const key = `${hex.r},${hex.g},${hex.b}`;
      if (!colorMap[key]) {
        colorMap[key] = 0;
      }
      colorMap[key]++;
    }
    
    // Find the most common color
    let maxCount = 0;
    let mostCommonColor = null;
    
    for (const [color, count] of Object.entries(colorMap)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonColor = color;
      }
    }
    
    // Convert to array of RGB values
    const [r, g, b] = mostCommonColor.split(',').map(Number);
    
    // Process the image with color segmentation
    image.scan(0, 0, width, height, function(x, y, idx) {
      const pixelColor = Jimp.intToRGBA(this.getPixelColor(x, y));
      
      // Calculate color distance from background
      const dr = pixelColor.r - r;
      const dg = pixelColor.g - g;
      const db = pixelColor.b - b;
      const distance = Math.sqrt(dr * dr + dg * dg + db * db);
      
      // If color is different from background by a threshold, make it black, otherwise white
      if (distance > 50) {
        this.setPixelColor(Jimp.rgbaToInt(0, 0, 0, 255), x, y); // Black
      } else {
        this.setPixelColor(Jimp.rgbaToInt(255, 255, 255, 255), x, y); // White
      }
    });
    
    // Increase contrast
    image.contrast(0.5);
    
    // Save processed image
    await image.writeAsync(processedPath);
    
    return processedPath;
  } catch (error) {
    console.error('Image preprocessing error:', error);
    throw error;
  }
};

/**
 * Process an image to extract text using OCR
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<{text: string, confidence: number}>} - Extracted text and confidence
 */
const processImage = async (imagePath) => {
  try {
    // Preprocess the image
    const processedImagePath = await preprocessImage(imagePath);
    
    // Create a worker
    const worker = await createWorker();
    
    // Load language and set parameters
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    // Set OCR parameters optimized for code
    await worker.setParameters({
      tessedit_pageseg_mode: '6', // Assume a single uniform block of text
      load_system_dawg: '0', // Disable dictionary to avoid "fixing" code terms
      load_freq_dawg: '0', // Disable frequency-based corrections
    });
    
    // Recognize text
    const { data } = await worker.recognize(processedImagePath);
    
    // Clean up processed image
    fs.unlinkSync(processedImagePath);
    
    // Terminate worker
    await worker.terminate();
    
    return {
      text: data.text,
      confidence: data.confidence
    };
  } catch (error) {
    console.error('OCR processing error:', error);
    throw error;
  }
};

/**
 * Analyze code for security risks
 * @param {string} code - The code text to analyze
 * @returns {Object} - Analysis results
 */
const analyzeCodeForSecurity = (code) => {
  const issues = [];
  
  // Check for AWS credentials
  const awsKeyRegex = /AKIA[0-9A-Z]{16}/g;
  const awsSecretRegex = /[0-9a-zA-Z/+]{40}/g;
  
  // Check for API keys and tokens with common patterns
  const apiKeyRegex = /['"`](api[-_]?key|api[-_]?token|app[-_]?key|app[-_]?token|auth[-_]?token|access[-_]?token|secret[-_]?key)['"`]\s*[:=]\s*['"`][0-9a-zA-Z_\-]{20,}['"`]/gi;
  
  // Check for password assignments
  const passwordRegex = /['"`](password|passwd|pwd|secret)['"`]\s*[:=]\s*['"`][^'"`]+['"`]/gi;
  
  // Check for database connection strings
  const dbConnRegex = /(mongodb|mysql|postgresql|postgres):\/\/[^:]+:[^@]+@[^/]+/gi;
  
  // Check for IP addresses
  const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
  
  // Check for email addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  
  // AWS Keys
  const awsKeys = code.match(awsKeyRegex);
  if (awsKeys) {
    issues.push({
      type: 'AWS Access Key',
      description: 'Found potential AWS Access Key ID',
      severity: 'High'
    });
  }
  
  // AWS Secrets
  const awsSecrets = code.match(awsSecretRegex);
  if (awsSecrets && awsKeys) { // Only flag if we also found an AWS key
    issues.push({
      type: 'AWS Secret Key',
      description: 'Found potential AWS Secret Access Key',
      severity: 'High'
    });
  }
  
  // API Keys
  const apiKeys = code.match(apiKeyRegex);
  if (apiKeys) {
    issues.push({
      type: 'API Key/Token',
      description: 'Found potential API key or token',
      severity: 'High'
    });
  }
  
  // Passwords
  const passwords = code.match(passwordRegex);
  if (passwords) {
    issues.push({
      type: 'Password',
      description: 'Found hardcoded password or secret',
      severity: 'High'
    });
  }
  
  // Database connection strings
  const dbConnections = code.match(dbConnRegex);
  if (dbConnections) {
    issues.push({
      type: 'Database Credentials',
      description: 'Found database connection string with credentials',
      severity: 'High'
    });
  }
  
  // IP addresses
  const ips = code.match(ipRegex);
  if (ips) {
    issues.push({
      type: 'IP Address',
      description: 'Found hardcoded IP address',
      severity: 'Medium'
    });
  }
  
  // Email addresses
  const emails = code.match(emailRegex);
  if (emails) {
    issues.push({
      type: 'Email Address',
      description: 'Found email address',
      severity: 'Low'
    });
  }
  
  return {
    issues,
    issuesFound: issues.length > 0
  };
};

module.exports = {
  processImage,
  analyzeCodeForSecurity
}; 