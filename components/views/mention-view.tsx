'use client'

import { useState } from 'react'
import { ShieldAlert, Download, FileCode2, RotateCcw, Database } from 'lucide-react'
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

const opciones = [
  'Validación Cruzada',
  'Entrenamiento y Prueba',
]

const tamañoK = [
  '5',
  '10',
]

const modelos = [
  'Logistic Regression',
  'Support Vector Machine',
  'Random Forest',
]

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
}

export function MentionView() {
  const [modeloSeleccionado, setModeloSeleccionado] = useState<string>(modelos[0])
  const [metodoDeEntrenamiento, setMetodoDeEntrenamiento] = useState<string | null>(opciones[0])
  const [valorK, setValorK] = useState<string | null>(tamañoK[0])
  const [porcentajeTrain, setPorcentajeTrain] = useState<number[]>([50])
  const [resultado, setResultado] = useState<ResumenMenciones | null>(null)
  const [modeloDescargaUrl, setModeloDescargaUrl] = useState<string | null>(null)
  const [nombreArchivo, setNombreArchivo] = useState<string>('modelo.pt')

  const porcentajeEntrenamiento = porcentajeTrain[0] ?? 50
  const porcentajePrueba = 100 - porcentajeEntrenamiento

  const handleReset = () => {
    setResultado(null)
    setModeloDescargaUrl(null)
  }

  const funcion = async () => {
    const body = {
      modelo: modeloSeleccionado,
      modo: metodoDeEntrenamiento === 'Validación Cruzada' ? 'validacion_cruzada' : 'porcentajes',
      ...(metodoDeEntrenamiento === 'Validación Cruzada'
        ? { k: Number(valorK) }
        : {
            porcentaje_entrenamiento: porcentajeEntrenamiento,
            porcentaje_prueba: porcentajePrueba,
          }),
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/detectar_menciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.detail ?? 'Error al detectar menciones')
      }

      const data = await res.json()
      setResultado(data.resumen)
      setModeloDescargaUrl(`data:application/octet-stream;base64,${data.archivo_base64}`)
      setNombreArchivo(data.nombre_archivo)
    } catch (error) {
      console.error('Error al detectar menciones:', error)
      alert('Ocurrió un error al detectar menciones. Por favor, inténtelo de nuevo.')
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
      <div className={`grid gap-6 items-stretch w-full ${resultado ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        <Card className="w-full shadow-sm">
          <CardHeader className="pb-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">
                Configuración de análisis
              </CardTitle>
              {resultado && (
                <span className="text-xs text-muted-foreground">(Bloqueado)</span>
              )}
            </div>

            {resultado && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs h-8 cursor-pointer"
                onClick={handleReset}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Volver a ejecutar
              </Button>
            )}
          </CardHeader>

          <CardContent>
            <div className={resultado ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4' : 'flex flex-col gap-4'}>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">
                  Modelo de análisis
                </label>
                <Select
                  value={modeloSeleccionado}
                  onValueChange={(val) => setModeloSeleccionado(val ?? modelos[0])}
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
                  value={metodoDeEntrenamiento ?? undefined}
                  onValueChange={setMetodoDeEntrenamiento}
                  disabled={Boolean(resultado)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione el método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {opciones.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {metodoDeEntrenamiento === 'Entrenamiento y Prueba' && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Entrenamiento: {porcentajeEntrenamiento}%</span>
                    <span>Prueba: {porcentajePrueba}%</span>
                  </div>
                  <Slider
                    min={10}
                    max={90}
                    step={10}
                    disabled={Boolean(resultado)}
                    value={porcentajeTrain}
                    onValueChange={(val) =>
                      setPorcentajeTrain(Array.isArray(val) ? val : [val])
                    }
                    className="w-full py-2"
                  />
                </div>
              )}

              {metodoDeEntrenamiento === 'Validación Cruzada' && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">
                    Cantidad de pliegues (K)
                  </label>
                  <Select
                    value={valorK ?? undefined}
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
          </CardContent>
        </Card>

        {!resultado ? (
          <AnalysisRunner
            icon={ShieldAlert}
            runLabel="Detectar menciones"
            idleHint="Clasifica cada mensaje como posible mención de ideación suicida mediante un modelo entrenado, indicando el nivel de confianza."
            ejecutarFuncion={funcion}
          >
            <div />
          </AnalysisRunner>
        ) : (
          <Card className="w-full shadow-sm">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  Resultados del análisis
                </CardTitle>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md">
                  <Database className="h-3.5 w-3.5" />
                  <span>Muestras procesadas: <strong className="text-foreground">{resultado.total_muestras.toLocaleString()}</strong></span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col items-center gap-6 py-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full text-center">
                <div className="p-2.5 rounded-lg bg-muted/20 border text-xs">
                  <span className="text-muted-foreground block text-[11px]">Total Dataset</span>
                  <strong className="text-foreground text-sm">{resultado.total_muestras.toLocaleString()}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/20 border text-xs">
                  <span className="text-muted-foreground block text-[11px]">Set Entrenamiento</span>
                  <strong className="text-foreground text-sm">{resultado.muestras_train.toLocaleString()}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/20 border text-xs">
                  <span className="text-muted-foreground block text-[11px]">Set Prueba / Validación</span>
                  <strong className="text-foreground text-sm">{resultado.muestras_test.toLocaleString()}</strong>
                </div>
              </div>

              <div className="w-full max-w-md grid grid-cols-[1.1fr_1.3fr_1.3fr] gap-3 text-center items-center">
                <div />
                <div className="text-xs font-medium text-muted-foreground pb-1">
                  Predicción: Mención
                </div>
                <div className="text-xs font-medium text-muted-foreground pb-1">
                  Predicción: No mención
                </div>

                <div className="text-right pr-3 text-xs font-medium text-muted-foreground">
                  Real: Mención
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/50 py-3.5 px-2 text-base font-bold text-foreground shadow-2xs">
                  {resultado.truePositive.toLocaleString()}
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/50 py-3.5 px-2 text-base font-bold text-foreground shadow-2xs">
                  {resultado.falseNegative.toLocaleString()}
                </div>

                <div className="text-right pr-3 text-xs font-medium text-muted-foreground">
                  Real: No mención
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/50 py-3.5 px-2 text-base font-bold text-foreground shadow-2xs">
                  {resultado.falsePositive.toLocaleString()}
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/50 py-3.5 px-2 text-base font-bold text-foreground shadow-2xs">
                  {resultado.trueNegative.toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-xl">
                <div className="px-3.5 py-2 rounded-lg border bg-muted/30 text-xs text-muted-foreground text-center">
                  Accuracy: <span className="font-semibold text-foreground text-sm ml-1">{Math.round(resultado.accuracy * 100)}%</span>
                </div>
                <div className="px-3.5 py-2 rounded-lg border bg-muted/30 text-xs text-muted-foreground text-center">
                  F1-Score: <span className="font-semibold text-foreground text-sm ml-1">{Math.round(resultado.f1_score * 100)}%</span>
                </div>
                <div className="px-3.5 py-2 rounded-lg border bg-muted/30 text-xs text-muted-foreground text-center">
                  Precision: <span className="font-semibold text-foreground text-sm ml-1">{Math.round(resultado.precision * 100)}%</span>
                </div>
                <div className="px-3.5 py-2 rounded-lg border bg-muted/30 text-xs text-muted-foreground text-center">
                  Recall: <span className="font-semibold text-foreground text-sm ml-1">{Math.round(resultado.recall * 100)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {resultado && (
        <Card className="w-full shadow-sm animate-in fade-in duration-200">
          <CardContent className="flex items-center justify-between p-3.5 px-6">
            <div className="flex items-center gap-3 text-xs font-mono font-medium text-foreground">
              <FileCode2 className="h-4 w-4 text-primary" />
              <span>{nombreArchivo}</span>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="gap-2 text-xs h-8 cursor-pointer"
              onClick={handleDescargar}
            >
              <Download className="h-3.5 w-3.5" />
              Descargar modelo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}