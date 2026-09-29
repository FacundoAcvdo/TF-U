import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { UsersView } from '@/components/views/users-view'

const GATEWAY_URL = process.env.GATEWAY_URL || process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://api-gateway:8080'

export default async function Page() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  let esAdmin = false
  if (token) {
    try {
      const res = await fetch(`${GATEWAY_URL}/auth/me`, {
        headers: { cookie: `access_token=${token}` },
        cache: 'no-store',
      })
      if (res.ok) {
        const data = await res.json()
        esAdmin = data?.user?.role === 'admin'
      }
    } catch {}
  }
  if (!esAdmin) redirect('/cargar-dataset')
  return <UsersView />
}
