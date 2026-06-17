import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLoginPage = pathname === '/rn-secure-admin/login'

  const token = request.cookies.get('rn_admin_session')?.value
  const session = token ? await decrypt(token) : null
  const isAuthenticated = session !== null

  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(
      new URL('/rn-secure-admin/login', request.url),
      307
    )
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(
      new URL('/rn-secure-admin', request.url),
      307
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/rn-secure-admin/:path*'],
}
