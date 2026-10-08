import { NextRequest, NextResponse } from 'next/server'
import { API_BASE } from '@/lib/api-base'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  let upstream: Response
  try {
    upstream = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      // No credentials needed para upstream, pero el gateway setea cookie
    })
  } catch (err) {
    console.error('Gateway login error', err)
    return NextResponse.json({ error: 'No se pudo conectar con el servicio de autenticación' }, { status: 502 })
  }

  const data = await upstream.text()
  let json: unknown
  try {
    json = JSON.parse(data)
  } catch {
    json = { raw: data }
  }

  const response = NextResponse.json(json, { status: upstream.status })

  // Reenviar cookies Set-Cookie del gateway hacia el browser (httponly access_token)
  // gateway hace: response.set_cookie(key="access_token", httponly=True, samesite="lax", ...)
  // fetch en Node no expone getSetCookie en todas las versiones, probamos varias formas
  const setCookieHeaders: string[] = []

  // Next.js / Node 18+ tiene getSetCookie()
  const getSetCookie = (upstream.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie
  if (typeof getSetCookie === 'function') {
    setCookieHeaders.push(...getSetCookie.call(upstream.headers))
  } else {
    // fallback: intentar get('set-cookie') (puede traer solo uno) y get('set-cookie' con split)
    const single = upstream.headers.get('set-cookie')
    if (single) setCookieHeaders.push(single)
    // Algunos gateways envían múltiples Set-Cookie separados por coma, pero httponly evita split simple
    // Intentamos también iterar headers si existe
    try {
      upstream.headers.forEach((value, key) => {
        if (key.toLowerCase() === 'set-cookie' && !setCookieHeaders.includes(value)) {
          setCookieHeaders.push(value)
        }
      })
    } catch {}
  }

  for (const cookie of setCookieHeaders) {
    response.headers.append('set-cookie', cookie)
  }

  // Si upstream no envió cookie pero sí token en json (fallback), setear manualmente
  if (setCookieHeaders.length === 0 && upstream.ok) {
    const parsed = json as { session?: { access_token?: string; expires_in?: number } } & Record<string, unknown>
    const token = parsed?.session?.access_token || (parsed as { access_token?: string })?.access_token
    if (token) {
      response.cookies.set('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: (parsed?.session?.expires_in as number) || 60 * 60 * 24,
      })
    }
  }

  return response
}
