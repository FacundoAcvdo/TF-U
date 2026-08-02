'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Gauge } from 'lucide-react'
import { AnalysisRunner } from '@/components/analysis-runner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { nivelesRiesgo } from '@/lib/mock-data'
import { ChartTooltip } from '@/components/chart-tooltip'

export function RiskView() {
  return (
    <AnalysisRunner
      icon={Gauge}
      runLabel="Estimar nivel de riesgo"
      idleHint="Combina las señales de emoción, lenguaje y menciones para estimar la distribución de niveles de riesgo en el conjunto de datos."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por nivel de riesgo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={nivelesRiesgo}
                    dataKey="valor"
                    nameKey="nivel"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={2}
                  >
                    {nivelesRiesgo.map((n, i) => (
                      <Cell key={i} fill={n.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Desglose</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {nivelesRiesgo.map((n) => (
              <div key={n.nivel} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: n.color }} aria-hidden />
                    {n.nivel}
                  </span>
                  <span className="text-muted-foreground">{n.valor}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: `${n.valor}%`, backgroundColor: n.color }} />
                </div>
              </div>
            ))}
            <p className="mt-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground text-pretty">
              El 15% de los registros se sitúa en riesgo alto o crítico. Estos casos deberían priorizarse
              para revisión por personal cualificado.
            </p>
          </CardContent>
        </Card>
      </div>
    </AnalysisRunner>
  )
}
