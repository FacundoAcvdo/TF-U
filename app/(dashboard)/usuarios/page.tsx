import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { UsersView } from '@/components/views/users-view'
import { API_BASE } from '@/lib/api-base'

export default async function Page() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  let esAdmin = false
  if (token) {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
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
