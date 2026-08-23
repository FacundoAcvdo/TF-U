import { useQueryClient } from "@tanstack/react-query"
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

export async function subirDataset(
  params: SubirDatasetParams,
  queryClient: ReturnType<typeof useQueryClient>
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

  const response = await fetch(`http://localhost:8080/datasets`, {
    method: "POST",
    credentials: 'include',
    body: formData,
  })

  if (!response.ok) {
    const mensajeError = await response.text().catch(() => null)

    throw new Error(
      mensajeError ||
        `No se pudo subir el dataset (status ${response.status})`
    )
  }

  queryClient.invalidateQueries({ queryKey: ['datasets'] })

  return response.json()
}
