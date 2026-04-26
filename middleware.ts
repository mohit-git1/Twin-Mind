export async function middleware(req: NextRequest) {
  return NextResponse.next() // temporary - bypass everything

  import { NextResponse } from 'next/server'
  import type { NextRequest } from 'next/server'
  import { getToken } from 'next-auth/jwt'

  export async function middleware(req: NextRequest) {
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET
    })

    const isAuthenticated = !!token
    const { pathname } = req.nextUrl

    if (pathname.startsWith('/api/auth')) {
      return NextResponse.next()
    }

    const isPublicPath =
      pathname.startsWith('/signin') ||
      pathname.startsWith('/signup')

    if (!isAuthenticated && !isPublicPath) {
      return NextResponse.redirect(new URL('/signin', req.url))
    }

    if (isAuthenticated && isPublicPath) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  }

  export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
  }
}