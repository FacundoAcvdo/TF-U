"use client";

import {
  ArrowDown,
  BarChart3,
  CheckCircle2,
  FileDown,
  FileText,
  Hash,
  Link2,
  MessageCircle,
  Smile,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { CleaningResult as CleaningResultType } from "./cleaning-types";

interface CleaningResultProps {
  result: CleaningResultType;
  onDownload: () => void;
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

function StatCard({
  label,
  value,
  icon,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            {label}
          </p>

          <p className="mt-1 text-xl font-semibold">
            {value.toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function CleaningResult({
  result,
  onDownload,
}: CleaningResultProps) {
  const { stats } = result;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-semibold">
                Limpieza completada
              </h2>

              <p className="mt-1 truncate text-sm text-muted-foreground">
                {result.filename}
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={onDownload}
            className="shrink-0 cursor-pointer"
          >
            <FileDown className="mr-2 h-5 w-5 cursor-pointer" />
            Descargar dataset
          </Button>
        </CardContent>
      </Card>

      {/* Resumen */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Filas originales"
          value={stats.original_rows}
          icon={<FileText className="h-5 w-5" />}
        />

        <StatCard
          label="Filas finales"
          value={stats.cleaned_rows}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />

        <StatCard
          label="Tokens originales"
          value={stats.original_tokens}
          icon={<BarChart3 className="h-5 w-5" />}
        />

        <StatCard
          label="Tokens finales"
          value={stats.cleaned_tokens}
          icon={<BarChart3 className="h-5 w-5" />}
        />
      </div>

      {/* Procesamiento */}
      <Card>
        <CardHeader>
          <CardTitle>Procesamiento realizado</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Duplicados eliminados"
              value={stats.removed_duplicates}
              icon={<CopyIcon />}
            />

            <StatCard
              label="URLs eliminadas"
              value={stats.removed_urls}
              icon={<Link2 className="h-5 w-5" />}
            />

            <StatCard
              label="Menciones eliminadas"
              value={stats.removed_mentions}
              icon={<MessageCircle className="h-5 w-5" />}
            />

            <StatCard
              label="Emojis procesados"
              value={stats.emojis_processed}
              icon={<Smile className="h-5 w-5" />}
            />

            <StatCard
              label="Hashtags procesados"
              value={stats.hashtags_processed}
              icon={<Hash className="h-5 w-5" />}
            />

            <StatCard
              label="Entidades anonimizadas"
              value={stats.entities_anonymized}
              icon={<Users className="h-5 w-5" />}
            />

            <StatCard
              label="Stopwords eliminadas"
              value={stats.stopwords_removed}
              icon={<MessageCircle className="h-5 w-5" />}
            />
          </div>
        </CardContent>
      </Card>

      {/* Métricas adicionales */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas adicionales</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Metric
              label="Espacios normalizados"
              value={stats.normalized_whitespace}
            />

            <Metric
              label="Puntuación eliminada"
              value={stats.punctuation_removed}
            />

            <Metric
              label="Lemas procesados"
              value={stats.lemmas_processed}
            />

            <Metric
              label="Truncados procesados"
              value={stats.truncated_words}
            />            

            <Metric
              label="Términos únicos originales"
              value={stats.original_unique_terms}
            />

            <Metric
              label="Términos únicos finales"
              value={stats.cleaned_unique_terms}
            />

            <Metric
              label="Filas eliminadas"
              value={Math.max(
                stats.original_rows - stats.cleaned_rows,
                0,
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Vista previa de cambios</CardTitle>
        </CardHeader>

        <CardContent>
          {result.previews.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <p className="text-sm font-medium">
                No hay cambios de texto para mostrar.
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Las operaciones seleccionadas no modificaron el
                contenido de los documentos mostrados.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {result.previews.map((preview, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-xl border"
                >
                  <div className="border-b bg-muted/40 px-4 py-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Documento {index + 1}
                    </span>
                  </div>

                  <div className="grid lg:grid-cols-2">
                    <div className="border-b p-4 lg:border-b-0 lg:border-r">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Original
                      </p>

                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                        {preview.original}
                      </p>
                    </div>

                    <div className="p-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Limpio
                      </p>

                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                        {preview.cleaned}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function CopyIcon() {
  return (
    <div className="flex h-5 w-5 items-center justify-center">
      <span className="text-sm font-bold">2×</span>
    </div>
  );
}