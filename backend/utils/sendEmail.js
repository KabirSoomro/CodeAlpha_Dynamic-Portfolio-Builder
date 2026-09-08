const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Debug: log whether credentials are loaded
  console.log('[sendEmail] EMAIL_USER:', process.env.EMAIL_USER ? '✅ loaded' : '❌ MISSING');
  console.log('[sendEmail] EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ loaded' : '❌ MISSING');

  // Create a reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    service: 'gmail',  // Use 'service' shorthand instead of manual host/port
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Construct the email message
  const message = {
    from: `Portfolio Builder AI <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html || options.message,
  };

  // Send the email
  const info = await transporter.sendMail(message);

  console.log('[sendEmail] ✅ Message sent:', info.messageId);
};

module.exports = sendEmail;
