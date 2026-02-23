import type { Handler, HandlerEvent } from '@netlify/functions';
import crypto from 'crypto';
import { sql } from './shared/db';

const MAX_ATTEMPTS = 5;

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
    
    const { email, otp, purpose } = parsedBody;

    if (!email || !otp || !purpose) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email, OTP, and purpose are required' }) };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const users = await sql`
      SELECT id FROM users WHERE email = ${normalizedEmail}
    `;

    if (users.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid OTP' }) };
    }

    const userId = users[0].id;

    // Find valid OTP record
    const otpRecords = await sql`
      SELECT id, otp_hash, otp_salt, expires_at, attempts, used_at
      FROM otps
      WHERE user_id = ${userId}
      AND purpose = ${purpose}
      AND used_at IS NULL
      AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (otpRecords.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'OTP not found or expired' }) };
    }

    const record = otpRecords[0];

    // Check attempts
    if (record.attempts >= MAX_ATTEMPTS) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Too many attempts. Please request a new OTP.' }) };
    }

    // Hash the provided OTP with stored salt
    const inputHash = crypto.createHmac('sha256', record.otp_salt).update(otp).digest('hex');

    if (inputHash !== record.otp_hash) {
      // Increment attempts
      await sql`
        UPDATE otps SET attempts = attempts + 1 WHERE id = ${record.id}
      `;

      const remainingAttempts = MAX_ATTEMPTS - record.attempts - 1;
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Invalid OTP. ${remainingAttempts} attempts remaining.` }),
      };
    }

    // Mark OTP as used
    await sql`
      UPDATE otps SET used_at = NOW() WHERE id = ${record.id}
    `;

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'OTP verified successfully' }),
    };
  } catch (error) {
    console.error('Error in verify-otp:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};

export { handler };
