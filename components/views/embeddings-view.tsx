'use client'

import { ResponsiveContainer } from 'recharts'
import { Sparkles } from 'lucide-react'
import { AnalysisRunner } from '@/components/analysis-runner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'

type Punto = { x: number; y: number; cluster: string }

export function EmbeddingsView() {
  const [gruposPorCluster, setGruposPorCluster] = useState<Record<string, Punto[]>>({})
  const [publicUrl, setPublicUrl] = useState<string | null>(null)

  const ejecutarEmbeddings = async () => {
    const respuesta = await fetch('http://localhost:8080/cluster', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dataset: "Suicide_Detection.csv" }),
    })

    if (!respuesta.ok) {
      console.error('Error al calcular embeddings:', respuesta.statusText)
      return
    }

    const data: { "public_url": string } = await respuesta.json()

    setPublicUrl(data.public_url)
  }



  return (
    <AnalysisRunner
      icon={Sparkles}
      runLabel="Calcular embeddings"
      idleHint="Genera la representación vectorial de cada mensaje y proyéctala en 2D para observar agrupamientos semánticos entre los textos."
      ejecutarFuncion={ejecutarEmbeddings}
    >
      <Card>
        <CardHeader>
          <CardTitle>Proyección 2D (UMAP)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="h-[400px] w-full">
              {publicUrl && <img src={publicUrl} alt="Imagen de los embeddings" />}
          </div>
        </CardContent>
      </Card>
    </AnalysisRunner>
  )
}
