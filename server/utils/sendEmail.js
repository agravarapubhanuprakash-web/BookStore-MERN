const nodemailer = require('nodemailer');

/**
 * Send an email using the configured SMTP transport.
 * Falls back to console logging when SMTP credentials are not set.
 *
 * @param {string} to      - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} html    - Email body as HTML string
 */
const sendEmail = async (to, subject, html) => {
  // If SMTP is not configured, log the email to the console instead
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log('--- EMAIL (SMTP not configured, logging instead) ---');
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:    ${html}`);
    console.log('--- END EMAIL ---');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false otherwise
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'BookStore'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Email sent: ${info.messageId}`);
};

module.exports = sendEmail;
