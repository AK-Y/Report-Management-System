const sendEmail = require('./sendEmail');

/**
 * Send OTP to user's email address
 * @param {string} email - User's email address
 * @param {string} otp - One-time password to send
 * @param {string} name - User's name (optional)
 * @returns {boolean} - Whether the email was sent successfully
 */
const sendEmailOTP = async (email, otp, name = '') => {
  try {
    const greeting = name ? `Hello ${name},` : 'Hello,';
    
    // Create email content with OTP
    const message = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e5e5e5; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Inspection Management System</h2>
        <p>${greeting}</p>
        <p>Your verification code is:</p>
        <div style="margin: 20px 0; text-align: center;">
          <h1 style="letter-spacing: 5px; font-size: 32px; margin: 0; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">${otp}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <p>Thanks,<br>The Inspection Management Team</p>
      </div>
    `;

    // Send email with OTP
    await sendEmail({
      email,
      subject: 'Your Verification Code',
      message
    });
    
    console.log(`Email OTP sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email OTP:', error);
    return false;
  }
};

module.exports = sendEmailOTP; 