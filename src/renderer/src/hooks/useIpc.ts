import { useState, useCallback } from 'react'

type IpcResult<T> = { success: true; data: T } | { success: false; error: string }

declare global {
  interface Window {
    api: { invoke: <T = unknown>(channel: string, data?: unknown) => Promise<IpcResult<T>> }
  }
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

export function useIpcQuery<T>(channel: string) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(
    async (payload?: unknown): Promise<IpcResult<T>> => {
      setLoading(true)
      setError(null)
      try {
        const res = await window.api.invoke<T>(channel, payload)
        if (res.success) {
          setData(res.data)
        } else {
          setError(res.error)
        }
        return res
      } catch (err: unknown) {
        const message = errorMessage(err)
        setError(message)
        return { success: false, error: message }
      } finally {
        setLoading(false)
      }
    },
    [channel]
  )

  return { data, error, loading, fetch }
}

export function useIpcMutation<P = unknown, T = unknown>(channel: string) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const mutate = useCallback(
    async (payload: P): Promise<IpcResult<T>> => {
      setLoading(true)
      setError(null)
      try {
        const res = await window.api.invoke<T>(channel, payload)
        if (!res.success) {
          setError(res.error)
        }
        return res
      } catch (err: unknown) {
        const message = errorMessage(err)
        setError(message)
        return { success: false, error: message }
      } finally {
        setLoading(false)
      }
    },
    [channel]
  )

  return { mutate, error, loading }
}
