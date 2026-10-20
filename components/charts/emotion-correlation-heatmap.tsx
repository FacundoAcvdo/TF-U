'use client'

import { useState } from 'react'
import { etiquetaEmocion } from '@/lib/emotions'

type Props = {
  correlation: { matrix: number[][]; order: string[]; flat: { x: string; y: string; value: number }[] }
  topWords?: Record<string, string[]>
}

function valueToOpacity(v: number) {
  const t = (Math.max(-1, Math.min(1, v)) + 1) / 2
  return t
}

export function EmotionCorrelationHeatmap({ correlation, topWords }: Props) {
  const { matrix, order } = correlation
  const [hover, setHover] = useState<{ x: string; y: string; v: number; cx: number; cy: number } | null>(null)

  if (!matrix?.length) return <p className="text-sm text-muted-foreground">Sin datos</p>

  return (
    <div className="w-full overflow-x-auto flex items-center justify-center">
      <div className="inline-block rounded-lg border bg-card p-3">
        <div className="grid gap-px bg-border/60 p-px rounded-md overflow-hidden" style={{ gridTemplateColumns: `80px repeat(${order.length}, 108px)` }}>
          <div className="bg-card" />
          {order.map((emo) => (
            <div key={emo} className="bg-card px-1 py-1 text-center text-[11px] font-medium capitalize text-muted-foreground truncate" title={etiquetaEmocion(emo)}>
              {etiquetaEmocion(emo)}
            </div>
          ))}
          {order.map((rowEmo, i) => (
            <div key={rowEmo} className="contents">
              <div className="bg-card flex items-center justify-end px-1.5 text-[11px] font-medium capitalize text-muted-foreground">{etiquetaEmocion(rowEmo)}</div>
              {order.map((colEmo, j) => {
                const v = matrix[i][j]
                const isDiag = i === j
                return (
                  <div
                    key={`${rowEmo}-${colEmo}`}
                    className="relative flex items-center justify-center bg-card text-[11px] font-mono transition-colors hover:z-10 hover:ring-1 hover:ring-ring/20"
                    style={{ height: 108, width: 108 }}
                    onMouseMove={(e) => setHover({ x: colEmo, y: rowEmo, v, cx: e.clientX, cy: e.clientY })}
                    onMouseLeave={() => setHover(null)}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'var(--primary)',
                        opacity: isDiag ? 0.08 + valueToOpacity(v) * 0.9 : valueToOpacity(v) * 0.22,
                      }}
                    />
                    <span className={`relative ${Math.abs(v) > 0.5 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                      {v.toFixed(2)}
                    </span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[11px] font-mono text-muted-foreground">-1</span>
          <div className="h-1 flex-1 rounded-full bg-muted overflow-hidden flex">
            <div className="flex-1" style={{ background: 'var(--muted)' }} />
            <div className="flex-1 opacity-20" style={{ background: 'var(--primary)' }} />
            <div className="flex-1" style={{ background: 'var(--primary)' }} />
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">+1</span>
          <span className="ml-2 text-[11px] text-muted-foreground">Pearson r</span>
        </div>
      </div>
      {hover && (
        <div
          className="pointer-events-none fixed z-50 max-w-[280px] rounded-md border bg-popover px-3 py-2 text-xs shadow-sm"
          style={{ left: hover.cx + 10, top: hover.cy + 10 }}
        >
          <p className="font-medium capitalize text-foreground">{etiquetaEmocion(hover.y)} ↔ {etiquetaEmocion(hover.x)}</p>
          <p className="font-mono text-muted-foreground">r <span className="text-foreground">{hover.v.toFixed(3)}</span></p>
          {topWords && (
            <div className="mt-1.5 grid grid-cols-2 gap-2 border-t pt-1.5">
              <div>
                <p className="font-medium capitalize text-[11px] text-foreground">{etiquetaEmocion(hover.y)}</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {(topWords[hover.y] || []).slice(0, 3).join(' · ') || '—'}
                </p>
              </div>
              <div>
                <p className="font-medium capitalize text-[11px] text-foreground">{etiquetaEmocion(hover.x)}</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {(topWords[hover.x] || []).slice(0, 3).join(' · ') || '—'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
