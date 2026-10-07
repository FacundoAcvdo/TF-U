'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts'
import { FileText, Download, LoaderCircle, Check, TriangleAlert, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmbeddingsScatter } from '@/components/charts/embeddings-scatter'
import { useDataset } from '@/context/dataset-provider'

const REPORT_BASE = 'http://localhost:8080/report'

const PDF_BG = '#ffffff'
const PDF_TX = '#1f2937'
const PDF_MUT = '#6b7280'
const PDF_GRID = '#e5e7eb'
const PDF_PALETA = ['#2563eb', '#0d9488', '#d97706', '#e11d48', '#9333ea', '#475569', '#a16207', '#15803d']
const ANCHO = 680

type Spec = {
  tipo: 'barras' | 'barrasH' | 'lineas' | 'dispersion' | 'nube'
  titulo: string
  etiquetas?: string[]
  valores?: number[]
  series?: { nombre: string; puntos: { x: string; y: number }[] }[]
  puntos?: { x: number; y: number; c: string }[]
  clusters?: { id: string; count: number }[]
  outliers?: number
  total?: number
  palabras?: { text: string; count: number }[]
  max_count?: number
}

function semillaAleatoria(semilla: number): () => number {
  let a = semilla
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function GraficoNube({ spec }: { spec: Spec }) {
  const W = 680
  const H = 500
  const palabras = spec.palabras ?? []
  const maximo = spec.max_count || 1
  const rnd = semillaAleatoria(42)
  type Caja = { text: string; x: number; y: number; w: number; h: number; size: number; opacity: number; peso: number }
  const cajas: Caja[] = []
  const rects: { x: number; y: number; w: number; h: number }[] = []
  const solapa = (
    a: { x: number; y: number; w: number; h: number },
    b: { x: number; y: number; w: number; h: number },
  ) => !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y)
  palabras.slice(0, 130).forEach((w, idx) => {
    const ratio = w.count / maximo
    const size = 10 + Math.pow(ratio, 1.65) * 48
    const opacity = 0.5 + ratio * 0.5
    const peso = idx < 5 ? 800 : idx < 12 ? 700 : idx < 25 ? 600 : 400
    const boxW = w.text.length * size * 0.58
    const boxH = size * 1.06
    const cx = W / 2
    const cy = H / 2
    if (cajas.length === 0) {
      cajas.push({ text: w.text, x: cx - boxW / 2, y: cy - boxH / 2, w: boxW, h: boxH, size, opacity, peso })
      rects.push({ x: cx - boxW / 2, y: cy - boxH / 2, w: boxW, h: boxH })
      return
    }
    let angulo = rnd() * Math.PI * 2
    let radio = 0
    for (let intento = 0; intento < 1200; intento++) {
      angulo += 0.38
      radio += 0.9
      const x = cx + Math.cos(angulo) * radio - boxW / 2
      const y = cy + Math.sin(angulo) * radio - boxH / 2
      if (x < 1 || y < 1 || x + boxW > W - 1 || y + boxH > H - 1) continue
      const rect = { x, y, w: boxW, h: boxH }
      let choca = false
      for (const pr of rects) {
        const a = { x: rect.x - 0.8, y: rect.y - 0.8, w: rect.w + 1.6, h: rect.h + 1.6 }
        if (solapa(a, pr)) {
          choca = true
          break
        }
      }
      if (!choca) {
        rects.push(rect)
        cajas.push({ text: w.text, x, y, w: boxW, h: boxH, size, opacity, peso })
        break
      }
    }
  })
  return (
    <div>
      <p style={{ color: '#1f2937', fontSize: 13, fontWeight: 600, margin: '0 0 8px 0' }}>{spec.titulo}</p>
      <svg width={W} height={H} xmlns="http://www.w3.org/2000/svg" fontFamily="sans-serif">
        {cajas.map((c) => (
          <text
            key={c.text}
            x={c.x + c.w / 2}
            y={c.y + c.h / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={c.size}
            fontWeight={c.peso}
            fill="#1f2937"
            opacity={c.opacity}
          >
            {c.text}
          </text>
        ))}
      </svg>
    </div>
  )
}

function GraficoSpec({ spec }: { spec: Spec }) {
  const tick = { fontSize: 11, fill: PDF_MUT }
  const titulo = (
    <p style={{ color: PDF_TX, fontSize: 13, fontWeight: 600, margin: '0 0 8px 0' }}>{spec.titulo}</p>
  )
  if (spec.tipo === 'barrasH') {
    const data = (spec.etiquetas ?? []).map((e, i) => ({ e, v: spec.valores?.[i] ?? 0 })).reverse()
    return (
      <div>
        {titulo}
        <BarChart width={ANCHO} height={Math.max(220, data.length * 32 + 60)} data={data} layout="vertical">
          <CartesianGrid stroke={PDF_GRID} horizontal={false} />
          <XAxis type="number" tick={tick} axisLine={false} tickLine={false} />
          <YAxis dataKey="e" type="category" width={140} tick={{ fontSize: 11, fill: PDF_TX }} axisLine={false} tickLine={false} />
          <Bar dataKey="v" fill={PDF_PALETA[0]} radius={[0, 4, 4, 0]} barSize={14} />
        </BarChart>
      </div>
    )
  }
  if (spec.tipo === 'lineas') {
    const series = spec.series ?? []
    const xs = series[0]?.puntos.map((p) => p.x) ?? []
    const data = xs.map((x, i) => {
      const row: Record<string, string | number> = { x }
      series.forEach((s) => {
        row[s.nombre] = s.puntos[i]?.y ?? 0
      })
      return row
    })
    return (
      <div>
        {titulo}
        <LineChart width={ANCHO} height={320} data={data}>
          <CartesianGrid stroke={PDF_GRID} strokeDasharray="4 4" />
          <XAxis dataKey="x" tick={tick} axisLine={false} tickLine={false} angle={-20} height={52} interval={0} />
          <YAxis tick={tick} axisLine={false} tickLine={false} />
          {series.map((s, i) => (
            <Line key={s.nombre} type="monotone" dataKey={s.nombre} stroke={PDF_PALETA[i % PDF_PALETA.length]} strokeWidth={2} dot={{ r: 3 }} />
          ))}
        </LineChart>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 6 }}>
          {series.map((s, i) => (
            <span key={s.nombre} style={{ color: PDF_MUT, fontSize: 11 }}>
              <span style={{ display: 'inline-block', width: 16, height: 3, background: PDF_PALETA[i % PDF_PALETA.length], marginRight: 5 }} />
              {s.nombre}
            </span>
          ))}
        </div>
      </div>
    )
  }
  if (spec.tipo === 'dispersion') {
    return null
  }
  const data = (spec.etiquetas ?? []).map((e, i) => ({ e, v: spec.valores?.[i] ?? 0 }))
  return (
    <div>
      {titulo}
      <BarChart width={ANCHO} height={300} data={data}>
        <CartesianGrid stroke={PDF_GRID} vertical={false} strokeDasharray="4 4" />
        <XAxis dataKey="e" tick={tick} axisLine={false} tickLine={false} angle={-25} height={56} interval={0} />
        <YAxis tick={tick} axisLine={false} tickLine={false} />
        <Bar dataKey="v" fill={PDF_PALETA[0]} radius={[4, 4, 0, 0]} />
      </BarChart>
    </div>
  )
}

