'use client'
import { ChartColumn } from 'lucide-react'
import { AnalysisRunner } from '@/components/analysis-runner'
import { useEffect, useState } from 'react'
import { useDataset } from '@/context/dataset-provider'
import { API_BASE } from '@/lib/api-base'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader } from '../ui/card'
import { EdaSentenceBoxPlot } from '@/components/charts/eda-sentence-boxplot'
import { EdaSentenceFreq } from '@/components/charts/eda-sentence-freq'
import { EdaClassDistribution } from '@/components/charts/eda-class-distribution'
import { EdaDistribution } from '@/components/charts/eda-distribution'

interface DF_STATS {
  sentence_avg: number,
  sentence_max: number,
  sentence_min: number,
  sentences: number,
  texto: number,
  vocabulary: number,
  word_avg: number,
  words: number,
}

interface DF_CLASS_STATS extends DF_STATS {
  clase: string
}

interface EDA_RESPONSE {
  dataset_id: string
  corpus_stats: DF_STATS
  class_stats: DF_CLASS_STATS[]
  sentence_stats: { min: number; max: number; median: number; q25: number; q75: number; mean: number; std: number; count: number }
  sentence_freq: { sentences: number; count: number; bin_end?: number }[]
  distribution: { clase: string; words_histogram: { bin_start: number; bin_end: number; count: number }[]; sentences_histogram: { bin_start: number; bin_end: number; count: number }[]; words_stats: any; sentences_stats: any }[]
}

