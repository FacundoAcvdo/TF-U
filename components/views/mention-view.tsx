'use client'

import { useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import { AnalysisRunner } from '@/components/analysis-runner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Combobox,ComboboxContent,ComboboxEmpty,ComboboxInput,ComboboxItem,ComboboxList,} from "@/components/ui/combobox"
import { Slider } from "@/components/ui/slider"

const opciones= [
  "Validación Cruzada",
  "Porcentajes de Entrenamiento y Prueba",
]
const tamañoK= [
  "5",
  "10",
]

type ResumenMenciones = {
  truePositive: number 
  falsePositive: number 
  trueNegative: number 
  falseNegative: number 
  accuracy: number
}

export function MentionView() {
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<string | null>(null)
  const [opcionSeleccionadak, setOpcionSeleccionadak] = useState<string | null>(tamañoK[0])
  const [porcentajeTrain, setPorcentajeTrain] = useState<number[]>([50])
  const [resultado, setResultado] = useState<ResumenMenciones | null>(null)
  const [error, setError] = useState<string | null>(null)
  const porcentajeEntrenamiento = porcentajeTrain?.[0] ?? 50
  const porcentajePrueba = 100 - porcentajeEntrenamiento

  const funcion = async () => {

    setError(null)

    const body = opcionSeleccionada === 'Validación Cruzada'
      ? {
          modo: 'validacion_cruzada',
          k: Number(opcionSeleccionadak),
        }
      : {
          modo: 'porcentajes',
          porcentaje_entrenamiento: Number(porcentajeEntrenamiento),
          porcentaje_prueba: Number(porcentajePrueba),
        }

    try {
      const res = await fetch('http://127.0.0.1:8000/detectar_menciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const detalle = await res.json().catch(() => null)
        throw new Error(detalle?.detail ?? `Error ${res.status} al detectar menciones`)
      }

      const data = await res.json()
      setResultado(data.resumen as ResumenMenciones)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado al detectar menciones')
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="mx-auto grid w-full max-w-5xl gap-4 grid-cols-1 sm:grid-cols-2 items-stretch">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Configurar análisis</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4">
          <Combobox items={opciones} value= {opcionSeleccionada} onValueChange={setOpcionSeleccionada} >
              <ComboboxInput placeholder="Seleccionar opción" />
              <ComboboxContent>
                <ComboboxEmpty>No items found.</ComboboxEmpty>
                <ComboboxList>
                  {opciones.map((item) => (
                    <ComboboxItem key={item} value={item} className="cursor-pointer">
                      {item}
                    </ComboboxItem>
                  ))}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>

          {opcionSeleccionada === 'Porcentajes de Entrenamiento y Prueba' && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Entrenamiento: {porcentajeEntrenamiento}%</span>
                <span>Prueba: {porcentajePrueba}%</span>
              </div>
              <Slider
                min={10}
                max={90}
                step={10}
                value={porcentajeTrain}
                onValueChange={(v) => setPorcentajeTrain(Array.isArray(v) ? v : [v as number])}
                className="mx-auto w-full max-w-xs"
              />
            </div>
          )}
          {opcionSeleccionada === 'Validación Cruzada' && (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm text-muted-foreground">
                <span>Cantidad de pliegues (K)</span>
              </label>
              <Combobox items={tamañoK} value={opcionSeleccionadak} onValueChange={setOpcionSeleccionadak}>
                <ComboboxInput placeholder="Seleccionar opción" />
                <ComboboxContent>
                  <ComboboxEmpty>No items found.</ComboboxEmpty>
                  <ComboboxList>
                    {tamañoK.map((item) => (
                      <ComboboxItem key={item} value={item}>
                        {item}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          )}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </CardContent>
      </Card>

      <AnalysisRunner
        icon={ShieldAlert}
        runLabel="Detectar menciones"
        idleHint="Clasifica cada mensaje como posible mención de ideación suicida mediante un modelo entrenado, indicando el nivel de confianza."
      >
        <Card>
          <CardHeader>
            <CardTitle>Matriz de confusión</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="mx-auto grid w-full max-w-sm grid-cols-[auto_1fr_1fr] gap-1 text-center text-sm">
              <div />
              <div className="text-muted-foreground">Predicción: Mención</div>
              <div className="text-muted-foreground">Predicción: No mención</div>

              <div className="flex items-center justify-end pr-2 text-muted-foreground">Real: Mención</div>
              <div className="rounded-md border border-border bg-primary/10 py-4 font-semibold">
                {resultado?.truePositive ?? 0}
              </div>
              <div className="rounded-md border border-border py-4 font-semibold">
                {resultado?.falseNegative ?? 0}
              </div>

              <div className="flex items-center justify-end pr-2 text-muted-foreground">Real: No mención</div>
              <div className="rounded-md border border-border py-4 font-semibold">
                {resultado?.falsePositive ?? 0}
              </div>
              <div className="rounded-md border border-border bg-primary/10 py-4 font-semibold">
                {resultado?.trueNegative ?? 0}
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Accuracy: <span className="font-semibold text-foreground">{resultado ? `${Math.round(resultado.accuracy * 100)}%` : '—'}</span>
            </p>
          </CardContent>
        </Card>
      </AnalysisRunner>
      </div>
    </div>
  )
}