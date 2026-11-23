import type { ModelDetail, ModelSummary, ProblemDetail } from './types'

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export class ApiError extends Error {
  readonly status: number
  readonly problem?: ProblemDetail

  constructor(status: number, problem?: ProblemDetail) {
    super(problem?.detail ?? problem?.title ?? `Request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.problem = problem
  }
}

async function getJson<T>(path: string, language: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: 'application/json', 'Accept-Language': language },
    signal,
  })
  if (!response.ok) {
    const isProblem = response.headers.get('Content-Type')?.includes('application/problem+json')
    throw new ApiError(response.status, isProblem ? ((await response.json()) as ProblemDetail) : undefined)
  }
  return (await response.json()) as T
}

export const api = {
  listModels: (language: string, signal?: AbortSignal) =>
    getJson<ModelSummary[]>('/api/models', language, signal),

  getModel: (slug: string, language: string, signal?: AbortSignal) =>
    getJson<ModelDetail>(`/api/models/${encodeURIComponent(slug)}`, language, signal),
}