export function StatsView() {
  const [estado, setEstado] = useState<'idle' | 'done' | 'running'>('idle')

  const [stats, setStats] = useState<DF_STATS | null>(null)
  const [classStats, setClassStats] = useState<DF_CLASS_STATS[] | null>(null)
  const [sentenceStats, setSentenceStats] = useState<EDA_RESPONSE["sentence_stats"] | null>(null)
  const [sentenceFreq, setSentenceFreq] = useState<EDA_RESPONSE["sentence_freq"] | null>(null)
  const [distribution, setDistribution] = useState<EDA_RESPONSE["distribution"] | null>(null)

  const { datasetSeleccionado } = useDataset()

  const ejecutarEda = async () => {
    setEstado('running')
    const respuesta = await fetch(API_BASE + '/eda/eda', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataset: datasetSeleccionado }),
    })
    if (!respuesta.ok) {
      console.error('Error al calcular eda:', respuesta.statusText)
      setEstado('idle')
      return
    }
    const data : EDA_RESPONSE = await respuesta.json()
    setStats(data.corpus_stats)
    setClassStats(data.class_stats)
    setSentenceStats(data.sentence_stats)
    setSentenceFreq(data.sentence_freq)
    setDistribution(data.distribution)
    setEstado('done')
  }

  useEffect(() => {
      if (!datasetSeleccionado) return
      const fetchResults = async () => {
        try {
          setEstado('running')
          const respuesta = await fetch(API_BASE + '/eda/getResults', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dataset: datasetSeleccionado }),
          })  
          if (!respuesta.ok) { setEstado('idle'); return }
          const data : EDA_RESPONSE = await respuesta.json()
          if (!data.corpus_stats || !data.class_stats) { setEstado('idle'); return }
          setStats(data.corpus_stats)
          setClassStats(data.class_stats)
          setSentenceStats(data.sentence_stats)
          setSentenceFreq(data.sentence_freq)
          setDistribution(data.distribution)
          setEstado('done')
        } catch { setEstado('idle') }
      }
      fetchResults()
    }, [datasetSeleccionado])

  return (
    <AnalysisRunner
      icon={ChartColumn}
      runLabel="Calcular estadísticas"
      idleHint="Genera el resumen descriptivo del dataset cargado."
      ejecutarFuncion={ejecutarEda}
      estado={estado}
    >
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="pb-3">
            <h3 className="text-sm font-semibold tracking-tight">Estadísticas de corpus</h3>
            <p className="text-xs text-muted-foreground">Resumen general del dataset</p>
          </CardHeader>
          <CardContent className="pt-0 flex flex-col gap-6">
            <Table className="[&_th:nth-child(even)]:bg-muted/40 [&_td:nth-child(even)]:bg-muted/40">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right text-base">Textos</TableHead>
                  <TableHead className="text-right text-base">Vocabulario</TableHead>
                  <TableHead className="text-right text-base">Palabras</TableHead>
                  <TableHead className="text-right text-base">Palabras avg</TableHead>
                  <TableHead className="text-right text-base">Oraciones</TableHead>
                  <TableHead className="text-right text-base">Oraciones avg</TableHead>
                  <TableHead className="text-right text-base">Oraciones min</TableHead>
                  <TableHead className="text-right text-base">Oraciones max</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-right text-base">{stats?.texto}</TableCell>
                  <TableCell className="text-right text-base">{stats?.vocabulary}</TableCell>
                  <TableCell className="text-right text-base">{stats?.words}</TableCell>
                  <TableCell className="text-right text-base">{stats?.word_avg}</TableCell>
                  <TableCell className="text-right text-base">{stats?.sentences}</TableCell>
                  <TableCell className="text-right text-base">{stats?.sentence_avg}</TableCell>
                  <TableCell className="text-right text-base">{stats?.sentence_min}</TableCell>
                  <TableCell className="text-right text-base">{stats?.sentence_max}</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <Table className="[&_th:nth-child(even)]:bg-muted/40 [&_td:nth-child(even)]:bg-muted/40">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left text-base">Clase</TableHead>
                  <TableHead className="text-left text-base">Textos</TableHead>
                  <TableHead className="text-right text-base">Vocabulario</TableHead>
                  <TableHead className="text-right text-base">Palabras</TableHead>
                  <TableHead className="text-right text-base">Palabras avg</TableHead>
                  <TableHead className="text-right text-base">Oraciones</TableHead>
                  <TableHead className="text-right text-base">Oraciones avg</TableHead>
                  <TableHead className="text-right text-base">Oraciones min</TableHead>
                  <TableHead className="text-right text-base">Oraciones max</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classStats?.map((s, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-left text-base">{s?.clase}</TableCell>
                    <TableCell className="text-right text-base">{s?.texto}</TableCell>
                    <TableCell className="text-right text-base">{s?.vocabulary}</TableCell>
                    <TableCell className="text-right text-base">{s?.words}</TableCell>
                    <TableCell className="text-right text-base">{s?.word_avg}</TableCell>
                    <TableCell className="text-right text-base">{s?.sentences}</TableCell>
                    <TableCell className="text-right text-base">{s?.sentence_avg}</TableCell>
                    <TableCell className="text-right text-base">{s?.sentence_min}</TableCell>
                    <TableCell className="text-right text-base">{s?.sentence_max}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {sentenceStats && sentenceFreq && (
          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-sm font-semibold tracking-tight">Distribución de oraciones</h3>
              <p className="text-xs text-muted-foreground">Boxplot + histograma — hover para detalles</p>
            </CardHeader>
            <CardContent className="pt-0 flex flex-col gap-4">
              <EdaSentenceBoxPlot stats={sentenceStats} />
              <EdaSentenceFreq data={sentenceFreq} />
            </CardContent>
          </Card>
        )}

        {classStats && (
          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-sm font-semibold tracking-tight">Distribución por clase</h3>
              <p className="text-xs text-muted-foreground">Comparativa de métricas por clase</p>
            </CardHeader>
            <CardContent className="pt-0">
              <EdaClassDistribution classStats={classStats} />
            </CardContent>
          </Card>
        )}

        {distribution && (
          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-sm font-semibold tracking-tight">Histograma por clase</h3>
              <p className="text-xs text-muted-foreground">Palabras y oraciones por clase — interactivo</p>
            </CardHeader>
            <CardContent className="pt-0">
              <EdaDistribution distribution={distribution} />
            </CardContent>
          </Card>
        )}
      </div>
    </AnalysisRunner>
  )
}
