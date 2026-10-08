'use client'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { HeartCrack } from 'lucide-react'
import { AnalysisRunner } from '@/components/analysis-runner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { useDataset } from '@/context/dataset-provider'
import { API_BASE } from '@/lib/api-base'
import { EmotionCorpusMeanChart } from '@/components/charts/emotion-corpus-mean-chart'
import { EmotionDistributionChart } from '@/components/charts/emotion-distribution-chart'
import { EmotionCorrelationHeatmap } from '@/components/charts/emotion-correlation-heatmap'
import { EmotionClassHeatmap } from '@/components/charts/emotion-class-heatmap'

// Tipos backend 6 emociones multilingüe
type CorpusStats = Record<string, { count: number; mean: number; std: number; min: number; max: number; median: number; q25: number; q75: number; sum: number }>
type ClassStats = Array<{ clase: string; count: number } & Record<string, { count: number; mean: number; std: number; min: number; max: number; median: number; q25: number; q75: number; sum: number; top_words?: string[] }>>
type Correlation = { matrix: number[][]; order: string[]; flat: { x: string; y: string; value: number }[] }
type Distribution = Array<{ emotion: string; stats: { count: number; mean: number; std: number; min: number; max: number; median: number; q25: number; q75: number }; histogram: { bin_start: number; bin_end: number; count: number }[] }>

type EmotionsResponse = {
  dataset_id: string
  emotions: string[]
  corpus_stats: CorpusStats
  class_stats: ClassStats
  correlation: Correlation
  distribution: Distribution
  top_words: Record<string, string[]>
  class_top_words: Record<string, Record<string, string[]>>
}

const classViews = [
  { label: "Promedio (mean)", value: "mean" as const },
  { label: "Mediana (median)", value: "median" as const },
  { label: "Desviación estándar (std)", value: "std" as const },
]

const corpusViews = [
  { label: "Promedio", value: "mean" },
  { label: "Distribución", value: "distribution" },
  { label: "Correlación", value: "correlation" },
]

export function EmotionsView() {
  const [estado, setEstado] = useState<'idle' | 'done' | 'running'>('idle')
  const [data, setData] = useState<EmotionsResponse | null>(null)
  const [corpusView, setCorpusView] = useState<'mean' | 'distribution' | 'correlation'>('mean')
  const [classMetric, setClassMetric] = useState<'mean' | 'median' | 'std'>('mean')

  const { datasetSeleccionado } = useDataset()

  const ejecutarEmotions = async () => {
    setEstado('running')
    const respuesta = await fetch(API_BASE + '/emotions/analyzeEmotions', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataset: datasetSeleccionado }),
    })
    if (!respuesta.ok) {
      console.error('Error al analizar emociones:', respuesta.statusText)
      setEstado('idle')
      return
    }
    const json: EmotionsResponse = await respuesta.json()
    setData(json)
    setEstado('done')
  }

  useEffect(() => {
    if (!datasetSeleccionado) return
    const fetchResults = async () => {
      try {
        setEstado('running')
        const respuesta = await fetch(API_BASE + '/emotions/getResults', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataset: datasetSeleccionado }),
        })
        if (!respuesta.ok) { setEstado('idle'); return }
        const json: EmotionsResponse = await respuesta.json()
        if (!json.corpus_stats) { setEstado('idle'); return }
        setData(json)
        setEstado('done')
      } catch { setEstado('idle') }
    }
    fetchResults()
  }, [datasetSeleccionado])

  return (
    <AnalysisRunner
      icon={HeartCrack}
      runLabel="Detectar emociones"
      idleHint="Clasifica cada mensaje según la emoción predominante (Empath) y agrega resultados."
      ejecutarFuncion={ejecutarEmotions}
      estado={estado}
    >
      <div className="flex flex-col gap-6">
        {/* CORPUS */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-row items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-semibold tracking-tight">Emociones — corpus</h3>
                <p className="text-xs text-muted-foreground">6 emociones · transformer multilingüe (es/en)</p>
              </div>
              <Select value={corpusView} onValueChange={(v) => setCorpusView(v as any)}>
                <SelectTrigger size="sm" className="w-36 bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Vista</SelectLabel>
                    {corpusViews.map((item) => (
                      <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {!data ? (
              <p className="text-sm text-muted-foreground">Sin datos</p>
            ) : corpusView === 'mean' ? (
              <EmotionCorpusMeanChart corpusStats={data.corpus_stats} />
            ) : corpusView === 'distribution' ? (
              <EmotionDistributionChart distribution={data.distribution} />
            ) : (
              <EmotionCorrelationHeatmap correlation={data.correlation} topWords={data.top_words} />
            )}
          </CardContent>
        </Card>

        {/* CLASES */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-row items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-semibold tracking-tight">Emociones por clase</h3>
                <p className="text-xs text-muted-foreground">Comparativa entre clases del dataset</p>
              </div>
              <Select value={classMetric} onValueChange={(v) => setClassMetric(v as any)}>
                <SelectTrigger size="sm" className="w-36 bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Métrica</SelectLabel>
                    {classViews.map((item) => (
                      <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {!data ? (
              <p className="text-sm text-muted-foreground">Sin datos</p>
            ) : (
              <EmotionClassHeatmap classStats={data.class_stats} emotions={data.emotions} metric={classMetric} />
            )}
          </CardContent>
        </Card>
      </div>
    </AnalysisRunner>
  )
}
