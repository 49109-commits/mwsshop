import type { Handler, HandlerEvent } from '@netlify/functions';
import { getSessionUser, sql } from './shared/db';

function generateQRCode(): string {
  return 'QR-' + crypto.randomUUID().split('-')[0].toUpperCase();
}

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
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

    const { items, roomNumber } = JSON.parse(event.body || '{}');

    if (!items || !Array.isArray(items) || items.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Items are required' }) };
    }

    if (!roomNumber || typeof roomNumber !== 'string' || roomNumber.trim() === '') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Room number is required' }) };
    }

    const qrValue = generateQRCode();

    const result = await sql`
      INSERT INTO orders (user_id, items, qr_value, room_number, status)
      VALUES (${user.user_id}, ${JSON.stringify(items)}, ${qrValue}, ${roomNumber.trim()}, 'placed')
      RETURNING id, items, qr_value, room_number, status, created_at
    `;

    const order = result[0];

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: order.id,
        items: order.items,
        qr_value: order.qr_value,
        room_number: order.room_number,
        status: order.status,
        created_at: order.created_at,
      }),
    };
  } catch (error) {
    console.error('Error in create-order:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};

export { handler };
