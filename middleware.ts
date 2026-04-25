import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  // Use getToken which is Edge-compatible, avoids importing mongoose/bcrypt
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET });
  const isAuthenticated = !!token;

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
}

export const config = {
  // Match all routes except static files, api routes (except auth), and _next internals
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
