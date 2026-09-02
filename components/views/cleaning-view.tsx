'use client'

import React, { useState } from 'react'

import { FileText, Download, LoaderCircle, Check, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const tratamientos = [
  'Convertir a minúsculas',
  'Quitar caracteres especiales y puntuación',
  'Quitar stopwords',
  'Quitar emojis',
  'Quitar duplicados',
  'Tratar valores nulos'
]

interface Informe {
  id: string
  nombre: string
  formato: string
  fecha: string
  tamano: string
}

function CleaningView() {
  const [seleccion, setSeleccion] = useState<string[]>(tratamientos.slice(0, 4))
  const [estado, setEstado] = useState<'idle' | 'generando' | 'listo'>('idle')
  const [informe, setInforme] = useState<Informe | undefined>(undefined)

  function toggle(s: string) {
    setSeleccion((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
    setEstado('idle')
  }

  function generar() {
    setEstado('generando')
    window.setTimeout(() => {
      setEstado('listo')
      setInforme({
        id: `r${Date.now()}`,
        nombre: `Dataset limpio`,
        formato: 'CSV',
        fecha: new Date().toLocaleDateString('es'),
        tamano: '1.8 MB',
      })
    }, 1400)
  }


  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-5">
        <CardHeader>
          <CardTitle>Limpiar Dataset</CardTitle>
          <CardDescription>Selecciona los diferentes procesos de limpieza que deseas aplicar sobre el dataset.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {tratamientos.map((s) => {
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

          <div className="flex flex-col items-center gap-3">
            <Button onClick={generar} disabled={seleccion.length === 0 || estado === 'generando'} className="w-full h-10">
              {estado === 'generando' ? <LoaderCircle className="animate-spin" /> : <FileText />}
              {estado === 'generando' ? 'Generando…' : 'Generar informe'}
            </Button>
            {estado === 'listo' && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-700">
                <Check className="size-4" /> Dataset limpio y listo para descargar
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {informe && (
      <Card className="lg:col-span-5">
        <CardHeader>
          <CardTitle>Dataset limpio generado</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2.5 py-1">
            <div key={informe.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <FileText className="size-4 text-primary" />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-sm font-medium">{informe.nombre}</span>
                <span className="text-xs text-muted-foreground">
                  {informe.fecha} · {informe.tamano}
                </span>
              </div>
              <Badge variant="secondary">{informe.formato}</Badge>
              <Button variant="ghost" size="icon-sm" aria-label="Descargar informe">
                <Download />
              </Button>
            </div>
        </CardContent>
        <CardFooter>
              <Dialog>
                <form className="w-full">
                  <DialogTrigger render={<Button variant="outline" className="w-full h-10">Cargar dataset limpio</Button>} />
                  <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Confirmar carga</DialogTitle>
                      <DialogDescription>
                        Esta acción reemplazará el dataset original con el dataset limpio generado. ¿Deseas continuar?
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button type="submit">Cargar</Button>
                      <DialogClose render={<Button variant="outline">Cancelar</Button>} />
                    </DialogFooter>
                  </DialogContent>
                </form>
              </Dialog>
        </CardFooter>
      </Card>)}
    </div>
  )
}

export default CleaningView