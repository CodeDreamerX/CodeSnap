const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const passport = require('passport');
const Jimp = require('jimp');
const Tesseract = require('tesseract.js');
const { processImage, analyzeCodeForSecurity } = require('../utils/imageProcessing');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter for image uploads
const fileFilter = (req, file, cb) => {
  // Accept only JPEG and PNG
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG and PNG files are allowed'), false);
  }
};

// Configure upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Auth middleware
const auth = passport.authenticate('jwt', { session: false });

// Route for file upload
router.post('/file', auth, upload.single('screenshot'), async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Get file path
    const filePath = req.file.path;
    
    // Process image to extract text
    const { text, confidence } = await processImage(filePath);
    
    // Analyze code for security issues
    const securityResults = analyzeCodeForSecurity(text);
    
    // Calculate ScanFactor
    const scanFactor = Math.round(confidence);
    
    // Create response
    const response = {
      scanFactor,
      issues: securityResults.issues,
      issuesFound: securityResults.issues.length > 0
    };
    
    // Delete the uploaded file
    fs.unlinkSync(filePath);
    
    res.json(response);
  } catch (error) {
    console.error('Upload processing error:', error);
    
    // Delete the uploaded file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    res.status(500).json({ message: 'Error processing image', error: error.message });
  }
});

// Route for paste upload (base64 image data)
router.post('/paste', auth, async (req, res) => {
  try {
    const { imageData } = req.body;
    
    // Validate image data
    if (!imageData || !imageData.startsWith('data:image/')) {
      return res.status(400).json({ message: 'Invalid image data' });
    }
    
    // Create temp directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Create temp file path
    const filePath = path.join(uploadDir, `paste-${Date.now()}.png`);
    
    // Extract base64 data
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Write buffer to file
    fs.writeFileSync(filePath, buffer);
    
    // Process image to extract text
    const { text, confidence } = await processImage(filePath);
    
    // Analyze code for security issues
    const securityResults = analyzeCodeForSecurity(text);
    
    // Calculate ScanFactor
    const scanFactor = Math.round(confidence);
    
    // Create response
    const response = {
      scanFactor,
      issues: securityResults.issues,
      issuesFound: securityResults.issues.length > 0
    };
    
    // Delete the temp file
    fs.unlinkSync(filePath);
    
    res.json(response);
  } catch (error) {
    console.error('Paste processing error:', error);
    res.status(500).json({ message: 'Error processing image', error: error.message });
  }
});

module.exports = router; 