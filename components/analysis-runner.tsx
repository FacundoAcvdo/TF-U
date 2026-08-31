'use client'

import { type ReactNode } from 'react'
import { Play, RotateCw, LoaderCircle, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type Estado = 'idle' | 'running' | 'done'

type AnalysisRunnerProps = {
  icon: LucideIcon
  runLabel?: string
  idleHint: string
  estado: Estado
  children: ReactNode
  ejecutarFuncion: () => void
}

export function AnalysisRunner({
  icon: Icon,
  runLabel = 'Ejecutar análisis',
  idleHint,
  estado,
  children,
  ejecutarFuncion
}: AnalysisRunnerProps) {
  if (estado === 'done') {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-flex size-2 rounded-full bg-emerald-500" aria-hidden />
            Análisis completado
          </p>
          <Button variant="outline" size="sm" onClick={ejecutarFuncion}>
            <RotateCw />
            Volver a ejecutar
          </Button>
        </div>
        {children}
      </div>
    )
  }

  return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {estado === 'running' ? (
              <LoaderCircle className="size-6 animate-spin" />
            ) : (
              <Icon className="size-6" />
            )}
          </span>
          <div className="flex max-w-md flex-col gap-1">
            <p className="text-sm font-medium text-foreground">
              {estado === 'running' ? 'Procesando el dataset…' : 'Esta operación no se ejecuta automáticamente'}
            </p>
            <p className="text-sm text-muted-foreground text-pretty">
              {estado === 'running'
                ? 'Aplicando el modelo sobre los mensajes cargados. Esto puede tardar unos segundos.'
                : idleHint}
            </p>
          </div>
          <Button size="lg" onClick={ejecutarFuncion} disabled={estado === 'running'}>
            <Play />
            {estado === 'running' ? 'Ejecutando…' : runLabel}
          </Button>
        </CardContent>
      </Card>
  )
}