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

  // DEBUG: Return test response to verify redirect is working
  return {
    statusCode: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      isKamiApiSuccessfulResponse: true,
      user: null,
      message: 'TEST RESPONSE - Redirect is working!',
      path: event.path,
      headers: Object.keys(event.headers)
    })
  };
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
