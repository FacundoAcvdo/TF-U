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
import {
  mockTopicModeling,
  type TopicModelingResult,
  type TopicModelingTopic,
} from '@/lib/mock-data'

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

    // Mock temporal.
    await new Promise((resolve) =>
      setTimeout(resolve, 800)
    )

    setTopics(mockTopicModeling)

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

          {/* =========================
              SUMMARY
          ========================== */}

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

          {/* =========================
              TOPIC RANKING
          ========================== */}

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

          {/* =========================
              TOPIC DIALOG
          ========================== */}

          <Dialog
            open={selectedTopic !== undefined}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedTopicId(null)
              }
            }}
          >
            {selectedTopic && (
              <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">

                <DialogHeader>
                  <div className="flex items-start gap-4 pr-8">
                    <div className="min-w-0 flex-1">

                      <div className="flex items-center gap-3">
                        <DialogTitle>
                          Topic {selectedTopic.topic_id + 1}
                        </DialogTitle>

                        <Badge variant="secondary">
                          {selectedTopic.percentage.toFixed(1)}%
                        </Badge>
                      </div>

                      <DialogDescription className="mt-1">
                        {selectedTopic.document_count.toLocaleString()}{' '}
                        documentos pertenecen a este tópico.
                      </DialogDescription>

                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6 pt-2">

                  {/* Términos */}

                  <div>
                    <h4 className="mb-3 text-sm font-medium">
                      Términos representativos
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      {selectedTopic.keywords.map((keyword) => (
                        <Badge
                          key={keyword}
                          variant="outline"
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Documentos */}

                  <div>
                    <div className="mb-3">
                      <h4 className="text-sm font-medium">
                        Documentos representativos
                      </h4>

                      <p className="text-xs text-muted-foreground">
                        Algunos documentos representativos de este tópico.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {selectedTopic.representative_documents.map(
                        (document) => (
                          <div
                            key={document.document_id}
                            className="rounded-lg border bg-muted/20 p-4"
                          >
                            <div className="mb-2 text-xs font-medium text-muted-foreground">
                              {document.document_id}
                            </div>

                            <p className="text-sm leading-relaxed">
                              {document.text}
                            </p>
                          </div>
                        )
                      )}
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

/* =====================================================
   TOPIC RANKING
===================================================== */

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

        {/* Rank */}

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

        {/* Topic info */}

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

          {/* Progress */}

          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${topic.percentage}%`,
              }}
            />
          </div>

          {/* Keywords */}

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