'use client'

import { toast } from 'sonner'
import { API_BASE } from '@/lib/api-base'
import { NETWORK_ERROR_MESSAGE, errorMessageForStatus } from '@/lib/api-errors'

export type ApiFetchOptions = {
  /** No mostrar toast ante errores (solo para lecturas de fondo esperables). */
  silent?: boolean
  /** No mostrar toast ante 404 (ej. getResults sin resultados: estado normal). */
  ignoreNotFound?: boolean
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/**
 * Fetch centralizado contra el api-gateway (Fase 2).
 * - 2xx: devuelve el JSON (o null si no hay cuerpo). Nunca hace toast.
 * - 202: devuelve el JSON {job_id, status} sin toast (el toast de éxito
 *   llega cuando el job termina, vía JobsProvider).
 * - !ok: muestra toast.error genérico según status y lanza ApiError.
 * - Fallo de red: toast.error de conexión y lanza ApiError con status 0.
 */
export async function apiFetch<T = unknown>(
  path: string,
  init?: RequestInit,
  options?: ApiFetchOptions,
): Promise<T> {
  let respuesta: Response
  try {
    respuesta = await fetch(API_BASE + path, {
      credentials: 'include',
      ...init,
      headers: {
        ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(init?.headers ?? {}),
      },
    })
  } catch {
    if (!options?.silent) toast.error(NETWORK_ERROR_MESSAGE)
    throw new ApiError(0, NETWORK_ERROR_MESSAGE)
  }

  if (!respuesta.ok) {
    const ignorar = options?.silent || (options?.ignoreNotFound && respuesta.status === 404)
    if (!ignorar) toast.error(errorMessageForStatus(respuesta.status))
    throw new ApiError(respuesta.status, errorMessageForStatus(respuesta.status))
  }

  const texto = await respuesta.text()
  if (!texto) return null as T
  try {
    return JSON.parse(texto) as T
  } catch {
    return texto as unknown as T
  }
}
