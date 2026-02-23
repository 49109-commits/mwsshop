import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

console.log('db.ts: DATABASE_URL present:', !!DATABASE_URL);

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export const sql = neon(DATABASE_URL);

export async function getSessionUser(token: string) {
  const result = await sql`
    SELECT s.user_id, u.username, u.email, u.email_verified_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  return result[0] || null;
}

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await sql`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt})
  `;

  return token;
}

export async function deleteSession(token: string) {
  await sql`DELETE FROM sessions WHERE token = ${token}`;
}

export async function deleteUserSessions(userId: string) {
  await sql`DELETE FROM sessions WHERE user_id = ${userId}`;
}
