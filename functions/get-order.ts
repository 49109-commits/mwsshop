import type { Handler, HandlerEvent } from '@netlify/functions';
import { getSessionUser, sql } from './shared/db';

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
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid session' }) };
    }

    const orderId = event.queryStringParameters?.id;

    console.log('Query params:', event.queryStringParameters);
    console.log('Order ID:', orderId);

    if (!orderId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Order ID is required' }) };
    }

    const orders = await sql`
      SELECT id, items, qr_value, room_number, status, created_at
      FROM orders
      WHERE id = ${orderId} AND user_id = ${user.user_id}
    `;

    if (orders.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Order not found' }) };
    }

    const order = orders[0];

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order: {
          ...order,
          items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
        }
      }),
    };
  } catch (error) {
    console.error('Error in get-order:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};

export { handler };