const CATALOGO = [
  { id: 'estadisticas', titulo: 'Estadísticas generales' },
  { id: 'nube', titulo: 'Nube de palabras' },
  { id: 'topicos', titulo: 'Tópicos principales' },
  { id: 'riesgo', titulo: 'Nivel de riesgo' },
  { id: 'sentimiento', titulo: 'Sentimiento en el tiempo' },
  { id: 'evolucion', titulo: 'Evolución de palabras en el tiempo' },
  { id: 'embeddings', titulo: 'Visualización de embeddings' },
  { id: 'chats', titulo: 'Chats del chatbot' },
  { id: 'emociones', titulo: 'Emociones negativas' },
]

type Disponibilidad = {
  disponible: boolean
  detalle: string
}

export function ReportsView() {
  const { datasetSeleccionado } = useDataset()

  const [disponibilidad, setDisponibilidad] = useState<Record<string, Disponibilidad>>({})
  const [seleccion, setSeleccion] = useState<string[]>([])
  const [specs, setSpecs] = useState<Record<string, Spec[]>>({})
  const ocultosRef = useRef<HTMLDivElement>(null)
  const [cargando, setCargando] = useState(false)
  const [estado, setEstado] = useState<'idle' | 'generando' | 'listo'>('idle')
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null)
  const [descargaUrl, setDescargaUrl] = useState<string | null>(null)
  const [nombreArchivo, setNombreArchivo] = useState('informe.pdf')

  useEffect(() => {
    if (!datasetSeleccionado) {
      setDisponibilidad({})
      setSeleccion([])
      return
    }
    setCargando(true)
    setErrorMensaje(null)
    fetch(`${REPORT_BASE}/disponibles?dataset=${encodeURIComponent(datasetSeleccionado)}`, {
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) throw new Error()
        const data = await res.json()
        const lista: { id: string; titulo: string; detalle: string; disponible: boolean; motivo: string }[] =
          Array.isArray(data.secciones) ? data.secciones : []
        const mapa: Record<string, Disponibilidad> = {}
        for (const s of lista) {
          mapa[s.id] = { disponible: s.disponible, detalle: s.detalle || s.motivo || '' }
        }
        setDisponibilidad(mapa)
        setSeleccion(CATALOGO.filter((c) => mapa[c.id]?.disponible).map((c) => c.id))
        fetch(`${REPORT_BASE}/datos-graficos`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dataset: datasetSeleccionado,
            secciones: CATALOGO.filter((c) => mapa[c.id]?.disponible).map((c) => c.id),
          }),
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((g) => {
            const mapaSpecs: Record<string, Spec[]> = {}
            const grupos = g?.graficos && typeof g.graficos === 'object' ? g.graficos : {}
            for (const [sid, lista] of Object.entries(grupos)) {
              if (Array.isArray(lista)) mapaSpecs[sid] = lista as Spec[]
            }
            setSpecs(mapaSpecs)
          })
          .catch(() => setSpecs({}))
      })
      .catch(() => {
        setDisponibilidad({})
        setSeleccion([])
        setErrorMensaje('No se pudo obtener los análisis realizados para este dataset.')
      })
      .finally(() => setCargando(false))
  }, [datasetSeleccionado])

  function toggle(s: string) {
    setSeleccion((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
    setEstado('idle')
  }

  function escaparXml(t: string): string {
    return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  function conLeyenda(svg: string, nombres: string[]): string {
    const hm = svg.match(/<svg[^>]*height="(\d+)"/)
    const h = hm ? parseInt(hm[1], 10) : 320
    const porFila = 4
    let g = `<g font-family="sans-serif" font-size="12" fill="#4b5563">`
    nombres.slice(0, 8).forEach((n, i) => {
      const f = Math.floor(i / porFila)
      const c = i % porFila
      const x = 12 + c * 165
      const y = h + 18 + f * 20
      const color = PDF_PALETA[i % PDF_PALETA.length]
      g += `<rect x="${x}" y="${y - 9}" width="14" height="4" fill="${color}"/><text x="${x + 19}" y="${y}">${escaparXml(n)}</text>`
    })
    g += `</g>`
    const filas = Math.ceil(Math.min(nombres.length, 8) / porFila)
    const nuevaAltura = h + filas * 20 + 10
    let out = svg.replace(/height="\d+"/, `height="${nuevaAltura}"`)
    return out.replace(/<\/svg>\s*$/, `${g}</svg>`)
  }

  function recolectarPngs(ids: string[]): Record<string, string[]> {
    const mapa: Record<string, string[]> = {}
    const raiz = ocultosRef.current
    if (!raiz) return mapa
    for (const sid of ids) {
      const nodos = raiz.querySelectorAll(`[data-png-seccion="${sid}"] canvas`)
      const lista: string[] = []
      nodos.forEach((cv) => {
        try {
          const url = (cv as HTMLCanvasElement).toDataURL('image/png')
          if (url.startsWith('data:image/png') && url.length < 8000000) lista.push(url)
        } catch {}
      })
      if (lista.length > 0) mapa[sid] = lista.slice(0, 2)
    }
    return mapa
  }

  function recolectarSvgs(ids: string[]): Record<string, string[]> {
    const mapa: Record<string, string[]> = {}
    const raiz = ocultosRef.current
    if (!raiz) return mapa
    const serializer = new XMLSerializer()
    for (const sid of ids) {
      const nodos = raiz.querySelectorAll(`[data-svg-seccion="${sid}"] svg`)
      const lista: string[] = []
      const listaSpecs = specs[sid] ?? []
      nodos.forEach((svg, idx) => {
        try {
          let texto = serializer.serializeToString(svg)
          const spec = listaSpecs[idx]
          if (spec && spec.tipo === 'lineas' && spec.series) {
            texto = conLeyenda(texto, spec.series.map((s) => s.nombre))
          }
          if (texto.length < 2000000) lista.push(texto)
        } catch {}
      })
      if (lista.length > 0) mapa[sid] = lista.slice(0, 4)
    }
    return mapa
  }

  async function generar() {
    if (!datasetSeleccionado || seleccion.length === 0) return
    setEstado('generando')
    setErrorMensaje(null)
    try {
      const graficos = recolectarSvgs(seleccion)
      const pngs = recolectarPngs(seleccion)
      const res = await fetch(`${REPORT_BASE}/generar`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataset: datasetSeleccionado, secciones: seleccion, graficos, pngs }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const mensaje = typeof data?.detail === 'string' ? data.detail : 'Ocurrió un error al generar el informe.'
        setErrorMensaje(mensaje)
        setEstado('idle')
        return
      }
      const blob = await res.blob()
      if (descargaUrl) URL.revokeObjectURL(descargaUrl)
      const url = URL.createObjectURL(blob)
      setDescargaUrl(url)
      const dispo = res.headers.get('content-disposition') || ''
      const m = dispo.match(/filename="?([^"]+)"?/)
      setNombreArchivo(m ? m[1] : `informe_${datasetSeleccionado}.pdf`)
      setEstado('listo')
    } catch {
      setErrorMensaje('No se pudo conectar con el servidor. Por favor, inténtelo de nuevo.')
      setEstado('idle')
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-5">
        <CardHeader>
          <CardTitle>Nuevo informe</CardTitle>
          <CardDescription>
            Solo se ofrecen los análisis ya realizados para el dataset seleccionado. El informe no recalcula nada.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Dataset: <strong className="text-foreground">{datasetSeleccionado ?? 'ninguno'}</strong>
            {' '}— cambialo con el selector del encabezado.
          </p>
          {errorMensaje && (
            <div className="flex items-center gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <TriangleAlert className="h-4 w-4 shrink-0" />
              <span>{errorMensaje}</span>
            </div>
          )}

          {cargando ? (
            <p className="text-sm text-muted-foreground">Buscando análisis realizados…</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {CATALOGO.map((s) => {
                const info = disponibilidad[s.id]
                const disponible = info?.disponible === true
                const activo = seleccion.includes(s.id)
                return (
                  <button
                    key={s.id}
                    onClick={() => disponible && toggle(s.id)}
                    disabled={!disponible}
                    className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                      !disponible
                        ? 'border-border opacity-50 cursor-not-allowed'
                        : activo
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <span
                      className={`flex size-4 items-center justify-center rounded border ${
                        activo && disponible ? 'border-primary bg-primary text-primary-foreground' : 'border-input'
                      }`}
                    >
                      {activo && disponible && <Check className="size-3" />}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="font-medium">{s.titulo}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {disponible ? info.detalle || 'Listo para incluir' : 'Aún no realizado'}
                      </span>
                    </span>
                    <Badge variant={disponible ? 'default' : 'outline'}>
                      {disponible ? 'Listo' : 'Falta'}
                    </Badge>
                  </button>
                )
              })}
            </div>
          )}

          <div className="flex flex-col items-center gap-3">
            <Button
              onClick={generar}
              disabled={seleccion.length === 0 || estado === 'generando'}
              className="w-full h-10"
            >
              {estado === 'generando' ? <LoaderCircle className="animate-spin" /> : <FileText />}
              {estado === 'generando' ? 'Generando…' : 'Generar informe'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {estado === 'listo' && descargaUrl && (
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Informe generado</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <FileDown className="size-4 text-primary" />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-sm font-medium">{nombreArchivo}</span>
                <span className="text-xs text-muted-foreground">PDF · {seleccion.length} secciones</span>
              </div>
              <Badge variant="secondary">PDF</Badge>
              <a href={descargaUrl} download={nombreArchivo}>
                <Button variant="ghost" size="icon-sm" aria-label="Descargar informe">
                  <Download />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      <div
        ref={ocultosRef}
        aria-hidden
        style={{ position: 'absolute', left: -10000, top: 0, width: 720, background: '#ffffff', padding: 16 }}
      >
        {Object.entries(specs).map(([sid, lista]) =>
          lista.map((spec, i) => {
            if (spec.tipo === 'nube') {
              return (
                <div key={`${sid}-${i}`} data-svg-seccion={sid} style={{ marginBottom: 16 }}>
                  <GraficoNube spec={spec} />
                </div>
              )
            }
            if (spec.tipo === 'dispersion') {
              const puntos = (spec.puntos ?? []).map((p) => ({ x: p.x, y: p.y, cluster: p.c }))
              const clusters = spec.clusters ?? []
              const outliers = spec.outliers ?? 0
              const total = spec.total ?? puntos.length
              return (
                <div key={`${sid}-${i}`} data-png-seccion={sid} style={{ marginBottom: 16, background: '#ffffff' }}>
                  <EmbeddingsScatter points={puntos} clusters={clusters} outliers={outliers} total={total} fondoBlanco />
                </div>
              )
            }
            return (
              <div key={`${sid}-${i}`} data-svg-seccion={sid} style={{ marginBottom: 16 }}>
                <GraficoSpec spec={spec} />
              </div>
            )
          }),
        )}
      </div>
    </div>
  )
}
