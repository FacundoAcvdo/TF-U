'use client'

import { useState } from 'react'
import { ShieldAlert, Download, FileCode2, Settings2, Database, TriangleAlert, Info } from 'lucide-react'
import { AnalysisRunner } from '@/components/analysis-runner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDataset } from '@/context/dataset-provider'
import { API_BASE } from '@/lib/api-base'

const VALIDACION_CRUZADA = 'Validación Cruzada'
const ENTRENAMIENTO_PRUEBA = 'Entrenamiento y Prueba'

const opciones = [VALIDACION_CRUZADA, ENTRENAMIENTO_PRUEBA]

const tamañoK = ['5', '10']

const modelos = [
  'Logistic Regression',
  'Support Vector Machine',
  'Random Forest',
  'Naive Bayes',
  'BERT',
] as const

type Modelo = (typeof modelos)[number]

const MODELOS_SIN_VALIDACION_CRUZADA: Modelo[] = ['BERT']

function formatearPorcentaje(valor: number): string {
  const truncado = Math.trunc(valor * 100 * 100) / 100
  return `${truncado.toFixed(2)}%`
}

type ResumenMenciones = {
  truePositive: number
  falsePositive: number
  trueNegative: number
  falseNegative: number
  accuracy: number
  f1_score: number
  precision: number
  recall: number
  total_muestras: number
  muestras_train: number
  muestras_test: number
  matriz_confusion: number[][]
  clases: string[]
}

