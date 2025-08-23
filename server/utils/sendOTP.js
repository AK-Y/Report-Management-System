const twilio = require('twilio');

const sendOTP = async (phoneNumber, otp) => {
  try {
    // Format phone number to include country code if not present
    const formattedPhoneNumber = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : `+91${phoneNumber}`; // Assuming India country code, change as needed
    
    console.log(`Attempting to send OTP to ${formattedPhoneNumber}`);
    
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const message = await client.messages.create({
      body: `Your OTP for Inspection Management System is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhoneNumber
    });
    
    console.log(`OTP sent successfully. Message SID: ${message.sid}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP:', error.message);
    if (error.code) {
      console.error('Twilio Error Code:', error.code);
    }
    if (error.moreInfo) {
      console.error('More Info:', error.moreInfo);
    }
    return false;
  }
};

module.exports = sendOTP; 