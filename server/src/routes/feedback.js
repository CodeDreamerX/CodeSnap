const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const passport = require('passport');

// Middleware to check if user is authenticated
const isAuthenticated = passport.authenticate('jwt', { session: false });

/**
 * @route   POST /api/feedback
 * @desc    Submit user feedback
 * @access  Public (can be used by both logged in and anonymous users)
 */
router.post('/', async (req, res) => {
  try {
    const { type, subject, message, email, screenshot, userAgent, timestamp } = req.body;
    
    // Basic validation
    if (!type || !subject || !message) {
      return res.status(400).json({ message: 'Please provide type, subject and message' });
    }

    // Get user ID if authenticated
    const userId = req.isAuthenticated ? req.user._id : null;

    // Create feedback record
    const feedback = new Feedback({
      type,
      subject,
      message,
      email,
      screenshot: screenshot ? {
        data: screenshot,
        contentType: 'image/png'
      } : null,
      userInfo: {
        userId,
        userAgent,
        timestamp,
        ipAddress: req.ip
      }
    });

    // Save to database
    await feedback.save();

    // Send notification to administrators - would need to implement
    // sendAdminNotification functionality elsewhere

    res.status(201).json({ message: 'Feedback submitted successfully', feedbackId: feedback._id });
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).json({ message: 'Server error processing feedback' });
  }
});

/**
 * @route   GET /api/feedback
 * @desc    Get all feedback (admin only)
 * @access  Private/Admin
 */
router.get('/', isAuthenticated, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to access feedback data' });
    }

    const feedback = await Feedback.find()
      .sort({ 'userInfo.timestamp': -1 })
      .select('-screenshot.data'); // Exclude screenshot data to reduce payload size

    res.json(feedback);
  } catch (err) {
    console.error('Error retrieving feedback:', err);
    res.status(500).json({ message: 'Server error retrieving feedback' });
  }
});

/**
 * @route   GET /api/feedback/:id
 * @desc    Get a specific feedback (admin only)
 * @access  Private/Admin
 */
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to access feedback data' });
    }

    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json(feedback);
  } catch (err) {
    console.error('Error retrieving feedback:', err);
    res.status(500).json({ message: 'Server error retrieving feedback' });
  }
});

module.exports = router; 