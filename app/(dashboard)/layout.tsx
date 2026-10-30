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
  const initialTermsAccepted = Boolean(user?.termsAccepted)

  return (
    <Providers>
      <DashboardShell userEmail={userEmail} initialTermsAccepted={initialTermsAccepted}>
        {children}
      </DashboardShell>
    </Providers>
  )
}
