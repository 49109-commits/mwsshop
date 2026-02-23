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
    let token: string | null = null;

    // Try to get token from Authorization header first (for browser extensions)
    const authHeader = event.headers.authorization || event.headers.Authorization;
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
      const match = cookie.match(/session=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }

    // If no token found, return unauthorized
    if (!token) {
      return { 
        statusCode: 401, 
        body: JSON.stringify({ 
          error: { 
            errors: ['Invalid Authorization'] 
          },
          isKamiApiSuccessfulResponse: false 
        }) 
      };
    }

    // Validate the session token
    const user = await getSessionUser(token);

    if (!user) {
      return { 
        statusCode: 401, 
        body: JSON.stringify({ 
          error: { 
            errors: ['Invalid Authorization'] 
          },
          isKamiApiSuccessfulResponse: false 
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
