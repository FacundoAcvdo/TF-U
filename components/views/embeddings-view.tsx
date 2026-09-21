'use client'

import { Sparkles } from 'lucide-react'
import { AnalysisRunner } from '@/components/analysis-runner'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { useDataset } from '@/context/dataset-provider'
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

  const ejecutarEmbeddings = async () => {
    setEstado('running')
    const respuesta = await fetch('http://localhost:8080/clustering/visualizeEmbeddings', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataset: datasetSeleccionado }),
    })
    if (!respuesta.ok) {
      console.error('Error al calcular embeddings:', respuesta.statusText)
      setEstado('idle')
      return
    }
    const json: EmbeddingsResponse = await respuesta.json()
    setData(json)
    setEstado('done')
  }

  useEffect(() => {
    if (!datasetSeleccionado) return
    const fetchData = async () => {
      try {
        setEstado('running')
        const respuesta = await fetch('http://localhost:8080/clustering/getEmbeddingsImage', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataset: datasetSeleccionado }),
        })
        if (!respuesta.ok) { setEstado('idle'); return }
        const json: EmbeddingsResponse = await respuesta.json()
        if (!json.points) { setEstado('idle'); return }
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
      idleHint="Genera la representación vectorial de cada mensaje y proyéctala en 2D para observar agrupamientos semánticos."
      estado={estado}
      ejecutarFuncion={ejecutarEmbeddings}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold tracking-tight">Proyección 2D — UMAP</h3>
            <p className="text-xs text-muted-foreground">cosine · 2 componentes · HDBSCAN interactivo</p>
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
