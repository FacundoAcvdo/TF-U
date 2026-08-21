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

const API_BASE_URL = "http://localhost:8000"
async function obtenerTokenSesion(): Promise<string | null> {
  // aca busco el token de alguna forma
  return null
}

export async function subirDataset(
  params: SubirDatasetParams
): Promise<SubirDatasetResultado> {
  const formData = new FormData()

  formData.append("archivo", params.archivo, params.archivo.name)
  formData.append("columnaTexto", params.columnaTexto)
  formData.append("formatoOriginal", params.formatoOriginal)
  formData.append("user_id", "usuario123")

  if (params.columnaClase) {
    formData.append("columnaClase", params.columnaClase)
  }

  if (params.columnaFecha) {
    formData.append("columnaFecha", params.columnaFecha)
  }

  if (params.formatoDetectado) {
    formData.append("formatoDetectado", params.formatoDetectado)
  }

  const token = await obtenerTokenSesion()
  const INTERNAL_TOKEN = "test-secret-123"
  const response = await fetch(`${API_BASE_URL}/datasets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${INTERNAL_TOKEN}`,
      "X-User-Id": "usuario123",
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
