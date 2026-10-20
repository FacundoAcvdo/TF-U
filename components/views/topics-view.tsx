'use client'

import { Layers, FileText, Hash, AlertCircle, Settings2 } from 'lucide-react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

import { useDataset } from '@/context/dataset-provider'
import { useJobs } from '@/context/jobs-context'
import { apiFetch } from '@/lib/api-fetch'

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
  title?: string
  title_source?: 'llm' | 'keywords' | 'disabled'
}

type TopicReduction = {
  requested: number
  achieved: number
}

function getTopicTitle(topic: TopicModelingTopic) {
  if (topic.title && topic.title.trim().length > 0) {
    return topic.title
  }
  return topic.keywords.slice(0, 3).join(' · ')
}

type TopicModelingResult = {
  document_count: number
  topic_count: number
  outlier_percentage: number
  reduction?: TopicReduction | null
  topics: TopicModelingTopic[]
}

const MAX_TOPICS_OPTIONS = [5, 10, 15, 20, 25, 30, 35, 40]

function ExpandableDocument({
  document,
  index,
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
  const [estado, setEstado] = useState
    <'idle' | 'done' | 'running'
  >('idle')

  const [topics, setTopics] =
    useState<TopicModelingResult | null>(null)

  const [selectedTopicId, setSelectedTopicId] =
    useState<number | null>(null)

  const [maxTopics, setMaxTopics] = useState<number>(20)

  const { datasetSeleccionado } = useDataset()
  const { tasks, startTask, adoptTask, consumeTask } = useJobs()
  const taskKey = datasetSeleccionado ? `topics:${datasetSeleccionado}:${maxTopics}` : null
  const task = taskKey ? tasks[taskKey] : undefined

  const ejecutarTopicModeling = () => {
    if (!datasetSeleccionado || !taskKey) return
    setEstado('running')

    startTask({
      key: taskKey,
      service: 'topicmodeling',
      operation: 'getTopics',
      jobType: 'topics',
      dataset: datasetSeleccionado,
      body: {
        dataset: datasetSeleccionado,
        max_topics: maxTopics,
      },
      successMessage: 'Tópicos generados correctamente.',
    }).catch(() => setEstado('idle'))
  }

  useEffect(() => {
    if (!datasetSeleccionado || !taskKey) return
    adoptTask({
      key: taskKey,
      service: 'topicmodeling',
      jobType: 'topics',
      dataset: datasetSeleccionado,
      successMessage: 'Tópicos generados correctamente.',
    })
  }, [datasetSeleccionado, maxTopics])

  useEffect(() => {
    if (!task || task.consumed) return
    if (task.status === 'running') {
      setEstado('running')
    } else if (task.status === 'succeeded') {
      // El job puede haberse iniciado con otro max_topics: solo se aplica
      // si coincide, si no se libera igual (el aviso de éxito ya salió).
      const jobMax = Number((task.params as { max_topics?: unknown } | null | undefined)?.max_topics)
      if (!task.params || !Number.isFinite(jobMax) || jobMax === maxTopics) {
        setTopics(task.result as TopicModelingResult)
        setEstado('done')
      } else {
        setEstado('idle')
      }
      consumeTask(task.key)
    } else {
      setEstado('idle')
      consumeTask(task.key)
    }
  }, [task])

  useEffect(() => {
    if (!datasetSeleccionado) {
      setTopics(null)
      setSelectedTopicId(null)
      setEstado('idle')
      return
    }
    const fetchResults = async () => {
      try {
        setEstado('running')
        setSelectedTopicId(null)
        const json = await apiFetch<TopicModelingResult>('/topicmodeling/getTopicResults', {
          method: 'POST',
          body: JSON.stringify({
            dataset: datasetSeleccionado,
            max_topics: maxTopics,
          }),
        }, { silent: true, ignoreNotFound: true })
        if (!json?.topics) {
          setTopics(null)
          setEstado('idle')
          return
        }
        setTopics(json)
        setEstado('done')
      } catch {
        setTopics(null)
        setEstado('idle')
      }
    }
    fetchResults()
  }, [datasetSeleccionado, maxTopics])

  const selectedTopic = topics?.topics.find(
    (topic) => topic.topic_id === selectedTopicId
  )

  const reductionNotice = topics
    ? topics.reduction && topics.reduction.achieved > topics.reduction.requested
      ? topics.reduction
      : topics.topics.length > maxTopics
        ? { requested: maxTopics, achieved: topics.topics.length }
        : null
    : null

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <Settings2 className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Cantidad máxima de tópicos
              </p>
              <p className="text-xs text-muted-foreground">
                Definí un tope para el modelado de tópicos.
              </p>
            </div>
          </div>

          <Select
            value={String(maxTopics)}
            onValueChange={(value) => setMaxTopics(Number(value))}
            disabled={estado === 'running'}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Máximo" />
            </SelectTrigger>
            <SelectContent>
              {MAX_TOPICS_OPTIONS.map((value) => (
                <SelectItem key={value} value={String(value)}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <AnalysisRunner
        icon={Layers}
        runLabel="Extraer tópicos"
        idleHint="Detecta automáticamente los temas principales presentes en los textos, agrupando los mensajes por asunto y mostrando las palabras más representativas de cada tema. Sirve para descubrir de qué se habla en un corpus grande sin necesidad de leerlo completo."
        estado={estado}
        ejecutarFuncion={ejecutarTopicModeling}
      >
        {topics && (
          <div className="space-y-6">

            {reductionNotice && (
              <Card className="border-amber-500/40 bg-amber-500/5">
                <CardContent className="flex items-center gap-3 p-4">
                  <AlertCircle className="size-5 shrink-0 text-amber-600" />
                  <p className="text-sm">
                    No se pudo reducir a los {reductionNotice.requested} tópicos pedidos.
                    Se muestran {reductionNotice.achieved} tópicos.
                  </p>
                </CardContent>
              </Card>
            )}

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
                      Atípicos
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
                          <DialogTitle>{selectedTopic.title ?? `Tópico ${selectedTopic.topic_id + 1}`}</DialogTitle>
                          <Badge variant="secondary">
                            {selectedTopic.percentage.toFixed(1)}%
                          </Badge>
                          {selectedTopic.title_source === 'llm' && (
                            <Badge variant="outline" className="text-xs">
                              IA
                            </Badge>
                          )}
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
                        {selectedTopic.keywords.map((keyword, indice) => (
                          <Badge key={indice} variant="outline" className="text-xs">
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
    </div>
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
      aria-label={`Ver detalles del tópico ${topic.topic_id + 1}`}
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
              {getTopicTitle(topic)}
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
            {topic.keywords.slice(0, 6).map((keyword, index) => (
              <span
                key={index}
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