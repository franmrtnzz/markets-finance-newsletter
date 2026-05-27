import { NextRequest, NextResponse } from 'next/server'

const ADMIN_SESSION_COOKIE = 'admin_session'

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const hasAdminSession =
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value === 'authenticated'

  if (pathname === '/admin/login') {
    if (hasAdminSession) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    return NextResponse.next()
  }

  if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/login') {
    if (!hasAdminSession) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    return NextResponse.next()
  }

  if (pathname.startsWith('/admin') && !hasAdminSession) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('next', `${pathname}${search}`)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
