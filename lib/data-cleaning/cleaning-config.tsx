"use client";

import {
  Check,
  Hash,
  Languages,
  Smile,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Checkbox } from "@/components/ui/checkbox";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  CleaningConfig as CleaningConfigType,
  CleaningLanguage,
  CleaningOperation,
} from "./cleaning-types";

interface CleaningConfigProps {
  config: CleaningConfigType;
  onChange: (config: CleaningConfigType) => void;
}

interface OperationOption {
  value: CleaningOperation;
  label: string;
  description: string;
}

const OPERATIONS: OperationOption[] = [
  {
    value: "lowercase",
    label: "Convertir a minúsculas",
    description: "Convierte todo el texto a minúsculas.",
  },
  {
    value: "remove_urls",
    label: "Eliminar URLs",
    description: "Elimina enlaces y direcciones web.",
  },
  {
    value: "remove_mentions",
    label: "Eliminar menciones",
    description: "Elimina menciones como @usuario.",
  },
  {
    value: "remove_html",
    label: "Eliminar HTML",
    description: "Elimina etiquetas HTML del texto.",
  },
  {
    value: "normalize_whitespace",
    label: "Normalizar espacios",
    description: "Reduce espacios y saltos de línea innecesarios.",
  },
  {
    value: "remove_duplicates",
    label: "Eliminar duplicados",
    description: "Elimina documentos con texto repetido.",
  },
  {
    value: "remove_punctuation",
    label: "Eliminar puntuación",
    description: "Elimina signos de puntuación.",
  },
  {
    value: "remove_stopwords",
    label: "Eliminar stopwords",
    description: "Elimina palabras frecuentes en inglés y español.",
  },
  {
    value: "lemmatization",
    label: "Lematización",
    description: "Convierte las palabras a su forma léxica base.",
  },
  {
    value: "anonymization",
    label: "Anonimización",
    description: "Reemplaza emails, teléfonos e IPs.",
  },
];

const EMOJI_OPTIONS: {
  value: CleaningConfigType["emoji_strategy"];
  label: string;
  description: string;
}[] = [
  {
    value: "keep",
    label: "Conservar",
    description: "Mantiene los emojis originales.",
  },
  {
    value: "remove",
    label: "Eliminar",
    description: "Elimina los emojis del texto.",
  },
  {
    value: "convert",
    label: "Convertir",
    description: "Convierte emojis a nombres textuales.",
  },
];

const HASHTAG_OPTIONS: {
  value: CleaningConfigType["hashtag_strategy"];
  label: string;
  description: string;
}[] = [
  {
    value: "keep",
    label: "Conservar",
    description: "Mantiene el hashtag completo.",
  },
  {
    value: "remove_symbol",
    label: "Quitar #",
    description: "Conserva la palabra y elimina el símbolo #.",
  },
  {
    value: "segment",
    label: "Segmentar",
    description: "Intenta separar palabras dentro del hashtag.",
  },
];

const LANGUAGE_OPTIONS: {
  value: CleaningLanguage;
  label: string;
  description: string;
}[] = [
  {
    value: "en",
    label: "Inglés",
    description: "Usa el modelo lingüístico de inglés.",
  },
  {
    value: "es",
    label: "Español",
    description: "Usa el modelo lingüístico de español.",
  },
  {
    value: "bilingual",
    label: "Bilingüe",
    description: "Preparado para datasets bilingües.",
  },
];

