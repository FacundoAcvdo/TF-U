import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getUserFromToken } from './lib/auth'

const PUBLIC_PATHS = ['/login']
const PUBLIC_PREFIXES = ['/api/auth']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('access_token')?.value
  const user = getUserFromToken(token)

  const isPublicPath = PUBLIC_PATHS.includes(pathname) || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
  const isAuthenticated = !!user

  // No autenticado y ruta protegida -> login
  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = new URL('/login', request.url)
    // preservar destino para redirect post-login si se quiere
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Autenticado y va a /login -> redirigir a dashboard por defecto
  if (isAuthenticated && pathname === '/login') {
    const next = request.nextUrl.searchParams.get('next')
    // evitar loop si next es /login
    const target = next && next !== '/login' ? next : '/cargar-dataset'
    return NextResponse.redirect(new URL(target, request.url))
  }

  // Autenticado y está en / (root) -> redirigir a dashboard
  if (isAuthenticated && pathname === '/') {
    return NextResponse.redirect(new URL('/cargar-dataset', request.url))
  }

  return NextResponse.next()
}

export default proxy

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
