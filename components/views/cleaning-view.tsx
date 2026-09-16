"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { BrushCleaning } from "lucide-react";

import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

import {
  Loader2,
  Sparkles,
} from "lucide-react";

import { useDataset } from "../../context/dataset-provider";

import { CleaningConfig } from "../../lib/data-cleaning/cleaning-config";
import { CleaningResult } from "../../lib/data-cleaning/cleaning-results";

import {
  CleaningConfig as CleaningConfigType,
  CleaningResult as CleaningResultType,
} from "../../lib/data-cleaning/cleaning-types";

const DEFAULT_CONFIG: CleaningConfigType = {
  operations: [],
  emoji_strategy: "keep",
  hashtag_strategy: "keep",
  language: "bilingual",
};

export function CleaningView() {
  const { datasetSeleccionado } = useDataset();

  const [config, setConfig] =
    useState<CleaningConfigType>(DEFAULT_CONFIG);

  const [result, setResult] =
    useState<CleaningResultType | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleClean = async () => {
    setError(null);
    setResult(null);

    if (!datasetSeleccionado) {
      setError("No hay ningún dataset seleccionado.");
      return;
    }

    if (config.operations.length === 0) {
      setError(
        "Selecciona al menos una operación de limpieza.",
      );
      return;
    }

    if (
      config.operations.includes("lemmatization") &&
      !config.language
    ) {
      setError(
        "Debes seleccionar un idioma para utilizar la lematización.",
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/datacleaning/cleanDataset",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            dataset_name: datasetSeleccionado,

            operations: config.operations,

            emoji_strategy: config.emoji_strategy,

            hashtag_strategy: config.hashtag_strategy,

            language: config.language ?? "bilingual",
          }),
        },
      );

      if (!response.ok) {
        let message =
          "No se pudo ejecutar la limpieza del dataset.";

        try {
          const errorData = await response.json();

          if (typeof errorData?.detail === "string") {
            message = errorData.detail;
          }
        } catch {

        }

        throw new Error(message);
      }

      const data = await response.json();

      /*
       * Si tu endpoint devuelve:
       *
       * {
       *   status: "success",
       *   source_dataset_id: "...",
       *   ...
       * }
       *
       * usamos solamente el contenido del resultado.
       */
      const cleaningResult: CleaningResultType =
        data.result ?? data;

      setResult(cleaningResult);
    } catch (err) {
      console.error("Error ejecutando cleaning:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error durante la limpieza.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result?.download_id) return;

    const response = await fetch(
      "http://localhost:8080/datacleaning/download",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          download_id: result.download_id,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Error descargando el archivo.");
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = result.filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Limpieza de dataset
            </h1>

            <p className="text-sm text-muted-foreground">
              Configura las operaciones que quieres aplicar antes
              del procesamiento del dataset.
            </p>
          </div>
        </div>
      </div>

      {/* Dataset seleccionado */}
      <div className="rounded-xl border bg-muted/30 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Dataset seleccionado
        </p>

        <p className="mt-1 truncate text-sm font-medium">
          {datasetSeleccionado ?? "Ningún dataset seleccionado"}
        </p>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Configuración */}
      <CleaningConfig
        config={config}
        onChange={setConfig}
      />

      {/* Acción */}
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleClean}
          disabled={loading}
          className="
            h-12
            px-7
            text-base
            font-semibold
            shadow-sm
            cursor-pointer
            transition-all
            hover:shadow-md
          "
        >
          <BrushCleaning className="mr-2 h-5 w-5" />
          {loading ? "Limpiando..." : "Ejecutar limpieza"}
        </Button>
      </div>

      {/* Resultado */}
      {result && (
        <CleaningResult
          result={result}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}