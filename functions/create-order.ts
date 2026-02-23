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
    console.log('create-order: Starting order creation');
    
    const cookie = event.headers.cookie || '';
    const match = cookie.match(/session=([^;]+)/);

    if (!match) {
      console.log('create-order: No session cookie found');
      return { statusCode: 401, body: JSON.stringify({ error: 'Not authenticated' }) };
    }

    const token = match[1];
    console.log('create-order: Token found, validating session');
    const user = await getSessionUser(token);

    if (!user) {
      console.log('create-order: Invalid session');
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid session' }) };
    }

    console.log('create-order: User authenticated:', user.user_id);
    
    let parsedBody;
    try {
      parsedBody = JSON.parse(event.body || '{}');
    } catch (parseError) {
      console.log('create-order: Failed to parse request body:', parseError);
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
    }
    
    const { items, roomNumber } = parsedBody;
    console.log('create-order: Received items:', items?.length, 'room:', roomNumber);

    if (!items || !Array.isArray(items) || items.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Items are required' }) };
    }

    if (!roomNumber || typeof roomNumber !== 'string' || roomNumber.trim() === '') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Room number is required' }) };
    }

    const qrValue = generateQRCode();

    console.log('create-order: Inserting order into database');
    console.log('create-order: user_id:', user.user_id);
    console.log('create-order: items:', JSON.stringify(items));
    console.log('create-order: qrValue:', qrValue);
    console.log('create-order: roomNumber:', roomNumber.trim());
    
    const result = await sql`
      INSERT INTO orders (user_id, items, qr_value, room_number, status)
      VALUES (${user.user_id}, ${JSON.stringify(items)}, ${qrValue}, ${roomNumber.trim()}, 'placed')
      RETURNING id, items, qr_value, room_number, status, created_at
    `;
    console.log('create-order: Order inserted successfully:', result[0]?.id);

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
