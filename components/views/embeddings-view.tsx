'use client'

import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import { Sparkles } from 'lucide-react'
import { AnalysisRunner } from '@/components/analysis-runner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { clustersEmbeddings } from '@/lib/mock-data'
import { useState } from 'react'

type Punto = { x: number; y: number; cluster: string }

export function EmbeddingsView() {
  const [gruposPorCluster, setGruposPorCluster] = useState<Record<string, Punto[]>>({})
  const [colores, setColores] = useState<Record<string, string>>({})

  const ejecutarEmbeddings = async () => {
    const respuesta = await fetch('http://127.0.0.1:8000/cluster', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!respuesta.ok) {
      console.error('Error al calcular embeddings:', respuesta.statusText)
      return
    }

    const data: { clusters: number; data: Punto[] } = await respuesta.json()

    // Agrupar los puntos por cluster
    const grupos: Record<string, Punto[]> = {}
    for (const punto of data.data) {
      if (!grupos[punto.cluster]) grupos[punto.cluster] = []
      grupos[punto.cluster].push(punto)
    }
    setGruposPorCluster(grupos)

    // Generar un color por cada cluster (excluyendo el ruido "-1")
    const clusterIds = Object.keys(grupos).filter((c) => c !== '-1')
    const nuevosColores: Record<string, string> = {}
    clusterIds.forEach((clusterId, i) => {
      const tono = (i * 360) / Math.max(clusterIds.length, 1)
      nuevosColores[clusterId] = `hsl(${tono}, 75%, 50%)`
    })
    setColores(nuevosColores)
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
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" dataKey="x" name="Dim 1" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis type="number" dataKey="y" name="Dim 2" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <ZAxis range={[40, 40]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                {Object.entries(gruposPorCluster).map(([clusterId, puntos]) => (
                  <Scatter
                    key={clusterId}
                    name={clusterId === '-1' ? 'Ruido' : `Cluster ${clusterId}`}
                    data={puntos}
                    fill={clusterId === '-1' ? 'grey' : colores[clusterId]}
                    fillOpacity={0.75}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4">
            {Object.entries(gruposPorCluster).map(([clusterId, puntos]) => (
              <span key={clusterId} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: clusterId === '-1' ? 'grey' : colores[clusterId] }} aria-hidden />
                {clusterId === '-1' ? 'Outliers' : `Cluster ${clusterId}`} <span className="text-xs">({puntos.length})</span>
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </AnalysisRunner>
  )
}
