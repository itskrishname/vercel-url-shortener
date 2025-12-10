import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only run logic if path starts with /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authCookie = request.cookies.get('admin_session');

    if (authCookie?.value !== 'true') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // For all other routes (including /api), do nothing and let it pass.
  return NextResponse.next();
}

export const config = {
  // Only invoke middleware on admin routes to be absolutely safe
  matcher: [
    '/admin/:path*',
  ],
};
