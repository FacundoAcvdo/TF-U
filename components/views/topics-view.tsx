'use client'

import { Layers, FileText, Hash, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

import { AnalysisRunner } from '@/components/analysis-runner'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

import { useDataset } from '@/context/dataset-provider'

type TopicModelingDocument = {
  document_id: string
  text: string
}

type TopicModelingTopic = {
  topic_id: number
  document_count: number
  percentage: number
  keywords: string[]
  representative_documents: TopicModelingDocument[]
}

type TopicModelingResult = {
  document_count: number
  topic_count: number
  outlier_percentage: number
  topics: TopicModelingTopic[]
}

function ExpandableDocument({ 
  document, 
  index 
}: { 
  document: { document_id: string; text: string }
  index: number 
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const MAX_CHARS = 275

  const isLong = document.text.length > MAX_CHARS
  const displayedText = isExpanded || !isLong 
    ? document.text 
    : `${document.text.slice(0, MAX_CHARS)} ...`

  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <div className="mb-1 text-xs font-semibold text-muted-foreground">
        Documento {index + 1}
      </div>
      <p className="text-xs leading-relaxed break-words">
        {displayedText}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-1 text-xs font-semibold text-primary hover:underline"
        >
          {isExpanded ? 'Ver menos' : 'Ver más'}
        </button>
      )}
    </div>
  )
}

export function TopicsView() {
  const [estado, setEstado] = useState<
    'idle' | 'done' | 'running'
  >('idle')

  const [topics, setTopics] =
    useState<TopicModelingResult | null>(null)

  const [selectedTopicId, setSelectedTopicId] =
    useState<number | null>(null)

  const { datasetSeleccionado } = useDataset()

  const ejecutarTopicModeling = async () => {
    setEstado('running')

    const respuesta = await fetch('http://localhost:8080/topicmodeling/getTopics', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataset: datasetSeleccionado }),
    })

    if (!respuesta.ok) {
      console.error('Error al obtener topicos principales:', respuesta.statusText)
      setEstado('idle')
      return
    }

    setTopics(respuesta.ok ? await respuesta.json() : null)

    setEstado('done')
  }

  useEffect(() => {
    setTopics(null)
    setSelectedTopicId(null)
    setEstado('idle')
  }, [datasetSeleccionado])

  const selectedTopic = topics?.topics.find(
    (topic) => topic.topic_id === selectedTopicId
  )

  return (
    <AnalysisRunner
      icon={Layers}
      runLabel="Extraer tópicos"
      idleHint="Aplica modelado de tópicos con BERTopic sobre el corpus para descubrir los temas latentes y sus términos representativos."
      estado={estado}
      ejecutarFuncion={ejecutarTopicModeling}
    >
      {topics && (
        <div className="space-y-6">

          <div className="grid gap-4 md:grid-cols-3">

            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="size-5 text-primary" />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Documentos
                  </p>

                  <p className="text-2xl font-semibold">
                    {topics.document_count.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Hash className="size-5 text-primary" />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Tópicos
                  </p>

                  <p className="text-2xl font-semibold">
                    {topics.topic_count}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                  <AlertCircle className="size-5 text-muted-foreground" />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Outliers
                  </p>

                  <p className="text-2xl font-semibold">
                    {topics.outlier_percentage.toFixed(1)}%
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>

          <Card>
            <CardHeader>
              <CardTitle>Principales tópicos</CardTitle>

              <p className="text-sm text-muted-foreground">
                Los tópicos están ordenados según su presencia
                en el corpus. Seleccioná uno para ver más
                información.
              </p>
            </CardHeader>

            <CardContent>
              <div className="space-y-2">
                {topics.topics.map((topic) => (
                  <TopicRanking
                    key={topic.topic_id}
                    topic={topic}
                    selected={
                      topic.topic_id === selectedTopicId
                    }
                    onClick={() =>
                      setSelectedTopicId(topic.topic_id)
                    }
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Dialog
            open={selectedTopic !== undefined}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedTopicId(null)
              }
            }}
          >
            {selectedTopic && (
              <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                  <div className="flex items-start gap-4 pr-8">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <DialogTitle>Topic {selectedTopic.topic_id + 1}</DialogTitle>
                        <Badge variant="secondary">
                          {selectedTopic.percentage.toFixed(1)}%
                        </Badge>
                      </div>
                      <DialogDescription className="mt-1">
                        {selectedTopic.document_count.toLocaleString()} documentos pertenecen a este tópico.
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                  <div>
                    <h4 className="mb-2 text-sm font-medium">Términos representativos</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTopic.keywords.map((keyword) => (
                        <Badge key={keyword} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2">
                      <h4 className="text-sm font-medium">Documentos representativos</h4>
                      <p className="text-xs text-muted-foreground">
                        Algunos documentos representativos de este tópico.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {selectedTopic.representative_documents.map((document, index) => (
                        <ExpandableDocument
                          key={document.document_id}
                          document={document}
                          index={index}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            )}
          </Dialog>
        </div>
      )}
    </AnalysisRunner>
  )
}

function TopicRanking({
  topic,
  selected,
  onClick,
}: {
  topic: TopicModelingTopic
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Ver detalles del topic ${topic.topic_id + 1}`}
      className={[
        'group w-full cursor-pointer rounded-lg border p-4 text-left',
        'transition-all duration-150',
        'hover:border-primary/30 hover:bg-muted/50',
        'hover:shadow-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        selected
          ? 'border-primary/40 bg-primary/5'
          : 'border-transparent',
      ].join(' ')}
    >
      <div className="flex items-center gap-4">

        <div
          className={[
            'flex size-9 shrink-0 items-center justify-center rounded-md',
            'text-sm font-semibold transition-colors',
            selected
              ? 'bg-primary text-primary-foreground'
              : 'bg-primary/10 text-primary',
          ].join(' ')}
        >
          {topic.topic_id + 1}
        </div>

        <div className="min-w-0 flex-1">

          <div className="mb-2 flex items-center justify-between gap-3">

            <div className="truncate text-sm font-semibold">
              {topic.keywords.slice(0, 3).join(' · ')}
            </div>

            <Badge
              variant="secondary"
              className="shrink-0"
            >
              {topic.percentage.toFixed(1)}%
            </Badge>

          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${topic.percentage}%`,
              }}
            />
          </div>

          <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
            {topic.keywords.slice(0, 6).map((keyword) => (
              <span
                key={keyword}
                className="text-xs text-muted-foreground"
              >
                {keyword}
              </span>
            ))}
          </div>

        </div>

      </div>
    </button>
  )
}