export type AuthUser = {
  email: string
  sub: string
  exp?: number
  termsAccepted?: boolean
}

function decodePayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1]
    // base64url -> base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const json = Buffer.from(padded, 'base64').toString('utf-8')
    // Edge runtime no tiene Buffer, fallback a atob
    return JSON.parse(json)
  } catch {
    try {
      const parts = token.split('.')
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
      const json = atob(payload)
      return JSON.parse(json)
    } catch {
      return null
    }
  }
}

export function getUserFromToken(token: string | undefined | null): AuthUser | null {
  if (!token) return null
  const payload = decodePayload(token)
  if (!payload) return null

  const exp = typeof payload.exp === 'number' ? payload.exp : undefined
  // Check expiry (exp is seconds since epoch)
  if (exp && exp * 1000 < Date.now()) return null

  const email = (payload.email as string) || (payload.user_email as string) || ''
  const sub = (payload.sub as string) || (payload.user_id as string) || ''
  if (!email && !sub) return null

  const appMetadata =
    payload.app_metadata && typeof payload.app_metadata === 'object'
      ? (payload.app_metadata as Record<string, unknown>)
      : undefined
  const termsAccepted = appMetadata?.terms_accepted === true

  return { email: email || sub, sub, exp, termsAccepted }
}

export function isTokenExpired(token: string | undefined | null): boolean {
  if (!token) return true
  const payload = decodePayload(token)
  if (!payload || typeof payload.exp !== 'number') return false // si no tiene exp, no lo consideramos expirado
  return payload.exp * 1000 < Date.now()
}
