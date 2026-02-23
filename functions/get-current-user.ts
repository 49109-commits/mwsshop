import type { Handler, HandlerEvent } from '@netlify/functions';
import { getSessionUser } from './shared/db';

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const cookie = event.headers.cookie || '';
    const match = cookie.match(/session=([^;]+)/);

    if (!match) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Not authenticated' }) };
    }

    const token = match[1];
    const user = await getSessionUser(token);

    if (!user) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid or expired session' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: {
          id: user.user_id,
          username: user.username,
          email: user.email,
          email_verified: !!user.email_verified_at,
        },
      }),
    };
  } catch (error) {
    console.error('Error in get-current-user:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};

export { handler };
