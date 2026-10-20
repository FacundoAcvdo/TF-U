'use client'

import { useState } from 'react'
import { etiquetaEmocion } from '@/lib/emotions'

type DistItem = {
  emotion: string
  stats: { mean: number; std: number; min: number; max: number; median: number; q25: number; q75: number; count: number }
  histogram: { bin_start: number; bin_end: number; count: number }[]
}

type Props = { distribution: DistItem[] }

function Tooltip({ item, x, y }: { item: DistItem; x: number; y: number }) {
  const s = item.stats
  const maxBin = Math.max(...item.histogram.map(h => h.count), 1)
  return (
    <div
      className="pointer-events-none fixed z-50 rounded-md border bg-popover px-3 py-2.5 text-xs shadow-sm"
      style={{ left: x + 12, top: y + 12 }}
    >
      <p className="text-sm font-medium capitalize text-foreground">{etiquetaEmocion(item.emotion)}</p>
      <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground">
        <span>media {s.mean.toFixed(3)}</span>
        <span>±{s.std.toFixed(3)}</span>
        <span>mediana {s.median.toFixed(3)}</span>
        <span>n {s.count}</span>
        <span>q25 {s.q25.toFixed(3)}</span>
        <span>q75 {s.q75.toFixed(3)}</span>
      </div>
      <div className="mt-2 flex h-7 items-end gap-px">
        {item.histogram.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-[1px] bg-foreground/15"
            style={{ height: `${(h.count / maxBin) * 100}%` }}
          />
        ))}
      </div>
    </div>
  )
}

function BoxPlotMini({ item }: { item: DistItem }) {
  const s = item.stats
  const toPct = (v: number) => Math.max(0, Math.min(100, v * 100))
  const q25 = toPct(s.q25)
  const q75 = toPct(s.q75)
  const median = toPct(s.median)
  const mean = toPct(s.mean)
  const min = toPct(s.min)
  const max = toPct(s.max)

  return (
    <div className="relative h-5 w-full">
      {/* track */}
      <div className="absolute top-1/2 h-px w-full -translate-y-1/2 bg-border" />
      {/* whisker */}
      <div className="absolute top-1/2 h-px -translate-y-1/2 bg-muted-foreground/40" style={{ left: `${min}%`, width: `${max - min}%` }} />
      {/* box */}
      <div
        className="absolute top-1/2 h-3 -translate-y-1/2 rounded-[3px] border bg-card shadow-none"
        style={{ left: `${q25}%`, width: `${Math.max(1.5, q75 - q25)}%`, borderColor: 'var(--border)', background: 'var(--muted)' }}
      />
      {/* median */}
      <div className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-foreground" style={{ left: `${median}%` }} />
      {/* mean */}
      <div className="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border bg-card" style={{ left: `${mean}%`, borderColor: 'var(--foreground)' }} />
    </div>
  )
}

export function EmotionDistributionChart({ distribution }: Props) {
  const [hover, setHover] = useState<{ item: DistItem; x: number; y: number } | null>(null)

  if (!distribution?.length) return <p className="text-sm text-muted-foreground">Sin datos</p>

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[520px] rounded-lg border bg-card">
        <div className="grid grid-cols-[128px_1fr_84px] gap-2 border-b bg-muted/30 px-3 py-2 text-[11px] font-medium tracking-wide text-muted-foreground">
          <span>emoción</span>
          <span>distribución</span>
          <span className="text-right">media</span>
        </div>
        <div className="divide-y divide-border/50">
          {distribution.map((item) => (
            <div
              key={item.emotion}
              className="grid grid-cols-[128px_1fr_84px] items-center gap-2 px-3 py-2.5 transition-colors hover:bg-muted/20"
              onMouseMove={(e) => setHover({ item, x: e.clientX, y: e.clientY })}
              onMouseLeave={() => setHover(null)}
            >
              <span className="text-sm capitalize text-foreground">{etiquetaEmocion(item.emotion)}</span>
              <BoxPlotMini item={item} />
              <span className="text-right font-mono text-xs text-foreground">
                {item.stats.mean.toFixed(3)}
                <span className="font-mono text-muted-foreground"> ±{item.stats.std.toFixed(2)}</span>
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 border-t bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-3 rounded-[2px] border bg-muted" /> q25–q75</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-px bg-foreground" /> mediana</span>
          <span className="flex items-center gap-1.5"><span className="size-1.5 rotate-45 border bg-card" style={{ borderColor: 'var(--foreground)' }} /> media</span>
          <span className="ml-auto font-mono text-[10px]">escala 0 — 1</span>
        </div>
      </div>
      {hover && <Tooltip item={hover.item} x={hover.x} y={hover.y} />}
    </div>
  )
}
