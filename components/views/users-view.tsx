'use client'

import { useState } from 'react'
import { UserPlus, Trash2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { usuariosIniciales, type Usuario } from '@/lib/mock-data'

const roles: Usuario['rol'][] = ['Administrador', 'Investigador', 'Analista']

export function UsersView() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosIniciales)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [rol, setRol] = useState<Usuario['rol']>('Analista')
  const [creado, setCreado] = useState(false)
  const [porEliminar, setPorEliminar] = useState<Usuario | null>(null)

  function crear(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim() || !email.trim()) return
    setUsuarios((u) => [
      ...u,
      {
        id: `u${Date.now()}`,
        nombre: nombre.trim(),
        email: email.trim(),
        rol,
        estado: 'Activo',
        ultimoAcceso: 'Nunca',
      },
    ])
    setNombre('')
    setEmail('')
    setRol('Analista')
    setCreado(true)
    window.setTimeout(() => setCreado(false), 2500)
  }

  function eliminar(id: string) {
    setUsuarios((u) => u.filter((usr) => usr.id !== id))
    setPorEliminar(null)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Crear usuario</CardTitle>
          <CardDescription>Alta de una nueva cuenta con acceso a la plataforma.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={crear} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Nombre completo
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                placeholder="Nombre y apellidos"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Correo electrónico
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                placeholder="nombre@instituto.org"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Rol
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value as Usuario['rol'])}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
              >
                {roles.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
            <Button type="submit">
              <UserPlus />
              Crear usuario
            </Button>
            {creado && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-700">
                <Check className="size-4" /> Usuario creado correctamente
              </span>
            )}
          </form>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Usuarios ({usuarios.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2.5">
          {usuarios.map((u) => (
            <div key={u.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {u.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-sm font-medium">{u.nombre}</span>
                <span className="truncate text-xs text-muted-foreground">{u.email}</span>
              </div>
              <div className="hidden flex-col items-end gap-1 sm:flex">
                <Badge variant={u.rol === 'Administrador' ? 'default' : 'secondary'}>{u.rol}</Badge>
                <span className="text-xs text-muted-foreground">{u.ultimoAcceso}</span>
              </div>
              <Badge variant={u.estado === 'Activo' ? 'success' : 'outline'}>{u.estado}</Badge>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setPorEliminar(u)}
                aria-label={`Eliminar a ${u.nombre}`}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {porEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Eliminar usuario</CardTitle>
              <CardDescription>
                {`¿Seguro que quieres eliminar a ${porEliminar.nombre}? Esta acción no se puede deshacer.`}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPorEliminar(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={() => eliminar(porEliminar.id)}>
                <Trash2 />
                Eliminar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
