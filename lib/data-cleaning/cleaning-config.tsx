'use client'

import React from 'react'
import {
  Check,
  ChevronDown,
  FileText,
  LoaderCircle,
  Sparkles,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
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
import { Separator } from '@/components/ui/separator'

import type {
  CleaningConfig as CleaningConfigType,
  CleaningOperation,
  CleaningPreset,
  EmojiStrategy,
  HashtagStrategy,
} from './cleaning-types'

interface OperationDefinition {
  id: CleaningOperation
  label: string
  description: string
  recommended?: boolean
}

const operations: OperationDefinition[] = [
  {
    id: 'lowercase',
    label: 'Convertir a minúsculas',
    description: 'Convierte todo el texto a minúsculas.',
    recommended: true,
  },
  {
    id: 'removeUrls',
    label: 'Quitar URLs',
    description: 'Elimina enlaces y direcciones web.',
    recommended: true,
  },
  {
    id: 'removeMentions',
    label: 'Quitar menciones',
    description: 'Elimina menciones como @usuario.',
    recommended: true,
  },
  {
    id: 'removeHtml',
    label: 'Quitar HTML',
    description: 'Elimina etiquetas HTML presentes en el texto.',
    recommended: true,
  },
  {
    id: 'normalizeWhitespace',
    label: 'Normalizar espacios',
    description: 'Reduce espacios, saltos de línea y separadores innecesarios.',
    recommended: true,
  },
  {
    id: 'removeDuplicates',
    label: 'Quitar duplicados',
    description: 'Elimina documentos exactamente duplicados.',
    recommended: true,
  },
  {
    id: 'handleHashtags',
    label: 'Procesar hashtags',
    description: 'Permite conservar, normalizar o segmentar hashtags.',
  },
  {
    id: 'handleEmojis',
    label: 'Procesar emojis',
    description: 'Permite conservar, eliminar o convertir emojis a texto.',
  },
  {
    id: 'removePunctuation',
    label: 'Quitar puntuación',
    description: 'Elimina signos de puntuación.',
  },
  {
    id: 'removeStopwords',
    label: 'Quitar stopwords',
    description: 'Elimina palabras funcionales según el idioma.',
  },
  {
    id: 'lemmatization',
    label: 'Lematización',
    description: 'Reduce las palabras a su lema.',
  },
  {
    id: 'anonymization',
    label: 'Anonimización',
    description: 'Detecta y reemplaza información personal identificable.',
  },
]

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

  recommended: {
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
  },

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

interface CleaningConfigProps {
  config: CleaningConfigType
  preset: CleaningPreset
  processing: boolean
  onPresetChange: (preset: CleaningPreset) => void
  onToggleOperation: (operation: CleaningOperation) => void
  onEmojiStrategyChange: (strategy: EmojiStrategy) => void
  onHashtagStrategyChange: (strategy: HashtagStrategy) => void
  onProcess: () => void
}

export function CleaningConfig({
  config,
  preset,
  processing,
  onPresetChange,
  onToggleOperation,
  onEmojiStrategyChange,
  onHashtagStrategyChange,
  onProcess,
}: CleaningConfigProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Configuración de limpieza</CardTitle>
            <CardDescription>
              Selecciona las operaciones que deseas aplicar al dataset.
            </CardDescription>
          </div>

          <Badge variant="secondary" className="hidden sm:flex">
            {config.operations.length} operaciones
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Presets */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Preset de limpieza
          </label>

          <Select
            value={preset}
            onValueChange={(value) =>
              onPresetChange(value as CleaningPreset)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona un preset" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="conservative">
                Limpieza conservadora
              </SelectItem>

              <SelectItem value="recommended">
                Limpieza recomendada
              </SelectItem>

              <SelectItem value="linguistic">
                Limpieza lingüística
              </SelectItem>

              <SelectItem value="custom">
                Personalizada
              </SelectItem>
            </SelectContent>
          </Select>

          {preset !== 'custom' && (
            <div className="flex items-start gap-2 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />

              <span>
                Esta configuración es una recomendación. Puedes cambiar
                individualmente las operaciones antes de procesar el dataset.
              </span>
            </div>
          )}
        </div>

        <Separator />

        {/* Operations */}
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium">
              Operaciones
            </h3>

            <p className="text-xs text-muted-foreground">
              Las operaciones marcadas se ejecutarán en el backend.
            </p>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            {operations.map((operation) => {
              const active = config.operations.includes(operation.id)

              return (
                <button
                  key={operation.id}
                  type="button"
                  onClick={() => onToggleOperation(operation.id)}
                  className={[
                    'group flex items-start gap-3 rounded-lg border p-3 text-left transition-colors',
                    active
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border',
                      active
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input bg-background',
                    ].join(' ')}
                  >
                    {active && <Check className="size-3" />}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      {operation.label}

                      {operation.recommended && (
                        <Badge
                          variant="outline"
                          className="text-[10px]"
                        >
                          Recomendada
                        </Badge>
                      )}
                    </span>

                    <span className="mt-1 block text-xs text-muted-foreground">
                      {operation.description}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Emoji configuration */}
        {config.operations.includes('handleEmojis') && (
          <>
            <Separator />

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tratamiento de emojis
              </label>

              <Select
                value={config.emojiStrategy}
                onValueChange={(value) =>
                  onEmojiStrategyChange(value as EmojiStrategy)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="keep">
                    Mantener emojis
                  </SelectItem>

                  <SelectItem value="remove">
                    Eliminar emojis
                  </SelectItem>

                  <SelectItem value="convert">
                    Convertir a texto
                  </SelectItem>
                </SelectContent>
              </Select>

              <p className="text-xs text-muted-foreground">
                Convertir emojis permite conservar parte de su información
                semántica en análisis posteriores.
              </p>
            </div>
          </>
        )}

        {/* Hashtag configuration */}
        {config.operations.includes('handleHashtags') && (
          <>
            <Separator />

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tratamiento de hashtags
              </label>

              <Select
                value={config.hashtagStrategy}
                onValueChange={(value) =>
                  onHashtagStrategyChange(value as HashtagStrategy)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="keep">
                    Mantener hashtag
                  </SelectItem>

                  <SelectItem value="removeSymbol">
                    Quitar # y conservar texto
                  </SelectItem>

                  <SelectItem value="segment">
                    Segmentar palabras
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <Separator />

        <Button
          onClick={onProcess}
          disabled={processing || config.operations.length === 0}
          className="h-10 w-full"
        >
          {processing ? (
            <>
              <LoaderCircle className="animate-spin" />
              Procesando dataset...
            </>
          ) : (
            <>
              <FileText />
              Procesar dataset
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}