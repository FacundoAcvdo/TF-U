'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type Point = { x: number; y: number; cluster: string }
type ClusterInfo = { id: string; count: number }

type Props = {
  points: Point[]
  clusters: ClusterInfo[]
  outliers: number
  total: number
  truncated?: boolean
}

const CHART_VARS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']

function getClusterVar(cluster: string, indexMap: Map<string, number>) {
  if (cluster === '-1') return 'var(--muted-foreground)'
  const idx = indexMap.get(cluster) ?? 0
  return CHART_VARS[idx % CHART_VARS.length]
}

function resolveCssVar(varExpr: string) {
  if (typeof window === 'undefined') return varExpr
  // varExpr like "var(--chart-1)" -> extract --chart-1
  const m = varExpr.match(/var\((--[^)]+)\)/)
  if (m) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim()
    return v || varExpr
  }
  return varExpr
}

export function EmbeddingsScatter({ points, clusters, outliers, total, truncated }: Props) {
  const [activeCluster, setActiveCluster] = useState<string | null>(null)
  const [showOutliers, setShowOutliers] = useState(true)
  const [hover, setHover] = useState<{ p: Point; cx: number; cy: number } | null>(null)
  const [zoom, setZoom] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const clusterIndex = useMemo(() => {
    const m = new Map<string, number>()
    const sorted = [...clusters].sort((a, b) => Number(a.id) - Number(b.id))
    sorted.forEach((c, i) => m.set(c.id, i))
    return m
  }, [clusters])

  const filtered = useMemo(() => {
    return points.filter(p => {
      if (p.cluster === '-1' && !showOutliers) return false
      if (activeCluster !== null && p.cluster !== activeCluster) return false
      return true
    })
  }, [points, activeCluster, showOutliers])

  const bounds = useMemo(() => {
    if (!filtered.length) return { minX: -1, maxX: 1, minY: -1, maxY: 1 }
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    for (const p of filtered) {
      if (p.x < minX) minX = p.x
      if (p.x > maxX) maxX = p.x
      if (p.y < minY) minY = p.y
      if (p.y > maxY) maxY = p.y
    }
    const padX = (maxX - minX) * 0.08 || 1
    const padY = (maxY - minY) * 0.08 || 1
    return { minX: minX - padX, maxX: maxX + padX, minY: minY - padY, maxY: maxY + padY }
  }, [filtered])

  const width = 640
  const height = 520
  const scaleX = (x: number) => ((x - bounds.minX) / (bounds.maxX - bounds.minX)) * width
  const scaleY = (y: number) => height - ((y - bounds.minY) / (bounds.maxY - bounds.minY)) * height

  // canvas draw - visual idéntico a SVG previo
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // fondo
    ctx.clearRect(0, 0, width, height)
    const cardFill = resolveCssVar('var(--card)')
    const borderCol = resolveCssVar('var(--border)')
    ctx.fillStyle = cardFill || '#ffffff'
    ctx.strokeStyle = borderCol || '#e5e7eb'
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.6
    // @ts-ignore roundRect si no está
    if (ctx.roundRect) {
      ctx.beginPath()
      // @ts-ignore
      ctx.roundRect(0, 0, width, height, 8)
      ctx.fill()
      ctx.stroke()
    } else {
      ctx.fillRect(0, 0, width, height)
      ctx.strokeRect(0, 0, width, height)
    }
    ctx.globalAlpha = 1

    const cardStroke = resolveCssVar('var(--card)')

    for (const p of filtered) {
      const isOutlier = p.cluster === '-1'
      const cx = scaleX(p.x)
      const cy = scaleY(p.y)
      const r = isOutlier ? 2 : 3.2
      const col = resolveCssVar(getClusterVar(p.cluster, clusterIndex))
      const alpha = isOutlier ? 0.22 : 0.78

      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fillStyle = col || '#71717a'
      ctx.globalAlpha = alpha
      ctx.fill()
      ctx.globalAlpha = 0.9
      ctx.strokeStyle = cardStroke || '#ffffff'
      ctx.lineWidth = 0.6
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }, [filtered, bounds, clusterIndex])

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas || !filtered.length) return
    const rect = canvas.getBoundingClientRect()
    // corrige por zoom CSS (transform scale)
    const scale = zoom
    const x = (e.clientX - rect.left) / (rect.width / width) / scale
    const y = (e.clientY - rect.top) / (rect.height / height) / scale

    // hit test lineal - 5000 puntos es barato (<1ms)
    let best: Point | null = null
    let bestDist = Infinity
    const threshold = 9 // px
    for (const p of filtered) {
      const sx = scaleX(p.x)
      const sy = scaleY(p.y)
      const dx = sx - x
      const dy = sy - y
      const d = Math.hypot(dx, dy)
      if (d < bestDist && d < threshold) {
        bestDist = d
        best = p
      }
    }
    if (best) setHover({ p: best, cx: e.clientX, cy: e.clientY })
    else setHover(null)
  }

  if (!points.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Sin puntos para mostrar</p>
  }

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveCluster(null)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${activeCluster === null ? 'bg-foreground text-background border-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}
          >
            Todos ({total})
          </button>
          {clusters.map(c => {
            const isActive = activeCluster === c.id
            return (
              <button
                key={c.id}
                onClick={() => setActiveCluster(isActive ? null : c.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors ${isActive ? 'bg-foreground text-background border-foreground' : 'bg-card hover:bg-muted'}`}
              >
                <span className="inline-block size-2 rounded-full" style={{ background: getClusterVar(c.id, clusterIndex) }} />
                <span className={isActive ? 'text-background' : 'text-foreground'}>c{c.id}</span>
                <span className={isActive ? 'text-background/70' : 'text-muted-foreground'}>{c.count}</span>
              </button>
            )
          })}
          {outliers > 0 && (
            <button
              onClick={() => setShowOutliers(v => !v)}
              className={`rounded-full border px-2.5 py-1 text-xs ${showOutliers ? 'bg-card text-foreground' : 'bg-muted text-muted-foreground line-through'}`}
            >
              outliers {outliers}
            </button>
          )}
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={() => setZoom(z => Math.max(0.6, z - 0.2))} className="size-7 rounded-md border bg-card text-xs hover:bg-muted">−</button>
          <span className="w-10 text-center font-mono text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(2.5, z + 0.2))} className="size-7 rounded-md border bg-card text-xs hover:bg-muted">+</button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="overflow-auto bg-muted/20 p-2" style={{ maxHeight: 520 }}>
          <div className="mx-auto w-full max-w-[640px] select-none" style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}>
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              className="mx-auto block h-[480px] w-full max-w-[640px] rounded-lg border"
              style={{ width: '100%', height: 480 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHover(null)}
            />
          </div>
        </div>
        <div className="flex items-center justify-between border-t bg-card px-3 py-2 text-[11px] text-muted-foreground">
          <span>UMAP 2D · cosine · HDBSCAN min 50 · canvas</span>
          <span className="font-mono">
            {filtered.length} / {total} puntos {truncated ? '· muestreo 8k' : ''}
          </span>
        </div>
      </div>

      {hover && (
        <div
          className="pointer-events-none fixed z-50 rounded-md border bg-popover px-2.5 py-1.5 text-xs shadow-sm"
          style={{ left: hover.cx + 10, top: hover.cy + 10 }}
        >
          <p className="font-medium text-foreground">
            {hover.p.cluster === '-1' ? 'outlier' : `cluster ${hover.p.cluster}`}
          </p>
          <p className="font-mono text-muted-foreground">
            x {hover.p.x.toFixed(3)} · y {hover.p.y.toFixed(3)}
          </p>
        </div>
      )}
      <p className="mt-2 text-center text-[11px] text-muted-foreground">hover para coordenadas · click en leyenda para filtrar · ± zoom</p>
    </div>
  )
}
