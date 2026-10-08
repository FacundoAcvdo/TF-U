'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  TrendingUp,
  TriangleAlert,
  Settings2,
  User,
  MessageSquare,
  Search,
  Users,
  Check,
  Calendar,
  Layers,
} from 'lucide-react'

import { AnalysisRunner } from '@/components/analysis-runner'
import { API_BASE } from '@/lib/api-base'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useDataset } from '@/context/dataset-provider'

type Usuario = {
  remitente: string
  cantidad_mensajes: number
}

type EmotionsMap = Record<string, number>

type Periodo = {
  etiqueta: string
  fecha_inicio: string
  fecha_fin: string
  cantidad_mensajes: number
  emotions: EmotionsMap
}

type BloqueBackend = {
  etiqueta?: string
  desde_msg?: number
  hasta_msg?: number
  cantidad_mensajes: number
  cantidad_palabras?: number
  emotions: EmotionsMap
}

type EvolucionEmociones = {
  remitente: string
  granularidad: string
  emotions?: string[]
  rango_fechas?: {
    desde: string
    hasta: string
  }
  total_mensajes: number
  periodos: Periodo[]
}

const EMOCIONES_ORDEN = [
  'anger',
  'disgust',
  'fear',
  'joy',
  'sadness',
  'surprise',
]

const EMOCIONES_ETIQUETA: Record<string, string> = {
  anger: 'Enojo',
  disgust: 'Disgusto',
  fear: 'Miedo',
  joy: 'Alegría',
  sadness: 'Tristeza',
  surprise: 'Sorpresa',
}

const formatearPorcentaje = (valor: number) =>
  `${(Number(valor) * 100).toFixed(1)}%`

const emocionDominante = (emotions: EmotionsMap | undefined) => {
  if (!emotions) return null
  let mejor: string | null = null
  let mejorValor = -Infinity
  for (const [emo, valor] of Object.entries(emotions)) {
    const num = Number(valor)
    if (Number.isFinite(num) && num > mejorValor) {
      mejorValor = num
      mejor = emo
    }
  }
  return mejor
}

const emocionesOrdenadas = (
  emotions: EmotionsMap | undefined,
  orden: string[] | undefined
) => {
  if (!emotions) return []
  const claves = Object.keys(emotions)
  const base = Array.isArray(orden) && orden.length > 0 ? orden : EMOCIONES_ORDEN
  const resto = claves.filter((c) => !base.includes(c))
  return [...base.filter((c) => c in emotions), ...resto].map((emo) => ({
    emocion: emo,
    valor: Number(emotions[emo]) || 0,
  }))
}

type Estado = 'idle' | 'done' | 'running'

