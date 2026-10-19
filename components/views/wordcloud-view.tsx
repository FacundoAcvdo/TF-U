'use client'

import { Cloud } from 'lucide-react'
import { AnalysisRunner } from '@/components/analysis-runner'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { useDataset } from '@/context/dataset-provider'
import { useJobs } from '@/context/jobs-context'
import { apiFetch } from '@/lib/api-fetch'
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
  const { tasks, startTask, adoptTask, consumeTask } = useJobs()
  const taskKey = datasetSeleccionado ? `wordcloud:${datasetSeleccionado}` : null
  const task = taskKey ? tasks[taskKey] : undefined

  const ejecutarWordCloud = () => {
    if (!datasetSeleccionado || !taskKey) return
    setEstado('running')
    startTask({
      key: taskKey,
      service: 'wordcloud',
      operation: 'visualizeWordCloud',
      jobType: 'wordcloud',
      dataset: datasetSeleccionado,
      body: { dataset: datasetSeleccionado },
      successMessage: 'Nube de palabras generada correctamente.',
    }).catch(() => setEstado('idle'))
  }

  useEffect(() => {
    if (!datasetSeleccionado || !taskKey) return
    adoptTask({
      key: taskKey,
      service: 'wordcloud',
      jobType: 'wordcloud',
      dataset: datasetSeleccionado,
      successMessage: 'Nube de palabras generada correctamente.',
    })
  }, [datasetSeleccionado])

  useEffect(() => {
    if (!task || task.consumed) return
    if (task.status === 'running') {
      setEstado('running')
    } else if (task.status === 'succeeded') {
      setData(task.result as WordCloudResponse)
      setEstado('done')
      consumeTask(task.key)
    } else {
      setEstado('idle')
      consumeTask(task.key)
    }
  }, [task])

  useEffect(() => {
    if (!datasetSeleccionado) return
    const fetchData = async () => {
      try {
        setEstado('running')
        const json = await apiFetch<WordCloudResponse>('/wordcloud/getWordCloudImage', {
          method: 'POST',
          body: JSON.stringify({ dataset: datasetSeleccionado }),
        }, { silent: true, ignoreNotFound: true })
        if (!json?.frequencies) { setEstado('idle'); return }
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
      idleHint="Muestra de forma visual las palabras que más se repiten en el conjunto de textos: cuanto más frecuente es una palabra, más grande se ve. Es una forma rápida de reconocer qué conceptos dominan, ideal para una primera exploración o para ilustrar resultados."
      estado={estado}
      ejecutarFuncion={ejecutarWordCloud}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold tracking-tight">Nube de palabras</h3>
            <p className="text-xs text-muted-foreground">
              {data ? `${data.documents_processed} documentos · ${data.total_words.toLocaleString()} palabras · ${data.frequencies.length} principales` : '200 términos principales'}
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
