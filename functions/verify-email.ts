import type { Handler, HandlerEvent } from '@netlify/functions';
import { sql } from './shared/db';

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
    
    const { token } = parsedBody;

    if (!token) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Token is required' }) };
    }

    // Find the verification record
    const verifications = await sql`
      SELECT ev.user_id, ev.expires_at
      FROM email_verifications ev
      WHERE ev.token = ${token}
    `;

    if (verifications.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid token' }) };
    }

    const verification = verifications[0];

    if (new Date(verification.expires_at) < new Date()) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Token has expired' }) };
    }

    // Mark email as verified
    await sql`
      UPDATE users SET email_verified_at = NOW(), updated_at = NOW()
      WHERE id = ${verification.user_id}
    `;

    // Delete the verification record
    await sql`DELETE FROM email_verifications WHERE user_id = ${verification.user_id}`;

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email verified successfully' }),
    };
  } catch (error) {
    console.error('Error in verify-email:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};

export { handler };
