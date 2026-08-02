'use client'

import { useState } from 'react'
import { FileText, Download, LoaderCircle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { informesGenerados } from '@/lib/mock-data'

const secciones = [
  'Estadísticas generales',
  'Emociones negativas',
  'Tópicos principales',
  'Nivel de riesgo',
  'Sentimiento en el tiempo',
  'Menciones de suicidio',
]

export function ReportsView() {
  const [seleccion, setSeleccion] = useState<string[]>(secciones.slice(0, 4))
  const [formato, setFormato] = useState('PDF')
  const [estado, setEstado] = useState<'idle' | 'generando' | 'listo'>('idle')
  const [informes, setInformes] = useState(informesGenerados)

  function toggle(s: string) {
    setSeleccion((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
    setEstado('idle')
  }

  function generar() {
    setEstado('generando')
    window.setTimeout(() => {
      setEstado('listo')
      setInformes((prev) => [
        {
          id: `r${Date.now()}`,
          nombre: `Informe personalizado (${seleccion.length} secciones)`,
          formato,
          fecha: new Date().toLocaleDateString('es'),
          tamano: '1.8 MB',
        },
        ...prev,
      ])
    }, 1400)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Nuevo informe</CardTitle>
          <CardDescription>Selecciona las secciones que quieres incluir y genera el documento.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {secciones.map((s) => {
              const activo = seleccion.includes(s)
              return (
                <button
                  key={s}
                  onClick={() => toggle(s)}
                  className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                    activo ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <span
                    className={`flex size-4 items-center justify-center rounded border ${
                      activo ? 'border-primary bg-primary text-primary-foreground' : 'border-input'
                    }`}
                  >
                    {activo && <Check className="size-3" />}
                  </span>
                  {s}
                </button>
              )
            })}
          </div>

          <label className="flex max-w-[200px] flex-col gap-1.5 text-sm font-medium">
            Formato de salida
            <select
              value={formato}
              onChange={(e) => setFormato(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <option>PDF</option>
              <option>CSV</option>
              <option>HTML</option>
            </select>
          </label>

          <div className="flex items-center gap-3">
            <Button onClick={generar} disabled={seleccion.length === 0 || estado === 'generando'}>
              {estado === 'generando' ? <LoaderCircle className="animate-spin" /> : <FileText />}
              {estado === 'generando' ? 'Generando…' : 'Generar informe'}
            </Button>
            {estado === 'listo' && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-700">
                <Check className="size-4" /> Informe generado
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Informes generados</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2.5">
          {informes.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <FileText className="size-4 text-primary" />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-sm font-medium">{r.nombre}</span>
                <span className="text-xs text-muted-foreground">
                  {r.fecha} · {r.tamano}
                </span>
              </div>
              <Badge variant="secondary">{r.formato}</Badge>
              <Button variant="ghost" size="icon-sm" aria-label="Descargar informe">
                <Download />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
