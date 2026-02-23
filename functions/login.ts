import type { Handler, HandlerEvent } from '@netlify/functions';
import bcrypt from 'bcrypt';
import { sql, createSession } from './shared/db';

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { emailOrUsername, password } = JSON.parse(event.body || '{}');

    if (!emailOrUsername || !password) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email/username and password are required' }) };
    }

    const input = emailOrUsername.trim().toLowerCase();
    
    // Try to find user by email or username
    const users = await sql`
      SELECT id, username, email, password_hash, email_verified_at
      FROM users 
      WHERE email = ${input} OR username = ${input}
    `;

    if (users.length === 0) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid email or password' }) };
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid email or password' }) };
    }

    // Create session
    const token = await createSession(user.id);

    // Set cookie
    const cookieHeader = `session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`;

    return {
      statusCode: 200,
      headers: {
        'Set-Cookie': cookieHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          email_verified: !!user.email_verified_at,
        },
      }),
    };
  } catch (error) {
    console.error('Error in login:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};

export { handler };
