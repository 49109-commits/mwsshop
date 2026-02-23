import type { Handler, HandlerEvent } from '@netlify/functions';
import { deleteSession } from './shared/db';

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const cookie = event.headers.cookie || '';
    const match = cookie.match(/session=([^;]+)/);

    if (match) {
      const token = match[1];
      await deleteSession(token);
    }

    return {
      statusCode: 200,
      headers: {
        'Set-Cookie': 'session=; HttpOnly; Path=/; Max-Age=0',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'Logged out successfully' }),
    };
  } catch (error) {
    console.error('Error in logout:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};

export { handler };
