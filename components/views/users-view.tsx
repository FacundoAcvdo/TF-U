'use client'

import { useCallback, useEffect, useState } from 'react'
import { UserPlus, Trash2, Check, TriangleAlert, ShieldAlert, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ApiError, apiFetch } from '@/lib/api-fetch'
import { toast } from 'sonner'

type UsuarioReal = {
  id: string
  email: string
  role: string
  created_at: string
  last_sign_in_at: string
}

function etiquetaRol(role: string): string {
  return role === 'admin' ? 'Administrador' : 'Usuario'
}

export function UsersView() {
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'denegado'>('cargando')
  const [usuarios, setUsuarios] = useState<UsuarioReal[]>([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState('user')
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null)
  const [porEliminar, setPorEliminar] = useState<UsuarioReal | null>(null)
  const [porClave, setPorClave] = useState<UsuarioReal | null>(null)
  const [nuevaClave, setNuevaClave] = useState('')
  const [procesando, setProcesando] = useState(false)

  const cargar = useCallback(async () => {
    try {
      const data = await apiFetch<{ users?: UsuarioReal[] }>(`/auth/admin/users`, { method: 'GET' }, { silent: true })
      setUsuarios(Array.isArray(data.users) ? data.users : [])
      setEstado('ok')
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
        setEstado('denegado')
        return
      }
      setErrorMensaje(e instanceof Error ? e.message : 'No se pudo conectar con el servidor.')
      toast.error(e instanceof Error ? e.message : 'No se pudo conectar con el servidor.')
      setEstado('ok')
    }
  }, [])

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.role === 'admin') {
          void cargar()
        } else {
          setEstado('denegado')
        }
      })
      .catch(() => setEstado('denegado'))
  }, [cargar])

  async function crear(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setProcesando(true)
    setMensaje(null)
    setErrorMensaje(null)
    try {
      await apiFetch(`/auth/admin/users`, {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password, role: rol }),
      })
      setMensaje('Usuario creado correctamente')
      setEmail('')
      setPassword('')
      setRol('user')
      await cargar()
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : 'No se pudo conectar con el servidor.'
      setErrorMensaje(mensaje)
    } finally {
      setProcesando(false)
    }
  }

  async function cambiarRol(u: UsuarioReal, nuevoRol: string) {
    if (nuevoRol === u.role) return
    setErrorMensaje(null)
    try {
      await apiFetch(`/auth/admin/users/${u.id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: nuevoRol }),
      })
      await cargar()
    } catch (e) {
      setErrorMensaje(e instanceof Error ? e.message : 'No se pudo conectar con el servidor.')
    }
  }

  async function cambiarClave() {
    if (!porClave || nuevaClave.length < 6) {
      setErrorMensaje('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setErrorMensaje(null)
    setMensaje(null)
    try {
      await apiFetch(`/auth/admin/users/${porClave.id}/password`, {
        method: 'PATCH',
        body: JSON.stringify({ password: nuevaClave }),
      })
      setMensaje(`Contraseña de ${porClave.email} actualizada.`)
      setPorClave(null)
      setNuevaClave('')
    } catch (e) {
      setErrorMensaje(e instanceof Error ? e.message : 'No se pudo conectar con el servidor.')
    }
  }

  async function eliminar(id: string) {
    setErrorMensaje(null)
    try {
      await apiFetch(`/auth/admin/users/${id}`, { method: 'DELETE' })
      await cargar()
    } catch (e) {
      setErrorMensaje(e instanceof Error ? e.message : 'No se pudo conectar con el servidor.')
    } finally {
      setPorEliminar(null)
    }
  }

  if (estado === 'cargando') {
    return <p className="text-sm text-muted-foreground">Cargando...</p>
  }

  if (estado === 'denegado') {
    return (
      <Card>
        <CardContent className="flex items-center gap-2.5 p-6 text-sm text-muted-foreground">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          Solo un super admin puede ver esta sección.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {errorMensaje && (
        <div className="flex items-center gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          <span>{errorMensaje}</span>
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Crear usuario</CardTitle>
            <CardDescription>Alta de una nueva cuenta con acceso a la plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={crear} className="flex flex-col gap-4">
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
                Contraseña
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                  placeholder="Mínimo 6 caracteres"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Rol
                <Select value={rol} onValueChange={(v) => setRol(v ?? 'user')}>
                  <SelectTrigger className="w-full">
                    <span className="flex flex-1 text-left">{etiquetaRol(rol)}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="user">Usuario</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </label>
              <Button type="submit" disabled={procesando}>
                <UserPlus />
                Crear usuario
              </Button>
              {mensaje && (
                <span className="flex items-center gap-1.5 text-sm text-emerald-700">
                  <Check className="size-4" /> {mensaje}
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
                  {u.email.slice(0, 2).toUpperCase()}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium">{u.email}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Alta: {u.created_at && u.created_at !== 'None' ? new Date(u.created_at).toLocaleDateString() : '—'}
                  </span>
                </div>
                <Select
                  value={u.role}
                  onValueChange={(v) => void cambiarRol(u, v ?? u.role)}
                >
                  <SelectTrigger className="h-8 w-[130px] text-xs" aria-label={`Rol de ${u.email}`}>
                    <span className="flex flex-1 text-left">{etiquetaRol(u.role)}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="user">Usuario</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                  {etiquetaRol(u.role)}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    setPorClave(u)
                    setNuevaClave('')
                  }}
                  aria-label={`Cambiar contraseña de ${u.email}`}
                  title="Cambiar contraseña"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <KeyRound />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setPorEliminar(u)}
                  aria-label={`Eliminar a ${u.email}`}
                  title="Eliminar usuario"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
            {usuarios.length === 0 && (
              <p className="text-sm text-muted-foreground">No hay usuarios para mostrar.</p>
            )}
          </CardContent>
        </Card>

        {porClave && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle>Cambiar contraseña</CardTitle>
                <CardDescription>
                  {`Nueva contraseña para ${porClave.email}. Se cerrarán sus sesiones.`}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <input
                  type="password"
                  value={nuevaClave}
                  onChange={(e) => setNuevaClave(e.target.value)}
                  minLength={6}
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                  placeholder="Mínimo 6 caracteres"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setPorClave(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => void cambiarClave()}>
                    <KeyRound />
                    Guardar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {porEliminar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle>Eliminar usuario</CardTitle>
                <CardDescription>
                  {`¿Seguro que quieres eliminar a ${porEliminar.email}? Esta acción no se puede deshacer.`}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPorEliminar(null)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={() => void eliminar(porEliminar.id)}>
                  <Trash2 />
                  Eliminar
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
