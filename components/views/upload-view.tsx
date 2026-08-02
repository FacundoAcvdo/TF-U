'use client'

import { useState } from 'react'
import { Upload, FileText, Check, LoaderCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { datasetInfo } from '@/lib/mock-data'

export function UploadView() {
  const [archivo, setArchivo] = useState<string | null>(null)
  const [estado, setEstado] = useState<'idle' | 'cargando' | 'listo'>('idle')
  const [dragOver, setDragOver] = useState(false)
  const [columnaTexto, setColumnaTexto] = useState('mensaje')
  const [columnaFecha, setColumnaFecha] = useState('fecha')

  function seleccionar(nombre: string) {
    setArchivo(nombre)
    setEstado('idle')
  }

  function cargar() {
    setEstado('cargando')
    window.setTimeout(() => setEstado('listo'), 1200)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Seleccionar archivo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              seleccionar(e.dataTransfer.files?.[0]?.name ?? 'dataset.csv')
            }}
            className={`flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
              dragOver ? 'border-primary bg-primary/5' : 'border-border'
            }`}
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <Upload className="size-5" />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Arrastra un archivo aquí</p>
              <p className="text-xs text-muted-foreground">Formatos aceptados: CSV, JSON, XLSX (máx. 50 MB)</p>
            </div>
            <label>
              <input
                type="file"
                className="sr-only"
                accept=".csv,.json,.xlsx"
                onChange={(e) => seleccionar(e.target.files?.[0]?.name ?? 'dataset.csv')}
              />
              <span className="inline-flex h-8 cursor-pointer items-center rounded-lg bg-secondary px-3 text-sm font-medium text-secondary-foreground hover:bg-secondary/80">
                Examinar archivos
              </span>
            </label>
          </div>

          {archivo && (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
              <FileText className="size-4 text-primary" />
              <span className="truncate text-sm font-medium">{archivo}</span>
              {estado === 'listo' ? (
                <Badge variant="success" className="ml-auto">
                  <Check className="size-3" /> Cargado
                </Badge>
              ) : (
                <button
                  onClick={() => {
                    setArchivo(null)
                    setEstado('idle')
                  }}
                  className="ml-auto text-muted-foreground hover:text-foreground"
                  aria-label="Quitar archivo"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Mapeo de columnas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Columna de texto
            <input
              value={columnaTexto}
              onChange={(e) => setColumnaTexto(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Columna de fecha
            <input
              value={columnaFecha}
              onChange={(e) => setColumnaFecha(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
            />
          </label>

          <Button onClick={cargar} disabled={!archivo || estado !== 'idle'} className="mt-1">
            {estado === 'cargando' && <LoaderCircle className="animate-spin" />}
            {estado === 'cargando' ? 'Cargando…' : 'Cargar dataset'}
          </Button>

          {estado === 'listo' && (
            <div className="flex flex-col gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/8 p-3 text-sm">
              <p className="flex items-center gap-2 font-medium text-emerald-700">
                <Check className="size-4" /> Dataset cargado correctamente
              </p>
              <p className="text-muted-foreground">
                {datasetInfo.registros.toLocaleString('es')} registros · {datasetInfo.columnas} columnas
                detectadas. Ya puedes ejecutar los análisis.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
