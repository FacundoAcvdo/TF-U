'use client'

// Mensajes genéricos por código HTTP (Fase 2).
// El detalle crudo del backend nunca se muestra: solo estos textos.
export function errorMessageForStatus(status: number): string {
  if (status === 401) return 'No tienes autorización. Inicia sesión de nuevo.'
  if (status === 403) return 'No tienes permiso para esta acción.'
  if (status === 404) return 'No se encontró el recurso solicitado.'
  if (status === 409) return 'Hay un conflicto con el estado actual.'
  if (status === 413) return 'El archivo es demasiado grande.'
  if (status === 422) return 'Datos inválidos. Revisa la selección e intenta de nuevo.'
  if (status === 504) return 'El servicio tardó demasiado. Intenta más tarde.'
  if (status >= 500) return 'Error en el servidor. Intenta más tarde.'
  return 'Ocurrió un error inesperado. Intenta más tarde.'
}

export function errorMessageForJob(errorCode: number | null | undefined): string {
  if (!errorCode) return 'Error en el servidor. Intenta más tarde.'
  return errorMessageForStatus(errorCode)
}

export const NETWORK_ERROR_MESSAGE = 'Sin conexión con el servidor. Revisa tu red.'
