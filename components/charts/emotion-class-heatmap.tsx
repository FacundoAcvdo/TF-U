'use client'

import { useState } from 'react'

type ClassStat = { clase: string; count: number; [emo: string]: any }
type Props = { classStats: ClassStat[]; emotions: string[]; metric: 'mean' | 'std' | 'median' }

export function EmotionClassHeatmap({ classStats, emotions, metric }: Props) {
  const [hover, setHover] = useState<{ clase: string; emo: string; v: number; x: number; y: number } | null>(null)

  if (!classStats?.length) return <p className="text-sm text-muted-foreground">Sin datos</p>

  const emoOrder = [...emotions].sort((a, b) => {
    const avgA = classStats.reduce((s, c) => s + (c[a]?.[metric] ?? 0), 0) / classStats.length
    const avgB = classStats.reduce((s, c) => s + (c[b]?.[metric] ?? 0), 0) / classStats.length
    return avgB - avgA
  })

  const allValues = classStats.flatMap(c => emoOrder.map(e => c[e]?.[metric] ?? 0))
  const min = Math.min(...allValues)
  const max = Math.max(...allValues)
  const range = max - min || 1

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[560px] rounded-lg border bg-card p-3">
        <div className="grid gap-px bg-border/60 p-px rounded-md overflow-hidden" style={{ gridTemplateColumns: `112px repeat(${emoOrder.length}, minmax(0, 1fr))` }}>
          <div className="bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-muted-foreground">clase</div>
          {emoOrder.map(emo => (
            <div key={emo} className="bg-muted/30 px-1 py-1.5 text-center text-[11px] font-medium capitalize text-muted-foreground truncate" title={emo}>
              {emo}
            </div>
          ))}
          {classStats.map(row => (
            <div key={row.clase} className="contents">
              <div className="bg-card flex items-center gap-1.5 px-2 py-2 text-xs">
                <span className="truncate font-medium text-foreground">{row.clase}</span>
                <span className="ml-auto shrink-0 rounded bg-muted px-1 py-0.5 font-mono text-[10px] text-muted-foreground">{row.count}</span>
              </div>
              {emoOrder.map(emo => {
                const v = row[emo]?.[metric] ?? 0
                const t = (v - min) / range
                return (
                  <div
                    key={`${row.clase}-${emo}`}
                    className="relative flex h-[36px] items-center justify-center bg-card text-[11px] font-mono hover:z-10 hover:ring-1 hover:ring-ring/20"
                    onMouseMove={(e) => setHover({ clase: row.clase, emo, v, x: e.clientX, y: e.clientY })}
                    onMouseLeave={() => setHover(null)}
                  >
                    <div className="absolute inset-0" style={{ background: 'var(--primary)', opacity: t * 0.22 }} />
                    <span className={`relative ${t > 0.5 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                      {v.toFixed(3)}
                    </span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="font-mono text-[11px] text-muted-foreground">{min.toFixed(3)}</span>
          <div className="h-1 flex-1 rounded-full bg-muted overflow-hidden flex">
            <div className="flex-1" style={{ background: 'var(--muted)' }} />
            <div className="flex-1 opacity-20" style={{ background: 'var(--primary)' }} />
            <div className="flex-1" style={{ background: 'var(--primary)' }} />
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">{max.toFixed(3)}</span>
          <span className="ml-2 text-[11px] text-muted-foreground">{metric}</span>
        </div>
      </div>
      {hover && (
        <div className="pointer-events-none fixed z-50 max-w-[260px] rounded-md border bg-popover px-3 py-2 text-xs shadow-sm" style={{ left: hover.x + 10, top: hover.y + 10 }}>
          <p className="font-medium text-foreground">{hover.clase} <span className="font-normal text-muted-foreground">·</span> <span className="capitalize">{hover.emo}</span></p>
          <p className="font-mono text-muted-foreground">{metric} <span className="text-foreground">{hover.v.toFixed(4)}</span></p>
          {(() => {
            const row = classStats.find(r => r.clase === hover.clase)
            const words: string[] = row?.[hover.emo]?.top_words || []
            return words.length ? (
              <p className="mt-1 border-t pt-1 font-mono text-[11px] text-muted-foreground">
                top: <span className="text-foreground">{words.slice(0, 3).join(' · ')}</span>
              </p>
            ) : null
          })()}
        </div>
      )}
    </div>
  )
}
