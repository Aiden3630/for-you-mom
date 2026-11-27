import { useState, useEffect } from 'react'

export function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored === null) return initial
      const parsed: unknown = JSON.parse(stored)
      if (typeof parsed !== typeof initial) return initial
      if (typeof parsed === 'number' && !Number.isFinite(parsed)) return initial
      return parsed as T
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* Приватный режим не мешает подарку. */
    }
  }, [key, value])
  return [value, setValue] as const
}
