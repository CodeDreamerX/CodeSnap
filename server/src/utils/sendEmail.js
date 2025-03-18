const nodemailer = require('nodemailer');

/**
 * Send an email using Nodemailer
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Email body (text)
 * @param {string} html - Email body (HTML, optional)
 * @returns {Promise<object>} - Nodemailer response
 */
const sendEmail = async (to, subject, text, html = '') => {
  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // Define email options
    const mailOptions = {
      from: `"CodeSnap" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      text,
      html: html || text // Use HTML if provided, otherwise use text
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

module.exports = sendEmail; 