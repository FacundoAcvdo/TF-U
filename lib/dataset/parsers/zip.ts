import JSZip from "jszip"
import {
  previewConvertedCsv,
  unsupportedPreview,
  csvEscape,
  type AutoConvertedPreviewData,
} from "../autoConvert"

const TEXT_EXTENSIONS = new Set([".txt"])

function esEntradaIgnorable(path: string): boolean {
  if (path.startsWith("__MACOSX/")) return true

  const partes = path.split("/").filter(Boolean)
  return partes.some((parte) => parte.startsWith("."))
}

function tieneExtensionDeTexto(path: string): boolean {
  const idx = path.lastIndexOf(".")
  if (idx === -1) return false
  return TEXT_EXTENSIONS.has(path.slice(idx).toLowerCase())
}

interface EntradaClasificada {
  clase: string
  texto: string
}

async function extraerEntradas(zip: JSZip): Promise<EntradaClasificada[]> {
  const entradas: EntradaClasificada[] = []

  const archivos = Object.values(zip.files).filter(
    (entry) =>
      !entry.dir &&
      !esEntradaIgnorable(entry.name) &&
      tieneExtensionDeTexto(entry.name)
  )

  for (const entry of archivos) {
    const partes = entry.name.split("/").filter(Boolean)

    if (partes.length < 2) continue

    const clase = partes[0]
    const contenido = await entry.async("string")
    const texto = contenido.trim()

    if (!texto) continue

    entradas.push({ clase, texto })
  }

  return entradas
}

function entradasACsv(entradas: EntradaClasificada[]): string {
  const filas = ["texto,clase"]

  for (const { texto, clase } of entradas) {
    filas.push(`${csvEscape(texto)},${csvEscape(clase)}`)
  }

  return filas.join("\n")
}

export async function previewZip(file: File): Promise<AutoConvertedPreviewData> {
  let zip: JSZip

  try {
    const buffer = await file.arrayBuffer()
    zip = await JSZip.loadAsync(buffer)
  } catch {
    return unsupportedPreview(
      "No se pudo leer el archivo .zip (¿está corrupto o no es un zip válido?)."
    )
  }

  const entradas = await extraerEntradas(zip)

  if (entradas.length === 0) {
    return unsupportedPreview(
      "El .zip no tiene la estructura esperada: se necesitan carpetas de primer nivel (una por clase) con archivos .txt adentro."
    )
  }

  const csvContent = entradasACsv(entradas)

  return previewConvertedCsv(
    csvContent,
    file.name,
    "labeled-folders",
    "Detectamos que este .zip contiene carpetas por clase con textos adentro. Lo convertimos automáticamente a CSV (texto, clase)."
  )
}