export function MentionView() {
  const [estado, setEstado] = useState<'idle' | 'done' | 'running'>('idle')
  const [modeloSeleccionado, setModeloSeleccionado] = useState<Modelo>(modelos[0])
  const [metodoDeEntrenamiento, setMetodoDeEntrenamiento] = useState<string>(opciones[0])
  const [valorK, setValorK] = useState<string>(tamañoK[0])
  const [porcentajeTrain, setPorcentajeTrain] = useState<number[]>([50])
  const [resultado, setResultado] = useState<ResumenMenciones | null>(null)
  const [modeloDescargaUrl, setModeloDescargaUrl] = useState<string | null>(null)
  const [nombreArchivo, setNombreArchivo] = useState<string>('modelo.zip')
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null)

  const { datasetSeleccionado } = useDataset()

  const porcentajeEntrenamiento = porcentajeTrain[0] ?? 50
  const porcentajePrueba = 100 - porcentajeEntrenamiento

  const soportaValidacionCruzada = !MODELOS_SIN_VALIDACION_CRUZADA.includes(modeloSeleccionado)
  const esBert = modeloSeleccionado === 'BERT'

  const handleModeloChange = (val: string) => {
    const nuevoModelo = (val as Modelo) ?? modelos[0]
    setModeloSeleccionado(nuevoModelo)

    if (MODELOS_SIN_VALIDACION_CRUZADA.includes(nuevoModelo) && metodoDeEntrenamiento === VALIDACION_CRUZADA) {
      setMetodoDeEntrenamiento(ENTRENAMIENTO_PRUEBA)
    }
  }

  const handleReset = () => {
    setResultado(null)
    setModeloDescargaUrl(null)
    setErrorMensaje(null)
    setEstado('idle')
  }

  const ejecutarDeteccion = async () => {
    if (!datasetSeleccionado) {
      setErrorMensaje('Seleccioná un dataset antes de entrenar.')
      return
    }

    setEstado('running')
    setErrorMensaje(null)

    const usaValidacionCruzada = soportaValidacionCruzada && metodoDeEntrenamiento === VALIDACION_CRUZADA

    const body = {
      dataset: datasetSeleccionado,
      modelo: modeloSeleccionado,
      modo: usaValidacionCruzada ? 'validacion_cruzada' : 'porcentajes',
      ...(usaValidacionCruzada
        ? { k: Number(valorK) }
        : {
            porcentaje_entrenamiento: porcentajeEntrenamiento,
            porcentaje_prueba: porcentajePrueba,
          }),
    }

    try {
      const res = await fetch(`${API_BASE}/classification/detectar_menciones`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        const mensaje = errorData?.detail ?? 'Ocurrió un error al detectar menciones. Por favor, inténtelo de nuevo.'
        console.warn('Error al detectar menciones:', mensaje)
        setErrorMensaje(typeof mensaje === 'string' ? mensaje : JSON.stringify(mensaje))
        setEstado('idle')
        return
      }

      const data = await res.json()

      // El modelo queda guardado en el servidor y se descarga por link
      // (antes viajaba en base64 dentro del JSON y tumbaba la conexión con BERT).
      setResultado(data.resumen)
      setModeloDescargaUrl(
        `${API_BASE}/classification/descargar_modelo?model_id=${encodeURIComponent(data.model_id ?? '')}`,
      )
      setNombreArchivo(data.nombre_archivo ?? 'modelo.zip')
      setEstado('done')
    } catch (error) {
      console.warn('Error de conexión al detectar menciones:', error)
      setErrorMensaje('No se pudo conectar con el servidor. Por favor, inténtelo de nuevo.')
      setEstado('idle')
    }
  }

  const handleDescargar = () => {
    if (!modeloDescargaUrl) return

    const enlaceDescarga = document.createElement('a')
    enlaceDescarga.href = modeloDescargaUrl
    enlaceDescarga.download = nombreArchivo
    document.body.appendChild(enlaceDescarga)
    enlaceDescarga.click()
    document.body.removeChild(enlaceDescarga)
  }

  return (
    <div className={`w-full mx-auto flex flex-col gap-6 py-4 ${resultado ? 'max-w-4xl' : 'max-w-5xl'}`}>
      {errorMensaje && (
        <div className="flex items-center gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          <span>{errorMensaje}</span>
        </div>
      )}
      <div className={`grid gap-6 items-stretch w-full ${resultado ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        <Card className="w-full shadow-sm">
          <CardHeader className="pb-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">
                Configuración de análisis
              </CardTitle>
            </div>

            {resultado && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs h-8 cursor-pointer"
                onClick={handleReset}
              >
                <Settings2 className="h-3.5 w-3.5" />
                Cambiar Configuración
              </Button>
            )}
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            <div className={resultado ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4' : 'flex flex-col gap-4'}>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">
                  Modelo de análisis
                </label>
                <Select
                  value={modeloSeleccionado}
                  onValueChange={handleModeloChange}
                  disabled={Boolean(resultado)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione un modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {modelos.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">
                  Método de entrenamiento
                </label>
                <Select
                  value={metodoDeEntrenamiento}
                  onValueChange={setMetodoDeEntrenamiento}
                  disabled={Boolean(resultado)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione el método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {opciones.map((item) => (
                        <SelectItem
                          key={item}
                          value={item}
                          disabled={item === VALIDACION_CRUZADA && !soportaValidacionCruzada}
                        >
                          {item}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {metodoDeEntrenamiento === ENTRENAMIENTO_PRUEBA && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Entrenamiento: {porcentajeEntrenamiento}%</span>
                    <span>Prueba: {porcentajePrueba}%</span>
                  </div>
                  <Slider
                    min={10}
                    max={90}
                    step={5}
                    disabled={Boolean(resultado)}
                    value={porcentajeTrain}
                    onValueChange={(val) =>
                      setPorcentajeTrain(Array.isArray(val) ? val : [val])
                    }
                    className="w-full py-2"
                  />
                </div>
              )}

              {metodoDeEntrenamiento === VALIDACION_CRUZADA && soportaValidacionCruzada && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">
                    Cantidad de pliegues (K)
                  </label>
                  <Select
                    value={valorK}
                    onValueChange={setValorK}
                    disabled={Boolean(resultado)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione K" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {tamañoK.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {esBert && !resultado && (
              <div className="flex items-start gap-2.5 rounded-lg border bg-muted/30 px-3.5 py-2.5 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>
                  BERT reentrena la red completa sobre los textos del dataset. Solo admite
                  división en entrenamiento y prueba, puede tardar varios minutos y el archivo
                  resultante pesa cientos de megabytes.
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {!resultado ? (
          <AnalysisRunner
            icon={ShieldAlert}
            runLabel="Detectar menciones"
            idleHint="Entrena un clasificador con tu dataset, evalúa su matriz de confusión y descarga el modelo resultante."
            estado={estado}
            ejecutarFuncion={ejecutarDeteccion}
          >
            <div />
          </AnalysisRunner>
        ) : (
          <Card className="w-full shadow-sm">
            <CardHeader className="pb-3 border-b">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <CardTitle className="text-sm font-semibold">
                  Resultados del análisis
                </CardTitle>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md">
                  <Database className="h-3.5 w-3.5" />
                  <span>
                    Muestras procesadas:{' '}
                    <strong className="text-foreground">
                      {resultado.total_muestras.toLocaleString()}
                    </strong>
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col items-center gap-6 py-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full text-center">
                <div className="p-2.5 rounded-lg bg-muted/20 border text-xs">
                  <span className="text-muted-foreground block text-[11px]">Total Dataset</span>
                  <strong className="text-foreground text-sm">
                    {resultado.total_muestras.toLocaleString()}
                  </strong>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/20 border text-xs">
                  <span className="text-muted-foreground block text-[11px]">Set Entrenamiento</span>
                  <strong className="text-foreground text-sm">
                    {resultado.muestras_train.toLocaleString()}
                  </strong>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/20 border text-xs">
                  <span className="text-muted-foreground block text-[11px]">Set Prueba / Validación</span>
                  <strong className="text-foreground text-sm">
                    {resultado.muestras_test.toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* MATRIZ DE CONFUSIÓN DINÁMICA (Soporta múltiples clases) */}
              <div className="w-full flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Matriz de Confusión (Filas: Real, Columnas: Predicha)
                </span>
                <div className="overflow-x-auto max-w-full border rounded-lg p-2 bg-muted/10">
                  <table className="text-xs text-center border-collapse">
                    <thead>
                      <tr>
                        <th className="p-2 border-b border-r bg-muted/20 text-muted-foreground font-semibold">Real \ Pred</th>
                        {resultado.clases.map((c, idx) => (
                          <th key={idx} className="p-2 border-b border-r bg-muted/20 font-medium text-foreground max-w-[100px] truncate px-3" title={c}>
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {resultado.matriz_confusion.map((fila, i) => (
                        <tr key={i}>
                          <th className="p-2 border-r border-b bg-muted/20 font-medium text-foreground text-left max-w-[100px] truncate px-3" title={resultado.clases[i]}>
                            {resultado.clases[i]}
                          </th>
                          {fila.map((valor, j) => {
                            const esDiagonal = i === j
                            return (
                              <td
                                key={j}
                                className={`p-2 border-r border-b font-mono ${
                                  esDiagonal
                                    ? 'bg-primary/15 text-primary font-bold'
                                    : valor > 0
                                    ? 'bg-destructive/10 text-destructive font-medium'
                                    : 'text-muted-foreground'
                                }`}
                              >
                                {valor}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-xl">
                <div className="flex flex-col items-center gap-0.5 px-3.5 py-2 rounded-lg border bg-muted/30 text-xs text-muted-foreground text-center">
                  <span>Accuracy</span>
                  <span className="font-semibold text-foreground text-sm">
                    {formatearPorcentaje(resultado.accuracy)}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-0.5 px-3.5 py-2 rounded-lg border bg-muted/30 text-xs text-muted-foreground text-center">
                  <span>F1-Score</span>
                  <span className="font-semibold text-foreground text-sm">
                    {formatearPorcentaje(resultado.f1_score)}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-0.5 px-3.5 py-2 rounded-lg border bg-muted/30 text-xs text-muted-foreground text-center">
                  <span>Precision</span>
                  <span className="font-semibold text-foreground text-sm">
                    {formatearPorcentaje(resultado.precision)}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-0.5 px-3.5 py-2 rounded-lg border bg-muted/30 text-xs text-muted-foreground text-center">
                  <span>Recall</span>
                  <span className="font-semibold text-foreground text-sm">
                    {formatearPorcentaje(resultado.recall)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {resultado && (
        <Card className="w-full shadow-sm animate-in fade-in duration-200">
          <CardContent className="flex items-center justify-between p-3.5 px-4 sm:px-6 gap-3">
            <div className="flex items-center gap-2.5 text-xs font-mono font-medium text-foreground min-w-0">
              <FileCode2 className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate">{nombreArchivo}</span>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="gap-2 text-xs h-8 cursor-pointer shrink-0"
              onClick={handleDescargar}
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Descargar modelo</span>
              <span className="sm:hidden">Descargar</span>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}