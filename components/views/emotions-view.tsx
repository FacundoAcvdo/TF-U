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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { useDataset } from '@/context/dataset-provider'


interface IMAGES {
  emotion_corpus_mean: string,
  emotion_corpus_distribution: string,
  emotion_corpus_correlation: string,
  emotion_class_mean: string,
  emotion_class_std: string,
  emotion_class_median: string
}

const classViews = [
  { label: "Promedio", value: "emotion_class_mean" },
  { label: "Mediana", value: "emotion_class_median" },
  { label: "Desviación estándar", value: "emotion_class_std" },
]

const corpusViews = [
  { label: "Promedio", value: "emotion_corpus_mean" },
  { label: "Distribución", value: "emotion_corpus_distribution" },
  { label: "Correlación", value: "emotion_corpus_correlation" },
]

export function EmotionsView() {
  const [estado, setEstado] = useState<'idle' | 'done' | 'running'>('idle')

  const [publicUrls, setPublicUrls] = useState<IMAGES | null>(null)

  const [heatMapClassView, setHeatMapClassView] = useState<string | null>(null)

  const [corpusView, setCorpusView] = useState<string | null>(null)

  const { datasetSeleccionado } = useDataset()

  const ejecutarEmotions = async () => {
    setEstado('running')

    const respuesta = await fetch('http://localhost:8080/emotions/analyzeEmotions', {
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

    const data: {
      public_urls: IMAGES
    }= await respuesta.json()

    setPublicUrls(data.public_urls)
    
    setEstado('done')
  }

  useEffect(() => {
      if (!datasetSeleccionado) return

      const fetchResults = async () => {
        try {
          setEstado('running')
  
          const respuesta = await fetch('http://localhost:8080/emotions/getResults', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dataset: datasetSeleccionado }),
          })  
          if (!respuesta.ok) {
            setEstado('idle')
            return
          }
  
          const data: {
            public_urls: IMAGES
          }= await respuesta.json()

          if (!data.public_urls) {
            setEstado('idle')
            return
          }

          setPublicUrls(data.public_urls)

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
      icon={HeartCrack}
      runLabel="Detectar emociones"
      idleHint="Clasifica cada mensaje según la emoción negativa predominante y agrega los resultados sobre el conjunto de datos."
      ejecutarFuncion={ejecutarEmotions}
      estado={estado}
    >
      <Card>
        <CardHeader>
          <CardTitle>Analisis de emociones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mt-4">
            <div className="w-full">
              {publicUrls && (
                <>
                  <div className="w-full flex flex-row items-center justify-between gap-4 mb-4">
                    <h3 className="text-left text-muted-foreground">
                      Estadísticas de emociones del corpus
                    </h3>
                      <Select items={corpusViews} defaultValue="emotion_corpus_mean" onValueChange={(value) => setCorpusView(publicUrls[value as keyof IMAGES] || null)}>
                        <SelectTrigger className="w-full max-w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Vistas</SelectLabel>
                            {corpusViews.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                  </div>
                  <img
                    src={corpusView || publicUrls.emotion_corpus_mean}
                    className="h-auto w-full object-contain border rounded-lg"
                    alt="Corpus emotions"
                  />
                </>
              )}
            </div>

            <div className="w-full">
              {publicUrls && (
                <>
                  <div className="w-full flex flex-row items-center justify-between gap-4 mb-4">
                    <h3 className="text-left text-muted-foreground">
                      Mapa de calor de emociones por clase
                    </h3>
                      <Select items={classViews} defaultValue="emotion_class_mean" onValueChange={(value) => setHeatMapClassView(publicUrls[value as keyof IMAGES] || null)}>
                        <SelectTrigger className="w-full max-w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Vistas</SelectLabel>
                            {classViews.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                  </div>
                  <img
                    src={heatMapClassView || publicUrls.emotion_class_mean}
                    className="h-auto w-full object-contain border rounded-lg"
                    alt="Class emotions"
                  />
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </AnalysisRunner>
  )
}
