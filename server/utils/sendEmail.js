const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // use true only if using port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
  // Define email options
  const mailOptions = {
    from: `${process.env.EMAIL_FROM} <${process.env.EMAIL_USERNAME}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  // Send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail; 