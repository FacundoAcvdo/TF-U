'use client'

type Props = { stats: { min: number; max: number; median: number; q25: number; q75: number; mean: number; std: number; count: number } }

export function EdaSentenceBoxPlot({ stats }: Props) {
  const { min, max, median, q25, q75, mean, std, count } = stats
  const range = max - min || 1
  const toPct = (v: number) => ((v - min) / range) * 100

  const q25Pct = toPct(q25)
  const q75Pct = toPct(q75)
  const medPct = toPct(median)
  const meanPct = toPct(mean)
  const minPct = 0
  const maxPct = 100

  return (
    <div className="w-full rounded-lg border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-xs font-medium text-muted-foreground">Distribución de oraciones por texto (boxplot)</h4>
        <span className="font-mono text-xs text-muted-foreground">n {count}</span>
      </div>
      <div className="relative h-10 w-full">
        <div className="absolute top-1/2 h-px w-full -translate-y-1/2 bg-border" />
        <div className="absolute top-1/2 h-px -translate-y-1/2 bg-muted-foreground/40" style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }} />
        <div className="absolute top-1/2 h-6 -translate-y-1/2 rounded-[3px] border bg-muted" style={{ left: `${q25Pct}%`, width: `${Math.max(2, q75Pct - q25Pct)}%` }} />
        <div className="absolute top-1/2 h-6 w-px -translate-y-1/2 bg-foreground" style={{ left: `${medPct}%` }} />
        <div className="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border bg-card" style={{ left: `${meanPct}%`, borderColor: 'var(--foreground)' }} />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[11px] text-muted-foreground">
        <span>min {min}</span>
        <span>q25 {q25.toFixed(1)}</span>
        <span className="font-medium text-foreground">med {median}</span>
        <span>q75 {q75.toFixed(1)}</span>
        <span>max {max}</span>
        <span>μ {mean.toFixed(1)} ±{std.toFixed(1)}</span>
      </div>
    </div>
  )
}
