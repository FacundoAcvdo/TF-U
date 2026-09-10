'use client'

import React from 'react'
import { Database } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { CleaningConfig } from '../../lib/data-cleaning/cleaning-config'
import { CleaningResults } from '../../lib/data-cleaning/cleaning-results'

import type {
  CleaningConfig as CleaningConfigType,
  CleaningOperation,
  CleaningPreset,
  CleaningResult,
  DatasetInfo,
} from '../../lib/data-cleaning/cleaning-types'

const recommendedConfig: CleaningConfigType = {
  operations: [
    'lowercase',
    'removeUrls',
    'removeMentions',
    'removeHtml',
    'normalizeWhitespace',
    'removeDuplicates',
    'handleHashtags',
    'handleEmojis',
  ],
  emojiStrategy: 'convert',
  hashtagStrategy: 'removeSymbol',
}

/**
 * ---------------------------------------------------------------------------
 * MOCK DEL BACKEND
 * ---------------------------------------------------------------------------
 *
 * Más adelante esto simplemente se reemplaza por:
 *
 * const response = await fetch('/api/datasets/clean', {...})
 *
 * El resto del componente no debería necesitar cambios.
 */
async function mockCleaningFetch(
  dataset: DatasetInfo,
  config: CleaningConfigType
): Promise<CleaningResult> {
  // Simulamos latencia de red + procesamiento del backend.
  await new Promise((resolve) => {
    window.setTimeout(resolve, 1800)
  })

  const hasOperation = (operation: CleaningOperation) =>
    config.operations.includes(operation)

  const originalRows = dataset.rows

  const removedDuplicates = hasOperation('removeDuplicates')
    ? 325
    : 0

  const cleanedRows = originalRows - removedDuplicates

  const originalTokens = 387219

  let cleanedTokens = originalTokens

  if (hasOperation('removeStopwords')) {
    cleanedTokens -= 84231
  }

  if (hasOperation('removePunctuation')) {
    cleanedTokens -= 14732
  }

  if (hasOperation('removeUrls')) {
    cleanedTokens -= 2341
  }

  if (hasOperation('removeMentions')) {
    cleanedTokens -= 1827
  }

  if (hasOperation('lemmatization')) {
    cleanedTokens -= 4217
  }

  cleanedTokens = Math.max(cleanedTokens, 0)

  const originalUniqueTerms = 18421

  let cleanedUniqueTerms = originalUniqueTerms

  if (hasOperation('lemmatization')) {
    cleanedUniqueTerms -= 2134
  }

  if (hasOperation('removeStopwords')) {
    cleanedUniqueTerms -= 812
  }

  if (hasOperation('lowercase')) {
    cleanedUniqueTerms -= 547
  }

  return {
    id: `cleaning-${Date.now()}`,

    datasetName: `${dataset.name} — Cleaned`,

    format: dataset.format,

    size: '1.82 MB',

    createdAt: new Date().toISOString(),

    stats: {
      originalRows,

      cleanedRows,

      originalTokens,

      cleanedTokens,

      originalUniqueTerms,

      cleanedUniqueTerms,

      removedDuplicates,

      removedUrls: hasOperation('removeUrls')
        ? 1204
        : 0,

      removedMentions: hasOperation('removeMentions')
        ? 891
        : 0,

      removedHtml: hasOperation('removeHtml')
        ? 145
        : 0,

      normalizedWhitespace: hasOperation(
        'normalizeWhitespace'
      )
        ? 4821
        : 0,

      emojisProcessed: hasOperation('handleEmojis')
        ? 2391
        : 0,

      hashtagsProcessed: hasOperation('handleHashtags')
        ? 874
        : 0,

      nullValuesHandled: 37,

      punctuationRemoved: hasOperation(
        'removePunctuation'
      )
        ? 14732
        : 0,

      stopwordsRemoved: hasOperation(
        'removeStopwords'
      )
        ? 84231
        : 0,

      lemmasProcessed: hasOperation(
        'lemmatization'
      )
        ? 156204
        : 0,

      entitiesAnonymized: hasOperation(
        'anonymization'
      )
        ? 64
        : 0,
    },

    previews: [
      {
        original:
          "I can't do this anymore 😭😭 @someone https://example.com",

        cleaned:
          hasOperation('handleEmojis') &&
          config.emojiStrategy === 'convert'
            ? "i can't do this anymore crying_face crying_face"
            : "i can't do this anymore 😭😭",
      },

      {
        original:
          'I feel like nobody would notice if I disappeared...',

        cleaned:
          hasOperation('removePunctuation')
            ? 'i feel like nobody would notice if i disappeared'
            : 'i feel like nobody would notice if i disappeared...',
      },

      {
        original:
          '#IWantToDisappear and I dont know what to do 😔',

        cleaned:
          hasOperation('handleHashtags')
            ? config.hashtagStrategy === 'segment'
              ? 'i want to disappear and i dont know what to do sad_face'
              : 'iwanttodisappear and i dont know what to do sad_face'
            : '#iwanttodisappear and i dont know what to do 😔',
      },

      {
        original:
          '<p>I am tired of everything.</p>  I just want some peace.',

        cleaned:
          'i am tired of everything. i just want some peace.',
      },
    ],

    config,

    downloadUrl: '#mock-download',
  }
}

interface CleaningViewProps {
  dataset?: DatasetInfo
}

