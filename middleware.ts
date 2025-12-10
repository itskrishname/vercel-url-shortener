import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Double check to ensure we never accidentally block API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authCookie = request.cookies.get('admin_session');

    if (authCookie?.value !== 'true') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  // Explicitly match only admin routes, but the function also checks.
  matcher: [
    '/admin/:path*',
    '/api/:path*' // We match API to ensure we explicitly ALLOW it (bypass) if needed, though default is allow.
  ],
};
