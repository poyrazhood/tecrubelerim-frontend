import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PASSWORD = 'Tecrube@Admin2026!'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const auth = request.cookies.get('admin_auth')?.value
    
    if (auth !== ADMIN_PASSWORD) {
      // Login sayfasına yönlendir
      if (request.nextUrl.pathname === '/admin/login') {
        return NextResponse.next()
      }
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
