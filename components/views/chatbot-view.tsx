'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, MessageCircle, Plus, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { API_BASE } from '@/lib/api-base'
import { errorMessageForStatus } from '@/lib/api-errors'
import { toast } from 'sonner'

type Mensaje = { autor: 'usuario' | 'asistente'; mensaje: string; created_at: string }

function formatFechaHora(iso: string | undefined): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export function ChatbotView() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [entrada, setEntrada] = useState('')
  const [escribiendo, setEscribiendo] = useState(false)
  const [cargandoChat, setCargandoChat] = useState(true)
  const [hasActiveChat, setHasActiveChat] = useState<boolean | null>(null)
  const [titulo, setTitulo] = useState<string | null>(null)
  const [modoPrivacidad, setModoPrivacidad] = useState(false)
  const [cambiandoModo, setCambiandoModo] = useState(false)
  const finRef = useRef<HTMLDivElement>(null)

  const tituloVisible = titulo?.trim() ? titulo : 'Sin título'

  useEffect(() => {
    async function cargarChatActivo() {
      try {
        const res = await fetch(`${API_BASE}/rag/chat`, {
          method: 'GET',
          credentials: 'include',
        })
        if (res.status === 404) {
          setHasActiveChat(false)
          setMensajes([])
          setTitulo(null)
          return
        }

        if (!res.ok) {
          if (res.status !== 404) toast.error(errorMessageForStatus(res.status))
          throw new Error(`GET /chat ${res.status}`)
        }

        const data: {
          chat_id: string
          titulo?: string | null
          privacy_mode?: boolean
          mensajes: { autor: 'usuario' | 'asistente'; mensaje: string; created_at: string }[]
        } = await res.json()

        setMensajes(data.mensajes ?? [])
        setTitulo(data.titulo ?? null)
        setModoPrivacidad(Boolean(data.privacy_mode))
        setHasActiveChat(true)
        
      } catch (e) {
        if (e instanceof TypeError) toast.error('Sin conexión con el servidor. Revisa tu red.')
        setHasActiveChat(false)
      } finally {
        setCargandoChat(false)
      }
    }
    cargarChatActivo()
  }, [])

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, escribiendo])

  async function cambiarModoPrivacidad(enabled: boolean) {
    setCambiandoModo(true)
    try {
      const res = await fetch(`${API_BASE}/rag/chat/mode`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ privacy_mode: enabled }),
      })
      if (!res.ok) {
        toast.error(errorMessageForStatus(res.status))
        return
      }
      setModoPrivacidad(enabled)
      toast.success(enabled ? 'Modo privacidad activado' : 'Modo estándar activado')
    } catch {
      toast.error('Sin conexión con el servidor. Revisa tu red.')
    } finally {
      setCambiandoModo(false)
    }
  }

  async function iniciarNuevoChat() {
    try {
      setCargandoChat(true)
      const res = await fetch(`${API_BASE}/rag/chat`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ privacy_mode: modoPrivacidad }),
      })
      if (!res.ok) throw new Error(`POST /chat ${res.status}`)
      const data: { titulo?: string | null; privacy_mode?: boolean } = await res.json().catch(() => ({}))
      setMensajes([])
      setTitulo(data.titulo ?? null)
      setModoPrivacidad(Boolean(data.privacy_mode))
      setHasActiveChat(true)
    } catch {
      toast.error('Error en el servidor. Intenta más tarde.')
    } finally {
      setCargandoChat(false)
    }

  }

  async function enviar(texto: string) {
    const limpio = texto.trim()
    if (!limpio || escribiendo) return
    // Mensaje optimista con timestamp local (se reemplazará con el real del backend si está disponible)
    const nowIso = new Date().toISOString()
    setMensajes((m) => [...m, { autor: 'usuario', mensaje: limpio, created_at: nowIso }])
    setEntrada('')
    setEscribiendo(true)

    try {
      const respuesta = await fetch(`${API_BASE}/rag/message`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: limpio, privacy_mode: modoPrivacidad }),
      })

      if (!respuesta.ok) {
        toast.error(errorMessageForStatus(respuesta.status))
        setMensajes((m) => [...m, { autor: 'asistente', mensaje: 'Ocurrió un error al responder. Intenta de nuevo.', created_at: new Date().toISOString() }])
        setEscribiendo(false)
        return
      }

      const data: {
        respuesta: { autor: 'usuario' | 'asistente'; mensaje: string; created_at: string };
        pregunta: { created_at: string };
        titulo?: string | null;
        privacy_mode?: boolean;
      } = await respuesta.json()

      // Si el backend devolvió el mensaje_usuario con created_at real, corrige el optimista
      if (data.pregunta.created_at) {
        setMensajes((prev) => {
          const copy = [...prev]
          // último usuario es el que acabamos de insertar optimista
          for (let i = copy.length - 1; i >= 0; i--) {
            if (copy[i].autor === 'usuario' && copy[i].mensaje === limpio) {
              copy[i] = { ...copy[i], created_at: data.pregunta!.created_at }
              break
            }
          }
          return copy
        })
      }

      setMensajes((m) => [...m, data.respuesta])
      if (data.titulo) setTitulo(data.titulo)
      if (typeof data.privacy_mode === 'boolean') setModoPrivacidad(data.privacy_mode)
      setEscribiendo(false)
    } catch {
      toast.error('Sin conexión con el servidor. Revisa tu red.')
      setMensajes((m) => [...m, { autor: 'asistente', mensaje: 'Sin conexión con el servidor.', created_at: new Date().toISOString() }])
      setEscribiendo(false)
      return
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) {
      e.preventDefault()
      enviar(entrada)
    }
  }

  if (cargandoChat) {
    return (
      <Card className="flex h-[calc(100dvh-13rem)] items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando chat...</p>
      </Card>
    )
  }

  if (!hasActiveChat) {
    return (
      <Card className="flex h-[calc(100dvh-13rem)] flex-col items-center justify-center gap-4 p-6 text-center">
        <MessageCircle className="size-10 text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-medium">No tienes un chat activo</p>
          <p className="text-xs text-muted-foreground">Inicia un nuevo chat para consultar al asistente técnico.</p>
        </div>
        <Button onClick={iniciarNuevoChat}>Iniciar nuevo chat</Button>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium" title={tituloVisible}>{tituloVisible}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={iniciarNuevoChat}
          disabled={cargandoChat || escribiendo}
          title="Descarta el chat actual e inicia una nueva sesión"
        >
          <Plus className="size-4" />
          Nueva sesión
        </Button>
      </div>

      <Card>
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="size-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">
                Modo privacidad
              </p>
              <p className="text-xs text-muted-foreground">
                {modoPrivacidad
                  ? 'Privacidad: Qwen3 local'
                  : 'Modelo configurado del sistema'}
              </p>
            </div>
          </div>

          <label className="ml-auto flex shrink-0 cursor-pointer items-center gap-2 text-xs text-muted-foreground select-none">
            <Switch
              checked={modoPrivacidad}
              onCheckedChange={(checked) => cambiarModoPrivacidad(checked)}
              disabled={cambiandoModo || escribiendo}
            />
            Privacidad
          </label>
        </CardContent>
      </Card>

      <Card className="flex h-[calc(100dvh-17.5rem)] flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {mensajes.length === 0 && !escribiendo && (
          <p className="text-center text-sm text-muted-foreground py-8">Sin mensajes. Escribe tu primera consulta.</p>
        )}
        {mensajes.map((m, i) => (
          <div
            key={i}
            className={`group flex flex-col ${m.autor === 'usuario' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.autor === 'usuario'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              {m.autor === 'usuario' ? (
                <p className="whitespace-pre-wrap break-words">{m.mensaje}</p>
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-p:leading-relaxed prose-strong:font-semibold prose-ul:my-2 prose-ol:my-2 prose-li:my-1 break-words [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => <p className="my-2 leading-relaxed whitespace-pre-wrap">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      ul: ({ children }) => <ul className="my-2 list-disc pl-5 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="my-2 list-decimal pl-5 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                      a: ({ children, href }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-80">
                          {children}
                        </a>
                      ),
                      code: ({ children }) => (
                        <code className="rounded bg-black/10 px-1 py-0.5 text-[13px] font-mono dark:bg-white/10">{children}</code>
                      ),
                      pre: ({ children }) => (
                        <pre className="my-2 overflow-x-auto rounded-lg bg-black/5 p-3 text-[13px] dark:bg-white/5">{children}</pre>
                      ),
                      table: ({ children }) => (
                        <div className="my-3 overflow-x-auto rounded-lg border border-border">
                          <table className="w-full border-collapse text-sm">{children}</table>
                        </div>
                      ),
                      thead: ({ children }) => <thead className="bg-muted-foreground/10">{children}</thead>,
                      th: ({ children }) => <th className="border-b border-border px-3 py-1.5 text-left text-xs font-semibold">{children}</th>,
                      td: ({ children }) => <td className="border-b border-border/50 px-3 py-1.5 align-top">{children}</td>,
                      blockquote: ({ children }) => (
                        <blockquote className="my-2 border-l-2 border-border pl-3 italic opacity-80">{children}</blockquote>
                      ),
                      h2: ({ children }) => <h2 className="mb-2 mt-4 text-sm font-semibold">{children}</h2>,
                      h3: ({ children }) => <h3 className="mb-1 mt-3 text-sm font-semibold">{children}</h3>,
                      hr: () => <hr className="my-3 border-border" />,
                    }}
                  >
                    {m.mensaje}
                  </ReactMarkdown>
                </div>
              )}
            </div>
            {m.created_at && (
              <span
                className={`mt-1 text-[11px] font-normal tracking-tight opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
                  m.autor === 'usuario' ? 'text-muted-foreground/60 mr-1' : 'text-muted-foreground/50 ml-1'
                }`}
              >
                {formatFechaHora(m.created_at)}
              </span>
            )}
          </div>
        ))}
        {escribiendo && (
          <div className="flex justify-start">
            <div className="flex gap-1 rounded-2xl bg-muted px-4 py-3">
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={finRef} />
      </div>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2">
            <input
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Escribe tu consulta…"
              className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
            />
            <Button size="icon-lg" onClick={() => enviar(entrada)} disabled={!entrada.trim() || escribiendo} aria-label="Enviar">
              <Send />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
