'use client'

import { useRef, useState } from 'react'
import { Send, MessageCircle, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

type Mensaje = { rol: 'usuario' | 'bot'; texto: string }

type Variante = 'general' | 'dataset'

const config: Record<
  Variante,
  { saludo: string; sugerencias: string[]; respuesta: string; icon: typeof MessageCircle }
> = {
  general: {
    icon: MessageCircle,
    saludo:
      'Hola. Soy un asistente informativo sobre prevención del suicidio y salud mental. Puedo ofrecer información general y orientar sobre recursos de ayuda. No sustituyo la atención profesional.',
    sugerencias: [
      '¿Cuáles son los factores de riesgo más comunes?',
      '¿Cómo puedo apoyar a alguien en crisis?',
      '¿Qué señales de alerta debo conocer?',
    ],
    respuesta:
      'Los factores de riesgo pueden incluir aislamiento social, antecedentes de trastornos del estado de ánimo y eventos vitales estresantes. Ante una crisis, es fundamental escuchar sin juzgar y derivar a servicios profesionales o líneas de ayuda locales lo antes posible.',
  },
  dataset: {
    icon: Database,
    saludo:
      'Hola. Puedo responder preguntas en lenguaje natural sobre el dataset cargado: estadísticas, tópicos, emociones y niveles de riesgo detectados.',
    sugerencias: [
      '¿Qué tópico predomina en el tercer trimestre?',
      '¿Cuántos mensajes son de riesgo alto?',
      '¿Cómo evolucionó el sentimiento negativo?',
    ],
    respuesta:
      'Según el dataset actual (12.480 registros), el tópico predominante es "Aislamiento social" (24%). El 15% de los mensajes se clasifican como riesgo alto o crítico, y el sentimiento negativo alcanzó su pico en junio (48%) antes de descender hacia final de año.',
  },
}

export function ChatbotView({ variante }: { variante: Variante }) {
  const c = config[variante]
  const [mensajes, setMensajes] = useState<Mensaje[]>([{ rol: 'bot', texto: c.saludo }])
  const [entrada, setEntrada] = useState('')
  const [escribiendo, setEscribiendo] = useState(false)
  const finRef = useRef<HTMLDivElement>(null)

  function enviar(texto: string) {
    const limpio = texto.trim()
    if (!limpio || escribiendo) return
    setMensajes((m) => [...m, { rol: 'usuario', texto: limpio }])
    setEntrada('')
    setEscribiendo(true)
    window.setTimeout(() => {
      setMensajes((m) => [...m, { rol: 'bot', texto: c.respuesta }])
      setEscribiendo(false)
      window.setTimeout(() => finRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }, 900)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) {
      e.preventDefault()
      enviar(entrada)
    }
  }

  return (
    <Card className="flex h-[calc(100dvh-13rem)] flex-col overflow-hidden">
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {mensajes.map((m, i) => (
          <div key={i} className={`flex ${m.rol === 'usuario' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed text-pretty ${
                m.rol === 'usuario'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              {m.texto}
            </div>
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

      {mensajes.length <= 1 && (
        <div className="flex flex-wrap gap-2 px-5 pb-2">
          {c.sugerencias.map((s) => (
            <button
              key={s}
              onClick={() => enviar(s)}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}

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
  )
}
