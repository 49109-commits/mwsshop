import type { Handler, HandlerEvent } from '@netlify/functions';
import { getSessionUser } from './shared/db';

/**
 * Browser Extension User Endpoint
 * 
 * This endpoint provides user authentication data for browser extensions.
 * It supports both cookie-based and Authorization header-based authentication.
 * 
 * Expected URL: /api/browser_extension/user
 */
const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'GET') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Method not allowed' }) 
    };
  }

  try {
    let token: string | null = null;

    // Try Authorization header first (for browser extensions)
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (authHeader) {
      if (authHeader.toLowerCase().startsWith('bearer ')) {
        token = authHeader.substring(7);
      } else {
        token = authHeader;
      }
    }

    // Fall back to cookie
    if (!token) {
      const cookie = event.headers.cookie || '';
      const match = cookie.match(/session=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }

    // Not authenticated - return success with null user
    if (!token) {
      return {
        statusCode: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          isKamiApiSuccessfulResponse: true,
          user: null
        })
      };
    }

    // Validate session token
    const user = await getSessionUser(token);

    if (!user) {
      return {
        statusCode: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          isKamiApiSuccessfulResponse: true,
          user: null
        })
      };
    }

    // Return user data
    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        isKamiApiSuccessfulResponse: true,
        user: {
          id: user.user_id,
          username: user.username,
          email: user.email,
          email_verified: !!user.email_verified_at,
        },
      }),
    };
  } catch (error) {
    console.error('Error in browser-extension-user:', error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        error: { errors: ['Internal server error'] },
        isKamiApiSuccessfulResponse: false 
      }) 
    };
  }
};

export const OPTIONS: Handler = async () => {
  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
    body: '',
  };
};

export { handler };
