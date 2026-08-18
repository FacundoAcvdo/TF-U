import type {
  AutoConvertSourceFormat,
  DatasetOriginalFormat,
} from "./autoConvert"

export interface SubirDatasetParams {
  archivo: File
  columnaTexto: string
  columnaClase: string | null
  columnaFecha: string | null
  formatoOriginal: DatasetOriginalFormat
  formatoDetectado: AutoConvertSourceFormat | null
}

export interface SubirDatasetResultado {
  datasetId: string
}

const API_BASE_URL = "http://localhost:3001"
async function obtenerTokenSesion(): Promise<string | null> {
  // aca busco el token de alguna forma
  return null
}

export async function subirDataset(
  params: SubirDatasetParams
): Promise<SubirDatasetResultado> {
  const formData = new FormData()

  formData.append("file", params.archivo, params.archivo.name)
  formData.append("textColumn", params.columnaTexto)
  formData.append("originalFormat", params.formatoOriginal)

  if (params.columnaClase) {
    formData.append("classColumn", params.columnaClase)
  }

  if (params.columnaFecha) {
    formData.append("dateColumn", params.columnaFecha)
  }

  if (params.formatoDetectado) {
    formData.append("detectedFormat", params.formatoDetectado)
  }

  const token = await obtenerTokenSesion()

  const response = await fetch(`${API_BASE_URL}/datasets`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })

  if (!response.ok) {
    const mensajeError = await response.text().catch(() => null)

    throw new Error(
      mensajeError ||
        `No se pudo subir el dataset (status ${response.status})`
    )
  }

  return response.json()
}