export default function CleaningView({
  dataset = {
    id: 'dataset-demo',
    name: 'Suicide Posts',
    format: 'CSV',
    rows: 10452,
    size: '2.4 MB',
    language: 'English',
  },
}: CleaningViewProps) {
  const [config, setConfig] =
    React.useState<CleaningConfigType>(
      recommendedConfig
    )

  const [preset, setPreset] =
    React.useState<CleaningPreset>('recommended')

  const [processing, setProcessing] =
    React.useState(false)

  const [result, setResult] =
    React.useState<CleaningResult | null>(null)

  const [error, setError] =
    React.useState<string | null>(null)

  function toggleOperation(
    operation: CleaningOperation
  ) {
    setPreset('custom')

    setConfig((current) => {
      const exists =
        current.operations.includes(operation)

      return {
        ...current,

        operations: exists
          ? current.operations.filter(
              (item) => item !== operation
            )
          : [...current.operations, operation],
      }
    })

    setResult(null)
    setError(null)
  }

  function changePreset(
    nextPreset: CleaningPreset
  ) {
    setPreset(nextPreset)

    if (nextPreset === 'custom') {
      return
    }

    const presets: Record<
      Exclude<CleaningPreset, 'custom'>,
      CleaningConfigType
    > = {
      conservative: {
        operations: [
          'removeUrls',
          'removeMentions',
          'removeHtml',
          'normalizeWhitespace',
          'removeDuplicates',
        ],

        emojiStrategy: 'keep',

        hashtagStrategy: 'keep',
      },

      recommended: recommendedConfig,

      linguistic: {
        operations: [
          'lowercase',
          'removeUrls',
          'removeMentions',
          'removeHtml',
          'normalizeWhitespace',
          'removeDuplicates',
          'handleHashtags',
          'handleEmojis',
          'removePunctuation',
          'removeStopwords',
          'lemmatization',
          'anonymization',
        ],

        emojiStrategy: 'convert',

        hashtagStrategy: 'segment',
      },
    }

    setConfig(presets[nextPreset])

    setResult(null)
    setError(null)
  }

  async function processDataset() {
    if (!config.operations.length) {
      return
    }

    setProcessing(true)
    setResult(null)
    setError(null)

    try {
      /*
       * ---------------------------------------------------------------------
       * MOCK
       * ---------------------------------------------------------------------
       *
       * Esto simula:
       *
       * POST /api/datasets/clean
       *
       * Cuando tengas backend, reemplazás solamente esta llamada.
       */

      const data = await mockCleaningFetch(
        dataset,
        config
      )

      setResult(data)
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al procesar el dataset.'
      )
    } finally {
      setProcessing(false)
    }
  }

  function createDataset() {
    if (!result) return

    console.log(
      '[MOCK] Crear nuevo dataset',
      {
        parentDatasetId: dataset.id,
        resultId: result.id,
        config,
      }
    )

    alert(
      'Mock: el dataset limpio se agregaría como un nuevo dataset.'
    )
  }

  function replaceDataset() {
    if (!result) return

    console.log(
      '[MOCK] Reemplazar dataset',
      {
        datasetId: dataset.id,
        resultId: result.id,
      }
    )

    alert(
      'Mock: el dataset original sería reemplazado.'
    )
  }

  function downloadDataset() {
    console.log(
      '[MOCK] Descargar dataset',
      result
    )

    alert(
      'Mock: comenzaría la descarga del dataset limpio.'
    )
  }

  function reset() {
    setResult(null)
    setError(null)
  }

  return (
    <div className="space-y-4">
      {/* ------------------------------------------------------------------ */}
      {/* DATASET                                                             */}
      {/* ------------------------------------------------------------------ */}

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Database className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>
                  Limpiar dataset
                </CardTitle>

                <Badge variant="secondary">
                  {dataset.format}
                </Badge>
              </div>

              <CardDescription className="mt-1">
                Configura las operaciones de limpieza
                para{' '}
                <strong>{dataset.name}</strong>.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <DatasetStat
              label="Registros"
              value={dataset.rows.toLocaleString('es')}
            />

            <DatasetStat
              label="Tamaño"
              value={dataset.size}
            />

            <DatasetStat
              label="Idioma"
              value={
                dataset.language ??
                'No especificado'
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* ERROR                                                               */}
      {/* ------------------------------------------------------------------ */}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* CONFIGURATION                                                       */}
      {/* ------------------------------------------------------------------ */}

      {!result && (
        <CleaningConfig
          config={config}
          preset={preset}
          processing={processing}
          onPresetChange={changePreset}
          onToggleOperation={toggleOperation}
          onEmojiStrategyChange={(strategy) => {
            setPreset('custom')

            setConfig((current) => ({
              ...current,
              emojiStrategy: strategy,
            }))

            setResult(null)
          }}
          onHashtagStrategyChange={(strategy) => {
            setPreset('custom')

            setConfig((current) => ({
              ...current,
              hashtagStrategy: strategy,
            }))

            setResult(null)
          }}
          onProcess={processDataset}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* RESULTS                                                             */}
      {/* ------------------------------------------------------------------ */}

      {result && (
        <CleaningResults
          result={result}
          config={config}
          onCreateDataset={createDataset}
          onReplaceDataset={replaceDataset}
          onDownload={downloadDataset}
          onReset={reset}
        />
      )}
    </div>
  )
}

function DatasetStat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-medium">
        {value}
      </p>
    </div>
  )
}