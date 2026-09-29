import { NextRequest, NextResponse } from 'next/server'

const GATEWAY_URL = process.env.GATEWAY_URL || process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://api-gateway:8080'

export async function POST(request: NextRequest) {
  try {
    await fetch(`${GATEWAY_URL}/auth/logout`, {
      method: 'POST',
      headers: request.headers.get('cookie') ? { cookie: request.headers.get('cookie') as string } : {},
    })
  } catch {}
  const response = NextResponse.json({ message: 'Sesión cerrada' })
  response.cookies.set('access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}

export async function GET(request: NextRequest) {
  return POST(request)
}
