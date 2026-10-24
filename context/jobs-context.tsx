'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { API_BASE } from '@/lib/api-base'
import { apiFetch } from '@/lib/api-fetch'
import { errorMessageForJob } from '@/lib/api-errors'

export type TaskStatus = 'running' | 'succeeded' | 'failed'

export type TaskEntry = {
  key: string
  service: string
  jobType: string
  dataset: string | null
  jobId: string
  status: TaskStatus
  result?: unknown
  errorCode?: number | null
  params?: Record<string, unknown> | null
  successMessage: string
  consumed: boolean
}

type StartTaskOptions = {
  key: string
  service: string
  operation: string
  jobType: string
  dataset?: string | null
  body?: unknown
  formData?: FormData
  successMessage: string
}

type AdoptTaskOptions = {
  key: string
  service: string
  jobType: string
  dataset?: string | null
  successMessage: string
}

type JobsContextValue = {
  tasks: Record<string, TaskEntry>
  startTask: (opts: StartTaskOptions) => Promise<void>
  adoptTask: (opts: AdoptTaskOptions) => Promise<void>
  consumeTask: (key: string) => void
}

const JobsContext = createContext<JobsContextValue | null>(null)

const POLL_DELAYS_MS = [2000, 4000, 8000, 15000] as const
const MAX_CONCURRENT_POLLS = 3

async function fetchJob(service: string, jobId: string) {
  const respuesta = await fetch(API_BASE + `/${service}/jobs/${jobId}`, {
    credentials: 'include',
  })
  if (!respuesta.ok) throw new Error(`job-status-${respuesta.status}`)
  return (await respuesta.json()) as {
    status: string
    result?: unknown
    error_code?: number | null
    params?: Record<string, unknown> | null
  }
}

