import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ message: 'Sesión cerrada' })
  // Borrar cookie httponly
  response.cookies.set('access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}

export async function GET() {
  return POST()
}
