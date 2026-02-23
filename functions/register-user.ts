import type { Handler, HandlerEvent } from '@netlify/functions';
import bcrypt from 'bcrypt';
import { sql } from './shared/db';

const SALT_ROUNDS = 10;

function sanitizeString(value: string, maxLength: number): string {
  return String(value)
    .normalize('NFKC')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 4) {
    return { valid: false, error: 'Password must be at least 4 characters' };
  }
  return { valid: true };
}

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { username, email, password } = JSON.parse(event.body || '{}');

    if (!username || !email || !password) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Username, email, and password are required' }) };
    }

    const sanitizedUsername = sanitizeString(username, 32);
    const sanitizedEmail = sanitizeString(email, 254).toLowerCase();

    if (!validateEmail(sanitizedEmail)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email format' }) };
    }

    if (sanitizedUsername.length < 2) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Username must be at least 2 characters' }) };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return { statusCode: 400, body: JSON.stringify({ error: passwordValidation.error }) };
    }

    // Check if email already exists
    const existingEmail = await sql`SELECT id FROM users WHERE email = ${sanitizedEmail}`;
    if (existingEmail.length > 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email already registered' }) };
    }

    // Check if username already exists
    const existingUsername = await sql`SELECT id FROM users WHERE username = ${sanitizedUsername}`;
    if (existingUsername.length > 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Username already taken' }) };
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await sql`
      INSERT INTO users (username, email, password_hash)
      VALUES (${sanitizedUsername}, ${sanitizedEmail}, ${passwordHash})
      RETURNING id
    `;

    const userId = result[0].id;

    // Generate verification token and send email
    const verificationToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await sql`
      INSERT INTO email_verifications (user_id, token, expires_at)
      VALUES (${userId}, ${verificationToken}, ${expiresAt})
    `;

    // Send verification email (in production)
    // await sendEmail(sanitizedEmail, 'Verify your email', `Click here to verify: ...`);

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'User created successfully. Please verify your email.' }),
    };
  } catch (error) {
    console.error('Error in register-user:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};

export { handler };
