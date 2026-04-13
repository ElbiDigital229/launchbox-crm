import { cookies } from 'next/headers';
import crypto from 'crypto';
import prisma from './prisma';

const SESSION_COOKIE = 'session_token';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Simple token-based sessions stored in DB-less approach using signed tokens
// Token format: userId.timestamp.signature

function getSecret() {
  const secret = process.env.SESSION_SECRET || 'launchbox-crm-default-secret-change-me';
  return secret;
}

function sign(payload) {
  const hmac = crypto.createHmac('sha256', getSecret());
  hmac.update(payload);
  return hmac.digest('hex');
}

export function createSessionToken(userId) {
  const payload = `${userId}.${Date.now()}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [userId, timestamp, signature] = parts;
  const payload = `${userId}.${timestamp}`;
  const expected = sign(payload);

  if (signature !== expected) return null;

  // Check expiry
  const age = (Date.now() - parseInt(timestamp)) / 1000;
  if (age > SESSION_MAX_AGE) return null;

  return parseInt(userId);
}

export async function setSessionCookie(userId) {
  const token = createSessionToken(userId);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const userId = verifySessionToken(token);
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, is_admin: true },
  });
  return user;
}

export async function getSessionUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}
