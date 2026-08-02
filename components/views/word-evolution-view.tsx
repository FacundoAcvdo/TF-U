'use client'

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { AnalysisRunner } from '@/components/analysis-runner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { evolucionPalabras } from '@/lib/mock-data'
import { ChartTooltip } from '@/components/chart-tooltip'

export function WordEvolutionView() {
  return (
    <AnalysisRunner
      icon={TrendingUp}
      runLabel="Analizar evolución"
      idleHint="Rastrea la frecuencia de los términos clave mes a mes para detectar cómo cambia el vocabulario predominante a lo largo del periodo."
    >
      <Card>
        <CardHeader>
          <CardTitle>Frecuencia mensual de términos clave</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolucionPalabras} margin={{ left: -16, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="soledad" name="soledad" stroke="var(--chart-4)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ayuda" name="ayuda" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="esperanza" name="esperanza" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-[var(--chart-4)]" aria-hidden />soledad</span>
            <span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-[var(--chart-1)]" aria-hidden />ayuda</span>
            <span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-[var(--chart-2)]" aria-hidden />esperanza</span>
          </div>
        </CardContent>
      </Card>
    </AnalysisRunner>
  )
}