export function SentimentTimeView() {
  const { datasetSeleccionado } = useDataset()

  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false)
  const [errorUsuarios, setErrorUsuarios] = useState<string | null>(null)

  const [remitenteSeleccionado, setRemitenteSeleccionado] =
    useState<string | null>(null)

  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState<Estado>('idle')
  const [resultado, setResultado] =
    useState<EvolucionEmociones | null>(null)

  const [errorMensaje, setErrorMensaje] = useState<string | null>(null)

  useEffect(() => {
    if (!datasetSeleccionado) {
      setUsuarios([])
      setRemitenteSeleccionado(null)
      setBusqueda('')
      setResultado(null)
      setEstado('idle')
      setErrorUsuarios(null)
      setErrorMensaje(null)
      return
    }

    setCargandoUsuarios(true)
    setErrorUsuarios(null)
    setErrorMensaje(null)
    setUsuarios([])
    setRemitenteSeleccionado(null)
    setBusqueda('')
    setResultado(null)
    setEstado('idle')

    const cargarUsuarios = async () => {
      try {
        const res = await fetch(
          API_BASE + '/evolution/users',
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              dataset: datasetSeleccionado,
            }),
          }
        )

        if (!res.ok) {
          const errorData = await res.json().catch(() => null)
          setErrorUsuarios(
            errorData?.detail ??
              'No se pudieron obtener los participantes de este dataset.'
          )
          return
        }

        const data = await res.json()
        setUsuarios(Array.isArray(data.usuarios) ? data.usuarios : [])
      } catch (error) {
        console.warn('Error de conexión al obtener usuarios:', error)
        setErrorUsuarios(
          'No se pudo conectar con el servidor para obtener los participantes.'
        )
      } finally {
        setCargandoUsuarios(false)
      }
    }

    cargarUsuarios()
  }, [datasetSeleccionado])

  const usuariosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    if (!texto) return usuarios

    return usuarios.filter((usuario) =>
      usuario.remitente.toLowerCase().includes(texto)
    )
  }, [usuarios, busqueda])

  const mostrarBuscador = usuarios.length > 2
  const configuracionBloqueada = estado !== 'idle'

  const formatearFecha = (fecha: string) => {
    const partes = fecha.split('-')
    if (partes.length !== 3) return fecha
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  const ejecutarEvolucion = async () => {
    if (!remitenteSeleccionado || !datasetSeleccionado) return

    setEstado('running')
    setErrorMensaje(null)

    try {
      const res = await fetch(
        API_BASE + '/evolution/emotions-evolution',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dataset: datasetSeleccionado,
            remitente: remitenteSeleccionado,
          }),
        }
      )

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        const mensaje =
          errorData?.detail ??
          'Ocurrió un error al calcular la evolución de emociones. Por favor, inténtelo de nuevo.'
        console.warn('Error al calcular evolución:', mensaje)
        setErrorMensaje(mensaje)
        setEstado('idle')
        return
      }

      const data = await res.json()
      if (Array.isArray((data as { bloques?: unknown }).bloques)) {
        const raw = data as { bloques: BloqueBackend[] } & Record<string, unknown>
        const periodos: Periodo[] = raw.bloques.map((b, i) => ({
          etiqueta: b.etiqueta ?? `Bloque ${i + 1}`,
          fecha_inicio: '',
          fecha_fin: '',
          cantidad_mensajes: b.cantidad_mensajes,
          emotions: b.emotions ?? {},
        }))
        setResultado({ ...data, periodos, rango_fechas: undefined })
      } else {
        setResultado(data)
      }
      setEstado('done')
    } catch (error) {
      console.warn('Error de conexión al calcular evolución:', error)
      setErrorMensaje(
        'No se pudo conectar con el servidor. Por favor, inténtelo de nuevo.'
      )
      setEstado('idle')
    }
  }

  const handleReset = () => {
    setResultado(null)
    setErrorMensaje(null)
    setEstado('idle')
  }

  return (
    <div className="w-full flex flex-col gap-6 py-4">
      {errorUsuarios && (
        <div className="flex items-center gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          <span>{errorUsuarios}</span>
        </div>
      )}

      {errorMensaje && (
        <div className="flex items-center gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          <span>{errorMensaje}</span>
        </div>
      )}

      {!resultado && (
        <div className="flex flex-col gap-6 w-full">
          <Card className="w-full shadow-sm">
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Participantes
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Seleccioná un participante para aplicar la evolución de
                  emociones en el tiempo.
                </p>
              </div>
            </CardHeader>

            <CardContent>
              {cargandoUsuarios ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-sm text-muted-foreground">
                    Buscando participantes…
                  </p>
                </div>
              ) : usuarios.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="mb-2 h-5 w-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Seleccioná un dataset para ver sus participantes.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {mostrarBuscador && (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar participante..."
                        className="pl-9"
                        disabled={configuracionBloqueada}
                      />
                    </div>
                  )}

                  <div className="rounded-lg border">
                    <div className="max-h-[220px] overflow-y-auto p-1.5 scrollbar-thin scrollbar-track-muted/30 scrollbar-thumb-muted-foreground/40">
                      <div className="flex flex-col gap-1 pr-1">
                        {usuariosFiltrados.map((usuario) => {
                          const seleccionado =
                            remitenteSeleccionado === usuario.remitente

                          return (
                            <button
                              key={usuario.remitente}
                              type="button"
                              disabled={configuracionBloqueada}
                              onClick={() =>
                                setRemitenteSeleccionado(usuario.remitente)
                              }
                              className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
                                seleccionado
                                  ? 'bg-primary text-primary-foreground'
                                  : 'hover:bg-muted/60'
                              }`}
                            >
                              <div className="flex min-w-0 items-center gap-2.5">
                                <span
                                  className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                                    seleccionado
                                      ? 'bg-primary-foreground/15'
                                      : 'bg-primary/10 text-primary'
                                  }`}
                                >
                                  <User className="h-4 w-4" />
                                </span>

                                <div className="min-w-0">
                                  <p
                                    className={`truncate text-sm font-medium ${
                                      seleccionado
                                        ? 'text-primary-foreground'
                                        : 'text-foreground'
                                    }`}
                                  >
                                    {usuario.remitente}
                                  </p>
                                  <p
                                    className={`text-xs ${
                                      seleccionado
                                        ? 'text-primary-foreground/70'
                                        : 'text-muted-foreground'
                                    }`}
                                  >
                                    {usuario.cantidad_mensajes.toLocaleString()}{' '}
                                    mensajes
                                  </p>
                                </div>
                              </div>

                              {seleccionado && (
                                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
                                  <Check className="h-4 w-4 text-primary-foreground" />
                                </div>
                              )}
                            </button>
                          )
                        })}

                        {usuariosFiltrados.length === 0 && (
                          <div className="py-8 text-center">
                            <Search className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              No se encontraron participantes.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
                    <span>
                      {usuarios.length}{' '}
                      {usuarios.length === 1 ? 'participante' : 'participantes'}
                    </span>
                    {remitenteSeleccionado && (
                      <span className="truncate max-w-[60%]">
                        Seleccionado:{' '}
                        <strong className="text-foreground">
                          {remitenteSeleccionado}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="w-full">
            <AnalysisRunner
              icon={TrendingUp}
              runLabel="Ver evolución de emociones"
              idleHint={
                remitenteSeleccionado
                  ? `Analiza los mensajes de ${remitenteSeleccionado} y arma una línea de tiempo con el porcentaje de cada emoción por período.`
                  : 'Seleccioná un participante para ver la evolución de sus emociones a lo largo del tiempo.'
              }
              estado={estado}
              ejecutarFuncion={ejecutarEvolucion}
            >
              <div />
            </AnalysisRunner>
          </div>
        </div>
      )}

      {resultado && (
        <Card className="w-full shadow-sm animate-in fade-in zoom-in-95 duration-300">
          <CardHeader className="pb-4 border-b bg-muted/5">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              
              <div className="flex flex-col gap-1.5">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  Evolución de emociones
                  <Badge variant="secondary" className="font-normal border bg-background shadow-sm">
                    <User className="w-3.5 h-3.5 mr-1.5 text-primary" />
                    {resultado.remitente}
                  </Badge>
                </CardTitle>
                
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <div className="flex items-center gap-1.5 bg-background border px-2.5 py-1 rounded-md shadow-sm text-xs text-muted-foreground">
                    <MessageSquare className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span><strong className="font-medium text-foreground">{resultado.total_mensajes.toLocaleString()}</strong> mensajes</span>
                  </div>
                  
                  {resultado.rango_fechas ? (
                    <div className="flex items-center gap-1.5 bg-background border px-2.5 py-1 rounded-md shadow-sm text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>
                        <strong className="font-medium text-foreground">{formatearFecha(resultado.rango_fechas.desde)}</strong>
                        <span className="mx-1.5 opacity-50">—</span>
                        <strong className="font-medium text-foreground">{formatearFecha(resultado.rango_fechas.hasta)}</strong>
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-background border px-2.5 py-1 rounded-md shadow-sm text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>Sin fechas: partición por bloques</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 bg-background border px-2.5 py-1 rounded-md shadow-sm text-xs text-muted-foreground">
                    <Layers className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Partición <strong className="font-medium text-foreground capitalize">{resultado.granularidad}</strong></span>
                  </div>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs h-8 cursor-pointer shrink-0 mt-1 sm:mt-0 w-full sm:w-auto"
                onClick={handleReset}
              >
                <Settings2 className="h-3.5 w-3.5" />
                Cambiar participante
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-4 py-5">
            <div className="relative">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-xs font-medium text-muted-foreground">
                  {resultado.rango_fechas ? 'Línea de tiempo horizontal' : 'Particiones por bloques'}
                </span>

                {resultado.periodos.length > 1 && (
                  <span className="text-[11px] text-muted-foreground">
                    Deslizá horizontalmente para avanzar →
                  </span>
                )}
              </div>

              <div className="overflow-x-auto overflow-y-auto rounded-lg border bg-muted/10 px-2 pb-6 pt-6 scrollbar-thin scrollbar-track-muted/30 scrollbar-thumb-muted-foreground/40">
                
                <div className="relative flex min-w-max items-center h-[520px] px-16">
                  
                  <div className="absolute left-0 right-0 top-1/2 h-px bg-border -translate-y-1/2 z-0" />

                  {resultado.periodos.map((periodo, index) => {
                    const isTop = index % 2 === 0

                    return (
                      <div
                        key={periodo.etiqueta}
                        className="relative flex flex-col items-center w-[200px] shrink-0"
                      >
                        <div className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full border-2 border-primary bg-background ring-4 ring-background -translate-x-1/2 -translate-y-1/2 z-10" />

                        <div
                          className={`absolute left-1/2 w-px bg-border -translate-x-1/2 z-0 ${
                            isTop ? 'bottom-1/2 h-12' : 'top-1/2 h-12'
                          }`}
                        />

                        <div
                          className={`absolute left-1/2 -translate-x-1/2 w-[280px] z-20 ${
                            isTop ? 'bottom-1/2 mb-12' : 'top-1/2 mt-12'
                          }`}
                        >
                          {isTop ? (
                            <>
                              <div className="absolute left-1/2 -bottom-[6px] -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-border z-10" />
                              <div className="absolute left-1/2 -bottom-[4.5px] -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-background z-20" />
                            </>
                          ) : (
                            <>
                              <div className="absolute left-1/2 -top-[6px] -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-border z-10" />
                              <div className="absolute left-1/2 -top-[4.5px] -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-background z-20" />
                            </>
                          )}

                          <div className="w-full rounded-xl border bg-background shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-4 flex flex-col gap-3">
                              <div className="flex items-start justify-between border-b pb-3">
                                <div className="min-w-0 pr-2">
                                  <p className="text-sm font-semibold text-foreground truncate">
                                    {periodo.etiqueta}
                                  </p>

                                  {periodo.fecha_inicio ? (
                                    <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                                      {formatearFecha(periodo.fecha_inicio)} —{' '}
                                      {formatearFecha(periodo.fecha_fin)}
                                    </p>
                                  ) : null}
                                </div>

                                <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                                  <MessageSquare className="h-3.5 w-3.5" />
                                  {periodo.cantidad_mensajes.toLocaleString()}
                                </span>
                              </div>

                              <div className="flex flex-col gap-2 pt-0.5">
                                {(() => {
                                  const lista = emocionesOrdenadas(
                                    periodo.emotions,
                                    resultado.emotions
                                  ).sort((a, b) => b.valor - a.valor)
                                  const dominante = emocionDominante(
                                    periodo.emotions
                                  )
                                  if (lista.length === 0) {
                                    return (
                                      <p className="text-xs text-muted-foreground">
                                        Sin emociones para este bloque.
                                      </p>
                                    )
                                  }
                                  return (
                                    <>
                                      {dominante && (
                                        <p className="text-[11px] text-muted-foreground">
                                          Predomina{' '}
                                          <strong className="font-medium text-foreground">
                                            {EMOCIONES_ETIQUETA[dominante] ??
                                              dominante}
                                          </strong>
                                        </p>
                                      )}
                                      <div className="flex flex-wrap gap-1.5">
                                        {lista.map(({ emocion, valor }) => (
                                          <Badge
                                            key={emocion}
                                            variant={
                                              emocion === dominante
                                                ? 'default'
                                                : 'secondary'
                                            }
                                            className="text-xs font-normal"
                                            title={`Puntaje promedio: ${valor.toFixed(4)}`}
                                          >
                                            {EMOCIONES_ETIQUETA[emocion] ??
                                              emocion}
                                            <span className="ml-1 font-medium">
                                              {formatearPorcentaje(valor)}
                                            </span>
                                          </Badge>
                                        ))}
                                      </div>
                                    </>
                                  )
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between px-1 text-xs text-muted-foreground">
                <span className="rounded-full border bg-muted/20 px-3 py-1.5">
                  {resultado.periodos.length}{' '}
                  {resultado.periodos.length === 1
                    ? 'período analizado'
                    : 'períodos analizados'}
                </span>

                {resultado.periodos.length > 1 && (
                  <span className="rounded-full border bg-muted/20 px-3 py-1.5 font-medium">
                    ← desplazate →
                  </span>
                )}
              </div>

            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}