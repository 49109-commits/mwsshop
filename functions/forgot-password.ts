import type { Handler, HandlerEvent } from '@netlify/functions';
import crypto from 'crypto';
import { sql } from './shared/db';
import { sendOTPEmail } from './shared/mailer';

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
    
    const { email } = parsedBody;

    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email is required' }) };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const users = await sql`
      SELECT id FROM users WHERE email = ${normalizedEmail}
    `;

    // Always return success to prevent email enumeration
    if (users.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'If an account exists, a reset code has been sent' }),
      };
    }

    const userId = users[0].id;

    // Generate OTP using crypto
    const otp = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTPs for this user
    await sql`DELETE FROM password_resets WHERE user_id = ${userId}`;

    // Store hashed OTP (in production, hash it properly)
    await sql`
      INSERT INTO password_resets (user_id, token, expires_at)
      VALUES (${userId}, ${otp}, ${expiresAt})
    `;

    // Send email (in production)
    await sendOTPEmail(normalizedEmail, otp, 'password_reset');

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'If an account exists, a reset code has been sent' }),
    };
  } catch (error) {
    console.error('Error in forgot-password:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};

export { handler };
