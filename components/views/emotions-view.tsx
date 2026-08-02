'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { HeartCrack } from 'lucide-react'
import { AnalysisRunner } from '@/components/analysis-runner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { emocionesNegativas } from '@/lib/mock-data'
import { ChartTooltip } from '@/components/chart-tooltip'

const colores = ['var(--chart-4)', 'var(--chart-3)', 'var(--chart-1)', 'var(--chart-5)', 'var(--chart-2)', 'var(--muted-foreground)']

export function EmotionsView() {
  return (
    <AnalysisRunner
      icon={HeartCrack}
      runLabel="Detectar emociones"
      idleHint="Clasifica cada mensaje según la emoción negativa predominante y agrega los resultados sobre el conjunto de datos."
    >
      <Card>
        <CardHeader>
          <CardTitle>Distribución de emociones negativas (%)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emocionesNegativas} layout="vertical" margin={{ left: 24, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis type="category" dataKey="emocion" tickLine={false} axisLine={false} fontSize={12} width={90} stroke="var(--muted-foreground)" />
                <Tooltip cursor={{ fill: 'var(--muted)' }} content={<ChartTooltip />} />
                <Bar dataKey="valor" name="Porcentaje" radius={[0, 4, 4, 0]}>
                  {emocionesNegativas.map((_, i) => (
                    <Cell key={i} fill={colores[i % colores.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </AnalysisRunner>
  )
}
