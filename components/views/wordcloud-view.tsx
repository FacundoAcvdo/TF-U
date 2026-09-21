'use client'

import { Cloud } from 'lucide-react'
import { AnalysisRunner } from '@/components/analysis-runner'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { useDataset } from '@/context/dataset-provider'
import { WordCloudInteractive } from '@/components/charts/wordcloud-interactive'

type WordFreq = {
  text: string
  value: number
  count: number
  percentage: number
  doc_frequency: number
  doc_percentage: number
  rank: number
}

type WordCloudResponse = {
  dataset_id: string
  documents_processed: number
  total_words: number
  unique_words: number
  frequencies: WordFreq[]
  max_count: number
  min_count: number
}

export function WordCloudView() {
  const [estado, setEstado] = useState<'idle' | 'done' | 'running'>('idle')
  const [data, setData] = useState<WordCloudResponse | null>(null)

  const { datasetSeleccionado } = useDataset()

  const ejecutarWordCloud = async () => {
    setEstado('running')
    const respuesta = await fetch('http://localhost:8080/wordcloud/visualizeWordCloud', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataset: datasetSeleccionado }),
    })
    if (!respuesta.ok) {
      console.error('Error al generar nube:', respuesta.statusText)
      setEstado('idle')
      return
    }
    const json: WordCloudResponse = await respuesta.json()
    setData(json)
    setEstado('done')
  }

  useEffect(() => {
    if (!datasetSeleccionado) return
    const fetchData = async () => {
      try {
        setEstado('running')
        const respuesta = await fetch('http://localhost:8080/wordcloud/getWordCloudImage', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataset: datasetSeleccionado }),
        })
        if (!respuesta.ok) { setEstado('idle'); return }
        const json: WordCloudResponse = await respuesta.json()
        if (!json.frequencies) { setEstado('idle'); return }
        setData(json)
        setEstado('done')
      } catch { setEstado('idle') }
    }
    fetchData()
  }, [datasetSeleccionado])

  return (
    <AnalysisRunner
      icon={Cloud}
      runLabel="Generar nube de palabras"
      idleHint="Extrae los términos más frecuentes del dataset (sin stopwords, min 3 letras) y visualízalos de forma interactiva."
      estado={estado}
      ejecutarFuncion={ejecutarWordCloud}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold tracking-tight">Nube de palabras</h3>
            <p className="text-xs text-muted-foreground">
              {data ? `${data.documents_processed} docs · ${data.total_words.toLocaleString()} palabras · top ${data.frequencies.length}` : 'top 200 términos'}
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {!data ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Sin datos</p>
          ) : (
            <WordCloudInteractive
              frequencies={data.frequencies}
              total_words={data.total_words}
              unique_words={data.unique_words}
              max_count={data.max_count}
            />
          )}
        </CardContent>
      </Card>
    </AnalysisRunner>
  )
}
