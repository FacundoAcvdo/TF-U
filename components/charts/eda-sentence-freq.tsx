'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type Props = { data: { sentences: number; count: number; bin_end?: number }[] }

function TooltipContent({ active, payload }: any) {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload
  return (
    <div className="rounded-md border bg-popover px-2.5 py-1.5 text-xs shadow-sm">
      <p className="font-medium text-foreground">{d.bin_end !== undefined ? `${d.sentences}–${d.bin_end}` : `${d.sentences} oraciones`}</p>
      <p className="font-mono text-muted-foreground">{payload[0].value} textos</p>
    </div>
  )
}

export function EdaSentenceFreq({ data }: Props) {
  if (!data?.length) return <p className="text-sm text-muted-foreground">Sin datos</p>
  return (
    <div className="h-[240px] w-full rounded-lg border bg-card p-3">
      <h4 className="mb-2 text-xs font-medium text-muted-foreground">Frecuencia de oraciones por texto</h4>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} margin={{ left: 4, right: 8, top: 4, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" opacity={0.6} vertical={false} />
          <XAxis dataKey="sentences" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
          <Tooltip content={<TooltipContent />} cursor={{ fill: 'var(--muted)', opacity: 0.2 }} />
          <Bar dataKey="count" fill="var(--chart-1)" radius={[4, 4, 0, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
