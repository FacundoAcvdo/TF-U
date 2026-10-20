import type {
  AutoConvertSourceFormat,
  DatasetOriginalFormat,
} from "./autoConvert"

import type { WhatsappLocale } from "./parsers/txt"

export interface SubirDatasetParams {
  archivo: File
  columnaTexto: string
  columnaClase: string | null
  columnaFecha: string | null
  columnaUsuario: string | null
  formatoOriginal: DatasetOriginalFormat
  formatoDetectado: AutoConvertSourceFormat | null
  formatoFecha?: WhatsappLocale | null
  esChat: boolean
}

export interface SubirDatasetResultado {
  datasetId: string
}

export function buildUploadFormData(params: SubirDatasetParams): FormData {
  const formData = new FormData()

  formData.append("archivo", params.archivo, params.archivo.name)
  formData.append("columnaTexto", params.columnaTexto)
  formData.append("formatoOriginal", params.formatoOriginal)
  formData.append("esChat", String(params.esChat))
  formData.append("user_id", "usuario123")

  if (params.columnaClase) {
    formData.append("columnaClase", params.columnaClase)
  }

  if (params.columnaFecha) {
    formData.append("columnaFecha", params.columnaFecha)
  }

  if (params.columnaUsuario) {
    formData.append("columnaUsuario", params.columnaUsuario)
  }

  if (params.formatoDetectado) {
    formData.append("formatoDetectado", params.formatoDetectado)
  }

  if (params.formatoFecha) {
    formData.append("formatoFecha", params.formatoFecha)
  }

  return formData
}
