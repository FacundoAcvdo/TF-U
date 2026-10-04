import { NextRequest, NextResponse } from 'next/server'

const GATEWAY_URL = process.env.GATEWAY_URL || process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://api-gateway:8080'

export async function GET(request: NextRequest) {
  let upstream: Response
  try {
    upstream = await fetch(`${GATEWAY_URL}/auth/me`, {
      headers: request.headers.get('cookie') ? { cookie: request.headers.get('cookie') as string } : {},
    })
  } catch {
    return NextResponse.json({ error: 'No se pudo conectar con el servicio de autenticación' }, { status: 502 })
  }
  const data = await upstream.text()
  return new NextResponse(data, {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json' },
  })
}
