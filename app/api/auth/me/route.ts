import { NextRequest, NextResponse } from 'next/server'
import { API_BASE } from '@/lib/api-base'

export async function GET(request: NextRequest) {
  let upstream: Response
  try {
    upstream = await fetch(`${API_BASE}/auth/me`, {
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
