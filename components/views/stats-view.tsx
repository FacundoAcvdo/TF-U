'use client'
import { ChartColumn } from 'lucide-react'
import { AnalysisRunner } from '@/components/analysis-runner'
import { useEffect, useState } from 'react'
import { useDataset } from '@/context/dataset-provider'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

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

interface IMAGES {
  boxplot: string
  catplot: string
  class_distribution: string
  distribution: string
}

interface EDA_RESPONSE {
  corpus_stats: DF_STATS
  class_stats: DF_CLASS_STATS[]
  images: IMAGES
}

export function StatsView() {
  const [estado, setEstado] = useState<'idle' | 'done' | 'running'>('idle')

  const [publicUrls, setPublicUrls] = useState<IMAGES | null>(null)

  const [stats, setStats] = useState<DF_STATS | null>(null)
  const [classStats, setClassStats] = useState<DF_CLASS_STATS[] | null>(null)

  const { datasetSeleccionado } = useDataset()

  const ejecutarEda = async () => {
    setEstado('running')

    const respuesta = await fetch('http://localhost:8080/eda/eda', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataset: datasetSeleccionado }),
    })

    if (!respuesta.ok) {
      console.error('Error al calcular realizar el analisis exploratorio:', respuesta.statusText)
      setEstado('idle')
      return
    }

    const data : EDA_RESPONSE = await respuesta.json()

    setPublicUrls(data.images)
    setStats(data.corpus_stats)
    setClassStats(data.class_stats)
    
    setEstado('done')
  }

  useEffect(() => {
      if (!datasetSeleccionado) return

      const fetchResults = async () => {
        try {
          setEstado('running')
  
          const respuesta = await fetch('http://localhost:8080/eda/getResults', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dataset: datasetSeleccionado }),
          })  
          if (!respuesta.ok) {
            setEstado('idle')
            return
          }
  
          const data : EDA_RESPONSE = await respuesta.json()

          if (!data.images || !data.corpus_stats || !data.class_stats) {
            setEstado('idle')
            return
          }

          setPublicUrls(data.images)
          setStats(data.corpus_stats)
          setClassStats(data.class_stats)

          setEstado('done')
        } catch (error) {
          setEstado('idle')
          return
        }
      }
  
      fetchResults()
    }, [datasetSeleccionado])

  return (
    <AnalysisRunner
      icon={ChartColumn}
      runLabel="Calcular estadísticas"
      idleHint="Genera el resumen descriptivo del dataset cargado: número de registros, usuarios, longitud media de los mensajes y distribución temporal."
      ejecutarFuncion={ejecutarEda}
      estado={estado}
    >
      <Card>
        <CardHeader>
          <CardTitle>Analisis exploratorio</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-10">
          <div className="flex flex-col">
            <h3 className="mb-3 text-base font-semibold">Estadísticas de corpus</h3>
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
          </div>

          <div className="flex flex-col">
            <h3 className="mb-3 text-base font-semibold">Estadísticas por clase</h3>
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
                {classStats?.map((stats, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-left text-base">{stats?.clase}</TableCell>
                    <TableCell className="text-right text-base">{stats?.texto}</TableCell>
                    <TableCell className="text-right text-base">{stats?.vocabulary}</TableCell>
                    <TableCell className="text-right text-base">{stats?.words}</TableCell>
                    <TableCell className="text-right text-base">{stats?.word_avg}</TableCell>
                    <TableCell className="text-right text-base">{stats?.sentences}</TableCell>
                    <TableCell className="text-right text-base">{stats?.sentence_avg}</TableCell>
                    <TableCell className="text-right text-base">{stats?.sentence_min}</TableCell>
                    <TableCell className="text-right text-base">{stats?.sentence_max}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex w-full gap-4">
            {publicUrls && (
              <img
                src={publicUrls?.boxplot}
                className="h-auto w-full max-w-[50%] flex-1 object-contain border rounded-lg"
                alt="Boxplot de la distribución de oraciones"
              />
            )}
            {publicUrls && (
              <img
                src={publicUrls?.catplot}
                className="h-auto w-full max-w-[50%] flex-1 object-contain border rounded-lg"
                alt="Catplot de la distribución de oraciones"
              />
            )}
          </div>

          <div className="w-full">
            {publicUrls && (
              <img
                src={publicUrls.distribution}
                className="h-auto w-full object-contain border rounded-lg"
                alt="Distribución de palabras y oraciones"
              />
            )}
          </div>

          <div className="w-full">
            {publicUrls && (
              <img
                src={publicUrls.class_distribution}
                className="h-auto w-full object-contain border rounded-lg"
                alt="Distribución por clase"
              />
            )}
          </div>
        </CardContent>
      </Card>
    </AnalysisRunner>
  )
}
