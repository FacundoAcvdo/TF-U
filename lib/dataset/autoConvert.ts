import { previewCsv } from "./parsers/csv"
import type { DatasetPreviewData } from "./types" 

export type AutoConvertSourceFormat =
  | "whatsapp-chat"
  | "labeled-folders"
  | "unsupported"

export type DatasetOriginalFormat = "csv" | "xlsx" | "txt" | "zip"

export function obtenerFormatoOriginal(
  nombreArchivo: string
): DatasetOriginalFormat {
  const ext = nombreArchivo.split(".").pop()?.toLowerCase()

  if (ext === "csv" || ext === "xlsx" || ext === "txt" || ext === "zip") {
    return ext
  }

  return "csv"
}

export interface AutoConvertedPreviewData extends DatasetPreviewData {
  sourceFormat: AutoConvertSourceFormat
  convertedFile?: File
  notice?: string
}

export function csvEscape(field: string): string {
  if (/[",\n]/.test(field)) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}

export function makeCsvFile(csvContent: string, originalName: string): File {
  const base = originalName.replace(/\.[^./\\]+$/, "")
  return new File([csvContent], `${base}.csv`, { type: "text/csv" })
}

export function unsupportedPreview(notice: string): AutoConvertedPreviewData {
  return {
    columns: [],
    rows: [],
    totalRows: 0,
    sourceFormat: "unsupported",
    notice,
  }
}

export async function previewConvertedCsv(
  csvContent: string,
  originalName: string,
  sourceFormat: Exclude<AutoConvertSourceFormat, "unsupported">,
  notice: string
): Promise<AutoConvertedPreviewData> {
  const convertedFile = makeCsvFile(csvContent, originalName)
  const preview = await previewCsv(convertedFile)

  return {
    ...preview,
    sourceFormat,
    convertedFile,
    notice,
  }
}
