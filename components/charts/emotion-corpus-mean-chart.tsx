'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { etiquetaEmocion } from '@/lib/emotions'

type CorpusStats = Record<string, { mean: number; std: number; min: number; max: number; median: number; q25: number; q75: number; count: number }>

type Props = { corpusStats: CorpusStats }

function MinimalTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null
  const p = payload[0].payload
  return (
    <div className="rounded-md border bg-popover px-2.5 py-2 text-xs shadow-sm">
      <p className="font-medium capitalize text-foreground">{etiquetaEmocion(p.emotion)}</p>
      <div className="mt-1 space-y-0.5 text-muted-foreground">
        <p>media <span className="font-mono font-medium text-foreground">{p.mean.toFixed(3)}</span> <span className="font-mono">±{p.std.toFixed(3)}</span></p>
        <p>mediana <span className="font-mono text-foreground">{p.median.toFixed(3)}</span> · n {p.count}</p>
      </div>
    </div>
  )
}

export function EmotionCorpusMeanChart({ corpusStats }: Props) {
  const data = Object.entries(corpusStats)
    .map(([emotion, s]) => ({
      emotion,
      mean: Number(s.mean.toFixed(4)),
      std: Number(s.std.toFixed(4)),
      median: s.median,
      count: s.count,
    }))
    .sort((a, b) => b.mean - a.mean)

  // valor máximo para dominio ceñido a la media (no mean+std para no dejar aire vacío)
  const maxMeanOnly = Math.max(...data.map(d => d.mean))
  const xMax = Math.max(maxMeanOnly * 1.25, 0.01)

  return (
    <div className="w-full">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }} barCategoryGap={10}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="0" horizontal={false} vertical={true} opacity={0.6} />
            <XAxis
              type="number"
              domain={[0, xMax]}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => v.toFixed(3)}
            />
            <YAxis
              dataKey="emotion"
              type="category"
              width={96}
              tick={{ fontSize: 12, fill: 'var(--foreground)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: string) => etiquetaEmocion(v)}
            />
            <Tooltip content={<MinimalTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.25 }} />
            <Bar dataKey="mean" radius={[4, 4, 4, 4]} barSize={10} fill="var(--chart-1)" fillOpacity={0.9} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">ordenado por media descendente · al pasar el cursor: desv. est. y mediana</p>
    </div>
  )
}
