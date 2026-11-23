import { useCallback, useEffect, useRef, useState } from 'react'

export type ApiState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; data: T }

type Settled<T> = Exclude<ApiState<T>, { status: 'loading' }>

/**
 * Runs `request` whenever `key` changes and tracks loading / error / data.
 *
 * - Each result remembers the key it belongs to. If the key changed and the new result
 *   has not arrived yet, we *derive* "loading" during render instead of storing it.
 * - The AbortController cancels the previous request when the key changes (e.g. quick
 *   language switch), so an old, slower response can never overwrite a newer one.
 */
export function useApi<T>(
  key: string,
  request: (signal: AbortSignal) => Promise<T>,
): ApiState<T> & { reload: () => void } {
  const [result, setResult] = useState<{ key: string; state: Settled<T> } | null>(null)
  const [attempt, setAttempt] = useState(0)
  const requestKey = `${key}#${attempt}`

  // Always call the latest `request` without making it an effect dependency.
  const requestRef = useRef(request)
  useEffect(() => {
    requestRef.current = request
  })

  useEffect(() => {
    const controller = new AbortController()
    requestRef.current(controller.signal).then(
      (data) => setResult({ key: requestKey, state: { status: 'success', data } }),
      (error: unknown) => {
        if (controller.signal.aborted) return
        const err = error instanceof Error ? error : new Error(String(error))
        setResult({ key: requestKey, state: { status: 'error', error: err } })
      },
    )
    return () => controller.abort()
  }, [requestKey])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])
  const state: ApiState<T> = result?.key === requestKey ? result.state : { status: 'loading' }
  return { ...state, reload }
}
