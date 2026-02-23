import type { Handler, HandlerEvent } from '@netlify/functions';
import { getSessionUser, sql } from './shared/db';

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'DELETE') {
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

    const orderId = event.queryStringParameters?.id;

    if (!orderId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Order ID is required' }) };
    }

    // Check ownership
    const orders = await sql`
      SELECT id FROM orders WHERE id = ${orderId} AND user_id = ${user.user_id}
    `;

    if (orders.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Order not found' }) };
    }

    // Update status to cancelled instead of deleting
    await sql`
      UPDATE orders SET status = 'cancelled', updated_at = NOW()
      WHERE id = ${orderId}
    `;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Order cancelled successfully' }),
    };
  } catch (error) {
    console.error('Error in delete-order:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};

export { handler };
