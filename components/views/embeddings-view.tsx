'use client'

import { Sparkles } from 'lucide-react'
import { AnalysisRunner } from '@/components/analysis-runner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { useDataset } from '@/context/dataset-provider'

export function EmbeddingsView() {
  const [estado, setEstado] = useState<'idle' | 'done' | 'running'>('idle')
  const [publicUrl, setPublicUrl] = useState<string | null>(null)

  const { datasetSeleccionado } = useDataset()

  const ejecutarEmbeddings = async () => {
    setEstado('running')

    const respuesta = await fetch('http://localhost:8080/cluster', {
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

    const data: { public_url: string } = await respuesta.json()
    setPublicUrl(data.public_url)
    setEstado('done')
  }

  useEffect(() => {
    const fetchImage = async () => {
      try {
        setEstado('running')

        const respuesta = await fetch('http://localhost:8080/getClusteringImage', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataset: datasetSeleccionado }),
        })

        if (!respuesta.ok) {
          setEstado('idle')
          return
        }

        const data: { public_url: string } = await respuesta.json()

        if (!data.public_url) {
          setEstado('idle')
          return
        }

        setPublicUrl(data.public_url)
        setEstado('done')
      } catch (error) {
        setEstado('idle')
        return
      }
    }

    fetchImage()
  }, [datasetSeleccionado])

  return (
    <AnalysisRunner
      icon={Sparkles}
      runLabel="Calcular embeddings"
      idleHint="Genera la representación vectorial de cada mensaje y proyéctala en 2D para observar agrupamientos semánticos entre los textos."
      estado={estado}
      ejecutarFuncion={ejecutarEmbeddings}
    >
      <Card>
        <CardHeader>
          <CardTitle>Proyección 2D (UMAP)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="h-[600px] w-full">
            {publicUrl && <img src={publicUrl} className="h-full w-full object-contain" alt="Imagen de los embeddings" />}
          </div>
        </CardContent>
      </Card>
    </AnalysisRunner>
  )
}