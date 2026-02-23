import type { Handler, HandlerEvent } from '@netlify/functions';
import { getSessionUser } from './shared/db';

/**
 * Browser Extension User Endpoint
 * 
 * This endpoint provides user authentication data for browser extensions.
 * It supports both cookie-based and Authorization header-based authentication.
 * 
 * Expected URL: /api/browser_extension/user
 * The browser extension expects user data to show/hide UI elements based on login status.
 */
const handler: Handler = async (event: HandlerEvent) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Method not allowed' }) 
    };
  }

  try {
    console.log('browser-extension-user: Request received');
    console.log('browser-extension-user: Headers:', JSON.stringify(event.headers));
    
    let token: string | null = null;

    // Try to get token from Authorization header first (for browser extensions)
    const authHeader = event.headers.authorization || event.headers.Authorization;
    console.log('browser-extension-user: Auth header:', authHeader);
    
    if (authHeader) {
      // Support both "Bearer token" and just "token" formats
      if (authHeader.toLowerCase().startsWith('bearer ')) {
        token = authHeader.substring(7);
      } else {
        token = authHeader;
      }
    }

    // Fall back to cookie if no Authorization header
    if (!token) {
      const cookie = event.headers.cookie || '';
      console.log('browser-extension-user: Cookie:', cookie.substring(0, 50) + '...');
      const match = cookie.match(/session=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }

    console.log('browser-extension-user: Token found:', !!token);

    // If no token found, return not logged in (but successful response)
    // This allows the browser extension to distinguish between logged in and not logged in
    if (!token) {
      return {
        statusCode: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type'
        },
        body: JSON.stringify({
          isKamiApiSuccessfulResponse: true,
          user: null,
          message: 'Not authenticated'
        })
      };
    }

    // Validate the session token
    const user = await getSessionUser(token);

    if (!user) {
      // Invalid token - return not logged in (but successful response)
      return {
        statusCode: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type'
        },
        body: JSON.stringify({
          isKamiApiSuccessfulResponse: true,
          user: null,
          message: 'Invalid or expired session'
        })
      };
    }

    // Return user data in a format compatible with browser extensions
    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type'
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
        error: { 
          errors: ['Internal server error'] 
        },
        isKamiApiSuccessfulResponse: false 
      }) 
    };
  }
};

// Handle CORS preflight requests
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
