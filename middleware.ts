import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;

  // Public paths that don't require authentication
  const publicPaths = ['/signin', '/signup'];
  const isPublicPath = publicPaths.some((path) =>
    nextUrl.pathname.startsWith(path)
  );

  // Allow all /api/auth/* routes through (NextAuth handlers)
  const isAuthApi = nextUrl.pathname.startsWith('/api/auth');
  if (isAuthApi) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to sign in
  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL('/signin', nextUrl));
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Match all routes except static files and _next internals
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
