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

const POLL_MS = 2000

async function fetchJob(service: string, jobId: string) {
  const respuesta = await fetch(API_BASE + `/${service}/jobs/${jobId}`, {
    credentials: 'include',
  })
  if (!respuesta.ok) throw new Error(`job-status-${respuesta.status}`)
  return (await respuesta.json()) as {
    status: string
    result?: unknown
    error_code?: number | null
  }
}

export function JobsProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Record<string, TaskEntry>>({})
  const tasksRef = useRef(tasks)
  tasksRef.current = tasks

  // Polling global: sobrevive a la navegación (el provider vive en el layout).
  // El toast final se muestra aunque el usuario esté en otra pantalla.
  useEffect(() => {
    const id = setInterval(async () => {
      const pendientes = Object.values(tasksRef.current).filter((t) => t.status === 'running')
      for (const t of pendientes) {
        let job: { status: string; result?: unknown; error_code?: number | null }
        try {
          job = await fetchJob(t.service, t.jobId)
        } catch {
          continue // error de red transitorio: se reintenta en el próximo ciclo
        }
        if (job.status !== 'succeeded' && job.status !== 'failed') continue
        setTasks((prev) => {
          const actual = prev[t.key]
          if (!actual || actual.status !== 'running') return prev
          if (job.status === 'succeeded') toast.success(t.successMessage)
          else toast.error(errorMessageForJob(job.error_code))
          return {
            ...prev,
            [t.key]: {
              ...actual,
              status: job.status as TaskStatus,
              result: job.result,
              errorCode: job.error_code ?? null,
            },
          }
        })
      }
    }, POLL_MS)
    return () => clearInterval(id)
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
        successMessage: opts.successMessage,
        consumed: false,
      },
    }))
  }, [])

  // Retoma un trabajo activo al (re)entrar a una pantalla, sin re-ejecutarlo.
  const adoptTask = useCallback(async (opts: AdoptTaskOptions) => {
    if (tasksRef.current[opts.key]) return
    let lista: { jobs: { job_id: string; status: string }[] }
    try {
      const params = new URLSearchParams({ job_type: opts.jobType })
      if (opts.dataset) params.set('dataset_name', opts.dataset)
      lista = await apiFetch<{ jobs: { job_id: string; status: string }[] }>(
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
