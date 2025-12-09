import { NextRequest, NextResponse } from 'next/server';

export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin12345',
};

export function isAuthenticated(req: NextRequest): boolean {
  const authCookie = req.cookies.get('admin_session');
  return authCookie?.value === 'true';
}
