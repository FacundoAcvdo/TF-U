'use client'

import { ShieldAlert } from 'lucide-react'
import { AnalysisRunner } from '@/components/analysis-runner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { mencionSuicidio } from '@/lib/mock-data'

function confianzaVariant(c: number) {
  if (c >= 0.9) return 'destructive' as const
  if (c >= 0.8) return 'warning' as const
  return 'secondary' as const
}

export function MentionView() {
  return (
    <AnalysisRunner
      icon={ShieldAlert}
      runLabel="Detectar menciones"
      idleHint="Clasifica cada mensaje como posible mención de ideación suicida mediante un modelo entrenado, indicando el nivel de confianza."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col gap-1 py-5">
            <span className="text-sm text-muted-foreground">Mensajes detectados</span>
            <span className="text-2xl font-semibold">{mencionSuicidio.totalDetectados}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 py-5">
            <span className="text-sm text-muted-foreground">% del corpus</span>
            <span className="text-2xl font-semibold">{mencionSuicidio.porcentaje}%</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 py-5">
            <span className="text-sm text-muted-foreground">Confianza media</span>
            <span className="text-2xl font-semibold">{mencionSuicidio.confianzaMedia}</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ejemplos detectados</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {mencionSuicidio.ejemplos.map((e) => (
            <div key={e.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
              <span className="font-mono text-xs text-muted-foreground">{e.id}</span>
              <p className="flex-1 text-sm text-pretty">{`"${e.extracto}"`}</p>
              <Badge variant={confianzaVariant(e.confianza)}>{Math.round(e.confianza * 100)}%</Badge>
            </div>
          ))}
          <p className="mt-1 text-xs text-muted-foreground text-pretty">
            Las clasificaciones son estimaciones automáticas y requieren revisión humana antes de
            cualquier interpretación clínica.
          </p>
        </CardContent>
      </Card>
    </AnalysisRunner>
  )
}
