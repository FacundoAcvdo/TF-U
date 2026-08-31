'use client'

import { useState } from 'react'
import { LoginView } from '@/components/login-view'
import { Dashboard } from '@/components/dashboard'
import { Providers } from '@/context/providers'

export default function Page() {
  const [userEmail, setUserEmail] = useState<string | null>(null)

  if (!userEmail) {
    return <LoginView onLogin={setUserEmail} />
  }

  return <Providers><Dashboard userEmail={userEmail} onLogout={() => setUserEmail(null)} /></Providers>
}
