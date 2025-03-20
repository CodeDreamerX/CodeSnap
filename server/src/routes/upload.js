const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const passport = require('passport');
const Jimp = require('jimp');
const Tesseract = require('tesseract.js');
const { processImage, saveImage } = require('../utils/imageProcessing');
const { analyzeCodeForSecurity } = require('../utils/securityPatterns');

const router = express.Router();


// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            console.error('Invalid file type:', file.mimetype);
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Auth middleware
const auth = passport.authenticate('jwt', { session: false });

// Handle image upload and processing
router.post('/', upload.single('image'), async (req, res) => {
    try {
        console.log('Upload request received:', {
            hasFile: !!req.file,
            fileType: req.file?.mimetype,
            fileSize: req.file?.size,
            fileName: req.file?.originalname
        });

        if (!req.file) {
            console.error('No file in request');
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Save the uploaded image
        const imagePath = await saveImage(req.file);
        console.log('Image saved to:', imagePath);

        // Process the image to extract code
        const { text: extractedCode, confidence } = await processImage(req.file.buffer);
        console.log('Code extracted with confidence:', confidence);

        // Analyze the code for security issues
        const securityAnalysis = await analyzeCodeForSecurity(extractedCode);
        console.log('Security analysis completed');

        res.json({
            success: true,
            code: extractedCode,
            confidence: Math.round(confidence),
            securityAnalysis,
            imagePath
        });
    } catch (error) {
        console.error('Upload error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({
            error: 'Error processing image',
            details: error.message
        });
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
    
    // Extract base64 data
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Process image to extract text directly from buffer
    const { text: extractedCode, confidence } = await processImage(buffer);
    console.log('Code extracted with confidence:', confidence);
    
    // Analyze code for security issues
    const securityAnalysis = await analyzeCodeForSecurity(extractedCode);
    console.log('Security analysis completed');
    
    res.json({
      success: true,
      code: extractedCode,
      confidence: Math.round(confidence),
      securityAnalysis
    });
  } catch (error) {
    console.error('Paste processing error:', error);
    res.status(500).json({ message: 'Error processing image', error: error.message });
  }
});

module.exports = router; 