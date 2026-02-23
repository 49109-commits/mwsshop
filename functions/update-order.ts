import type { Handler, HandlerEvent } from '@netlify/functions';
import { getSessionUser, sql } from './shared/db';

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'PUT' && event.httpMethod !== 'PATCH') {
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

    let parsedBody;
    try {
      parsedBody = JSON.parse(event.body || '{}');
    } catch {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
    }
    
    const { id, items, status } = parsedBody;

    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Order ID is required' }) };
    }

    // Check ownership
    const orders = await sql`
      SELECT id FROM orders WHERE id = ${id} AND user_id = ${user.user_id}
    `;

    if (orders.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Order not found' }) };
    }

    // Build dynamic SQL update with proper parameterization
    if (items && status) {
      await sql`UPDATE orders SET items = ${JSON.stringify(items)}, status = ${status}, updated_at = NOW() WHERE id = ${id}`;
    } else if (items) {
      await sql`UPDATE orders SET items = ${JSON.stringify(items)}, updated_at = NOW() WHERE id = ${id}`;
    } else if (status) {
      await sql`UPDATE orders SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
    }

    const updated = await sql`SELECT * FROM orders WHERE id = ${id}`;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: updated[0] }),
    };
  } catch (error) {
    console.error('Error in update-order:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};

export { handler };
