import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/auth"

export async function middleware(req: NextRequest) {
  const session = await auth()

  const isAuthenticated = !!session
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  const isPublicPath =
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup")

  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL("/signin", req.url))
  }

  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}