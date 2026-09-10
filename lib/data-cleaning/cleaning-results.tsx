'use client'

import React from 'react'
import {
  Check,
  Download,
  FileText,
  RefreshCcw,
  Save,
  Database,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import type {
  CleaningConfig,
  CleaningResult,
} from './cleaning-types'

interface CleaningResultsProps {
  result: CleaningResult
  config: CleaningConfig
  onCreateDataset: () => void
  onReplaceDataset: () => void
  onDownload: () => void
  onReset: () => void
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('es-ES').format(value)
}

function percentage(original: number, current: number) {
  if (!original) return 0

  return Math.round(((original - current) / original) * 100)
}

export function CleaningResults({
  result,
  config,
  onCreateDataset,
  onReplaceDataset,
  onDownload,
  onReset,
}: CleaningResultsProps) {
  const [replaceDialogOpen, setReplaceDialogOpen] =
    React.useState(false)

  const rowsRemoved = result.stats.originalRows - result.stats.cleanedRows

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="secondary">
                  <Check className="mr-1 size-3" />
                  Procesado
                </Badge>
              </div>

              <CardTitle>Resultado de la limpieza</CardTitle>

              <CardDescription>
                {result.datasetName} · {result.format} ·{' '}
                {result.size}
              </CardDescription>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
            >
              <RefreshCcw />
              Nueva limpieza
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Documentos</CardDescription>
            <CardTitle className="text-2xl">
              {formatNumber(result.stats.cleanedRows)}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-xs text-muted-foreground">
              Antes:{' '}
              {formatNumber(result.stats.originalRows)}
              {rowsRemoved > 0 && (
                <>
                  {' · '}
                  {formatNumber(rowsRemoved)} eliminados
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tokens</CardDescription>
            <CardTitle className="text-2xl">
              {formatNumber(result.stats.cleanedTokens)}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-xs text-muted-foreground">
              Reducción:{' '}
              {percentage(
                result.stats.originalTokens,
                result.stats.cleanedTokens
              )}
              %
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Términos únicos</CardDescription>
            <CardTitle className="text-2xl">
              {formatNumber(
                result.stats.cleanedUniqueTerms
              )}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-xs text-muted-foreground">
              Antes:{' '}
              {formatNumber(
                result.stats.originalUniqueTerms
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Duplicados</CardDescription>
            <CardTitle className="text-2xl">
              {formatNumber(result.stats.removedDuplicates)}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-xs text-muted-foreground">
              Documentos eliminados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cleaning impact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Impacto de la limpieza
          </CardTitle>

          <CardDescription>
            Elementos modificados o eliminados durante el procesamiento.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Duplicados eliminados"
              value={result.stats.removedDuplicates}
            />

            <Stat
              label="URLs eliminadas"
              value={result.stats.removedUrls}
            />

            <Stat
              label="Menciones eliminadas"
              value={result.stats.removedMentions}
            />

            <Stat
              label="HTML eliminado"
              value={result.stats.removedHtml}
            />

            <Stat
              label="Emojis procesados"
              value={result.stats.emojisProcessed}
            />

            <Stat
              label="Hashtags procesados"
              value={result.stats.hashtagsProcessed}
            />

            <Stat
              label="Stopwords eliminadas"
              value={result.stats.stopwordsRemoved}
            />

            <Stat
              label="Entidades anonimizadas"
              value={result.stats.entitiesAnonymized}
            />

            <Stat
              label="Puntuación eliminada"
              value={result.stats.punctuationRemoved}
            />

            <Stat
              label="Lemas procesados"
              value={result.stats.lemmasProcessed}
            />

            <Stat
              label="Espacios normalizados"
              value={result.stats.normalizedWhitespace}
            />

            <Stat
              label="Valores nulos tratados"
              value={result.stats.nullValuesHandled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Vista previa
          </CardTitle>

          <CardDescription>
            Algunos ejemplos del texto antes y después de aplicar
            la configuración seleccionada.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {result.previews.map((preview, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-lg border"
            >
              <div className="grid lg:grid-cols-2">
                <div className="border-b p-4 lg:border-b-0 lg:border-r">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Original
                    </span>

                    <Badge
                      variant="outline"
                      className="text-[10px]"
                    >
                      Antes
                    </Badge>
                  </div>

                  <p className="text-sm leading-relaxed">
                    {preview.original}
                  </p>
                </div>

                <div className="bg-primary/[0.03] p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Limpio
                    </span>

                    <Badge
                      variant="secondary"
                      className="text-[10px]"
                    >
                      Después
                    </Badge>
                  </div>

                  <p className="text-sm leading-relaxed">
                    {preview.cleaned}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Configuración utilizada
          </CardTitle>

          <CardDescription>
            Operaciones utilizadas para generar esta versión del dataset.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-2">
            {config.operations.map((operation) => (
              <Badge key={operation} variant="outline">
                {operation}
              </Badge>
            ))}
          </div>

          {config.operations.includes('handleEmojis') && (
            <p className="mt-3 text-xs text-muted-foreground">
              Emojis:{' '}
              <strong>{config.emojiStrategy}</strong>
            </p>
          )}

          {config.operations.includes('handleHashtags') && (
            <p className="text-xs text-muted-foreground">
              Hashtags:{' '}
              <strong>{config.hashtagStrategy}</strong>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Final actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            ¿Qué quieres hacer con el dataset?
          </CardTitle>

          <CardDescription>
            Puedes conservar el original, reemplazarlo o descargar únicamente
            el resultado.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-3 md:grid-cols-3">
          <ActionButton
            icon={<Database />}
            title="Crear nuevo dataset"
            description="Conserva el original y agrega esta versión."
            onClick={onCreateDataset}
          />

          <ActionButton
            icon={<Save />}
            title="Reemplazar original"
            description="Usa esta versión como dataset principal."
            onClick={() => setReplaceDialogOpen(true)}
          />

          <ActionButton
            icon={<Download />}
            title="Descargar solamente"
            description="Descarga el resultado sin guardarlo."
            onClick={onDownload}
          />
        </CardContent>

        <CardFooter className="border-t pt-4">
          <p className="text-xs text-muted-foreground">
            Recomendación: conservar el dataset original permite volver a
            procesarlo con otra configuración posteriormente.
          </p>
        </CardFooter>
      </Card>

      {/* Replace confirmation */}
      <Dialog
        open={replaceDialogOpen}
        onOpenChange={setReplaceDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              ¿Reemplazar dataset original?
            </DialogTitle>

            <DialogDescription>
              El dataset limpio pasará a ser la versión principal.
              Recomendamos conservar el original si planeas probar
              diferentes configuraciones de limpieza.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancelar
            </DialogClose>

            <Button
              onClick={() => {
                setReplaceDialogOpen(false)
                onReplaceDataset()
              }}
            >
              Reemplazar dataset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Stat({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold">
        {formatNumber(value)}
      </p>
    </div>
  )
}

function ActionButton({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>

      <div>
        <p className="text-sm font-medium">
          {title}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {description}
        </p>
      </div>
    </button>
  )
}