export function JobsProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Record<string, TaskEntry>>({})
  const tasksRef = useRef(tasks)
  // Un mismo job puede estar registrado bajo varias keys (ej. cambio de
  // parámetros con el job en curso): el toast final se muestra una sola vez.
  const notifiedRef = useRef<Set<string>>(new Set())
  const pollStateRef = useRef(
    new Map<string, { service: string; jobId: string; attempt: number; nextPollAt: number; inFlight: boolean }>(),
  )
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollingRef = useRef(false)

  // Polling global: sobrevive a la navegación (el provider vive en el layout).
  // El toast final se muestra aunque el usuario esté en otra pantalla.
  useEffect(() => {
    tasksRef.current = tasks
    const jobKey = (service: string, jobId: string) => `${service}:${jobId}`
    const syncPollState = () => {
      const activos = new Map<string, { service: string; jobId: string }>()
      for (const task of Object.values(tasksRef.current)) {
        if (task.status === 'running') activos.set(jobKey(task.service, task.jobId), task)
      }

      for (const key of pollStateRef.current.keys()) {
        if (!activos.has(key)) pollStateRef.current.delete(key)
      }
      for (const [key, job] of activos) {
        if (!pollStateRef.current.has(key)) {
          pollStateRef.current.set(key, {
            ...job,
            attempt: 0,
            nextPollAt: Date.now() + POLL_DELAYS_MS[0],
            inFlight: false,
          })
        }
      }
      return activos
    }

    const scheduleNext = () => {
      if (!pollingRef.current) return
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current)
      const activos = syncPollState()
      if (activos.size === 0) {
        pollingRef.current = false
        pollTimerRef.current = null
        return
      }

      const ahora = Date.now()
      const pendientes = [...pollStateRef.current.values()]
        .filter((state) => !state.inFlight && state.nextPollAt <= ahora)
        .slice(0, MAX_CONCURRENT_POLLS)
      if (pendientes.length > 0) {
        void poll(pendientes)
        return
      }

      const siguiente = Math.min(...[...pollStateRef.current.values()].map((state) => state.nextPollAt))
      pollTimerRef.current = setTimeout(scheduleNext, Math.max(0, siguiente - ahora))
    }

    const poll = async (
      pendientes: { service: string; jobId: string; attempt: number; nextPollAt: number; inFlight: boolean }[],
    ) => {
      for (const state of pendientes) state.inFlight = true
      await Promise.all(
        pendientes.map(async (state) => {
          const key = jobKey(state.service, state.jobId)
          try {
            const job = await fetchJob(state.service, state.jobId)
            if (job.status === 'succeeded' || job.status === 'failed') {
              pollStateRef.current.delete(key)
              const actuales = Object.values(tasksRef.current).filter(
                (task) => task.status === 'running' && jobKey(task.service, task.jobId) === key,
              )
              const first = actuales[0]
              if (first && !notifiedRef.current.has(state.jobId)) {
                notifiedRef.current.add(state.jobId)
                if (job.status === 'succeeded') toast.success(first.successMessage)
                else toast.error(errorMessageForJob(job.error_code))
              }
              if (actuales.length > 0) {
                setTasks((prev) => {
                  const next = { ...prev }
                  for (const task of actuales) {
                    const current = next[task.key]
                    if (!current || current.status !== 'running') continue
                    next[task.key] = {
                      ...current,
                      status: job.status as TaskStatus,
                      result: job.result,
                      errorCode: job.error_code ?? null,
                      params: job.params ?? current.params ?? null,
                    }
                  }
                  return next
                })
              }
              return
            }

            const current = pollStateRef.current.get(key)
            if (current) {
              current.attempt = Math.min(current.attempt + 1, POLL_DELAYS_MS.length - 1)
              current.nextPollAt = Date.now() + POLL_DELAYS_MS[current.attempt]
              current.inFlight = false
            }
          } catch {
            const current = pollStateRef.current.get(key)
            if (current) {
              current.attempt = Math.min(current.attempt + 1, POLL_DELAYS_MS.length - 1)
              current.nextPollAt = Date.now() + POLL_DELAYS_MS[current.attempt]
              current.inFlight = false
            }
          }
        }),
      )
      scheduleNext()
    }

    if (Object.values(tasksRef.current).some((task) => task.status === 'running')) {
      pollingRef.current = true
      scheduleNext()
    }
  }, [tasks])

  useEffect(() => () => {
    pollingRef.current = false
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current)
  }, [])

  const startTask = useCallback(async (opts: StartTaskOptions) => {
    // apiFetch: si el POST falla, ya muestra el toast de error y lanza.
    // Si devuelve 202, NO muestra toast (el éxito se avisa al terminar el job).
    const data = await apiFetch<{ job_id: string; status: string }>(
      `/${opts.service}/${opts.operation}`,
      opts.formData
        ? { method: 'POST', body: opts.formData }
        : { method: 'POST', body: JSON.stringify(opts.body ?? {}) },
    )
    setTasks((prev) => ({
      ...prev,
      [opts.key]: {
        key: opts.key,
        service: opts.service,
        jobType: opts.jobType,
        dataset: opts.dataset ?? null,
        jobId: data.job_id,
        status: 'running',
        params: (opts.body as Record<string, unknown> | undefined) ?? null,
        successMessage: opts.successMessage,
        consumed: false,
      },
    }))
  }, [])

  // Retoma un trabajo activo al (re)entrar a una pantalla, sin re-ejecutarlo.
  const adoptTask = useCallback(async (opts: AdoptTaskOptions) => {
    if (tasksRef.current[opts.key]) return
    let lista: { jobs: { job_id: string; status: string; params?: Record<string, unknown> | null }[] }
    try {
      const params = new URLSearchParams({ job_type: opts.jobType })
      if (opts.dataset) params.set('dataset_name', opts.dataset)
      lista = await apiFetch<{ jobs: { job_id: string; status: string; params?: Record<string, unknown> | null }[] }>(
        `/${opts.service}/jobs?${params.toString()}`,
        { method: 'GET' },
        { silent: true },
      )
    } catch {
      return // recuperación best-effort: sin trabajos o backend no disponible
    }
    const activo = (lista.jobs ?? []).find((j) => j.status === 'queued' || j.status === 'running')
    if (!activo) return
    setTasks((prev) => {
      if (prev[opts.key]) return prev
      return {
        ...prev,
        [opts.key]: {
          key: opts.key,
          service: opts.service,
          jobType: opts.jobType,
          dataset: opts.dataset ?? null,
          jobId: activo.job_id,
          status: 'running',
          params: activo.params ?? null,
          successMessage: opts.successMessage,
          consumed: false,
        },
      }
    })
  }, [])

  const consumeTask = useCallback((key: string) => {
    setTasks((prev) => {
      const actual = prev[key]
      if (!actual || actual.consumed) return prev
      return { ...prev, [key]: { ...actual, consumed: true } }
    })
  }, [])

  return (
    <JobsContext.Provider value={{ tasks, startTask, adoptTask, consumeTask }}>
      {children}
    </JobsContext.Provider>
  )
}

export function useJobs(): JobsContextValue {
  const ctx = useContext(JobsContext)
  if (!ctx) throw new Error('useJobs debe usarse dentro de <JobsProvider>')
  return ctx
}
