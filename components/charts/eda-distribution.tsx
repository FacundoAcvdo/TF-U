'use client'

import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type Hist = { bin_start: number; bin_end: number; count: number }
type Dist = { clase: string; words_histogram: Hist[]; sentences_histogram: Hist[]; words_stats: any; sentences_stats: any }

type Props = { distribution: Dist[] }

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']

export function EdaDistribution({ distribution }: Props) {
  const [mode, setMode] = useState<'words' | 'sentences'>('words')
  if (!distribution?.length) return <p className="text-sm text-muted-foreground">Sin datos</p>

  // preparar datos para recharts: merge bins
  // tomamos bins de la primera clase como referencia, alineamos
  const allBins = distribution[0]?.[mode === 'words' ? 'words_histogram' : 'sentences_histogram'] || []
  const chartData = allBins.map((_, i) => {
    const row: any = { bin: `${allBins[i].bin_start}–${allBins[i].bin_end}` }
    distribution.forEach(d => {
      const hist = d[mode === 'words' ? 'words_histogram' : 'sentences_histogram']
      row[d.clase] = hist[i]?.count ?? 0
    })
    return row
  })

  return (
    <div className="w-full rounded-lg border bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-xs font-medium text-muted-foreground">Histograma por clase — {mode === 'words' ? 'palabras por texto' : 'oraciones por texto'}</h4>
        <div className="flex rounded-md border p-0.5">
          <button onClick={() => setMode('words')} className={`rounded px-2 py-1 text-xs ${mode === 'words' ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted'}`}>words</button>
          <button onClick={() => setMode('sentences')} className={`rounded px-2 py-1 text-xs ${mode === 'sentences' ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted'}`}>sentences</button>
        </div>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: 4, right: 8, top: 4, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" opacity={0.6} vertical={false} />
            <XAxis dataKey="bin" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} interval={Math.floor(chartData.length / 6)} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: 'var(--muted)', opacity: 0.15 }} content={({ active, payload, label }: any) => {
              if (!active || !payload?.length) return null
              return (
                <div className="rounded-md border bg-popover px-2.5 py-2 text-xs shadow-sm">
                  <p className="font-medium">{label}</p>
                  {payload.map((p: any) => (
                    <p key={p.dataKey} className="font-mono text-muted-foreground">{p.dataKey}: <span className="text-foreground">{p.value}</span></p>
                  ))}
                </div>
              )
            }} />
            {distribution.map((d, i) => (
              <Bar key={d.clase} dataKey={d.clase} fill={COLORS[i % COLORS.length]} radius={[2, 2, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-center text-[11px] text-muted-foreground">hover para conteo por clase</p>
    </div>
  )
}
