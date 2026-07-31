import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Get session cookie
  const sessionCookie = request.cookies.get('timber_admin_session');

  // 2. Routing Rules for Admin Portal
  if (pathname.startsWith('/admin')) {
    // If trying to access admin subpages without session
    if (!sessionCookie && pathname !== '/admin/login') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all admin paths
  matcher: ['/admin/:path*'],
};
