'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartColumn } from 'lucide-react'
import { AnalysisRunner } from '@/components/analysis-runner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { datasetInfo, distribucionMensajes, estadisticas } from '@/lib/mock-data'
import { ChartTooltip } from '@/components/chart-tooltip'

export function StatsView() {
  return (
    <AnalysisRunner
      icon={ChartColumn}
      runLabel="Calcular estadísticas"
      idleHint="Genera el resumen descriptivo del dataset cargado: número de registros, usuarios, longitud media de los mensajes y distribución temporal."
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {estadisticas.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex flex-col gap-1 py-5">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <span className="text-2xl font-semibold tracking-tight">{s.valor}</span>
              <span className="text-xs text-muted-foreground">{s.detalle}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribución de mensajes por mes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribucionMensajes} margin={{ left: -16, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip cursor={{ fill: 'var(--muted)' }} content={<ChartTooltip />} />
                <Bar dataKey="mensajes" fill="var(--chart-1)" radius={[4, 4, 0, 0]} name="Mensajes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ficha del dataset</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm md:grid-cols-3">
            {[
              ['Archivo', datasetInfo.nombre],
              ['Registros', datasetInfo.registros.toLocaleString('es')],
              ['Columnas', String(datasetInfo.columnas)],
              ['Idioma', datasetInfo.idioma],
              ['Periodo', datasetInfo.periodo],
              ['Tamaño', datasetInfo.tamano],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-0.5">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </AnalysisRunner>
  )
}
