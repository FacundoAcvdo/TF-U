'use client'

import { useEffect, useMemo, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Gauge, TriangleAlert } from 'lucide-react'
import { AnalysisRunner } from '@/components/analysis-runner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { API_BASE } from '@/lib/api-base'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChartTooltip } from '@/components/chart-tooltip'
import { useDataset } from '@/context/dataset-provider'

type Nivel = 'nulo' | 'bajo' | 'medio' | 'potencial' | 'alto'

type Span = { texto: string; start: number; end: number; triggers: string[] }
type TopItem = {
  doc_id: string
  texto: string
  score_a: number
  score_b: number | null
  nivel: Nivel
  spans: Span[]
  triggers: string[]
  chunk_index?: number
  msg_desde?: number
  msg_hasta?: number
  fecha_desde?: string
  fecha_hasta?: string
  mensajes_evidencia?: { n: number; texto: string; triggers: string[] }[]
}

type RiskResponse = {
  dataset_id: string
  fuente?: 'mensajes' | 'chat'
  modelo_version?: string
  thresholds?: Record<string, number>
  resumen?: { counts: Record<Nivel, number>; total: number; pct_alto_potencial: number; score_medio: number }
  por_clase?: Record<string, { total: number; alto: number; potencial: number }>
  verificados_b?: number
  top_items?: TopItem[]
  disclaimer?: string
}

const NIVEL_META: Record<Nivel, { color: string; badge: 'success' | 'secondary' | 'warning' | 'destructive' | 'outline' }> = {
  nulo: { color: '#10b981', badge: 'success' },
  bajo: { color: '#38bdf8', badge: 'secondary' },
  medio: { color: '#f59e0b', badge: 'warning' },
  potencial: { color: '#fb923c', badge: 'warning' },
  alto: { color: '#ef4444', badge: 'destructive' },
}

function highlightTriggers(texto: string, triggers: string[]) {
  if (!triggers.length) return texto
  const escaped = triggers.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const parts = texto.split(new RegExp(`(${escaped.join('|')})`, 'gi'))
  return parts.map((p, i) =>
    triggers.some((t) => t.toLowerCase() === p.toLowerCase()) ? (
      <mark key={i} className="rounded-sm bg-destructive/15 px-0.5 text-destructive">
        {p}
      </mark>
    ) : (
      <span key={i}>{p}</span>
    ),
  )
}

function ExpandableEvidence({ texto, triggers }: { texto: string; triggers: string[] }) {
  const [expandido, setExpandido] = useState(false)
  const MAX_CHARS = 275
  const esLargo = texto.length > MAX_CHARS
  const visible = expandido || !esLargo ? texto : `${texto.slice(0, MAX_CHARS)} ...`

  return (
    <div className="min-w-0">
      <p className="text-sm leading-relaxed break-words text-pretty">{highlightTriggers(visible, triggers)}</p>
      {triggers.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {triggers.map((t) => (
            <Badge key={t} variant="outline">
              {t}
            </Badge>
          ))}
        </div>
      )}
      {esLargo && (
        <button
          type="button"
          onClick={() => setExpandido(!expandido)}
          className="mt-1 text-xs font-semibold text-primary hover:underline"
        >
          {expandido ? 'Ver menos' : 'Ver más'}
        </button>
      )}
    </div>
  )
}

