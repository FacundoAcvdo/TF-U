'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Activity, LogOut } from 'lucide-react'
import { navGroups } from '@/lib/navigation'
import { cn } from '@/lib/utils'

export function AppSidebar({
  userEmail = 'usuario@demo.local',
}: {
  userEmail?: string
}) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    router.push('/login')
    router.refresh()
  }
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Activity className="size-4" />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold leading-tight">TFU</span>
          <span className="truncate text-xs text-sidebar-foreground/60">Análisis de datos</span>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {navGroups.map((grupo) => (
          <div key={grupo.titulo} className="flex flex-col gap-1">
            <p className="px-2 pb-1 text-[0.68rem] font-semibold uppercase tracking-wider text-sidebar-foreground/45">
              {grupo.titulo}
            </p>
            {grupo.items.map((item) => {
              const Icon = item.icon
              const seleccionado = pathname === item.href || pathname?.startsWith(item.href + '/')
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={seleccionado ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                    seleccionado
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
            {userEmail.slice(0, 2).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1 truncate text-xs text-sidebar-foreground/70">{userEmail}</span>
        </div>
        <button
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="size-4 shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
