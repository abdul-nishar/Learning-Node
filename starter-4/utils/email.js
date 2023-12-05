const nodemailer = require('nodemailer');
const catchAsync = require('./catchAsync');

const sendEmail = catchAsync(async (options) => {
  // 1) Create a trasnporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Sheikh Abdul Nishar <kamikaze69@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // 3) Send the mail
  await transporter.sendMail(mailOptions);
});

module.exports = sendEmail;
