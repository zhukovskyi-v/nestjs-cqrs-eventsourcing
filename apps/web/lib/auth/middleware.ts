import { NextResponse, type NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

export async function authMiddleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isProtected =
    request.nextUrl.pathname.startsWith('/browse') ||
    request.nextUrl.pathname === '/'

  if (isProtected && !sessionCookie) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  if (isAuthPage && sessionCookie) {
    const url = request.nextUrl.clone()
    url.pathname = '/browse'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}
