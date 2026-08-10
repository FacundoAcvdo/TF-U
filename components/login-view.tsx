'use client'

import { useState } from 'react'
import { Activity, Lock, Mail, LoaderCircle, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LoginView({ onLogin }: { onLogin: (email: string) => void }) {
  const [email, setEmail] = useState('facevedo@unsl.edu.ar')
  const [password, setPassword] = useState('abc123')
  const [cargando, setCargando] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)
    window.setTimeout(() => onLogin(email), 900)
  }

  return (
    <main className="flex min-h-dvh flex-col bg-sidebar text-sidebar-foreground lg:flex-row">
      {/* Panel de marca */}
      <section className="flex flex-1 flex-col justify-between gap-10 p-8 lg:p-14">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Activity className="size-5" />
          </span>
          <span className="text-sm font-semibold tracking-tight">TFU</span>
        </div>

        <div className="flex max-w-md flex-col gap-4">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-balance lg:text-4xl">
            Plataforma de análisis de datos sobre el suicidio
          </h1>
          <p className="text-sm leading-relaxed text-sidebar-foreground/70 text-pretty">
            Herramienta de investigación para explorar patrones lingüísticos, emociones y niveles de
            riesgo en corpus textuales, con el objetivo de apoyar tareas de prevención e investigación.
          </p>
        </div>

        <p className="flex items-start gap-2 text-xs leading-relaxed text-sidebar-foreground/60 text-pretty">
        </p>
      </section>

      {/* Panel de acceso */}
      <section className="flex items-center justify-center bg-background p-6 text-foreground lg:w-[460px] lg:p-10">
        <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-semibold tracking-tight">Iniciar sesión</h2>
            <p className="text-sm text-muted-foreground">Accede con tu cuenta institucional.</p>
          </div>

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
