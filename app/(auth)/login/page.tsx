'use client'

import Image from 'next/image'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Mail, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

function LoginInner() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/cargar-dataset'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        const msg = (data as { detail?: string; error?: string })?.detail || (data as { error?: string })?.error || 'Error al iniciar. Intenta nuevamente más tarde.'
        setError(msg)
        setCargando(false)
        return
      }

      if (!data || !(data as { user?: unknown }).user) {
        setError('Error al iniciar sesión. Por favor, verifica tus credenciales.')
        setCargando(false)
        return
      }

      router.push(next)
      router.refresh()
    } catch {
      setError('No se pudo conectar con el servidor.')
      setCargando(false)
    }
  }

  return (
    <main className="flex min-h-dvh flex-col bg-sidebar text-sidebar-foreground lg:flex-row">
      {/* Panel de marca */}
      <section className="flex flex-1 flex-col justify-between gap-10 p-8 lg:p-14">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="PLASMA" width={36} height={36} className="size-9" priority />
          <span className="text-sm font-semibold tracking-tight">PLASMA</span>
        </div>

        <div className="flex max-w-md flex-col gap-4">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-balance lg:text-4xl">
            Plataforma de Lenguaje y Análisis de Salud Mental Automatizado
          </h1>
          <p className="text-sm leading-relaxed text-sidebar-foreground/70 text-pretty">
            Herramienta de investigación para explorar patrones lingüísticos, emociones y niveles de
            riesgo en corpus textuales. Pensada para el ámbito de la salud mental y el análisis general de lenguaje.
          </p>
        </div>

        <p className="flex items-start gap-2 text-xs leading-relaxed text-sidebar-foreground/60 text-pretty" />
      </section>

      {/* Panel de acceso */}
      <section className="flex items-center justify-center bg-background p-6 text-foreground lg:w-[460px] lg:p-10">
        <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-semibold tracking-tight">Iniciar sesión</h2>
            <p className="text-sm text-muted-foreground">Accede con tu cuenta institucional.</p>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Correo electrónico
              <span className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                  placeholder="nombre@instituto.org"
                />
              </span>
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Contraseña
              <span className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                  placeholder="••••••••"
                />
              </span>
            </label>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={cargando}>
            {cargando && <LoaderCircle className="animate-spin" />}
            {cargando ? 'Verificando…' : 'Entrar'}
          </Button>
        </form>
      </section>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center">Cargando...</div>}>
      <LoginInner />
    </Suspense>
  )
}
