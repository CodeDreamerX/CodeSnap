const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['bug', 'feature', 'security', 'general'],
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 255,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  screenshot: {
    data: String, // Base64 encoded image
    contentType: String
  },
  userInfo: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userAgent: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'resolved', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date
}, {
  timestamps: true
});

// Create indexes for better query performance
feedbackSchema.index({ 'userInfo.timestamp': -1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ type: 1 });

// Remove sensitive data when converting to JSON
feedbackSchema.methods.toJSON = function() {
  const feedbackObject = this.toObject();
  
  // Remove base64 screenshot data from JSON output unless explicitly requested
  if (feedbackObject.screenshot && feedbackObject.screenshot.data) {
    feedbackObject.screenshot = {
      ...feedbackObject.screenshot,
      data: '[Screenshot Data]',
      hasScreenshot: true
    };
  }
  
  return feedbackObject;
};

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback; 