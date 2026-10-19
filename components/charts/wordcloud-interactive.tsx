'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type WordFreq = {
  text: string
  value: number
  count: number
  percentage: number
  doc_frequency: number
  doc_percentage: number
  rank: number
}

type Props = {
  frequencies: WordFreq[]
  total_words: number
  unique_words: number
  max_count: number
}

type Placed = WordFreq & { x: number; y: number; w: number; h: number; size: number; opacity: number }

function rectsOverlap(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) {
  return !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y)
}

export function WordCloudInteractive({ frequencies, total_words, max_count }: Props) {
  const [hover, setHover] = useState<{ w: WordFreq; x: number; y: number } | null>(null)
  const [filter, setFilter] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerW, setContainerW] = useState(640)
  const [placed, setPlaced] = useState<Placed[]>([])

  const filtered = useMemo(() => {
    if (!filter) return frequencies
    const q = filter.toLowerCase()
    return frequencies.filter(w => w.text.includes(q))
  }, [frequencies, filter])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setContainerW(el.clientWidth))
    ro.observe(el)
    setContainerW(el.clientWidth || 640)
    return () => ro.disconnect()
  }, [])

  // layout: espiral densa, sin rotación, frecuencia grande al centro
  useEffect(() => {
    if (!filtered.length) { setPlaced([]); return }
    const W = containerW
    const H = 500
    const cx = W / 2
    const cy = H / 2
    const placedRects: { x: number; y: number; w: number; h: number }[] = []
    const result: Placed[] = []
    const words = filtered.slice(0, 130)

    for (const w of words) {
      const ratio = w.count / (max_count || 1)
      // contraste extremo: top muy grande, resto cae rápido (exp 1.65)
      const size = 10 + Math.pow(ratio, 1.65) * 48 // 10 -> 58, 0.5->~25, 0.2->~13
      const opacity = 0.5 + ratio * 0.5
      const estW = w.text.length * size * 0.58
      const estH = size * 1.06
      const boxW = estW
      const boxH = estH

      // primera palabra exactamente al centro
      if (result.length === 0) {
        const x = cx - boxW / 2
        const y = cy - boxH / 2
        placedRects.push({ x, y, w: boxW, h: boxH })
        result.push({ ...w, x, y, w: boxW, h: boxH, size, opacity })
        continue
      }

      let angle = Math.random() * Math.PI * 2
      let radius = 0
      for (let attempt = 0; attempt < 1200; attempt++) {
        angle += 0.38
        radius += 0.9
        const x = cx + Math.cos(angle) * radius - boxW / 2
        const y = cy + Math.sin(angle) * radius - boxH / 2
        if (x < 1 || y < 1 || x + boxW > W - 1 || y + boxH > H - 1) continue
        const rect = { x, y, w: boxW, h: boxH }
        let coll = false
        for (const pr of placedRects) {
          const pad = 0.8 // packing ultra denso
          const a = { x: rect.x - pad, y: rect.y - pad, w: rect.w + pad * 2, h: rect.h + pad * 2 }
          if (rectsOverlap(a, pr)) { coll = true; break }
        }
        if (!coll) {
          placedRects.push(rect)
          result.push({ ...w, x, y, w: boxW, h: boxH, size, opacity })
          break
        }
      }
    }
    setPlaced(result)
  }, [filtered, containerW, max_count])

  if (!frequencies.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Sin palabras para mostrar</p>
  }

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center gap-2">
        <input
          placeholder="filtrar palabra..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-7 w-44 rounded-md border bg-card px-2.5 text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/20"
        />
        <span className="text-xs text-muted-foreground">
          {placed.length} / {frequencies.length} visibles
        </span>
        <span className="ml-auto hidden text-[11px] text-muted-foreground sm:inline">centro = más frecuente · sin rotación · al pasar el cursor para estadísticas</span>
      </div>

      <div ref={containerRef} className="relative overflow-hidden rounded-lg border bg-card" style={{ height: 520 }}>
        {placed.map(w => (
          <button
            key={w.text}
            onMouseMove={(e) => setHover({ w, x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setHover(null)}
            className="absolute flex items-center justify-center rounded px-0.5 leading-none transition-colors hover:bg-muted"
            style={{
              left: w.x,
              top: w.y,
              width: w.w,
              height: w.h,
            }}
          >
            <span
              className="whitespace-nowrap text-foreground"
              style={{
                fontSize: `${w.size}px`,
                opacity: w.opacity,
                fontWeight: w.rank <= 5 ? 800 : w.rank <= 12 ? 700 : w.rank <= 25 ? 600 : 400,
                letterSpacing: w.rank <= 5 ? '-0.03em' : '-0.015em',
                lineHeight: 1,
              }}
            >
              {w.text}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{total_words.toLocaleString()} palabras · {frequencies.length} únicas (200 principales)</span>
        <span className="font-mono">máx {max_count} · visibles {placed.length}</span>
      </div>

      {hover && (
        <div
          className="pointer-events-none fixed z-50 rounded-md border bg-popover px-3 py-2 text-xs shadow-sm"
          style={{ left: hover.x + 10, top: hover.y + 10 }}
        >
          <p className="text-sm font-semibold capitalize text-foreground">{hover.w.text}</p>
          <div className="mt-1 space-y-0.5 font-mono text-muted-foreground">
            <p>
              apariciones <span className="font-medium text-foreground">{hover.w.count}</span>{' '}
              <span className="text-[11px]">({hover.w.percentage}% del corpus)</span>
            </p>
            <p>
              en <span className="font-medium text-foreground">{hover.w.doc_frequency}</span> documentos{' '}
              <span className="text-[11px]">({hover.w.doc_percentage}%)</span>
            </p>
            <p className="text-[11px]">puesto #{hover.w.rank}</p>
          </div>
        </div>
      )}
    </div>
  )
}
