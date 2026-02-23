import type { Handler, HandlerEvent } from '@netlify/functions';
import { getSessionUser, sql } from './shared/db';

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'DELETE') {
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
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid session' }) };
    }

    // Get all sessions for the user
    const sessions = await sql`
      SELECT id, created_at, expires_at
      FROM sessions
      WHERE user_id = ${user.user_id}
      ORDER BY created_at DESC
    `;

    // If DELETE, delete all sessions except current
    if (event.httpMethod === 'DELETE') {
      await sql`DELETE FROM sessions WHERE user_id = ${user.user_id} AND token != ${token}`;
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'All other sessions logged out' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        sessions: sessions.map(s => ({
          id: s.id,
          created_at: s.created_at,
          expires_at: s.expires_at,
          current: s.token === token,
        })),
      }),
    };
  } catch (error) {
    console.error('Error in user-sessions:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};

export { handler };
