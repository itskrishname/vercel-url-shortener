import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export interface TokenPayload {
  userId: string;
  username: string;
  role: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function getUserFromRequest(req: NextRequest): TokenPayload | null {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
