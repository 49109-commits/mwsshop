import type { Handler, HandlerEvent } from '@netlify/functions';
import bcrypt from 'bcryptjs';
import { sql } from './shared/db';

const SALT_ROUNDS = 10;

function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  if (!/(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(password)) {
    return { valid: false, error: 'Password must contain at least 1 letter, 1 number, and 1 special character' };
  }
  return { valid: true };
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
    
    const { token, password } = parsedBody;

    if (!token || !password) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Token and password are required' }) };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return { statusCode: 400, body: JSON.stringify({ error: passwordValidation.error }) };
    }

    // Find the password reset record
    const resets = await sql`
      SELECT pr.user_id, pr.expires_at
      FROM password_resets pr
      WHERE pr.token = ${token}
    `;

    if (resets.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid token' }) };
    }

    const reset = resets[0];

    if (new Date(reset.expires_at) < new Date()) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Token has expired' }) };
    }

    // Hash new password
    const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);

    // Update user password
    await sql`
      UPDATE users SET password_hash = ${passwordHash}, updated_at = NOW()
      WHERE id = ${reset.user_id}
    `;

    // Delete the used reset token
    await sql`DELETE FROM password_resets WHERE user_id = ${reset.user_id}`;

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Password reset successfully' }),
    };
  } catch (error) {
    console.error('Error in reset-password:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};

export { handler };
