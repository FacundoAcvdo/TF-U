import { cookies } from 'next/headers'
import { Providers } from '@/context/providers'
import { DashboardShell } from '@/components/dashboard-shell'
import { getUserFromToken } from '@/lib/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  const user = getUserFromToken(token)
  const userEmail = user?.email || 'usuario@demo.local'

  return (
    <Providers>
      <DashboardShell userEmail={userEmail}>{children}</DashboardShell>
    </Providers>
  )
}