export function RiskView() {
  const [estado, setEstado] = useState<'idle' | 'done' | 'running'>('idle')
  const [data, setData] = useState<RiskResponse | null>(null)
  const [filtro, setFiltro] = useState<'todos' | Nivel>('todos')
  const { datasetSeleccionado } = useDataset()

  const ejecutarRiesgo = async () => {
    if (!datasetSeleccionado) return
    setEstado('running')
    try {
      const respuesta = await fetch(`${API_BASE}/suicide/analyzeRisk`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataset: datasetSeleccionado, with_verification: true, top_k: 200 }),
      })
      if (!respuesta.ok) throw new Error(respuesta.statusText)
      setData(await respuesta.json())
      setEstado('done')
    } catch (e) {
      console.error('Error al estimar riesgo:', e)
      setEstado('idle')
    }
  }

  useEffect(() => {
    if (!datasetSeleccionado) return
    const cargar = async () => {
      try {
        setEstado('running')
        const respuesta = await fetch(`${API_BASE}/suicide/getResults`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataset: datasetSeleccionado }),
        })
        if (!respuesta.ok) {
          setEstado('idle')
          return
        }
        const json: RiskResponse = await respuesta.json()
        if (!json.resumen) {
          setEstado('idle')
          return
        }
        setData(json)
        setEstado('done')
      } catch {
        setEstado('idle')
      }
    }
    cargar()
  }, [datasetSeleccionado])

  const donut = useMemo(() => {
    if (!data?.resumen) return []
    const total = data.resumen.total || 1
    return (Object.keys(NIVEL_META) as Nivel[]).map((nivel) => ({
      nivel,
      valor: data.resumen!.counts[nivel] ?? 0,
      pct: (((data.resumen!.counts[nivel] ?? 0) / total) * 100).toFixed(1),
      color: NIVEL_META[nivel].color,
    }))
  }, [data])

  const items = useMemo(() => {
    const all = data?.top_items ?? []
    return filtro === 'todos' ? all : all.filter((it) => it.nivel === filtro)
  }, [data, filtro])

  return (
    <AnalysisRunner
      icon={Gauge}
      runLabel="Estimar nivel de riesgo"
      idleHint="Aplica la cabeza E5-large + LogReg sobre los embeddings y verifica con RoBERTa los casos altos en inglés."
      estado={estado}
      ejecutarFuncion={ejecutarRiesgo}
    >
      <div className="flex flex-col gap-4">
        {data?.disclaimer && (
          <Alert>
            <TriangleAlert />
            <AlertTitle>Aviso: modelo de IA experimental</AlertTitle>
            <AlertDescription>{data.disclaimer}</AlertDescription>
          </Alert>
        )}

        {data?.resumen && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Alto + potencial</CardDescription>
                <CardTitle className="text-2xl text-destructive">
                  {data.resumen.pct_alto_potencial}%
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Requieren revisión por personal cualificado
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Documentos analizados</CardDescription>
                <CardTitle className="text-2xl">{data.resumen.total}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                {data.modelo_version ?? 'E5-large + LogReg'}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Score medio</CardDescription>
                <CardTitle className="text-2xl">{data.resumen.score_medio}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                P(suicidio) promedio del corpus
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Verificados RoBERTa</CardDescription>
                <CardTitle className="text-2xl">{data.verificados_b ?? 0}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Solo casos altos en inglés
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Distribución por nivel de riesgo</CardTitle>
              <CardDescription>Alto, potencial, medio, bajo y nulo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donut}
                      dataKey="valor"
                      nameKey="nivel"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={2}
                    >
                      {donut.map((n) => (
                        <Cell key={n.nivel} fill={n.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Desglose</CardTitle>
              <CardDescription>Conteo y porcentaje por nivel</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {donut.map((n) => (
                <div key={n.nivel} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: n.color }}
                        aria-hidden
                      />
                      <Badge variant={NIVEL_META[n.nivel as Nivel].badge}>{n.nivel}</Badge>
                    </span>
                    <span className="text-muted-foreground">
                      {n.valor} ({n.pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${n.pct}%`, backgroundColor: n.color }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <CardTitle className="flex items-center gap-2">
                Textos más relevantes
                {data?.fuente && (
                  <Badge variant={data.fuente === 'chat' ? 'default' : 'secondary'}>
                    {data.fuente === 'chat' ? 'Chat' : 'Mensajes'}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {data?.fuente === 'chat'
                  ? 'Chunks de conversación con los mensajes de riesgo resaltados'
                  : 'Casos de mayor riesgo con la evidencia resaltada'}
              </CardDescription>
            </div>
            <Select value={filtro} onValueChange={(v) => setFiltro(v as typeof filtro)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Nivel</SelectLabel>
                  <SelectItem value="todos">Todos</SelectItem>
                  {(Object.keys(NIVEL_META) as Nivel[]).map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {!items.length ? (
              <p className="text-sm text-muted-foreground">Sin casos para este filtro.</p>
            ) : (
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead>Evidencia</TableHead>
                    <TableHead className="w-20">Score A</TableHead>
                    <TableHead className="w-20">RoBERTa</TableHead>
                    <TableHead className="w-24">Nivel</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.slice(0, 50).map((it) => (
                    <TableRow key={it.doc_id} className="align-top">
                      <TableCell className="min-w-0">
                        {it.chunk_index != null && (
                          <div className="mb-1 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                            <Badge variant="secondary">chunk #{it.chunk_index}</Badge>
                            <span>
                              msgs {it.msg_desde}–{it.msg_hasta}
                            </span>
                            {(it.fecha_desde || it.fecha_hasta) && (
                              <span>
                                · {it.fecha_desde ?? '?'} → {it.fecha_hasta ?? '?'}
                              </span>
                            )}
                          </div>
                        )}
                        {it.mensajes_evidencia?.length ? (
                          <div className="flex flex-col gap-1.5">
                            {it.mensajes_evidencia.map((m) => (
                              <p key={m.n} className="rounded-md bg-muted/40 p-2 text-sm leading-relaxed break-words text-pretty">
                                <span className="mr-1 font-mono text-xs text-muted-foreground">#{m.n}</span>
                                {highlightTriggers(m.texto, m.triggers)}
                              </p>
                            ))}
                            <ExpandableEvidence texto={it.texto} triggers={[]} />
                          </div>
                        ) : (
                          <ExpandableEvidence texto={it.texto} triggers={it.triggers} />
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{it.score_a.toFixed(3)}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {it.score_b != null ? it.score_b.toFixed(3) : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={NIVEL_META[it.nivel].badge}>{it.nivel}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AnalysisRunner>
  )
}
