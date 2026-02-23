import type { Handler, HandlerEvent } from '@netlify/functions';
import crypto from 'crypto';
import { sql } from './shared/db';
import { sendOTPEmail } from './shared/mailer';

function generateOTP(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashOTP(otp: string, salt: string): string {
  return crypto.createHmac('sha256', salt).update(otp).digest('hex');
}

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    let parsedBody;
    try {
      parsedBody = JSON.parse(event.body || '{}');
    } catch {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
    }
    
    const { email, purpose } = parsedBody;

    if (!email || !purpose) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email and purpose are required' }) };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const users = await sql`
      SELECT id FROM users WHERE email = ${normalizedEmail}
    `;

    // Always return success to prevent email enumeration
    if (users.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'If an account exists, an OTP has been sent' }),
      };
    }

    const userId = users[0].id;

    // Generate OTP and salt using crypto
    const otp = generateOTP();
    const salt = crypto.randomBytes(32).toString('hex');
    const otpHash = hashOTP(otp, salt);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing unused OTPs for this user and purpose
    await sql`
      DELETE FROM otps 
      WHERE user_id = ${userId} 
      AND purpose = ${purpose} 
      AND used_at IS NULL
    `;

    // Insert new OTP
    await sql`
      INSERT INTO otps (user_id, otp_hash, otp_salt, purpose, expires_at)
      VALUES (${userId}, ${otpHash}, ${salt}, ${purpose}, ${expiresAt})
    `;

    // Send OTP via email (in production)
    await sendOTPEmail(normalizedEmail, otp, purpose);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'If an account exists, an OTP has been sent' }),
    };
  } catch (error) {
    console.error('Error in send-otp:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};

export { handler };
