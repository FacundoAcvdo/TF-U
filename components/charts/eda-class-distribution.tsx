'use client'

import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type ClassStat = { clase: string; texto: number; vocabulary: number; words: number; word_avg: number; sentences: number; sentence_avg: number; sentence_min: number; sentence_max: number }

type Props = { classStats: ClassStat[] }

function TooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border bg-popover px-2.5 py-2 text-xs shadow-sm">
      <p className="font-medium text-foreground">{label}</p>
      <div className="mt-1 space-y-0.5 font-mono text-muted-foreground">
        {payload.map((p: any) => (
          <p key={p.dataKey}>{METRIC_LABEL[p.dataKey] ?? p.dataKey}: <span className="text-foreground">{p.value}</span></p>
        ))}
      </div>
    </div>
  )
}

const METRIC_LABEL: Record<string, string> = {
  texto: 'Textos',
  words: 'Palabras',
  sentences: 'Oraciones',
  vocabulary: 'Vocabulario',
}

const METRIC_OPTIONS = [
  { label: 'Todos', value: 'Todos' },
  { label: 'Textos', value: 'texto' },
  { label: 'Palabras', value: 'words' },
  { label: 'Oraciones', value: 'sentences' },
  { label: 'Vocabulario', value: 'vocabulary' },
] as const

const METRIC_COLOR: Record<string, string> = {
  texto: 'var(--chart-1)',
  words: 'var(--chart-2)',
  sentences: 'var(--chart-3)',
  vocabulary: 'var(--chart-4)',
}

export function EdaClassDistribution({ classStats }: Props) {
  const [metric, setMetric] = useState<'Todos' | 'texto' | 'words' | 'sentences' | 'vocabulary'>('Todos')
  if (!classStats?.length) return <p className="text-sm text-muted-foreground">Sin datos</p>

  return (
    <div className="w-full rounded-lg border bg-card p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h4 className="text-xs font-medium text-muted-foreground">
          {metric === 'Todos' ? 'Distribución por clase (escala lineal, al pasar el cursor para valores)' : `Distribución por clase — ${METRIC_LABEL[metric] ?? metric}`}
        </h4>
        <Select value={metric} onValueChange={(v) => setMetric(v as any)}>
          <SelectTrigger size="sm" className="w-36 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {METRIC_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={classStats} margin={{ left: 4, right: 8, top: 4, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" opacity={0.6} vertical={false} />
            <XAxis dataKey="clase" tick={{ fontSize: 11, fill: 'var(--foreground)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<TooltipContent />} cursor={{ fill: 'var(--muted)', opacity: 0.15 }} />
            {metric === 'Todos' ? (
              <>
                <Bar dataKey="texto" fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="words" fill="var(--chart-2)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="sentences" fill="var(--chart-3)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="vocabulary" fill="var(--chart-4)" radius={[3, 3, 0, 0]} />
              </>
            ) : (
              <Bar dataKey={metric} fill={METRIC_COLOR[metric]} radius={[4, 4, 0, 0]} barSize={48} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-center text-[11px] text-muted-foreground">
        {metric === 'Todos' ? 'texto · palabras · oraciones · vocabulario' : `solo ${METRIC_LABEL[metric] ?? metric} — escala ajustada`}
      </p>
    </div>
  )
}
