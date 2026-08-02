'use client'

import { useState } from 'react'
import { Check, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

function Toggle({
  activo,
  onToggle,
  label,
}: {
  activo: boolean
  onToggle: () => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      onClick={onToggle}
      className="flex items-center justify-between gap-4 rounded-lg border border-border px-3.5 py-3 text-left text-sm transition-colors hover:bg-muted/50"
    >
      <span className="font-medium">{label}</span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          activo ? 'bg-primary' : 'bg-input'
        }`}
      >
        <span
          className={`absolute top-0.5 size-4 rounded-full bg-background transition-transform ${
            activo ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  )
}

const modelos = ['BETO (español)', 'RoBERTuito', 'Multilingual BERT', 'XLM-RoBERTa']

export function ConfigView() {
  const [analisis, setAnalisis] = useState({
    emociones: true,
    topicos: true,
    riesgo: true,
    embeddings: false,
    sentimiento: true,
  })
  const [modelo, setModelo] = useState(modelos[0])
  const [numTopicos, setNumTopicos] = useState(6)
  const [umbralRiesgo, setUmbralRiesgo] = useState(70)
  const [guardado, setGuardado] = useState(false)

  const toggle = (k: keyof typeof analisis) => {
    setAnalisis((a) => ({ ...a, [k]: !a[k] }))
    setGuardado(false)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Análisis a ejecutar</CardTitle>
          <CardDescription>Activa los módulos que estarán disponibles para este dataset.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2.5">
          <Toggle activo={analisis.emociones} onToggle={() => toggle('emociones')} label="Detección de emociones negativas" />
          <Toggle activo={analisis.topicos} onToggle={() => toggle('topicos')} label="Modelado de tópicos" />
          <Toggle activo={analisis.riesgo} onToggle={() => toggle('riesgo')} label="Nivel de riesgo de suicidio" />
          <Toggle activo={analisis.embeddings} onToggle={() => toggle('embeddings')} label="Cálculo de embeddings" />
          <Toggle activo={analisis.sentimiento} onToggle={() => toggle('sentimiento')} label="Sentimiento en el tiempo" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parámetros del modelo</CardTitle>
          <CardDescription>Ajusta los hiperparámetros aplicados durante el procesamiento.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Modelo de lenguaje
            <select
              value={modelo}
              onChange={(e) => {
                setModelo(e.target.value)
                setGuardado(false)
              }}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              {modelos.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            <span className="flex items-center justify-between">
              Número de tópicos <span className="text-muted-foreground">{numTopicos}</span>
            </span>
            <input
              type="range"
              min={3}
              max={20}
              value={numTopicos}
              onChange={(e) => {
                setNumTopicos(+e.target.value)
                setGuardado(false)
              }}
              className="accent-[var(--primary)]"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            <span className="flex items-center justify-between">
              Umbral de riesgo (%) <span className="text-muted-foreground">{umbralRiesgo}</span>
            </span>
            <input
              type="range"
              min={50}
              max={95}
              value={umbralRiesgo}
              onChange={(e) => {
                setUmbralRiesgo(+e.target.value)
                setGuardado(false)
              }}
              className="accent-[var(--primary)]"
            />
          </label>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 lg:col-span-2">
        <Button onClick={() => setGuardado(true)}>
          <Settings />
          Guardar configuración
        </Button>
        {guardado && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-700">
            <Check className="size-4" /> Configuración guardada
          </span>
        )}
      </div>
    </div>
  )
}
