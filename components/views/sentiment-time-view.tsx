'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartLine } from 'lucide-react'
import { AnalysisRunner } from '@/components/analysis-runner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { sentimientoTiempo } from '@/lib/mock-data'
import { ChartTooltip } from '@/components/chart-tooltip'

export function SentimentTimeView() {
  return (
    <AnalysisRunner
      icon={ChartLine}
      runLabel="Analizar sentimiento temporal"
      idleHint="Calcula la polaridad de cada mensaje y agrega los resultados por mes para observar la tendencia del sentimiento a lo largo del tiempo."
    >
      <Card>
        <CardHeader>
          <CardTitle>Evolución del sentimiento (% mensual)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sentimientoTiempo} margin={{ left: -16, right: 8 }}>
                <defs>
                  <linearGradient id="neg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-4)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--chart-4)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="pos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="negativo" name="Negativo" stroke="var(--chart-4)" fill="url(#neg)" strokeWidth={2} />
                <Area type="monotone" dataKey="positivo" name="Positivo" stroke="var(--chart-2)" fill="url(#pos)" strokeWidth={2} />
                <Area type="monotone" dataKey="neutro" name="Neutro" stroke="var(--muted-foreground)" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-[var(--chart-4)]" aria-hidden />Negativo</span>
            <span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-[var(--chart-2)]" aria-hidden />Positivo</span>
            <span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-[var(--muted-foreground)]" aria-hidden />Neutro</span>
          </div>
        </CardContent>
      </Card>
    </AnalysisRunner>
  )
}
