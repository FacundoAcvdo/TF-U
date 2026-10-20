'use client'

import { Sparkles } from 'lucide-react'
import { AnalysisRunner } from '@/components/analysis-runner'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { useDataset } from '@/context/dataset-provider'
import { useJobs } from '@/context/jobs-context'
import { apiFetch } from '@/lib/api-fetch'
import { EmbeddingsScatter } from '@/components/charts/embeddings-scatter'

type EmbeddingsResponse = {
  dataset_id: string
  points: { x: number; y: number; cluster: string }[]
  clusters: { id: string; count: number }[]
  total: number
  displayed: number
  outliers: number
  truncated?: boolean
}

export function EmbeddingsView() {
  const [estado, setEstado] = useState<'idle' | 'done' | 'running'>('idle')
  const [data, setData] = useState<EmbeddingsResponse | null>(null)

  const { datasetSeleccionado } = useDataset()
  const { tasks, startTask, adoptTask, consumeTask } = useJobs()
  const taskKey = datasetSeleccionado ? `embeddings:${datasetSeleccionado}` : null
  const task = taskKey ? tasks[taskKey] : undefined

  const ejecutarEmbeddings = () => {
    if (!datasetSeleccionado || !taskKey) return
    setEstado('running')
    startTask({
      key: taskKey,
      service: 'clustering',
      operation: 'visualizeEmbeddings',
      jobType: 'embeddings',
      dataset: datasetSeleccionado,
      body: { dataset: datasetSeleccionado },
      successMessage: 'Embeddings calculados correctamente.',
    }).catch(() => setEstado('idle'))
  }

  useEffect(() => {
    if (!datasetSeleccionado || !taskKey) return
    adoptTask({
      key: taskKey,
      service: 'clustering',
      jobType: 'embeddings',
      dataset: datasetSeleccionado,
      successMessage: 'Embeddings calculados correctamente.',
    })
  }, [datasetSeleccionado])

  useEffect(() => {
    if (!task || task.consumed) return
    if (task.status === 'running') {
      setEstado('running')
    } else if (task.status === 'succeeded') {
      setData(task.result as EmbeddingsResponse)
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
        const json = await apiFetch<EmbeddingsResponse>('/clustering/getEmbeddingsImage', {
          method: 'POST',
          body: JSON.stringify({ dataset: datasetSeleccionado }),
        }, { silent: true, ignoreNotFound: true })
        if (!json?.points) { setEstado('idle'); return }
        setData(json)
        setEstado('done')
      } catch { setEstado('idle') }
    }
    fetchData()
  }, [datasetSeleccionado])

  return (
    <AnalysisRunner
      icon={Sparkles}
      runLabel="Calcular embeddings"
      idleHint="Convierte cada mensaje en una representación numérica de su significado y lo ubica en un mapa 2D. Los textos parecidos quedan cerca: sirve para descubrir temas recurrentes y ver de un vistazo cómo se agrupa el contenido del dataset."
      estado={estado}
      ejecutarFuncion={ejecutarEmbeddings}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold tracking-tight">Proyección 2D — UMAP</h3>
            <p className="text-xs text-muted-foreground">coseno · 2 componentes · HDBSCAN interactivo</p>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {!data ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Sin datos</p>
          ) : (
            <EmbeddingsScatter
              points={data.points}
              clusters={data.clusters}
              outliers={data.outliers}
              total={data.total}
              truncated={data.truncated}
            />
          )}
        </CardContent>
      </Card>
    </AnalysisRunner>
  )
}
