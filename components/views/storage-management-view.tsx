'use client'

import React, { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface Dataset {
  dataset_id: string
  dataset_name: string
  user_id: string
  dataset_size: number
  embedding_size: number
  embedding_chunked_size: number
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const unitIndex = Math.floor(
    Math.log(bytes) / Math.log(1024)
  )

  const index = Math.min(unitIndex, units.length - 1)

  return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${units[index]}`
}

function clampPercentage(value: number): number {
  return Math.min(Math.max(value, 0), 100)
}

function ProgressBar({
  percentage,
}: {
  percentage: number
}) {
  const safePercentage = clampPercentage(percentage)

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all duration-500"
        style={{
          width: `${safePercentage}%`,
        }}
      />
    </div>
  )
}

function StorageStat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold">
        {value}
      </p>
    </div>
  )
}  

function StorageManagementView() {
    const [datasets, setDatasets] = useState<Dataset[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [eliminandoDataset, setEliminandoDataset] = useState<string | null>(null)
    const [eliminandoTodos, setEliminandoTodos] = useState(false)
    
    const totalStorage = 5 * 1024 * 1024 * 1024

    const eliminarDataset = async (datasetId: string) => {
        try {
            setEliminandoDataset(datasetId)

            const respuesta = await fetch(
                        `http://localhost:8080/dataset/deleteDataset?dataset_id=${encodeURIComponent(datasetId)}`,
                        {
                            method: 'DELETE',
                            credentials: 'include',
                        }
                    )

            if (!respuesta.ok) {
            console.error(
                'Error al eliminar dataset:',
                respuesta.status,
                respuesta.statusText
            )

            toast.error('No se pudo eliminar el dataset.')

            return
            }

            setDatasets((datasetsActuales) =>
            datasetsActuales.filter(
                (dataset) => dataset.dataset_id !== datasetId
            )
            )

            toast.success('Dataset eliminado correctamente.')
        } catch (error) {
            console.error(
            'Error al eliminar dataset:',
            error
            )

            toast.error(
            'Ocurrió un error al eliminar el dataset.'
            )
        } finally {
            setEliminandoDataset(null)
        }
    }

    const eliminarTodosLosDatasets = async () => {
        try {
            setEliminandoTodos(true)

            const respuesta = await fetch(
            'http://localhost:8080/dataset/deleteDatasetsByUser',
            {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                'Content-Type': 'application/json',
                },
            }
            )

            if (!respuesta.ok) {
            console.error(
                'Error al eliminar todos los datasets:',
                respuesta.status,
                respuesta.statusText
            )

            toast.error('No se pudieron eliminar los datasets.')
            return
            }

            setDatasets([])

            toast.success('Todos los datasets fueron eliminados correctamente.')
        } catch (error) {
            console.error(
            'Error al eliminar todos los datasets:',
            error
            )

            toast.error('Ocurrió un error al eliminar los datasets.')
        } finally {
            setEliminandoTodos(false)
    }
    }


  useEffect(() => {
    const obtenerDatasets = async () => {
      try {
        setLoading(true)
        setError(null)

        const respuesta = await fetch('http://localhost:8080/dataset/getDatasets', {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!respuesta.ok) {
          console.error(
            'Error al obtener datasets:',
            respuesta.status,
            respuesta.statusText
          )

          setError(
            'No se pudieron cargar los datasets.'
          )

          return
        }

        const data = await respuesta.json()

        setDatasets(data.datasets ?? [])
      } catch (error) {
        console.error(
          'Error al obtener datasets:',
          error
        )

        setError(
          'No se pudieron cargar los datasets.'
        )
      } finally {
        setLoading(false)
      }
    }

    obtenerDatasets()
  }, [])

  const totalDatasetSize = datasets.reduce(
    (total, dataset) =>
      total +
      dataset.dataset_size +
      dataset.embedding_size +
      dataset.embedding_chunked_size,
    0
  )

  const totalFilesSize = datasets.reduce(
    (total, dataset) =>
      total + dataset.dataset_size,
    0
  )

  const totalEmbeddingsSize = datasets.reduce(
    (total, dataset) =>
      total + dataset.embedding_size,
    0
  )

  const totalChunkedSize = datasets.reduce(
    (total, dataset) =>
      total + dataset.embedding_chunked_size,
    0
  )

  const availableStorage = Math.max(
    totalStorage - totalDatasetSize,
    0
  )

  const percentageUsed =
    totalStorage > 0
      ? clampPercentage(
          (totalDatasetSize / totalStorage) * 100
        )
      : 0

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">

            <div className="flex items-start justify-between gap-4">

              <div>
                <CardTitle>
                  Almacenamiento
                </CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  Espacio utilizado por tus datasets
                </p>
              </div>

              <Badge
                variant="secondary"
                className="text-sm"
              >
                {percentageUsed.toFixed(1)}% utilizado
              </Badge>

            </div>

            <div className="flex flex-col gap-2">

              <div className="flex items-end justify-between gap-3">

                <div>
                  <span className="text-2xl font-bold">
                    {formatBytes(totalDatasetSize)}
                  </span>

                  <span className="ml-1 text-sm text-muted-foreground">
                    / {formatBytes(totalStorage)}
                  </span>
                </div>

                <span className="text-sm text-muted-foreground">
                  {formatBytes(availableStorage)} disponibles
                </span>

              </div>

              <ProgressBar
                percentage={percentageUsed}
              />

            </div>

          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

            <StorageStat
              label="Archivos"
              value={formatBytes(totalFilesSize)}
            />

            <StorageStat
              label="Embeddings"
              value={formatBytes(totalEmbeddingsSize)}
            />

            <StorageStat
              label="Embeddings Chunks"
              value={formatBytes(totalChunkedSize)}
            />

            <StorageStat
              label="Datasets"
              value={`${datasets.length}`}
            />

          </div>

        </CardContent>

        <CardFooter className="flex justify-end">
            <Button
                variant="destructive"
                size="lg"
                disabled={eliminandoTodos || datasets.length === 0}
                onClick={eliminarTodosLosDatasets}
                >
                {eliminandoTodos ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Eliminando...
                    </>
                ) : (
                    'Eliminar todos'
                )}
            </Button>
        </CardFooter>
      </Card>


      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              Datasets almacenados
            </CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Haz click en un dataset para ver su desglose.
            </p>
          </div>
        </CardHeader>

        <CardContent>

          {loading && (
            <div className="flex flex-col gap-2 py-6 text-center">

              <p className="text-sm text-muted-foreground">
                Cargando datasets...
              </p>

            </div>
          )}

          {!loading && error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">

              <p className="text-sm text-destructive">
                {error}
              </p>

            </div>
          )}

          {!loading &&
            !error &&
            datasets.length === 0 && (
              <div className="rounded-lg border border-dashed p-8 text-center">

                <p className="text-sm font-medium">
                  No tienes datasets almacenados
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Cuando subas un dataset aparecerá aquí.
                </p>

              </div>
            )}

          {!loading &&
            !error &&
            datasets.length > 0 && (
              <Accordion
                className="w-full"
              >

                {[...datasets]
                    .sort((a, b) => {
                        const totalA =
                        a.dataset_size +
                        a.embedding_size +
                        a.embedding_chunked_size

                        const totalB =
                        b.dataset_size +
                        b.embedding_size +
                        b.embedding_chunked_size

                        return totalB - totalA
                    })
                    .map((dataset) => {

                  const datasetTotalSize =
                    dataset.dataset_size +
                    dataset.embedding_size +
                    dataset.embedding_chunked_size

                  const storagePercentage =
                    totalStorage > 0
                      ? clampPercentage(
                          (datasetTotalSize / totalStorage) *
                            100
                        )
                      : 0

                  const filePercentage =
                    datasetTotalSize > 0
                      ? (dataset.dataset_size /
                          datasetTotalSize) *
                        100
                      : 0

                  const embeddingPercentage =
                    datasetTotalSize > 0
                      ? (dataset.embedding_size /
                          datasetTotalSize) *
                        100
                      : 0

                  const chunkedPercentage =
                    datasetTotalSize > 0
                      ? (dataset.embedding_chunked_size /
                          datasetTotalSize) *
                        100
                      : 0

                  return (
                    <AccordionItem
                      key={dataset.dataset_id}
                      value={dataset.dataset_id}
                      className="mb-3 p-6 rounded-lg border bg-card shadow-sm last:mb-0"
                    >

                      <AccordionTrigger className="py-4 hover:no-underline">

                        <div className="flex w-full flex-col gap-2 pr-4">

                          <div className="flex items-center justify-between gap-4">

                            <span className="truncate text-left font-medium">
                              {dataset.dataset_name}
                            </span>

                            <div className="flex shrink-0 items-center gap-2">

                              <span className="text-sm text-muted-foreground">
                                {formatBytes(datasetTotalSize)}
                              </span>

                              <Badge
                                variant="secondary"
                                className="hidden sm:inline-flex"
                              >
                                {storagePercentage.toFixed(1)}%
                              </Badge>

                            </div>

                          </div>

                          <ProgressBar
                            percentage={
                              storagePercentage
                            }
                          />

                        </div>

                      </AccordionTrigger>

                      <AccordionContent>

                        <div className="flex flex-col gap-5">

                          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-4">

                            <div>

                              <p className="text-xs text-muted-foreground">
                                Tamaño total
                              </p>

                              <p className="text-lg font-semibold">
                                {formatBytes(
                                  datasetTotalSize
                                )}
                              </p>

                            </div>

                            <div>

                              <p className="text-xs text-muted-foreground">
                                Del almacenamiento
                              </p>

                              <p className="text-lg font-semibold">
                                {storagePercentage.toFixed(2)}%
                              </p>

                            </div>

                          </div>

                          <div className="flex flex-col gap-2">

                            <div className="flex items-center justify-between gap-3">

                              <div>
                                <p className="text-sm font-medium">
                                  Archivo
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  {formatBytes(
                                    dataset.dataset_size
                                  )}
                                </p>
                              </div>

                              <Badge variant="secondary">
                                {filePercentage.toFixed(2)}%
                              </Badge>

                            </div>

                            <ProgressBar
                              percentage={
                                filePercentage
                              }
                            />

                          </div>

                          <div className="flex flex-col gap-2">

                            <div className="flex items-center justify-between gap-3">

                              <div>
                                <p className="text-sm font-medium">
                                  Embeddings
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  {formatBytes(
                                    dataset.embedding_size
                                  )}
                                </p>
                              </div>

                              <Badge variant="secondary">
                                {embeddingPercentage.toFixed(2)}%
                              </Badge>

                            </div>

                            <ProgressBar
                              percentage={
                                embeddingPercentage
                              }
                            />

                          </div>

                          <div className="flex flex-col gap-2">

                            <div className="flex items-center justify-between gap-3">

                              <div>
                                <p className="text-sm font-medium">
                                  Embeddings Chunks
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  {formatBytes(
                                    dataset.embedding_chunked_size
                                  )}
                                </p>
                              </div>

                              <Badge variant="secondary">
                                {chunkedPercentage.toFixed(2)}%
                              </Badge>

                            </div>

                            <ProgressBar
                              percentage={
                                chunkedPercentage
                              }
                            />

                          </div>

                          <div className="flex justify-end pt-4">

                            <Button
                                variant="destructive"
                                size="sm"
                                disabled={eliminandoDataset === dataset.dataset_id}
                                onClick={() => eliminarDataset(dataset.dataset_id)}
                                >
                                {eliminandoDataset === dataset.dataset_id ? (
                                    <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Eliminando...
                                    </>
                                ) : (
                                    'Eliminar dataset'
                                )}
                            </Button>

                          </div>

                        </div>

                      </AccordionContent>

                    </AccordionItem>
                  )
                })}

              </Accordion>
            )}

        </CardContent>
      </Card>

    </div>
  )
}

export default StorageManagementView