export function CleaningConfig({
  config,
  onChange,
}: CleaningConfigProps) {
  const hasEmojis = config.operations.includes("handle_emojis");
  const hasHashtags = config.operations.includes("handle_hashtags");
  const hasLemmatization = config.operations.includes("lemmatization");

  const toggleOperation = (operation: CleaningOperation) => {
    const exists = config.operations.includes(operation);

    const operations = exists
      ? config.operations.filter((item) => item !== operation)
      : [...config.operations, operation];

    const nextConfig: CleaningConfigType = {
      ...config,
      operations,
    };

    if (!operations.includes("lemmatization")) {
      nextConfig.language = null;
    }

    onChange(nextConfig);
  };

  const setEmojiStrategy = (
    emoji_strategy: CleaningConfigType["emoji_strategy"],
  ) => {
    onChange({
      ...config,
      emoji_strategy,
    });
  };

  const setHashtagStrategy = (
    hashtag_strategy: CleaningConfigType["hashtag_strategy"],
  ) => {
    onChange({
      ...config,
      hashtag_strategy,
    });
  };

  const setLanguage = (language: CleaningLanguage) => {
    onChange({
      ...config,
      language,
    });
  };

  return (
    <div className="space-y-6">
      {/* Operaciones principales */}
      <Card>
        <CardHeader>
          <CardTitle>Operaciones de limpieza</CardTitle>

          <CardDescription>
            Selecciona las transformaciones que quieres aplicar al dataset.
            Las operaciones se ejecutarán en el orden definido por el backend.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {OPERATIONS.map((operation) => {
              const selected = config.operations.includes(
                operation.value,
              );

              return (
                <label
                  key={operation.value}
                  className={[
                    "group relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all",
                    "hover:border-primary/50 hover:bg-muted/40",
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border",
                  ].join(" ")}
                >
                  <Checkbox
                    checked={selected}
                    onCheckedChange={() =>
                      toggleOperation(operation.value)
                    }
                    className="mt-0.5"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {operation.label}
                      </span>

                      {selected && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>

                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {operation.description}
                    </p>
                  </div>
                </label>
              );
            })}

            {/* Emojis */}
            <label
              className={[
                "group relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all",
                "hover:border-primary/50 hover:bg-muted/40",
                hasEmojis
                  ? "border-primary bg-primary/5"
                  : "border-border",
              ].join(" ")}
            >
              <Checkbox
                checked={hasEmojis}
                onCheckedChange={() =>
                  toggleOperation("handle_emojis")
                }
                className="mt-0.5"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Smile className="h-4 w-4 text-muted-foreground" />

                  <span className="text-sm font-medium">
                    Gestionar emojis
                  </span>

                  {hasEmojis && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>

                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Define qué hacer con los emojis del texto.
                </p>
              </div>
            </label>

            {/* Hashtags */}
            <label
              className={[
                "group relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all",
                "hover:border-primary/50 hover:bg-muted/40",
                hasHashtags
                  ? "border-primary bg-primary/5"
                  : "border-border",
              ].join(" ")}
            >
              <Checkbox
                checked={hasHashtags}
                onCheckedChange={() =>
                  toggleOperation("handle_hashtags")
                }
                className="mt-0.5"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />

                  <span className="text-sm font-medium">
                    Gestionar hashtags
                  </span>

                  {hasHashtags && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>

                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Define cómo tratar hashtags como #depresion.
                </p>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Configuraciones específicas */}
      {(hasEmojis || hasHashtags) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {hasEmojis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smile className="h-5 w-5" />
                  Tratamiento de emojis
                </CardTitle>

                <CardDescription>
                  Los emojis pueden contener información emocional
                  relevante, por lo que su eliminación es opcional.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid gap-3 sm:grid-cols-3">
                  {EMOJI_OPTIONS.map((option) => {
                    const selected =
                      config.emoji_strategy === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setEmojiStrategy(option.value)
                        }
                        className={[
                          "rounded-xl border p-4 text-left transition-all",
                          "hover:border-primary/50 hover:bg-muted/40",
                          selected
                            ? "border-primary bg-primary/5"
                            : "border-border",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium">
                            {option.label}
                          </span>

                          {selected && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>

                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {option.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {hasHashtags && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Tratamiento de hashtags
                </CardTitle>

                <CardDescription>
                  Los hashtags pueden conservar información temática
                  útil para el análisis.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid gap-3 sm:grid-cols-3">
                  {HASHTAG_OPTIONS.map((option) => {
                    const selected =
                      config.hashtag_strategy === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setHashtagStrategy(option.value)
                        }
                        className={[
                          "rounded-xl border p-4 text-left transition-all",
                          "hover:border-primary/50 hover:bg-muted/40",
                          selected
                            ? "border-primary bg-primary/5"
                            : "border-border",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium">
                            {option.label}
                          </span>

                          {selected && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>

                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {option.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Idioma */}
      {hasLemmatization && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Idioma para lematización
            </CardTitle>

            <CardDescription>
              La lematización necesita conocer el idioma del dataset.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Select
              value={config.language ?? undefined}
              onValueChange={(value) =>
                setLanguage(value as CleaningLanguage)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un idioma" />
              </SelectTrigger>

              <SelectContent>
                {LANGUAGE_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {config.language === "bilingual" && (
              <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                La opción bilingüe está preparada para futuras
                versiones. Actualmente la lematización bilingüe
                requiere detección de idioma por documento.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}