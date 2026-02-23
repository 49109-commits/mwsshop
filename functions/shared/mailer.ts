import nodemailer from 'nodemailer';

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.log('Email not configured, skipping send:', { to, subject });
    return;
  }

  try {
    await transporter.sendMail({
      from: EMAIL_USER,
      to,
      subject,
      html,
    });
    console.log('Email sent to:', to);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export async function sendOTPEmail(to: string, otp: string, purpose: string) {
  const subject = purpose === 'password_reset' 
    ? 'Password Reset OTP' 
    : 'Email Verification OTP';
  
  const html = `
    <h2>Your OTP Code</h2>
    <p>Your verification code is: <strong>${otp}</strong></p>
    <p>This code will expire in 10 minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
  `;

  await sendEmail(to, subject, html);
}
