import type { Handler, HandlerEvent } from '@netlify/functions';
import { sql } from './shared/db';

function sanitizeString(value: string, maxLength: number): string {
  return String(value)
    .normalize('NFKC')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const username = event.queryStringParameters?.username;

    if (!username) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Username is required' }) };
    }

    const sanitizedUsername = sanitizeString(username, 32);

    if (!/^[a-zA-Z0-9_]+$/.test(sanitizedUsername)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid username format' }) };
    }

    const users = await sql`
      SELECT id FROM users WHERE username = ${sanitizedUsername}
    `;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: users.length === 0 }),
    };
  } catch (error) {
    console.error('Error in check-username:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};

export { handler };
